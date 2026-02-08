// backend/src/repositories/interfaces/IEventRepository.ts

import { CreateEventInput, EventEntity } from "@/entities/event.entity";


export interface IEventRepository {
    createEvent(eventInput: CreateEventInput) : Promise<EventEntity>;
}