// backend/src/repositories/interfaces/IEventRepository.ts

import { CreateEventInput, EventEntity, EventStatusUpdateInput, UpdateEventInput } from "@/entities/event.entity";
import { EVENT_STATUS, EventFilterQuery, IEventModelPopulatedHost, SortQuery } from "@/types/event.types";


export interface IEventRepository {
    createEvent(eventInput: CreateEventInput) : Promise<EventEntity>;
    updateEvent(eventId: string, eventInput: UpdateEventInput) : Promise<EventEntity|null>;
    findEvents(filterQuery: EventFilterQuery, skip: number, limit: number, sort: SortQuery): Promise<EventEntity[] | null>;
    countEvents(filterQuery: EventFilterQuery): Promise<number>;
    getEventById(eventId: string): Promise<EventEntity | null>;
    updateEventStatus(eventId: string, updateInput: EventStatusUpdateInput): Promise<EVENT_STATUS | undefined>;
    deleteEvent(eventId: string): Promise<void>;
    getPublicEvents(
        filters: EventFilterQuery, 
        skip: number, limit: number, 
        sortField: string, sortOrder: 1 | -1
    ): Promise<{ eventEntity: EventEntity[] | null; totalCount: number }>;

    incrementEventTicketStats(eventId: string, newBookingQty: number, totalAmount: number): Promise<void>;
    decrementEventTicketStats(eventId: string, cancelledQty: number, totalAmount: number): Promise<void>;
}