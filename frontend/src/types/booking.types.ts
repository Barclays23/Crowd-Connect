// frontend/src/types/booking.types.ts

import type { IPagination } from "@/types/common.types";
import type { EVENT_FORMAT } from "@/types/event.types";

export const BOOKING_STATUS = {
  PENDING:   "pending",
  CONFIRMED: "confirmed",
  FAILED:    "failed",
  CANCELLED: "cancelled",
  ATTENDED:  "attended",
} as const;

export type BOOKING_STATUS = typeof BOOKING_STATUS[keyof typeof BOOKING_STATUS];
// → "pending" | "confirmed" | "failed" | "cancelled" | "attended"


export const PAYMENT_STATUS = {
  PENDING:  "pending",
  PAID:     "paid",
  FAILED:   "failed",
  REFUNDED: "refunded",
} as const;

export type PAYMENT_STATUS = typeof PAYMENT_STATUS[keyof typeof PAYMENT_STATUS];
// → "pending" | "paid" | "failed" | "refunded"


export type BookingSortField = "createdAt" | "startDateTime" | "ticketRate" | "totalAmount" | "quantity" | "ticketNo";



// Booking quantity constraints - just for UI display
export const BOOKING_CONSTRAINTS = {
  ONLINE: {
    MAX_PER_BOOKING: 1,      // Online: max 1 ticket per booking per user
    MESSAGE: "You can book only 1 ticket for online events."
  },
  OFFLINE: {
    MAX_PER_BOOKING: 5,       // Offline: max 5 tickets per booking
    MESSAGE: "A maximum of 5 tickets is allowed per booking."
  },
  MIN_PER_BOOKING: 1,
} as const;



// ─── Booking Responses ────────────────────────────────────────────────────────

// Returned for paid events from POST /bookings/initiate
// Feed directly to Razorpay frontend SDK
export interface BookingPaymentOrderResponse {  // same interface BookingOrderResponseDTO why that separate??
  bookingId:       string;   // pending booking _id — stored by frontend for reference
  orderId: string;
  amount:          number;   // in paise (₹ × 100)
  currency:        string;
  keyId:           string;   // Razorpay key_id for frontend SDK
}


// Returned after booking is confirmed (free event or after payment verified)
export interface IBookingState {
  bookingId: string;
  event: {
    eventId:       string;
    title:         string;
    category:      string;
    posterUrl:     string;
    startDateTime: string;
    endDateTime:   string;
    format:        string;
    locationName?: string;
    onlineLink?:   string;
  };
  user: {
    userId: string;
    name: string;
    email: string;
  }
  quantity:         number;
  ticketRate:       number;
  totalAmount:      number;
  ticketNo:         string;
  eventFormat:      EVENT_FORMAT;
  bookingStatus:    BOOKING_STATUS;
  payment: {
    orderId:    string;
    paymentId?: string;
    status:             PAYMENT_STATUS;
    paidAt?:            string;
  };
  qrToken:          string;
  remainingEntries: number;
  checkedInAt?:     string;
  cancellation?: {
    reason?:     string;
    cancelledAt: string;
    refundId?:   string;
    refundedAt?: string;
  };
  refundGracePeriodEnd?: string;
  createdAt: string;
}


// Discriminated union — returned from POST /bookings/initiate
// Frontend checks isFree to decide next step:
//   isFree = true  → booking confirmed, show confirmation screen directly
//   isFree = false → open Razorpay SDK with order, then call /verify-payment
export type InitiateBookingResponse =  // is it booking confirmation response ???
  | { isFree: true;  populatedBooking: IBookingState }
  | { isFree: false; order:   BookingPaymentOrderResponse };




export interface GetMyBookingsParams {
  page?:      number;
  limit?:     number;
  status?:    string;
  eventFormat?: EVENT_FORMAT | "all";
  sortBy?:    BookingSortField;
  sortOrder?: "asc" | "desc";
  search?: string;
}


export interface GetMyBookingsResponse {
  bookings:   IBookingState[];
  pagination: IPagination;
}


export interface GetBookingsApiResponse {
  bookingsData: IBookingState[];
  // message: string;
  pagination: IPagination;
}