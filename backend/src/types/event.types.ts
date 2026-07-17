// backend/src/types/event.types.ts

import { 
  EventCategory, 
  EventFormat, 
  EventStatus, 
  TicketType 
} from "@/constants/event.constants";
import { EventResponseDTO } from "@/dtos/event.dto";
import { IPagination } from "@/types/common.types";
import { DateQueryOperator } from "@/utils/eventStatus.utils";
import { Types } from "mongoose";





export interface ILocation {
  type: "Point";
  coordinates: [number, number]; // [longitude, latitude]
}


export interface IEventModel {
  _id: Types.ObjectId;
  // Relationships
  hostRef: Types.ObjectId; // Reference to User model

  // Basic Details
  title: string;
  category: EventCategory;
  description: string;

  // Visuals
  posterUrl: string; // Stores the Cloudinary/S3 URL

  // Format & Location
  format: EventFormat;
  locationName?: string,             // Optional if online
  location?: ILocation;       // Optional if online
  onlineLink?: string;        // Optional if offline

  // Timing
  startDateTime: Date;
  endDateTime: Date;

  // Pricing & Capacity
  ticketType: TicketType;
  ticketPrice: number;
  capacity: number;
  soldTickets: number; // To track how many tickets/seats left (booking ++ & cancel booking --)
  checkedInCount: number; // number of QR scanned or attendedance for the event (used for attendance percentage calculation for payout process)
  grossTicketRevenue: number; // To track total revenue for the event (every new booking - cancellation)

  // Status & Views
  eventStatus: EventStatus;
  views: number;       // for trending/popular calculation
  ratingAverage: number;
  totalReviews: number;

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
  category?: EventCategory;
  format?: EventFormat;
  ticketType?: TicketType;
}


// query filters for fetching events (by admin)
export interface GetEventsFilter extends IBaseEventFilter {
  status?: EventStatus;
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






// for fetching an organiser's past and present events
export interface GetOrganiserEventsFilter {
  page: number;
  limit: number;
  hostId: string;
}




// result when events listing (for admin side and user side)
export interface GetAllEventsResult {
  events: EventResponseDTO[] | null;
  pagination: IPagination;
}