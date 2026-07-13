// frontent/src/types/event.types.ts

import type { EventFormat, EventStatus, TicketType } from "@/constants/event.constants";
import type { IPagination } from "@/types/common.types";




export interface IEventState {
  eventId             : string;
  title               : string;
  category            : string;
  description         : string;

  posterUrl           : string;

  organizer           : {
    hostId        : string;
    hostName      : string;
    organizerName : string;
  };

  startDateTime       : string;
  endDateTime         : string;
  eventStatus         : EventStatus;

  format              : EventFormat;
  locationName        : string;
  location?           : {
    type        : "Point";
    coordinates : [number, number]; // [longitude, latitude]
  };
  onlineLink?         : string;

  ticketType          : TicketType;
  ticketPrice         : number;
  capacity            : number;
  soldTickets         : number;
  grossTicketRevenue  : number;

  cancellation?       : {
    reason      : string;
    cancelledBy : string;  // organizer.organizerName or 'Admin'
    cancelledAt : string;
  };

  views?              : number;           // Needed for the Trending/Popular filter [cite: 459, 640]
  checkedInCount      : number;  // Useful if you ever need to show "filling up fast!" logic [cite: 646, 647]

  createdAt           : string;
  updatedAt?          : string;
}





// move to constants
export const POSTER_MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const POSTER_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];



// move to constants like location.constants ??
export const DEFAULT_RADIUS_KM = 25



export type EventSortField = "createdAt" | "startDateTime" | "endDateTime" | "title" | "ticketPrice" | "grossTicketRevenue";
export type EventSortDirection = "asc" | "desc";





// PAYLOAD TYPES _______________________________________________

export interface UpdateEventStatusPayload {
  eventStatus: EventStatus;
}



export type PublicEventsSortOption = "upcoming" | "newest" | "popular" | "price_asc" | "price_desc";

export interface GetPublicEventsParams {
  page?       : number;
  limit?      : number;
  search?     : string;
  startDate?  : string;
  endDate?    : string;
  category?   : string;
  format?     : string;
  ticketType? : string;
  lat?        : number;
  lng?        : number;
  radiusKm?   : number;
  sortBy?     : PublicEventsSortOption; 
}




// RESPONSE TYPES _______________________________________________

