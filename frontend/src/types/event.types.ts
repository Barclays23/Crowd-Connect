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
export type EVENT_FORMAT = "offline" | "online";
export type TICKET_TYPE = "free" | "paid";
export type EVENT_STATUS = "draft" | "upcoming" | "ongoing" | "completed" | "cancelled" | "suspended";




export interface IEventState {
  eventId: string;
  title: string;
  category: string;
  description: string;

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
  onlineLink: string;

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

  createdAt: string;
  updatedAt: string;
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