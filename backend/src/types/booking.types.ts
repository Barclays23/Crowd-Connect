// backend/src/types/booking.types.ts

import { BookingEntityPopulated } from "@/entities/booking.entity";
import { EventEntity } from "@/entities/event.entity";
import { IPagination } from "@/types/common.types";
import { EVENT_CATEGORY, EVENT_FORMAT } from "@/types/event.types";
import { Types } from "mongoose";


// ─── Enums ────────────────────────────────────────────────────────────────────

export enum BOOKING_STATUS {
  PENDING   = "pending",    // Razorpay order created; payment not yet confirmed
  CONFIRMED = "confirmed",  // Payment verified; QR issued; host earns this ticket
  FAILED    = "failed",     // Razorpay payment.failed webhook received
                            // Kept in DB for audit trail — never delete failed bookings
  CANCELLED = "cancelled",  // User cancelled — check payment.status for refund state
  ATTENDED  = "attended",   // remainingEntries hit 0 — ALL tickets in this booking scanned
                            // Partial scans stay as CONFIRMED (e.g. 3 of 5 scanned → CONFIRMED)
}

// REFUNDED lives in PAYMENT_STATUS, not BOOKING_STATUS.
// BOOKING_STATUS = booking lifecycle (user-facing state machine).
// PAYMENT_STATUS = Razorpay transaction state (payment-provider-facing).
// They move independently — booking can be CANCELLED while refund is still in transit.
export enum PAYMENT_STATUS {
  PENDING   = "pending",
  COMPLETED = "completed",
  FAILED    = "failed",
  REFUNDED  = "refunded",
}

// ─── Booking Flow ─────────────────────────────────────────────────────────────
//
// PENDING ──→ CONFIRMED ──→ ATTENDED          (all tickets scanned)
//          |            └──→ CONFIRMED         (no-show / partial — host still earns it)
//          └──→ FAILED                         (Razorpay payment.failed webhook)
//
// CONFIRMED ──→ CANCELLED
//                  └── payment.status = REFUNDED  (cancelled within refund window)
//                  └── payment.status = PAID      (cancelled past window — no refund)




export interface MajorEventChange {
  changedAt:  Date;
  // changeType: "DATE" | "VENUE" | "PRICE" | "CAPACITY" | "OTHER" | "FORMAT";
  changeType: "STARTDATETIME" | "ENDDATETIME" | "VENUE" | "LOCATION" | "TICKETPRICE" | "MULTIPLE";
  // need FORMAT ?? (I think cannot change event format once anyone booked the event)
  // CAPACITY is included because an admin can force-reduce capacity for compliance
  // reasons (e.g. fire safety limits a 500-seat venue to 150). Confirmed ticket
  // holders are affected through no fault of their own — they deserve a grace refund
  // window. Hosts cannot reduce capacity below soldTickets, but admins can override.
  summary: string;  // e.g. "Date changed from 15 Mar to 20 Apr 2026"
}

// ─── Core Model Interface ─────────────────────────────────────────────────────

export interface IBookingModel {
  _id: Types.ObjectId;

  // Relations
  userRef:  Types.ObjectId;  // The attendee
  eventRef: Types.ObjectId;  // The event (use IBookingPopulatedEvent when populated)

  // Ticket details — snapshot at booking time.
  // ticketRate stored here because event.ticketPrice can change after booking.
  quantity:    number;  // 1 for online; 1–10 for offline
  ticketRate:  number;  // Price per ticket at moment of booking
  totalAmount: number;  // quantity × ticketRate (kept in sync by pre-save hook)
  ticketNo:    string;

  // Status & event format
  bookingStatus: BOOKING_STATUS;
  eventFormat: EVENT_FORMAT;

  // Payment — embedded (not a separate model).
  payment: {
    orderId:    string;
    paymentId?: string;    // undefined until Razorpay captures the charge
    signature?: string;    // undefined until verified on backend
    status:  PAYMENT_STATUS;
    paidAt?: Date;
  }

  // QR / Entry
  // One signed JWT per booking (not per ticket). Payload: { bookingId, eventId, userId }.
  // Verified live from DB at scan time. Frontend renders via react-qr-code.
  qrToken:          string;  // Empty string on PENDING; populated after payment confirmed
  remainingEntries: number;  // Starts at quantity; decremented on each partial scan
  checkedInAt?:     Date;    // Timestamp of the FIRST scan only

  // Cancellation
  cancellation?: {
    reason?:     string;
    cancelledAt: Date;
    refundId?:   string;  // Razorpay refund ID; set when refund is initiated
    refundedAt?: Date;    // Set when Razorpay refund webhook confirms settlement
  };

  // Major event change (host changes date/venue/price etc. after tickets are sold)
  // Stored on booking (not event) because each booking may have a different grace
  // window depending on when it was created relative to the change.
  majorEventChange?: MajorEventChange;

  // Full refund allowed until this deadline regardless of normal cancellation policy.
  // Null = no active grace period.
  gracePeriodEnd?: Date | null;

  // Timestamps (auto-managed by Mongoose { timestamps: true })
  createdAt: Date;
  updatedAt: Date;
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
    category:      EVENT_CATEGORY;
    posterUrl:     string; 
    startDateTime: Date;
    endDateTime:   Date;
    format:        EVENT_FORMAT;
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
  status?:  BOOKING_STATUS;
  userId?:  string;   // filter by a specific user's bookings
  eventId?: string;   // admin / host: filter bookings for a specific event
  eventFormat?: EVENT_FORMAT;
  sortBy?:    BookingSortField;
  sortOrder?: "asc" | "desc";
}


// not used
export interface BookingFilterQuery {
  bookingStatus?: BOOKING_STATUS;
  userRef?:       Types.ObjectId;
  eventRef?:      Types.ObjectId;
  eventFormat?:   EVENT_FORMAT;
  // $or?:           Record<string, unknown>[];  // (for ticketNo search)
  $or?:           Array<Record<string, unknown>>;  // (for ticketNo search)
}




export interface GetBookingsResult {
  bookings:   BookingEntityPopulated[];
  pagination: IPagination;
}


export interface MapBookingParams {
  userId: string;
  event: EventEntity;
  newBookingQty: number;
  ticketNo: string;
  qrToken?: string;        // Only passed for free events
  paymentOrderId?: string; // Only passed for paid events
}



// After Event checkin
//  Decrements remainingEntries by entryCount
//  Sets bookingStatus (ATTENDED when all entries used, else unchanged)
//  Sets checkedInAt on the first scan only (undefined = not first scan, skip it)
export interface BookingCheckinUpdate {
  bookingId   : string,
  entryCount  : number,
  newStatus   : BOOKING_STATUS,
  checkedInAt?: Date,
}



