// backend/src/dtos/event.dto.ts
import { EVENT_CATEGORY, EVENT_FORMAT, EVENT_STATUS, ILocation, TICKET_TYPE } from "@/types/event.types";


/* ───────────────── HTTP REQUEST BOUNDARY DTOs ───────────────── */

export interface CreateEventDTO {
    hostRef: string; // The User ID

    title: string;
    category: EVENT_CATEGORY;
    description: string;

    aiGeneratedImage?: string;   // if generated AI poster image (Base64 / URL)
    
    format: EVENT_FORMAT;
    locationName?: string;       //  if offline event (human readable string)
    location?: ILocation;        //  if offline event (location coordinatory points- lat/lng)
    onlineLink?: string;
    
    startDateTime: Date;
    endDateTime: Date;
    
    ticketType: TICKET_TYPE;
    ticketPrice: number;
    capacity: number;
}



/* ───────────────── HTTP RESPONSE BOUNDARY DTOs ───────────────── */
export interface EventResponseDTO {
  eventId: string;
  hostRef: string;

  title: string;
  category: EVENT_CATEGORY;
  description: string;

  posterUrl: string;

  format: EVENT_FORMAT;
  locationName?: string;
  location?: ILocation;
  onlineLink?: string;

  startDateTime: string;
  endDateTime: string;

  ticketType: TICKET_TYPE;
  ticketPrice: number;
  capacity: number;

  soldTickets: number;
  checkedInCount: number;
  grossTicketRevenue: number;

  eventStatus: EVENT_STATUS;

  createdAt: string;
}