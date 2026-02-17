import { EVENT_CATEGORY, EVENT_FORMAT, EVENT_STATUS, ILocation, TICKET_TYPE } from "@/types/event.types";
import { Types } from "mongoose";


/* ───────────────── CORE ENTITY ───────────────── */

export interface EventEntity {
  id: string;
  hostRef: string;

  title: string;
  category: EVENT_CATEGORY;
  description: string;

  posterUrl: string;

  format: EVENT_FORMAT;
  locationName?: string;
  location?: ILocation
  onlineLink?: string;

  startDateTime: Date;
  endDateTime: Date;

  ticketType: TICKET_TYPE;
  ticketPrice: number;
  capacity: number;

  soldTickets: number;
  checkedInCount: number;
  grossTicketRevenue: number;

  eventStatus: EVENT_STATUS;
  views: number;       // for trending/popular calculation

  // Event Cancellation
  cancellationReason?: string;
  cancelledBy?: Types.ObjectId;  // by host or admin
  cancelledAt?: Date;

  createdAt: Date;
}





/* ───────────────── DB INPUTS ───────────────── */

export interface CreateEventInput {
   hostRef: Types.ObjectId;

   title: string;
   category: EVENT_CATEGORY;
   description: string;
   
   posterUrl: string;
   
   format: EVENT_FORMAT;
   locationName?: string;
   location?: ILocation;
   onlineLink?: string;
   
   startDateTime: Date;
   endDateTime: Date;

   // Pricing & Capacity
   ticketType: TICKET_TYPE;
   ticketPrice: number;
   capacity: number;
   
   // soldTickets: number;             // no need when creating an event, default: 0
   // checkedInCount: number;          // no need when creating an event, default: 0
   // grossTicketRevenue: number;      // no need when creating an event, default: 0
   
   eventStatus: EVENT_STATUS;          // EVENT_STATUS.DRAFT (when creating, before publish)
}



// for cancel / suspend / complete the event
export interface EventStatusUpdateInput {
  eventStatus: EVENT_STATUS;
  cancellationReason?: string;  // for cancelling and suspending
  cancelledBy?: Types.ObjectId;  // need this ?
  cancelledAt?: Date;
}