// backend/src/services/event-services/implementations/eventManagement.service.ts
import { uploadToCloudinary } from "@/config/cloudinary";
import { HttpResponse } from "@/constants/responseMessages.constants";
import { HttpStatus } from "@/constants/statusCodes.constants";
import { CreateEventDTO, EventResponseDTO } from "@/dtos/event.dto";
import { CreateEventInput, EventEntity } from "@/entities/event.entity";
import { mapCreateEventRequestDtoToInput, mapEventEntityToEventResponseDto } from "@/mappers/event.mapper";
import { IEventRepository } from "@/repositories/interfaces/IEventRepository";
import { IEventManagementServices } from "@/services/event-services/interfaces/IEventManagementServices";
import { EVENT_FORMAT, TICKET_TYPE } from "@/types/event.types";
import { createHttpError } from "@/utils/httpError.utils";




export class EventManagementServices implements IEventManagementServices {
    constructor(private _eventRepository: IEventRepository) {
        
    }

    
    async createEvent({ createDto, imageFile }: { 
        createDto: CreateEventDTO; 
        imageFile?: Express.Multer.File;
        // currentUserId: string;
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

    
console.time("uploadImage");
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
console.timeEnd("uploadImage");
                                                 
            const eventInput: CreateEventInput = mapCreateEventRequestDtoToInput({
                createDto,
                eventPosterUrl,
                // currentUserId,
            });

console.time("saveEvent");
            const createdEvent: EventEntity = await this._eventRepository.createEvent(eventInput);
console.timeEnd("saveEvent");

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


}