// frontent/src/types/event.types.ts

import type { EventFormat, EventStatus, TicketType } from "@/constants/event.constants";
import type { IPagination } from "@/types/common.types";




// move to constants like location.constants ??
export const DEFAULT_RADIUS_KM = 25


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




// Based on your plan (5-10%)
// Also check the same percentage value in backend
// export const ADMIN_COMMISSION_PERCENT = 10;



// move to constants
export const POSTER_MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const POSTER_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];




export interface GetEventsApiResponse {
  eventsData: IEventState[];
  pagination: IPagination;
}


export type EventSortField = "createdAt" | "startDateTime" | "endDateTime" | "title" | "ticketPrice" | "grossTicketRevenue";
export type EventSortDirection = "asc" | "desc";