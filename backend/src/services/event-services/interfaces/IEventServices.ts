// backend/src/services/event-services/interfaces/IEventServices.ts

import { CreateEventRequestDTO, EventResponseDTO, GetDiscoveryEventsResult, UpdateEventRequestDTO } from "@/dtos/event.dto";
import { EVENT_STATUS, GetEventsFilter, GetAllEventsResult, GetPublicEventsFilter } from "@/types/event.types";


export interface IEventServices {
    createEvent({ createDto, imageFile }: { 
        createDto: CreateEventRequestDTO; 
        imageFile?: Express.Multer.File;
    }): Promise<EventResponseDTO>;

    updateEventByHost({currentUserId, eventId, updateEventDto, imageFile }: { 
        currentUserId: string;
        eventId: string;
        updateEventDto: UpdateEventRequestDTO; 
        imageFile?: Express.Multer.File;
    }): Promise<EventResponseDTO>;

    updateEventByAdmin({eventId, updateEventDto, imageFile }: { 
        eventId: string;
        updateEventDto: UpdateEventRequestDTO; 
        imageFile?: Express.Multer.File;
    }): Promise<EventResponseDTO>;

    publishEvent(eventId: string, userId: string): Promise<void>;

    getAllEvents(filters: GetEventsFilter): Promise<GetAllEventsResult>;

    cancelEvent({ eventId, userId, cancelReason }: { eventId: string; userId: string; cancelReason: string; }): Promise<EVENT_STATUS | undefined>
    
    suspendEvent({eventId, suspendReason}: {eventId: string, suspendReason: string}): Promise<EVENT_STATUS | undefined>;
    
    deleteEvent(eventId: string): Promise<void>;

    getUserEvents({userId, filters}: {userId: string, filters: GetEventsFilter}): Promise<GetAllEventsResult>;
    
    getEventsForDiscovery(filters: GetPublicEventsFilter): Promise<GetDiscoveryEventsResult>;

    getTrendingEvents(limit: number): Promise<EventResponseDTO[]>;
    
    getEventDetails(eventId: string): Promise<EventResponseDTO>;
}