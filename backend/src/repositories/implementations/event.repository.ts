// // backend/src/repositories/implementations/event.repository.ts

import { CreateEventInput, EventEntity, EventStatusUpdateInput, UpdateEventInput } from "@/entities/event.entity";
import { mapEventModelToEventEntity } from "@/mappers/event.mapper";
import Event from "@/models/implementations/event.model";
import { BaseRepository } from "@/repositories/base.repository";
import { IEventRepository } from "@/repositories/interfaces/IEventRepository";
import { EVENT_STATUS, EventFilterQuery, IEventModel, IEventModelPopulatedHost, SortQuery } from "@/types/event.types";
import { isGeoNearQuery } from "@/utils/general.utils";
import { ClientSession } from "mongoose";



export class EventRepository extends BaseRepository<IEventModel> implements IEventRepository {
   constructor() {
      super(Event);
   }

   
   async createEvent(eventInput: CreateEventInput): Promise<EventEntity> {
      const eventData = await this.createOne(eventInput);
      const eventEntity: EventEntity = mapEventModelToEventEntity(eventData);
      return eventEntity;
   }


   async getEventById(eventId: string): Promise<EventEntity | null> {
      const eventData: IEventModelPopulatedHost | null = await this.findByIdQuery(eventId)
         .populate('hostRef')
         .lean<IEventModelPopulatedHost>()
         .exec();

      const result: EventEntity | null = eventData ? mapEventModelToEventEntity(eventData) : null;
      return result;
   }



   async getPublicEvents(
      filters: EventFilterQuery,
      skip: number,
      limit: number,
      sortField: string,
      sortDirection: 1 | -1
   ): Promise<{ events: EventEntity[]; totalCount: number }> {

      const query = this.findManyQuery(filters)
         .select('-onlineLink') // don't fetch link for public users
         .populate("hostRef", "name organizationName");

      const isGeospatial = filters.location && isGeoNearQuery(filters.location);

      if (!isGeospatial) {
         query.sort({ [sortField]: sortDirection });
      }

      const [paginatedEvents, totalCount]: [IEventModelPopulatedHost[], number] = await Promise.all([
         query.skip(skip).limit(limit).lean<IEventModelPopulatedHost[]>().exec(),
         this.countDocuments(filters),
      ]);

      const events: EventEntity[] = paginatedEvents.map(event => mapEventModelToEventEntity(event));

      return { events, totalCount };
   }



   // for listing events in user/admin dashboard
   async findEvents(
      query: EventFilterQuery,
      skip : number,
      limit: number,
      sort : SortQuery
   ): Promise<EventEntity[]> {  
      const paginatedEvents: IEventModelPopulatedHost[] = await this.findManyQuery(query)
         .select('-onlineLink') // dont send online link to public users
         .populate("hostRef", "name organizationName")
         .collation({ locale: 'en', strength: 2 })
         .sort(sort ? sort : { createdAt: -1 })
         .skip(skip)
         .limit(limit)
         .lean<IEventModelPopulatedHost[]>()
         .exec();

      const eventEntity: EventEntity[] = paginatedEvents.map(mapEventModelToEventEntity);

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


   async updateEvent(eventId: string, updateInput: UpdateEventInput): Promise<EventEntity|null> {
      const updatedEventData: IEventModel | null = await this.findByIdAndUpdate(eventId, { $set: updateInput });
      const updatedEvent: EventEntity | null = updatedEventData ? mapEventModelToEventEntity(updatedEventData) : null;
      return updatedEvent;
   }


   async updateEventStatus(eventId: string, updateInput: EventStatusUpdateInput): Promise<EVENT_STATUS | null> {
      const updatedEventData: IEventModel | null = await this.findByIdAndUpdate(eventId, { $set: updateInput });
      const updatedStatus = updatedEventData ? updatedEventData.eventStatus : null;
      return updatedStatus;
   }



   async countEvents(query: EventFilterQuery): Promise<number> {
      return await this.countDocuments(query);
   }


   async incrementEventViews(eventId: string): Promise<void> {
      await this.findByIdAndUpdate(eventId, { $inc: { views: 1 } });
   }


   async incrementEventTicketAndRevenueStats(eventId: string, newBookingQty: number, totalAmount: number, options: { session?: ClientSession } = {}): Promise<void> {
      const { session } = options;
      
      await this.findByIdAndUpdate(
         eventId,
         {
            $inc: {
               soldTickets       : newBookingQty,
               grossTicketRevenue: totalAmount, // stays 0 for free events
            },
         },
         { session }
      );
   }

   async decrementEventTicketAndRevenueStats(eventId: string, cancelledQty: number, totalAmount: number, options: { session?: ClientSession } = {}): Promise<void> {
      const { session } = options;

      await this.findByIdAndUpdate(
        eventId,
        {
            $inc: {
               soldTickets       : -cancelledQty,
               grossTicketRevenue: -totalAmount,
            },
        },
        { session },
      );
   }


   async incrementEventCheckedInCount(eventId: string, entryCount: number): Promise<void> {
      await this.findByIdAndUpdate(eventId, {
         $inc: { checkedInCount: entryCount },
      });
   }




   async deleteEvent(eventId: string): Promise<void> {
      await this.findByIdAndDelete(eventId);
   }
   

    
}