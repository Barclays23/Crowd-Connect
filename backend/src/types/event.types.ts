// backend/src/types/event.types.ts

import { Types } from "mongoose";


// Also check the same percentage value in backend
export const ADMIN_COMMISSION_PERCENT = 10;


export const ALL_EVENT_CATEGORIES = [
   "Art & Exhibitions",
   "Business & Networking",
   "Charity & Causes",
   "Conferences & Seminars",
   "Education & Workshops",
   "Fashion & Beauty",
   "Festivals & Fairs",
   "Film & Media",
   "Food & Drink",
   "Health & Wellness",
   "Kids & Family",
   "Music & Concerts",
   "Parties & Nightlife",
   "Spiritual & Religious",
   "Sports & Fitness",
   "Technology & Innovation",
   "Theatre & Live Shows",
   "Travel & Outdoor",
   "Weddings & Social Gatherings",
] as const;


export type EVENT_CATEGORY = typeof ALL_EVENT_CATEGORIES[number];


export enum EVENT_FORMAT {
  ONLINE = 'online',
  OFFLINE = 'offline',
}


export enum TICKET_TYPE {
  FREE = 'free',
  PAID = 'paid',
}


export interface ILocation {
   type: "Point";
   coordinates: [number, number]; // [longitude, latitude]
}



export enum EVENT_STATUS {
   DRAFT = "draft",             // DRAFT: Creating / Editing phase.
   PUBLISHED = "published",     // PUBLISHED: Live and bookable. and cannot change back to draft (time-based display computed from here).
   // UPCOMING = "upcoming",       // only for virtual UI display based on startDateTime & endDateTime
   // ONGOING = "ongoing",         // only for virtual UI display based on startDateTime & endDateTime
   CANCELLED = "cancelled",     // CANCELLED: Permanent stop.
   SUSPENDED = "suspended",      // SUSPENDED: admin suspended. (but reason in cancelledReason)
   COMPLETED = "completed",     // COMPLETED: Auto or manual (after end / payouts). After every process completed.
}



export interface IEventModel {
   _id: Types.ObjectId;
   // Relationships
   hostRef: Types.ObjectId; // Reference to User model

   // Basic Details
   title: string;
   category: EVENT_CATEGORY;
   description: string;

   // Visuals
   posterUrl: string; // Stores the Cloudinary/S3 URL

   // Format & Location
   format: EVENT_FORMAT;
   locationName?: string,             // Optional if online
   location?: ILocation;       // Optional if online
   onlineLink?: string;        // Optional if offline

   // Timing
   startDateTime: Date;
   endDateTime: Date;

   // Pricing & Capacity
   ticketType: TICKET_TYPE;
   ticketPrice: number;
   capacity: number;
   soldTickets: number; // To track how many tickets/seats left (booking ++ & cancel booking --)
   checkedInCount: number; // number of QR scanned or attendedance for the event (used for attendance percentage calculation for payout process)
   grossTicketRevenue: number; // To track total revenue for the event (every new booking - cancellation)

   // Status & Views
   eventStatus: EVENT_STATUS;
   views: number;       // for trending/popular calculation
   
   // Event Cancellation
   cancellationReason?: string;
   cancelledBy?: Types.ObjectId;  // by host or admin
   cancelledAt?: Date;

   // Timestamps
   createdAt : Date;
   updatedAt : Date;
}




