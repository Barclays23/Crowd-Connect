// backend/src/types/booking.types.ts

import { BookingStatus } from "@/constants/booking.constants";
import { EventCategory, EventChangeType, EventFormat } from "@/constants/event.constants";
import { PaymentStatus } from "@/constants/payment.constants";
import { BookingEntityPopulated } from "@/entities/booking.entity";
import { EventEntity } from "@/entities/event.entity";
import { IPagination } from "@/types/common.types";
import { Types } from "mongoose";




export interface MajorEventChange {
  changedAt:  Date;
  // changeType: "DATE" | "VENUE" | "PRICE" | "CAPACITY" | "OTHER" | "FORMAT";
  changeType: EventChangeType;
  // use this change types from constants
  // need FORMAT ?? (I think cannot change event format once anyone booked the event)
  // CAPACITY is included because an admin can force-reduce capacity for compliance
  // reasons (e.g. fire safety limits a 500-seat venue to 150). Confirmed ticket
  // holders are affected through no fault of their own — they deserve a grace refund
  // window. Hosts cannot reduce capacity below soldTickets, but admins can override.
  summary: string;  // e.g. "Date changed from 15 Mar to 20 Apr 2026"
}

// ─── Core Model Interface ─────────────────────────────────────────────────────

export interface IBookingModel {
  _id               : Types.ObjectId;

  // Relations
  userRef           : Types.ObjectId;  // The attendee
  eventRef          : Types.ObjectId;  // The event (use IBookingPopulatedEvent when populated)

  // Ticket details — snapshot at booking time.
  // ticketRate stored here because event.ticketPrice can change after booking.
  quantity          : number;  // 1 for online; 1–10 for offline
  ticketRate        : number;  // Price per ticket at moment of booking
  totalAmount       : number;  // quantity × ticketRate (kept in sync by pre-save hook)
  ticketNo          : string;

  // Status & event format
  bookingStatus     : BookingStatus;
  eventFormat       : EventFormat;

  // Payment — embedded (not a separate model).
  payment           : {
    orderId     : string;
    paymentId?  : string;    // undefined until Razorpay captures the charge
    signature?  : string;    // undefined until verified on backend
    status      : PaymentStatus;
    paidAt?     : Date;
  }

  // QR / Entry
  // One signed JWT per booking (not per ticket). Payload: { bookingId, eventId, userId }.
  // Verified live from DB at scan time. Frontend renders via react-qr-code.
  qrToken           : string;  // Empty string on PENDING; populated after payment confirmed
  remainingEntries  : number;  // Starts at quantity; decremented on each partial scan
  checkedInAt?      : Date;    // Timestamp of the FIRST scan only

  // Cancellation
  cancellation?     : {
    reason?     : string;
    cancelledAt : Date;
    refundId?   : string;  // Razorpay refund ID; set when refund is initiated
    refundedAt? : Date;    // Set when refund webhook confirms settlement
  };

  // Major event change (host changes date/venue/price etc. after tickets are sold)
  majorEventChange? : MajorEventChange;

  // Full refund allowed until this deadline regardless of normal cancellation policy.
  gracePeriodEnd?   : Date | null;

  // Timestamps (auto-managed by Mongoose { timestamps: true })
  createdAt         : Date;
  updatedAt         : Date;
}






// ─── Virtuals Interface ───────────────────────────────────────────────────────
// Virtuals are computed properties — not stored in the database.
// Defined separately from IBookingModel and passed as the 4th type parameter
// to Schema so TypeScript knows these exist on `this` inside virtual getters.

export interface IBookingVirtuals {
  isGraceRefundActive:     boolean;  // Is a major-change grace period currently active?
  currentRefundPercentage: number;   // 0 | 50 | 100 — refund % if user cancels right now
}


// ─── Populated Variant ────────────────────────────────────────────────────────
// Use this type when you .populate("eventRef").
// Gives type safety on eventRef sub-fields instead of just an ObjectId.

export interface IBookingPopulatedUserAndEvent extends Omit<IBookingModel, "eventRef" | "userRef"> {
  eventRef: {
    _id:           Types.ObjectId;
    title:         string;
    category:      EventCategory;
    posterUrl:     string; 
    startDateTime: Date;
    endDateTime:   Date;
    format:        EventFormat;
    locationName?: string;
    onlineLink?:   string;
  },
  userRef: {
    _id:    Types.ObjectId;
    name:   string;
    email:  string;
    // mobile?: string;
  };
}


export interface BookingFacetResult {
  paginatedResults: IBookingPopulatedUserAndEvent[];
  totalCountQuery : { total: number }[];
}


// ─── Filter / Query types ─────────────────────────────────────────────────────

export const ALLOWED_BOOKING_SORT_FIELDS: BookingSortField[] = ["createdAt", "startDateTime", "ticketRate", "quantity", "ticketNo"];

export type BookingSortField = "createdAt" | "startDateTime" | "ticketRate" | "quantity" | "ticketNo";


export interface GetBookingsFilter {
  page:     number;
  limit:    number;
  search?: string;
  status?:  BookingStatus;
  userId?:  string;   // filter by a specific user's bookings
  eventId?: string;   // admin / host: filter bookings for a specific event
  eventFormat?: EventFormat;
  sortBy?:    BookingSortField;
  sortOrder?: "asc" | "desc";
}


// not used
export interface BookingFilterQuery {
  bookingStatus?: BookingStatus;
  userRef?:       Types.ObjectId;
  eventRef?:      Types.ObjectId;
  eventFormat?:   EventFormat;
  // $or?:           Record<string, unknown>[];  // (for ticketNo search)
  $or?:           Array<Record<string, unknown>>;  // (for ticketNo search)
}




export interface GetBookingsResult {
  bookings:   BookingEntityPopulated[];
  pagination: IPagination;
}


export interface MapBookingParams {
  userId          : string;
  event           : EventEntity;
  newBookingQty   : number;
  ticketNo        : string;
  qrToken?        : string;         // Passed for FREE and WALLET payments (since they confirm instantly)
  paymentOrderId? : string;         // Only passed for ONLINE PAYMENT (Razorpay Order ID)
  bookingStatus   : BookingStatus;
  paymentStatus   : PaymentStatus;
}



// After Event checkin
//  Decrements remainingEntries by entryCount
//  Sets bookingStatus (ATTENDED when all entries used, else unchanged)
//  Sets checkedInAt on the first scan only (undefined = not first scan, skip it)
export interface BookingCheckinUpdate {
  bookingId   : string,
  entryCount  : number,
  newStatus   : BookingStatus,
  checkedInAt?: Date,
}



