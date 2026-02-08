// // backend/src/repositories/implementations/event.repository.ts

import { CreateEventInput, EventEntity } from "@/entities/event.entity";
import { mapEventModelToEventEntity } from "@/mappers/event.mapper";
import Event from "@/models/implementations/event.model";
import { BaseRepository } from "@/repositories/base.repository";
import { IEventRepository } from "@/repositories/interfaces/IEventRepository";
import { IEventModel } from "@/types/event.types";



export class EventRepository extends BaseRepository<IEventModel> implements IEventRepository {
    constructor() {
        super(Event);
    }

    async createEvent(eventInput: CreateEventInput): Promise<EventEntity> {
        try {
            const eventData: IEventModel = await this.createOne(eventInput);
            const eventEntity: EventEntity = mapEventModelToEventEntity(eventData);
            return eventEntity;

        } catch (error) {
            const msg = error instanceof Error ? error.message : 'Unknown error';
            console.error("Error in EventRepository.createEvent:", msg);
            throw error;
        }
    }

    
}