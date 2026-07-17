// backend/src/services/event-services/interfaces/IEventServices.ts
import { EventStatus } from "@/constants/event.constants";
import { 
    CreateEventRequestDTO, 
    EventResponseDTO, 
    GetDiscoveryEventsResult, 
    GetOrganiserEventsResult, 
    UpdateEventRequestDTO 
} from "@/dtos/event.dto";
import { 
    GetEventsFilter, 
    GetAllEventsResult, 
    GetPublicEventsFilter, 
    GetOrganiserEventsFilter
} from "@/types/event.types";


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

    cancelEvent({ eventId, userId, cancelReason }: { eventId: string; userId: string; cancelReason: string; }): Promise<EventStatus | null>
    
    suspendEvent({eventId, suspendReason}: {eventId: string, suspendReason: string}): Promise<EventStatus | null>;
    
    deleteEvent(eventId: string): Promise<void>;

    getUserEvents({userId, filters}: {userId: string, filters: GetEventsFilter}): Promise<GetAllEventsResult>;
    
    getEventsForDiscovery(filters: GetPublicEventsFilter): Promise<GetDiscoveryEventsResult>;

    getOrganiserEvents(filters: GetOrganiserEventsFilter): Promise<GetOrganiserEventsResult>

    getTrendingEvents(limit: number): Promise<EventResponseDTO[]>;
    
    getEventDetails(eventId: string): Promise<EventResponseDTO>;

}