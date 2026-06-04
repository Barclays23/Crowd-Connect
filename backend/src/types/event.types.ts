// backend/src/types/event.types.ts

import { EventResponseDTO } from "@/dtos/event.dto";
import { IPagination } from "@/types/common.types";
import { DateQueryOperator } from "@/utils/eventStatus.utils";
import { Types } from "mongoose";




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

export const DEFAULT_RADIUS_KM = 25


export enum EVENT_STATUS {
  DRAFT = "draft",             // DRAFT: Creating / Editing phase.
  PUBLISHED = "published",     // PUBLISHED: Live and bookable. and cannot change back to draft (time-based display computed from here).
  CANCELLED = "cancelled",     // CANCELLED: Permanent stop.
  SUSPENDED = "suspended",     // SUSPENDED: admin suspended. (but reason in cancelledReason)
  COMPLETED = "completed",     // COMPLETED: Auto or manual (after end / payouts). After every process completed.

  // Onlu for virtual UI display based on startDateTime & endDateTime
  // use getEventDisplayStatus to generate the display event status.
  UPCOMING = "upcoming",
  ONGOING  = "ongoing",
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
  cancellation?: {
    reason: string;
    cancelledBy: "ADMIN" | "HOST";
    cancelledAt: Date;
  };


  // Timestamps
  createdAt : Date;
  updatedAt : Date;
}



export interface IHostPopulatedFromEvent {
  _id: Types.ObjectId;
  name: string;
  organizationName?: string;
}


export type IEventModelPopulatedHost = Omit<IEventModel, "hostRef"> & {
  hostRef: IHostPopulatedFromEvent;
};




// Strictly types the MongoDB $near operator for GeoJSON points
export interface GeoNearQueryOperator {
  $near: {
    $geometry: {
      type: "Point";
      coordinates: [number, number]; // [longitude, latitude]
    };
    $maxDistance?: number;
    $minDistance?: number;
  };
}


export interface GeoWithinQueryOperator {
  $geoWithin: {
    $centerSphere?: [
      [number, number],     // [lng, lat]
      number                // radius in radians
    ];
    $geometry?: {
      type: string;
      coordinates: [number, number];
    };
    // Add other shapes if needed later: $box, $polygon, $center, etc.
  };
}


// Strictly types the MongoDB $text search operator
export interface TextSearchOperator {
  $search: string;
  $language?: string;
  $caseSensitive?: boolean;
  $diacriticSensitive?: boolean;
}





// export type EventFilterQuery = Partial<IEventModel> & Record<string, unknown>;
export type EventFilterQuery = Partial<Omit<IEventModel, 'startDateTime' | 'endDateTime' | 'location'>> & {
  startDateTime?: DateQueryOperator;
  endDateTime?: DateQueryOperator;
  location?: ILocation | GeoNearQueryOperator | GeoWithinQueryOperator | Record<string, unknown>;

  $text?: TextSearchOperator;
  $or?: Array<Record<string, unknown>>;
} & Record<string, unknown>;



interface IBaseEventFilter {
  page: number;
  limit: number;
  search?: string;
  category?: EVENT_CATEGORY;
  format?: EVENT_FORMAT;
  ticketType?: TICKET_TYPE;
}


// query filters for fetching events (by admin)
export interface GetEventsFilter extends IBaseEventFilter {
  status?: EVENT_STATUS;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}



// query filters for fetching events in public events discovery page
export interface GetPublicEventsFilter extends IBaseEventFilter {
  lat?: number;
  lng?: number;
  // location: string;  // need this ??
  radiusKm?: number;
  startDate?: string;
  endDate?: string;
  sortBy?: PublicEventsSortOption
}


export type PublicEventsSortOption = 
  "upcoming"   |     // startDateTime (ascending)
  "newest"     |     // createdAt (newly created events)
  "popular"    |     // views (most views first)
  "price_asc"  |     // ticketPrice (low to high)
  "price_desc";      // ticketPrice (high to low)


export const allowedEventSortFields = [
  "createdAt",
  "startDateTime",
  "endDateTime",
  "title",
  "ticketPrice",
  "grossTicketRevenue",
  "capacity",
  "soldTickets",
  "views"
];

// rename to SortOrder
export type SortQuery = Record<string, 1 | -1>;





// result when events listing (for admin side and user side)
export interface GetAllEventsResult {
  events: EventResponseDTO[] | null;
  pagination: IPagination;
}