// backend/src/services/interfaces/IAuthRecovery.ts

import { CreateEventDTO, EventResponseDTO } from "@/dtos/event.dto";
import { EVENT_STATUS, GetEventsFilter, GetAllEventsResult } from "@/types/event.types";


export interface IEventManagementServices {
    createEvent({ createDto, imageFile }: { 
        createDto: CreateEventDTO; 
        imageFile?: Express.Multer.File;
        // currentUserId: string;
    }): Promise<EventResponseDTO>;

    publishEvent(eventId: string, userId: string): Promise<void>;

    getAllEvents(filters: GetEventsFilter): Promise<GetAllEventsResult>;
    
    suspendEvent({eventId, suspendReason}: {eventId: string, suspendReason: string}): Promise<EVENT_STATUS | undefined>;
    
    deleteEvent(eventId: string): Promise<void>;
    
    getUserEvents({userId, filters}: {userId: string, filters: GetEventsFilter}): Promise<GetAllEventsResult>;
}