// backend/src/repositories/interfaces/IEventRepository.ts

import { CreateEventInput, EventEntity, EventStatusUpdateInput } from "@/entities/event.entity";
import { EVENT_STATUS, EventFilterQuery } from "@/types/event.types";


export interface IEventRepository {
    createEvent(eventInput: CreateEventInput) : Promise<EventEntity>;
    findEvents(filterQuery: EventFilterQuery, skip: number, limit: number, sort: any): Promise<EventEntity[] | null>;
    countEvents(filterQuery: EventFilterQuery): Promise<number>;
    getEventById(eventId: string): Promise<EventEntity | null>;
    updateEventStatus(eventId: string, updateInput: EventStatusUpdateInput): Promise<EVENT_STATUS | undefined>;
    deleteEvent(eventId: string): Promise<void>;
}