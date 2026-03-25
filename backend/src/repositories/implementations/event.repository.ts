// // backend/src/repositories/implementations/event.repository.ts

import { CreateEventInput, EventEntity, EventStatusUpdateInput, UpdateEventInput } from "@/entities/event.entity";
import { mapEventModelToEventEntity } from "@/mappers/event.mapper";
import Event from "@/models/implementations/event.model";
import { BaseRepository } from "@/repositories/base.repository";
import { IEventRepository } from "@/repositories/interfaces/IEventRepository";
import { EVENT_STATUS, EventFilterQuery, IEventModel, IEventModelPopulatedHost, SortQuery } from "@/types/event.types";
import { isGeoNearQuery } from "@/utils/general.utils";



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


   async updateEvent(eventId: string, updateInput: UpdateEventInput): Promise<EventEntity|null> {
      try {
         const updatedEventData: IEventModel | null = await this.findByIdAndUpdate(eventId, updateInput);
         const updatedEvent: EventEntity | null = updatedEventData ? mapEventModelToEventEntity(updatedEventData) : null;
         return updatedEvent;

      } catch (error) {
         console.log('error in eventRepository.updateEvent :', error);
         throw error;
      }
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


   // for showing the events in public events page.
   async getPublicEvents(
      filters: EventFilterQuery,
      skip: number,
      limit: number,
      sortField: string,
      sortDirection: 1 | -1
   ): Promise<{ eventEntity: EventEntity[] | null; totalCount: number }> {

      const query = this.model.find(filters)
         .select('-onlineLink') // don't fetch link for public users
         .populate("hostRef", "name organizationName");

      const isGeospatial = filters.location && isGeoNearQuery(filters.location);

      if (!isGeospatial) {
         query.sort({ [sortField]: sortDirection });
      }

      const paginatedEvents: IEventModelPopulatedHost[] = await query.skip(skip).limit(limit).lean<IEventModelPopulatedHost[]>().exec();
      const eventEntity: EventEntity[] | null = paginatedEvents ? paginatedEvents.map(event => mapEventModelToEventEntity(event)) : null;
      const totalCount: number = await this.model.countDocuments(filters).exec();

      return { eventEntity, totalCount };
   }


   // for listing events in user/admin dashboard
   async findEvents(query: EventFilterQuery, skip: number, limit: number, sort: SortQuery) {
      const paginatedEvents = await this.model.find(query)
         .select('-onlineLink') // dont send online link to public users
         .populate("hostRef", "name organizationName")
         .collation({ locale: 'en', strength: 2 })
         .sort(sort ? sort : { createdAt: -1 })
         .skip(skip)
         .limit(limit)
         .lean<IEventModelPopulatedHost[]>()
         .exec();

         const eventEntity: EventEntity[] | null = paginatedEvents ? paginatedEvents.map(event => mapEventModelToEventEntity(event)) : null;
      return eventEntity;
   }


   async getTrendingEvents(limit: number): Promise<EventEntity[]> {
      const now = new Date();
      const results = await this.model.aggregate([
         {
            $match: {
               eventStatus: EVENT_STATUS.PUBLISHED,
               endDateTime: { $gt: now },
            }
         },
         {
            $addFields: {
               trendingScore: {
               $add: [
                  // 50% weight: sell-through rate (soldTickets / capacity)
                  { $multiply: [
                        { $divide: ["$soldTickets", { $max: ["$capacity", 1] }] },
                        0.5
                  ]},
                  // 30% weight: views (normalized — views / (views + 100) keeps it 0–1)
                  { $multiply: [
                        { $divide: ["$views", { $add: ["$views", 100] }] },
                        0.3
                  ]},
                  // 20% weight: recency boost (closer start date = higher score)
                  { $multiply: [
                        { $min: [
                           { $divide: [
                           1,
                           { $max: [
                              { $divide: [{ $subtract: ["$startDateTime", now] }, 86400000] }, // days until start
                              1
                           ]}
                           ]},
                           1
                        ]},
                        0.2
                  ]}
               ]
               }
            }
         },
         { $sort: { trendingScore: -1 } },
         { $limit: limit },
         {
            $lookup: {
               from: "users",
               localField: "hostRef",
               foreignField: "_id",
               as: "hostRef"
            }
         },
         { $unwind: "$hostRef" },
         { $project: { onlineLink: 0, trendingScore: 0 } } // strip computed field before returning
      ]);

      return results.map(event => mapEventModelToEventEntity(event));
   }



   async countEvents(query: EventFilterQuery): Promise<number> {
      return await this.model.countDocuments(query).exec();
   }


   async getEventById(eventId: string): Promise<EventEntity | null> {
      const eventData: IEventModelPopulatedHost | null = await this.findByIdQuery(eventId)
         .populate('hostRef')
         .lean<IEventModelPopulatedHost>()
         .exec();

      const result: EventEntity | null = eventData ? mapEventModelToEventEntity(eventData) : null;
      return result;
   }


   async incrementEventViews(eventId: string): Promise<void> {
      await this.model.findByIdAndUpdate(eventId, { $inc: { views: 1 } });
   }


   async incrementEventTicketStats(eventId: string, newBookingQty: number, totalAmount: number): Promise<void> {
      try {
         await this.model.findByIdAndUpdate(eventId, {
            $inc: {
               soldTickets: newBookingQty,
               grossTicketRevenue: totalAmount,  // stays 0 for free events
            },
         });
      } catch (error) {
         const msg = error instanceof Error ? error.message : "Unknown error";
         console.error("Error in EventRepository.incrementSoldTickets:", msg);
         throw error;
      }
   }

   async decrementEventTicketStats(eventId: string, cancelledQty: number, totalAmount: number): Promise<void> {
      try {
         await this.model.findByIdAndUpdate(eventId, {
            $inc: {
               soldTickets:        -cancelledQty,
               grossTicketRevenue: -totalAmount,
            },
         });
      } catch (error) {
         const msg = error instanceof Error ? error.message : "Unknown error";
         console.error("Error in EventRepository.decrementSoldTickets:", msg);
         throw error;
      }
   }
   

    
}