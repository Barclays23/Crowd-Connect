// backend/src/services/event-services/implementations/eventManagement.service.ts
import { deleteFromCloudinary, uploadToCloudinary } from "@/config/cloudinary";
import { HttpResponse } from "@/constants/responseMessages.constants";
import { HttpStatus } from "@/constants/statusCodes.constants";
import { CreateEventDTO, EventResponseDTO } from "@/dtos/event.dto";
import { CreateEventInput, EventEntity, EventStatusUpdateInput } from "@/entities/event.entity";
import { mapCreateEventRequestDtoToInput, mapEventEntityToEventResponseDto, mapToEventStatusUpdateInput, mapToEventStatusUpdateResponseDto } from "@/mappers/event.mapper";
import { IEventRepository } from "@/repositories/interfaces/IEventRepository";
import { IEventManagementServices } from "@/services/event-services/interfaces/IEventManagementServices";
import { EVENT_FORMAT, EVENT_STATUS, EventFilterQuery, GetEventsFilter, GetEventsResult, TICKET_TYPE } from "@/types/event.types";
import { getEventDisplayStatus } from "@/utils/eventStatus.utils";
import { createHttpError } from "@/utils/httpError.utils";





export class EventManagementServices implements IEventManagementServices {
    constructor(
        private _eventRepository: IEventRepository,
        // private _notificationServices: INotificationService,
        // private _storageService: IFileStorageService,
    ) {}

    
    async createEvent({ createDto, imageFile }: { 
        createDto: CreateEventDTO; 
        imageFile?: Express.Multer.File;
    }): Promise<EventResponseDTO> {
        try {
            if (createDto.startDateTime >= createDto.endDateTime) {
                throw createHttpError(HttpStatus.BAD_REQUEST, "Event end time must be after start time");
            }

            if (createDto.format === EVENT_FORMAT.OFFLINE && !createDto.location) {
                throw createHttpError(HttpStatus.BAD_REQUEST, "Offline events must have a location" );
            }

            // if (createDto.format === EVENT_FORMAT.ONLINE && !createDto.onlineLink) {
            //     throw createHttpError(HttpStatus.BAD_REQUEST, "Online events must have an online link");
            // }

            if (createDto.ticketType === TICKET_TYPE.FREE && createDto.ticketPrice > 0) {
                throw createHttpError(HttpStatus.BAD_REQUEST, "Free events cannot have a ticket price.");
            }
            if (createDto.ticketType === TICKET_TYPE.PAID && createDto.ticketPrice <= 0) {
                throw createHttpError(HttpStatus.BAD_REQUEST, "Paid events must have a ticket price.");
            }

            if (!imageFile && !createDto.aiGeneratedImage) {
                throw createHttpError(HttpStatus.BAD_REQUEST, "Event poster is required");
            }

            let eventPosterUrl!: string;

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
                throw createHttpError(HttpStatus.INTERNAL_SERVER_ERROR, HttpResponse.FAILED_CREATE_EVENT);
            }

            const newEvent: EventResponseDTO = mapEventEntityToEventResponseDto(createdEvent);
            console.log('✅✅ created event : ', newEvent);
            
            return newEvent;

        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : 'Unknown error';
            console.error("Error in EventManagementServices.createEvent:", msg);
            throw error;
        }
    }


    async getAllEvents(filters: GetEventsFilter): Promise<GetEventsResult> {
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
            if (status) query.eventStatus = status;
            if (category) query.category = category;
            if (format) query.format = format;
            if (ticketType) query.ticketType = ticketType;

            const skip = (page - 1) * limit;
            const sort: any = {};
            sort[sortBy!] = sortOrder === "asc" ? 1 : -1;

            console.log('Final query in EventManagementServices.getAllEvents:', query);
            console.log("Sort applied:", sort);

            const [events, totalCount]: [EventEntity[] | null, number] = await Promise.all([
                this._eventRepository.findEvents(query, skip, limit, sort),
                this._eventRepository.countEvents(query)
            ]);

            const mappedEvents: EventResponseDTO[] = events ? events.map(mapEventEntityToEventResponseDto) : [];

            return {
                events: mappedEvents,
                page,
                limit,
                totalCount,
                totalPages: Math.ceil(totalCount / limit),
            };

        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : 'Unknown error';
            console.error("Error in EventManagementServices.getAllEvents:", msg);
            throw error;
        }
    }


    async suspendEvent({ eventId, suspendReason }: { eventId: string; suspendReason: string; }): Promise<EVENT_STATUS | undefined> {
        try {
            const eventEntity: EventEntity | null = await this._eventRepository.getEventById(eventId);
            if (!eventEntity) {
                throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.EVENT_NOT_FOUND);
            }
            
            const displayStatus: EVENT_STATUS = getEventDisplayStatus(eventEntity);
            const allowedToSuspend = [
                EVENT_STATUS.UPCOMING,
                EVENT_STATUS.ONGOING
            ];

            if (!allowedToSuspend.includes(displayStatus)) {
                throw createHttpError(
                    HttpStatus.BAD_REQUEST,
                    `Cannot suspend an event with status "${displayStatus}"`
                );
            }

            const eventStatusUpdateInput: EventStatusUpdateInput = mapToEventStatusUpdateInput({
                newStatus: EVENT_STATUS.SUSPENDED, 
                reason: suspendReason
            });
            
            // if need full entity
            // const updatedEventEntity: EventEntity | null = await this._eventRepository.updateEventStatus(eventId, eventStatusUpdateInput);
            // const updatedStatusResponse: HostStatusUpdateResponseDto = mapToEventStatusUpdateResponseDto(updatedEventEntity)
            // return updatedStatusResponse;

            // if need only updated status
            // const updatedStatus: EVENT_STATUS | undefined = await this._eventRepository.updateEventStatus(eventId, eventStatusUpdateInput);

            const updatedStatus = EVENT_STATUS.SUSPENDED;

            // Send notification to host and attendees (later)
            // if (updatedStatus === EVENT_STATUS.SUSPENDED) {
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
            console.error("Error in EventManagementServices.suspendEvent:", msg);
            throw error;
        }
    }


    async deleteEvent(eventId: string): Promise<void> {
        try {
            const event = await this._eventRepository.getEventById(eventId);

            if (!event){
                throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.EVENT_NOT_FOUND);
            }

            if (event.posterUrl && event.posterUrl.trim() !== '') {
                try {
                    await deleteFromCloudinary({fileUrl: event.posterUrl, resourceType: 'image'});
                } catch (cleanupErr) {
                    console.warn("Failed to delete event poster from Cloudinary:", cleanupErr);
                }
            }

            await this._eventRepository.deleteEvent(eventId);
            
            return;
            
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : 'Unknown error';
            console.error("Error in EventManagementServices.deleteEvent:", msg);
            throw error;
        }
    }


}