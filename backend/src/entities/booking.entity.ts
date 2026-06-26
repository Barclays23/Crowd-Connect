// backend/src/entities/booking.entity.ts

import { BookingStatus } from "@/constants/booking.constants";
import { EventCategory, EventFormat } from "@/constants/event.constants";
import { PaymentStatus } from "@/constants/payment.constants";
import { MajorEventChange } from "@/types/booking.types";
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
  bookingStatus: BookingStatus;

  payment: {
    orderId:    string;
    paymentId?: string;
    signature?: string;
    status:             PaymentStatus;
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

  gracePeriodEnd?: Date | null;

  createdAt: Date;
  updatedAt: Date;
}

// Populated variant — eventRef replaced with event details
export interface BookingEntityPopulated extends Omit<BookingEntity, "eventRef" | "userRef"> {
  event: {
    eventId:       string;
    title:         string;
    category:      EventCategory;
    posterUrl:     string;
    startDateTime: Date;
    endDateTime:   Date;
    format:        EventFormat;
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
  _id?: string | Types.ObjectId;  // for Free Events, auto-generated bookingId is created already for generating the QR token
  userRef:   Types.ObjectId;
  eventRef:  Types.ObjectId;
  quantity:  number;
  ticketRate: number;
  totalAmount: number;
  ticketNo:    string;
  payment: {
    orderId: string;
    paymentId?: string;
    status:          PaymentStatus;
    paidAt?:         Date;
  };
  qrToken:          string;
  remainingEntries: number;
  eventFormat: EventFormat;
  bookingStatus:    BookingStatus;
}

// 2
export interface ConfirmBookingInput {
  payment: {
    paymentId: string;
    signature: string;
    status: PaymentStatus;
    paidAt: Date;
  };
  qrToken: string;
  bookingStatus: BookingStatus;
}


export interface UpdateBookingInput {  // or UpdateBookingRefundInput

}


export interface CancelBookingInput {
  bookingStatus: BookingStatus;
  paymentStatus: PaymentStatus;
  // qrToken:       string;
  cancellation: {
    cancelledAt: Date;
    reason?:     string;
    refundId?:   string;
    refundedAt?: Date;
  };
}


export interface BulkCancelBookingsInput {
  bookingStatus: BookingStatus;
  cancellation: {
    cancelledAt:  Date;
    reason: string;
  };
}


export interface MarkRefundedInput {
  paymentStatus: PaymentStatus;
  refundId: string;
  refundedAt: Date;
}