// backend/src/dtos/booking.dto.ts

import { IPagination } from "@/types/common.types";
import { BOOKING_STATUS, PAYMENT_STATUS } from "@/types/booking.types";
import { EVENT_CATEGORY, EVENT_FORMAT } from "@/types/event.types";


// ─── Request DTOs ─────────────────────────────────────────────────────────────

export interface BookingOrderRequestDTO {
  eventId:  string;
  userId: string;
  quantity: number;  // 1 for online events, max 5 for offline events
}



export interface VerifyPaymentRequestDTO {
  bookingId: string;
  paymentOrderId: string;
  paymentId: string;
  signature: string;
}






// ─── Response DTOs ────────────────────────────────────────────────────────────

// Returned after a paid event order is created (fed to Razorpay frontend SDK)
export interface BookingOrderResponseDTO {
  bookingId:       string;   // pending booking _id — stored by frontend for reference
  orderId: string;
  amount:          number;   // in paise (₹ × 100)
  currency:        string;
  keyId:           string;   // Razorpay key_id for frontend SDK
}

// Returned for all booking detail views (after confirmation)
export interface BookingResponseDTO {
  bookingId:       string;
  event: {
    eventId:       string;
    title:         string;
    category:      EVENT_CATEGORY;
    posterUrl:     string;
    startDateTime: string;
    endDateTime:   string;
    format:        EVENT_FORMAT;
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
  bookingStatus:    BOOKING_STATUS;
  payment: {
    orderId:    string;
    paymentId?: string;
    signature?: string;
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
  gracePeriodEnd?: string;
  isGraceRefundActive:    boolean;   // true if gracePeriodEnd is set and hasn't passed
  currentRefundPercent:   number;    // 0 for non-CONFIRMED bookings
  currentRefundableAmount: number;   // ₹ amount user would receive right now

  createdAt: string;
}


// Returned from initiateBooking — shape differs based on free vs paid.
// Frontend checks isFree to decide next step:
//   isFree = true  → booking is already confirmed, show confirmation screen
//   isFree = false → open Razorpay SDK with `order`, then call verify-payment
export type InitiateBookingResponseDTO =
  | { isFree: true;  populatedBooking: BookingResponseDTO }    // confirmed, has QR
  | { isFree: false; order:   BookingOrderResponseDTO } // pending, needs payment




// ─── List response DTOs ───────────────────────────────────────────────────────

export interface GetBookingsResponseDTO {
  bookings:   BookingResponseDTO[];
  pagination: IPagination;
}