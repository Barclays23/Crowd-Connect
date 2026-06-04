// backend/src/repositories/interfaces/IEventRepository.ts

import { CreateEventInput, EventEntity, EventStatusUpdateInput, UpdateEventInput } from "@/entities/event.entity";
import { EVENT_STATUS, EventFilterQuery, SortQuery } from "@/types/event.types";
import { ClientSession } from "mongoose";


export interface IEventRepository {
    createEvent(eventInput: CreateEventInput) : Promise<EventEntity>;

    
    findEvents(filterQuery: EventFilterQuery, skip: number, limit: number, sort: SortQuery): Promise<EventEntity[]>;
    getTrendingEvents(limit: number): Promise<EventEntity[]>;
    getEventById(eventId: string): Promise<EventEntity | null>;
    getPublicEvents(
        filters: EventFilterQuery, 
        skip: number, limit: number, 
        sortField: string, sortOrder: 1 | -1
    ): Promise<{ events: EventEntity[]; totalCount: number }>;
    getCompletedEventsByHost(hostId: string): Promise<EventEntity[]>;
    
    updateEvent(eventId: string, eventInput: UpdateEventInput) : Promise<EventEntity|null>;
    updateEventStatus(eventId: string, updateInput: EventStatusUpdateInput): Promise<EVENT_STATUS | null>;
    deleteEvent(eventId: string): Promise<void>;

    countEvents(filterQuery: EventFilterQuery): Promise<number>;
    
    incrementEventViews(eventId: string): Promise<void>;
    incrementEventTicketAndRevenueStats(eventId: string, newBookingQty: number, totalAmount: number, options?: { session?: ClientSession }): Promise<void>;
    decrementEventTicketAndRevenueStats(eventId: string, cancelledQty: number, totalAmount: number, options?: { session?: ClientSession }): Promise<void>;
    incrementEventCheckedInCount(eventId: string, count: number): Promise<void>;
    
    
    startSession(): Promise<ClientSession>;
}