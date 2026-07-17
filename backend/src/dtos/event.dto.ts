// backend/src/dtos/event.dto.ts
import { EventCategory, EventFormat, EventStatus, TicketType } from "@/constants/event.constants";
import { IPagination } from "@/types/common.types";
import { ILocation } from "@/types/event.types";


/* ───────────────── HTTP REQUEST BOUNDARY DTOs ───────────────── */

export interface CreateEventRequestDTO {
  hostRef: string; // The User ID

  title: string;
  category: EventCategory;
  description: string;

  aiGeneratedImage?: string;   // if generated AI poster image (Base64 / URL)
  
  format: EventFormat;
  locationName?: string;       //  if offline event (human readable string)
  location?: ILocation;        //  if offline event (location coordinatory points- lat/lng)
  onlineLink?: string;
  
  startDateTime: Date;
  endDateTime: Date;
  
  ticketType: TicketType;
  ticketPrice: number;
  capacity: number;
}


export interface UpdateEventRequestDTO {
  title: string;
  category: EventCategory;
  description: string;

  aiGeneratedImage?: string;   // if generated AI poster image (Base64 / URL)
  
  format: EventFormat;
  locationName?: string;       //  if offline event (human readable string)
  location?: ILocation;        //  if offline event (location coordinatory points- lat/lng)
  onlineLink?: string;
  
  startDateTime: Date;
  endDateTime: Date;
  
  ticketType: TicketType;
  ticketPrice: number;
  capacity: number;
}




export interface EventStatusUpdateRequestDto {
  newStatus: EventStatus, 
  reason?: string;
}



/* ───────────────── HTTP RESPONSE BOUNDARY DTOs ───────────────── */
export interface EventResponseDTO {
  eventId: string;
  // hostRef: string;
  organizer: {
    hostId: string;
    hostName: string;
    organizerName: string;
  };

  title: string;
  category: EventCategory;
  description: string;

  posterUrl: string;

  format: EventFormat;
  locationName?: string;
  location?: ILocation;
  onlineLink?: string;

  startDateTime: string;
  endDateTime: string;

  ticketType: TicketType;
  ticketPrice: number;
  capacity: number;

  soldTickets: number;
  checkedInCount: number;
  grossTicketRevenue: number;

  eventStatus: EventStatus;

  cancellation?: {
    reason: string;
    cancelledBy: string;
    cancelledAt: string;
  };

  createdAt: string;
}



// smaller, lightweight DTO for the organiser's portfolio
export interface OrganiserEventResponseDTO {
  eventId: string;
  title: string;
  category: string;
  posterUrl: string;
  startDateTime: string;
  format: string;
  eventStatus: string;
  ratingAverage: number;
  totalReviews: number;
}




export interface GetDiscoveryEventsResult {
  eventsData: EventResponseDTO[];
  pagination: IPagination;
}



export interface GetOrganiserEventsResult {
  eventsData: OrganiserEventResponseDTO[];
  pagination: IPagination;
}