// backend/src/services/interfaces/IAuthRecovery.ts

import { CreateEventDTO, EventResponseDTO } from "@/dtos/event.dto";
import { EVENT_STATUS, GetEventsFilter, GetEventsResult } from "@/types/event.types";


export interface IEventManagementServices {
    createEvent({ createDto, imageFile }: { 
        createDto: CreateEventDTO; 
        imageFile?: Express.Multer.File;
        // currentUserId: string;
    }): Promise<EventResponseDTO>;

    getAllEvents(filters: GetEventsFilter): Promise<GetEventsResult>;

    suspendEvent({eventId, suspendReason}: {eventId: string, suspendReason: string}): Promise<EVENT_STATUS | undefined>;

    deleteEvent(eventId: string): Promise<void>;
 
}