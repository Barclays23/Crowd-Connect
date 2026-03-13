// backend/src/entities/booking.entity.ts

import { BOOKING_STATUS, MajorEventChange, PAYMENT_STATUS } from "@/types/booking.types";
import { EVENT_FORMAT } from "@/types/event.types";
import { Types } from "mongoose";

export interface BookingEntity {
  bookingId:    string;
  userRef:      string;
  eventRef:     string;

  quantity:    number;
  ticketRate:  number;
  totalAmount: number;
  ticketNo:    string;
  
  // Booking Status & Event Format
  bookingStatus: BOOKING_STATUS;
  eventFormat: EVENT_FORMAT;

  payment: {
    orderId:    string;
    paymentId?: string;
    signature?: string;
    status:             PAYMENT_STATUS;
    paidAt?:            Date;
  };

  qrToken:          string;
  remainingEntries: number;
  checkedInAt?:     Date;

  cancellation?: {
    reason?:     string;
    cancelledAt: Date;
    refundId?:   string;
    refundedAt?: Date;
  };

  majorEventChange?: MajorEventChange;

  refundGracePeriodEnd?: Date | null;

  createdAt: Date;
  updatedAt: Date;
}

// Populated variant — eventRef replaced with event details
export interface BookingEntityPopulated extends Omit<BookingEntity, "eventRef" | "userRef"> {
  event: {
    eventId:       string;
    title:         string;
    category:      string;
    posterUrl:     string;
    startDateTime: Date;
    endDateTime:   Date;
    format:        string;
    locationName?: string;
    onlineLink?:   string;
  },
  user: {
    userId: string;
    name:   string;
    email:  string;
    // mobile?: string;
  };
}

// Input types for repository operations
export interface CreateBookingInput {
  userRef:   Types.ObjectId;
  eventRef:  Types.ObjectId;
  quantity:  number;
  ticketRate: number;
  totalAmount: number;
  ticketNo:    string;
  payment: {
    orderId: string;
    paymentId?: string;
    status:          PAYMENT_STATUS;
    paidAt:         Date;
  };
  qrToken:          string;
  remainingEntries: number;
  eventFormat: EVENT_FORMAT;
  bookingStatus:    BOOKING_STATUS;
}


export interface ConfirmBookingInput {
  razorpayPaymentId: string;
  razorpaySignature: string;
  qrToken:           string;
  paidAt:            Date;
}


export interface BookingCancelInput {
  bookingStatus: BOOKING_STATUS;
  paymentStatus: PAYMENT_STATUS;
  // qrToken:       string;
  cancellation: {
    cancelledAt: Date;
    reason?:     string;
    refundId?:   string;
    refundedAt?: Date;
  };
}


export interface BulkCancelBookingsInput {
  bookingStatus: BOOKING_STATUS;
  cancellation: {
    cancelledAt:  Date;
    cancelReason: string;
  };
}