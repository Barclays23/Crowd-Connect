// backend/src/entities/event.entity.ts

import { EventCategory, EventFormat, EventStatus, TicketType } from "@/constants/event.constants";
import { ILocation } from "@/types/event.types";
import { Types } from "mongoose";


/* ───────────────── CORE OUTPUT ENTITY ───────────────── */

export interface EventEntity {
  eventId       : string;
  // hostRef: string;
  organizer     : {
    hostId        : string;
    hostName      : string;
    organizerName : string;
  };

  title         : string;
  category      : EventCategory;
  description   : string;

  posterUrl     : string;

  format        : EventFormat;
  locationName? : string;
  location?     : ILocation
  onlineLink?   : string;

  startDateTime : Date;
  endDateTime   : Date;

  ticketType    : TicketType;
  ticketPrice   : number;
  capacity      : number;

  soldTickets   : number;
  checkedInCount: number;
  grossTicketRevenue  : number;

  eventStatus   : EventStatus;
  views         : number;       // for trending/popular calculation

  // Event Cancellation
  cancellation? : {
    reason        : string;
    cancelledBy   : 'HOST' | 'ADMIN';
    cancelledAt   : Date;
  };

  createdAt       : Date;
}



// The slim entity for the organiser events portfolio
export interface OrganiserEventEntity {
  eventId: string;
  title: string;
  category: EventCategory;
  posterUrl: string;
  startDateTime: Date;
  format: EventFormat;
  eventStatus: EventStatus;
  ratingAverage: number;
  totalReviews: number;
}





/* ───────────────── DB INPUTS ENTITY ───────────────── */

export interface CreateEventInput {
   hostRef: Types.ObjectId;

   title: string;
   category: EventCategory;
   description: string;
   
   posterUrl: string;
   
   format: EventFormat;
   locationName?: string;
   location?: ILocation;
   onlineLink?: string;
   
   startDateTime: Date;
   endDateTime: Date;

   // Pricing & Capacity
   ticketType: TicketType;
   ticketPrice: number;
   capacity: number;
   
   // soldTickets: number;             // no need when creating an event, default: 0
   // checkedInCount: number;          // no need when creating an event, default: 0
   // grossTicketRevenue: number;      // no need when creating an event, default: 0
   
   eventStatus: EventStatus;          // EventStatus.DRAFT (when creating, before publish)
}



export interface UpdateEventInput {
  title?:         string;
  description?:   string;
  category?:      string;

  posterUrl?:     string;

  format?:        string;
  locationName?:  string;
  location?:      { type: "Point"; coordinates: [number, number] } | null; // null to clear
  onlineLink?:    string | null; // null to clear

  startDateTime?: Date;
  endDateTime?:   Date;

  ticketType?:    string;
  ticketPrice?:   number;
  capacity?:      number;

  eventStatus?:   string;
}


// for cancel / suspend / complete the event
export interface EventStatusUpdateInput {
  eventStatus: EventStatus;
  cancellation?: {
    reason: string;  // for cancelling and suspending
    cancelledBy: "ADMIN" | "HOST";
    cancelledAt: Date;
  }
}