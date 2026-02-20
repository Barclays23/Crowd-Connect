// // backend/src/repositories/implementations/event.repository.ts

import { CreateEventInput, EventEntity, EventStatusUpdateInput } from "@/entities/event.entity";
import { mapEventModelToEventEntity } from "@/mappers/event.mapper";
import Event from "@/models/implementations/event.model";
import { BaseRepository } from "@/repositories/base.repository";
import { IEventRepository } from "@/repositories/interfaces/IEventRepository";
import { EVENT_STATUS, EventFilterQuery, IEventModel, IEventModelPopulatedHost } from "@/types/event.types";



export class EventRepository extends BaseRepository<IEventModel> implements IEventRepository {
   constructor() {
      super(Event);
   }

   async createEvent(eventInput: CreateEventInput): Promise<EventEntity> {
      try {
         const eventData = await this.createOne(eventInput);
         const eventEntity: EventEntity = mapEventModelToEventEntity(eventData);
         return eventEntity;

      } catch (error) {
         const msg = error instanceof Error ? error.message : 'Unknown error';
         console.error("Error in EventRepository.createEvent:", msg);
         throw error;
      }
   }


   async findEvents(query: EventFilterQuery, skip: number, limit: number, sort: any) {
      const paginatedEvents: IEventModelPopulatedHost[] = await this.model.find(query)
         .select('-onlineLink')  // include the fields that event listing not needed
         .populate("hostRef", "name organizationName")
         .collation({ locale: 'en', strength: 2 })  // for case-insensitive sort
         .sort(sort ? sort : {createdAt: -1})
         .skip(skip)
         .limit(limit)
         .lean<IEventModelPopulatedHost[]>() // faster + easier to map

         // console.log('paginatedEvents :', paginatedEvents);

      const result: EventEntity[] | null = paginatedEvents ? paginatedEvents.map(event => mapEventModelToEventEntity(event)) : null;
      return result;
   }

   async countEvents(query: EventFilterQuery): Promise<number> {
      const count: number = await this.model.countDocuments(query);
      try {
         const count: number = await this.countDocuments(query);
         return count;
      } catch (error) {
         console.log('error in countEvents :', error);
         throw new Error("Error Counting Events");
      }
   }


   async getEventById(eventId: string): Promise<EventEntity | null> {
      const eventData: IEventModel | null = await this.model.findById(eventId);
      const result: EventEntity | null = eventData ? mapEventModelToEventEntity(eventData) : null;
      return result;
   }



   async updateEventStatus(eventId: string, updateInput: EventStatusUpdateInput): Promise<EVENT_STATUS|undefined> {
      try {
         const updatedEventData: IEventModel | null = await this.findByIdAndUpdate(eventId, updateInput);
         // const result: EventEntity | null = updatedEventData ? mapEventModelToEventEntity(updatedEventData) : null;
         // return result;
         const updatedStatus = updatedEventData?.eventStatus;
         return updatedStatus;

      } catch (error) {
         console.log('error in eventRepository.updateEventStatus :', error);
         throw error;
      }
   }



   async deleteEvent(eventId: string): Promise<void> {
      try {
         await this.findByIdAndDelete(eventId);
      } catch (error) {
         console.log('error in deleteEvent :', error);
         throw error;
      }
   }
   

    
}