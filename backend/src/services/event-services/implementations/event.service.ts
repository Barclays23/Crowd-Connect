// backend/src/services/event-services/implementations/eventManagement.service.ts
import { 
    deleteFromCloudinary, 
    uploadBase64ToCloudinary, 
    uploadToCloudinary 
} from "@/config/cloudinary";
import { HTTP_STATUS } from "@/constants/http-status.constants";
import { 
    CreateEventRequestDTO, 
    EventResponseDTO, 
    GetDiscoveryEventsResult, 
    UpdateEventRequestDTO 
} from "@/dtos/event.dto";
import { 
    CreateEventInput, 
    EventEntity, 
    EventStatusUpdateInput, 
    UpdateEventInput 
} from "@/entities/event.entity";
import { 
    mapCreateEventRequestDtoToInput, 
    mapEventEntityToEventResponseDto, 
    mapToEventStatusUpdateInput, 
    mapUpdateEventRequestDtoToInput 
} from "@/mappers/event.mapper";
import { IEventRepository } from "@/repositories/interfaces/IEventRepository";
import { IBookingService } from "@/services/booking-services/interfaces/IBookingService";
import { IEventServices } from "@/services/event-services/interfaces/IEventServices";
import { 
    EventFilterQuery, 
    GetEventsFilter, 
    GetAllEventsResult, 
    GetPublicEventsFilter 
} from "@/types/event.types";
import { 
    buildChangeSummary, 
    DetectedChange, 
    detectMajorEventChanges 
} from "@/utils/event-change-detector";
import { 
    validateEventCancel, 
    validateEventCreate, 
    validateEventDelete, 
    validateEventPublish, 
    validateEventSuspend, 
    validateEventUpdateByAdmin, 
    validateEventUpdateByHost 
} from "@/utils/validations/eventValidations";
import { applyEventStatusFilter } from "@/utils/eventStatus.utils";
import { createHttpError } from "@/utils/httpError.utils";
import { Types } from "mongoose";
import { getPublicEventSortQuery, SortConfig } from "@/utils/event.utils";
import { ICacheService } from "@/services/cache-services/interfaces/ICacheService";
import { IPlatformSettingsService } from "@/services/platform-settings-services/interfaces/IPlatformSettingsService";
import { IEventQueueService } from "@/services/queue-services/interfaces/IEventQueueService";
import { EVENT_MESSAGES } from "@/constants/messages.constants";
import { EVENT_FORMATS, EVENT_STATUSES, EventStatus } from "@/constants/event.constants";





export class EventManagementServices implements IEventServices {
    constructor(
        private readonly _eventRepository   : IEventRepository,
        private readonly _bookingService    : IBookingService,
        private readonly _cacheService      : ICacheService,
        private readonly _settingsService   : IPlatformSettingsService,
        private readonly _eventQueueService : IEventQueueService,
        // private _paymentService:    IPaymentService,
        // private _bookingRepository: IBookingRepository,
        // private _notificationServices: INotificationService,
        // private _storageService: IFileStorageService,
    ) {}

    
    async createEvent({ createDto, imageFile }: { 
        createDto: CreateEventRequestDTO; 
        imageFile?: Express.Multer.File;
    }): Promise<EventResponseDTO> {
        try {

            validateEventCreate(createDto, imageFile);

            let eventPosterUrl!: string;

            // separate storage-service needed ??
            // if (imageFile) {
            //     eventPosterUrl = await this._storageService.uploadFile(imageFile.buffer, 'event-posters');
            // }

            if (imageFile) {
                eventPosterUrl = await uploadToCloudinary({
                    fileBuffer: imageFile.buffer,
                    folderPath: 'event-posters',
                    fileType: 'image',
                });
            } else if (createDto.aiGeneratedImage) {
                // need to upload the aiGeneratedImage base64 or url to cloudinary ??
                eventPosterUrl = createDto.aiGeneratedImage;
            }
                                                 
            const eventInput: CreateEventInput = mapCreateEventRequestDtoToInput({
                createDto,
                eventPosterUrl,
            });

            const createdEvent: EventEntity = await this._eventRepository.createEvent(eventInput);

            if (!createdEvent) {
                throw createHttpError(HTTP_STATUS.INTERNAL_SERVER_ERROR, EVENT_MESSAGES.FAILED_CREATE_EVENT);
            }

            const newEvent: EventResponseDTO = mapEventEntityToEventResponseDto(createdEvent);
            // console.log('✅✅ created event : ', newEvent);
            
            return newEvent;

        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : 'Unknown error';
            console.error("Error in EventManagementServices.createEvent:", msg);
            throw error;
        }
    }


    async updateEventByHost({ currentUserId, eventId, updateEventDto, imageFile}: {
        currentUserId: string;
        eventId: string;
        updateEventDto: UpdateEventRequestDTO;
        imageFile?: Express.Multer.File;
    }): Promise<EventResponseDTO> {
        try {
            const existingEvent: EventEntity | null = await this._eventRepository.getEventById(eventId);

            validateEventUpdateByHost(existingEvent, updateEventDto, currentUserId, imageFile);

            return this._executeEventUpdate(existingEvent, updateEventDto, imageFile);

        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : "Unknown error";
            console.error("Error in EventManagementServices.updateEventByHost:", msg);
            throw error;
        }
    }


    async updateEventByAdmin({ eventId, updateEventDto, imageFile}: {
        eventId: string;
        updateEventDto: UpdateEventRequestDTO;
        imageFile?: Express.Multer.File;
    }): Promise<EventResponseDTO> {
        try {
            const existingEvent: EventEntity | null = await this._eventRepository.getEventById(eventId);

            validateEventUpdateByAdmin(existingEvent, updateEventDto, imageFile);

            return this._executeEventUpdate(existingEvent, updateEventDto, imageFile);

        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : "Unknown error";
            console.error("Error in EventManagementServices.updateEventByAdmin:", msg);
            throw error;
        }
    }


    async getAllEvents(filters: GetEventsFilter): Promise<GetAllEventsResult> {
        try {
            const { 
                page, 
                limit, 
                search, 
                status, 
                category, 
                format,
                ticketType,
                sortBy, 
                sortOrder
            } = filters;

            const query: EventFilterQuery = {};

            if (search) {
                query.$or = [
                    { title: { $regex: search, $options: 'i' } },
                    { locationName: { $regex: search, $options: 'i' } },
                ];
            }
            
            // if (status) query.eventStatus = status;
            applyEventStatusFilter(query, status);

            if (category) query.category = category;
            if (format) query.format = format;
            if (ticketType) query.ticketType = ticketType;

            const skip = (page - 1) * limit;
            const sort: Record<string, 1 | -1> = {};
            if (sortBy) {
                sort[sortBy] = sortOrder === "asc" ? 1 : -1;
            }

            console.log('Final query in EventManagementServices.getAllEvents:', query);
            console.log("Sort applied:", sort);

            const [events, totalCount]: [EventEntity[] | null, number] = await Promise.all([
                this._eventRepository.findEvents(query, skip, limit, sort),
                this._eventRepository.countEvents(query)
            ]);

            const mappedEvents: EventResponseDTO[] = events ? events.map(mapEventEntityToEventResponseDto) : [];

            return {
                events: mappedEvents,
                pagination: {
                    totalCount: totalCount,
                    limit: limit,
                    currentPage: page,
                    totalPages: Math.ceil(totalCount / limit)
                }
            };

        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : 'Unknown error';
            console.error("Error in EventManagementServices.getAllEvents:", msg);
            throw error;
        }
    }


    async getUserEvents({userId, filters}: {userId: string, filters: GetEventsFilter}): Promise<GetAllEventsResult> {
        try {
            const { 
                page, 
                limit, 
                search, 
                status, 
                category, 
                format,
                ticketType,
                sortBy, 
                sortOrder
            }: GetEventsFilter = filters;

            const query: EventFilterQuery = {};

            query.hostRef = new Types.ObjectId(userId);

            if (search) {
                query.$or = [
                    { title: { $regex: search, $options: 'i' } },
                    { locationName: { $regex: search, $options: 'i' } },
                ];
            }

            // if (status) query.eventStatus = status;
            applyEventStatusFilter(query, status);

            if (category) query.category = category;
            if (format) query.format = format;
            if (ticketType) query.ticketType = ticketType;

            const skip = (page - 1) * limit;
            const sort: Record<string, 1 | -1> = {};
            if (sortBy) {
                sort[sortBy] = sortOrder === "asc" ? 1 : -1;
            }

            console.log('Final query in EventManagementServices.getUserEvents:', query);
            console.log("Sort applied:", sort);

            const [events, totalCount]: [EventEntity[] | null, number] = await Promise.all([
                this._eventRepository.findEvents(query, skip, limit, sort),
                this._eventRepository.countEvents(query)
            ]);
            
            const mappedEvents: EventResponseDTO[] = events ? events.map(mapEventEntityToEventResponseDto) : [];

            return {
                events: mappedEvents,
                pagination: {
                    totalCount: totalCount,
                    limit: limit,
                    currentPage: page,
                    totalPages: Math.ceil(totalCount / limit)
                }
            };

        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : 'Unknown error';
            console.error("Error in EventManagementServices.getUserEvents:", msg);
            throw error;
        }
    }


    // cancel /suspend by admin
    async suspendEvent({ eventId, suspendReason }: { eventId: string; suspendReason: string; }): Promise<EventStatus | null> {
        try {
            const eventEntity: EventEntity | null = await this._eventRepository.getEventById(eventId);

            validateEventSuspend(eventEntity);

            // suspend the event
            const eventStatusUpdateInput: EventStatusUpdateInput = mapToEventStatusUpdateInput({
                newStatus: EVENT_STATUSES.SUSPENDED,
                reason: suspendReason,
            });
            
            const updatedStatus = await this._eventRepository.updateEventStatus(eventId, eventStatusUpdateInput);

            // Remove the event queque schedule for marking the event status as 'COMPLETED' since the event is suspended
            await this._eventQueueService.removeEventCompletionSchedule(eventId);


            // Cancel + refund all confirmed bookings (batched process)
            await this._bookingService.cancelAllBookingsForEvent(
                eventId,
                `Event suspended by admin: ${suspendReason}`
            );

            // Send notification to host and attendees (later)
            // if (updatedStatus === EVENT_STATUSES.SUSPENDED) {
            //     await Promise.all([
            //         this._notificationServices.sendEventSuspendedToHost(
            //             // eventEntity.hostRef,
            //             eventEntity,
            //             suspendReason
            //         ),
            //         this._notificationServices.sendEventSuspendedToAttendees(
            //             // eventId,
            //             eventEntity,
            //             suspendReason
            //         )
            //     ]);
            // }

            return updatedStatus;

        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : 'Unknown error';
            console.error("Error in EventServices.suspendEvent:", msg);
            throw error;
        }
    }


    // cancel by host
    async cancelEvent({ eventId, userId, cancelReason }: { eventId: string; userId: string; cancelReason: string; }): Promise<EventStatus | null> {
        try {
            const eventEntity: EventEntity | null = await this._eventRepository.getEventById(eventId);

            validateEventCancel(eventEntity, userId);

            // cancel the event
            const eventStatusUpdateInput: EventStatusUpdateInput = mapToEventStatusUpdateInput({
                newStatus: EVENT_STATUSES.CANCELLED,
                reason: cancelReason,
            });
            
            const updatedStatus = await this._eventRepository.updateEventStatus(eventId, eventStatusUpdateInput);

            // Remove the event queque schedule for marking the event status as 'COMPLETED' since the event is cancelled
            await this._eventQueueService.removeEventCompletionSchedule(eventId);
            
            // Cancel + refund all confirmed bookings (batched process)
            await this._bookingService.cancelAllBookingsForEvent(
                eventId,
                `Event cancelled by host: ${cancelReason}`
            );

            // Send notification to host and attendees (later)
            // if (updatedStatus === EVENT_STATUSES.CANCELLED) {
            //     await Promise.all([
            //         this._notificationServices.sendEventSuspendedToHost(
            //             // eventEntity.hostRef,
            //             eventEntity,
            //             cancelReason
            //         ),
            //         this._notificationServices.sendEventSuspendedToAttendees(
            //             // eventId,
            //             eventEntity,
            //             cancelReason
            //         )
            //     ]);
            // }

            return updatedStatus;

        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : 'Unknown error';
            console.error("Error in EventManagementServices.cancelEvent:", msg);
            throw error;
        }
    }



    async publishEvent(eventId: string, userId: string): Promise<void> {
        try {
            const eventEntity: EventEntity | null = await this._eventRepository.getEventById(eventId);

            validateEventPublish(eventEntity, userId);

            const eventStatusUpdateInput: EventStatusUpdateInput = {eventStatus: EVENT_STATUSES.PUBLISHED};

            // generate online link at publish time
            // if (event.format === "online" && !event.onlineLink) {
            //     updateData.onlineLink = generateMeetingLink(event);
            // }

            await this._eventRepository.updateEventStatus(eventId, eventStatusUpdateInput);

            // update event status as 'COMPLETED' when the event finish (using BullMQ background job)
            await this._eventQueueService.scheduleEventCompletion(eventId, eventEntity.endDateTime);

            await this._cacheService.deleteKeyValue("trending_events");

        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : 'Unknown error';
            console.error("Error in EventManagementServices.publishEvent:", msg);
            throw error;
        }
    }



    async deleteEvent(eventId: string): Promise<void> {
        try {
            const event = await this._eventRepository.getEventById(eventId);

            validateEventDelete(event);

            if (event.posterUrl && event.posterUrl.trim() !== '') {
                try {
                    await deleteFromCloudinary({fileUrl: event.posterUrl, resourceType: 'image'});
                } catch (cleanupErr) {
                    console.warn("Failed to delete event poster from Cloudinary:", cleanupErr);
                }
            }

            // Remove the event queque schedule for marking the event status as 'COMPLETED' since the event is suspended
            await this._eventQueueService.removeEventCompletionSchedule(eventId);

            await this._eventRepository.deleteEvent(eventId);
            
            return;
            
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : 'Unknown error';
            console.error("Error in EventManagementServices.deleteEvent:", msg);
            throw error;
        }
    }


    async getEventsForDiscovery(filters: GetPublicEventsFilter): Promise<GetDiscoveryEventsResult> {
        const { page, limit, search, startDate, endDate, category, format, ticketType, lat, lng, radiusKm, sortBy } = filters;
        const skip = (page - 1) * limit;
        
        const dbQuery: EventFilterQuery = { 
            eventStatus: EVENT_STATUSES.PUBLISHED,
            endDateTime: { $gt: new Date() } // Only show events that haven't ended
        };

        if (startDate || endDate) {
            dbQuery.startDateTime = {}; 

            if (startDate) {
                dbQuery.startDateTime.$gte = new Date(startDate);
            }

            if (endDate) {
                const endOfDay = new Date(endDate);
                endOfDay.setUTCHours(23, 59, 59, 999);
                dbQuery.startDateTime.$lte = endOfDay;
            }
        }

        // search with exact match.
        // if (search) {
        //     dbQuery.$text = { $search: search };
        // }

        if (search) {
            const searchRegex = new RegExp(search.trim(), 'i');
            dbQuery.$or = [
                { title: searchRegex },
                { locationName: searchRegex },
            ];
        }

        if (category) dbQuery.category = category;
        if (format) dbQuery.format = format;
        if (ticketType) dbQuery.ticketType = ticketType;

        console.log('lat :', lat, ', lng:', lng, ', radiusKm:', radiusKm);

        if (lat && lng && radiusKm) {
            dbQuery.location = {
                $geoWithin: {
                $centerSphere: [
                    [lng, lat],               // IMPORTANT: [longitude, latitude] order
                    radiusKm / 6378.1         // Earth radius in km ≈ 6378.1 → convert km to radians
                ]
                }
            };
        }

        const { sortField, sortOrder }: SortConfig = getPublicEventSortQuery(sortBy)
        console.log('Selected Sort Option :', sortBy)
        console.log('sortField :', sortField, 'sortOrder :', sortOrder)

        const { events, totalCount } = await this._eventRepository.getPublicEvents(
            dbQuery, 
            skip, 
            limit, 
            sortField, 
            sortOrder
        );

        // 3. Map Mongoose documents to secure public DTOs
        // (Removing sensitive info like onlineLink [cite: 186, 523])
        const eventsData: EventResponseDTO[] = events ? events.map(mapEventEntityToEventResponseDto) : [];

        return {
            eventsData,
            pagination: {
                totalCount: totalCount,
                limit: limit,
                currentPage: page,
                totalPages: Math.ceil(totalCount / limit)
            }
        };
    }



    async getEventDetails(eventId: string): Promise<EventResponseDTO> {
        const eventEntity: EventEntity | null = await this._eventRepository.getEventById(eventId);

        if (!eventEntity){
            throw createHttpError(HTTP_STATUS.NOT_FOUND, EVENT_MESSAGES.EVENT_NOT_FOUND);
        }

        this._eventRepository.incrementEventViews(eventId).catch(err =>
            console.warn('Failed to increment views:', err)
        );
        
        const eventDetails: EventResponseDTO = mapEventEntityToEventResponseDto(eventEntity);

        return eventDetails;
    }



    async getTrendingEvents(limit: number): Promise<EventResponseDTO[]> {
        const CACHE_KEY = "trending_events";
        const TTL = 60 * 20; // 20 minutes

        const cached: string | null = await this._cacheService.getKeyValue(CACHE_KEY);

        if (cached) {
            const cachedTredingEvents: EventResponseDTO[] = JSON.parse(cached) as EventResponseDTO[];
            return cachedTredingEvents;
        }

        const events: EventEntity[] = await this._eventRepository.getTrendingEvents(limit);
        const trendingEvents: EventResponseDTO[] = events.map(mapEventEntityToEventResponseDto);

        await this._cacheService.setKeyValue(CACHE_KEY, JSON.stringify(trendingEvents), TTL);

        return trendingEvents;
    }




    // used for both updateEventByHost & updateEventByAdmin
    private async _executeEventUpdate(
        existingEvent: EventEntity, 
        updateEventDto: UpdateEventRequestDTO, 
        imageFile?: Express.Multer.File
    ): Promise<EventResponseDTO> {

        let updatedPosterUrl: string | undefined = undefined;

        if (imageFile) {
            updatedPosterUrl = await uploadToCloudinary({
                fileBuffer: imageFile.buffer,
                folderPath: "event-posters",
                fileType:   "image",
            });
        } else if (updateEventDto.aiGeneratedImage) {
            // Upload the base64 AI image to Cloudinary — do NOT store raw base64 as URL.
            updatedPosterUrl = await uploadBase64ToCloudinary({
                base64Data: updateEventDto.aiGeneratedImage,
                folderPath: "event-posters",
            });
        }

        const updateEventInput: UpdateEventInput = mapUpdateEventRequestDtoToInput({
            existingEvent,
            updateEventDto,
            updatedPosterUrl,
        });

        const formatChanged = !!updateEventDto.format && updateEventDto.format !== existingEvent.format;
        const isPublished   = existingEvent.eventStatus === EVENT_STATUSES.PUBLISHED;

        if (formatChanged) {
            if (updateEventDto.format === EVENT_FORMATS.OFFLINE) {
                // Switching to offline: clear the online link, ensure location is present
                updateEventInput.onlineLink    = null;
                updateEventInput.locationName  = updateEventDto.locationName;
                updateEventInput.location      = updateEventDto.location;
            }

            if (updateEventDto.format === EVENT_FORMATS.ONLINE) {
                // Switching to online: clear location fields
                updateEventInput.locationName = undefined;
                updateEventInput.location     = null;

                // If event is already published, generate the online link immediately.
                // If still draft, the link will be generated at publish time.
                if (isPublished) {
                    // updateEventInput.onlineLink = generateMeetingLink(existingEvent);
                }
            }
        }


        // if no changes made while updating event
        if (Object.keys(updateEventInput).length === 0) {
            // throw createHttpError(HTTP_STATUS.BAD_REQUEST, HttpResponse.NO_CHANGE_MADE);
        }

        const updatedEvent: EventEntity | null = await this._eventRepository.updateEvent(existingEvent.eventId, updateEventInput);

        if (!updatedEvent) {
            throw createHttpError(HTTP_STATUS.INTERNAL_SERVER_ERROR, EVENT_MESSAGES.FAILED_UPDATE_EVENT);
        }


        // Reschedule queque for marking the event status as 'COMPLETED' if endDateTime changed AND event is published
        if (updatedEvent.eventStatus === EVENT_STATUSES.PUBLISHED) {
            const endDateTimeChanged = 
                updateEventDto.endDateTime && 
                new Date(updateEventDto.endDateTime).getTime() !== existingEvent.endDateTime.getTime();

            if (endDateTimeChanged) {
                await this._eventQueueService.rescheduleEventCompletion(updatedEvent.eventId, updatedEvent.endDateTime);
            }
        }

        // ── Major change detection → grace period implememtation ────────────────────────────
        const hasStarted = existingEvent.startDateTime <= new Date();
        if (!hasStarted) {
            const majorChanges: DetectedChange[] = detectMajorEventChanges(existingEvent, updateEventDto);

            if (majorChanges.length > 0 && existingEvent.soldTickets > 0) {

                const settings = await this._settingsService.getPlatformSettings();

                const gracePeriodEnd = new Date(
                    Math.min(
                        existingEvent.startDateTime.getTime(),
                        Date.now() + settings.gracePeriodHours * 60 * 60 * 1000
                    )
                );

                await this._bookingService.setGracePeriodForEvent(existingEvent.eventId, {
                    gracePeriodEnd,
                    summary: buildChangeSummary(majorChanges),
                    changes:  majorChanges,
                });

                // TODO: notify confirmed bookers via email/SMS/push with summary + gracePeriodEnd
            }
        }

        const mappedEvent: EventResponseDTO = mapEventEntityToEventResponseDto(updatedEvent);
        return mappedEvent;

    }



}