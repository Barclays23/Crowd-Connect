// frontent/src/types/event.types.ts

import type { IPagination } from "@/types/common.types";

export const EVENT_CATEGORIES = [
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




// export const EVENT_FORMAT = ["offline", "online"] as const;
// export const TICKET_TYPE = ["free", "paid"] as const;
// export type EVENT_FORMAT = "offline" | "online";
// export type TICKET_TYPE = "free" | "paid";
// export type EVENT_STATUS = "draft" | "upcoming" | "ongoing" | "completed" | "cancelled" | "suspended";

export const EVENT_STATUSES = {
  DRAFT : "draft",             // DRAFT: Creating / Editing phase.
  PUBLISHED : "published",     // PUBLISHED: Live and bookable ("published" is only stored in DB, not exposing to frontend)
  CANCELLED : "cancelled",     // CANCELLED: Permanent stop.
  SUSPENDED : "suspended",     // SUSPENDED: admin suspended. (but reason in cancelledReason)
  COMPLETED : "completed",     // COMPLETED: Auto or manual (after end / payouts). After every process completed.

  // Only for virtual UI display based on startDateTime & endDateTime
  UPCOMING   : "upcoming",     // Virtual UI status (from backend getEventDisplayStatus) — derived from startDateTime
  ONGOING    : "ongoing",      // Virtual UI status (from backend getEventDisplayStatus) — derived from start/endDateTime
}

export const EVENT_FORMATS = {
  OFFLINE: "offline",
  ONLINE: "online"
} as const;


export const TICKET_TYPES = {
  FREE: "free",
  PAID: "paid"
} as const;



export type EVENT_FORMAT = typeof EVENT_FORMATS[keyof typeof EVENT_FORMATS];
export type TICKET_TYPE = typeof TICKET_TYPES[keyof typeof TICKET_TYPES];
export type EVENT_STATUS = typeof EVENT_STATUSES[keyof typeof EVENT_STATUSES];


export const DEFAULT_RADIUS_KM = 25

export interface IEventState {
  eventId: string;
  title: string;
  category: string;
  description: string;

  posterUrl: string;

  organizer: {
    hostId: string;
    hostName: string;
    organizerName: string;
  };

  startDateTime: string;
  endDateTime: string;
  eventStatus: EVENT_STATUS;

  format: EVENT_FORMAT;
  locationName: string;
  location?: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };
  onlineLink?: string;

  ticketType: TICKET_TYPE;
  ticketPrice: number;
  capacity: number;
  soldTickets: number;
  grossTicketRevenue: number;

  cancellation?: {
    reason: string;
    cancelledBy: string;  // organizer.organizerName or 'Admin'
    cancelledAt: string;
  };

  views?: number;           // Needed for the Trending/Popular filter [cite: 459, 640]
  checkedInCount: number;  // Useful if you ever need to show "filling up fast!" logic [cite: 646, 647]

  createdAt: string;
  updatedAt?: string;
}




// Based on your plan (5-10%)
// Also check the same percentage value in backend
export const ADMIN_COMMISSION_PERCENT = 10;


export const POSTER_MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const POSTER_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];




export interface GetEventsApiResponse {
  eventsData: IEventState[];
  pagination: IPagination;
}


export type EventSortField = "createdAt" | "startDateTime" | "endDateTime" | "title" | "ticketPrice" | "grossTicketRevenue";
export type EventSortDirection = "asc" | "desc";