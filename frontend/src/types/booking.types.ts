// frontend/src/types/booking.types.ts

import { type BookingStatus } from "@/constants/booking.constants";
import type { EventFormat } from "@/constants/event.constants";
import { 
  PAYMENT_METHODS,
  type PaymentMethod, 
  type PaymentStatus 
} from "@/constants/payment.constants";
import type { IPagination } from "@/types/common.types";
import type { 
  BasePaymentOrderDetails, 
} from "@/types/payment.types";




export type BookingSortField = "createdAt" | "startDateTime" | "ticketRate" | "totalAmount" | "quantity" | "ticketNo";





// ─── Booking Responses ────────────────────────────────────────────────────────

// Returned for paid events from POST /bookings/initiate
export interface BookingPaymentOrder extends BasePaymentOrderDetails {
  bookingId: string;  // pending booking _id — stored by frontend for reference
}


// Returned after booking is confirmed (free event or after payment verified)
export interface IBookingState {
  bookingId         : string;
  event             : {
    eventId             : string;
    title               : string;
    category            : string;
    posterUrl           : string;
    startDateTime       : string;
    endDateTime         : string;
    format              : string;
    locationName?       : string;
    onlineLink?         : string;
  };
  user              : {
    userId              : string;
    name                : string;
    email               : string;
  }
  quantity          : number;
  ticketRate        : number;
  totalAmount       : number;
  ticketNo          : string;
  eventFormat       : EventFormat;
  bookingStatus     : BookingStatus;
  payment           : {
    orderId             : string;
    paymentId?          : string;
    status              : PaymentStatus;
    paidAt?             : string;
  };
  qrToken           : string;
  remainingEntries  : number;
  checkedInAt?      : string;
  cancellation?     : {
    reason?             : string;
    cancelledAt         : string;
    refundId?           : string;
    refundedAt?         : string;
  };
  gracePeriodEnd?   : string;
  createdAt         : string;
}



// Discriminated union — returned from POST /bookings/initiate
export type InitiateBookingResponse = 
  | { isFree: true;  paymentMethod: typeof PAYMENT_METHODS.NONE;   populatedBooking: IBookingState }
  | { isFree: false; paymentMethod: typeof PAYMENT_METHODS.WALLET; populatedBooking: IBookingState }
  | { isFree: false; paymentMethod: typeof PAYMENT_METHODS.ONLINE; order: BookingPaymentOrder };


export interface InitiateBookingParams {
  eventId             : string;
  eventTitle          : string;
  selectedQuantity    : number;
  paymentMethod       : PaymentMethod;
  userName            : string;
  userEmail           : string;
  userPhone?          : string;
}


export interface RetryBookingParams {
  bookingId     : string, 
  paymentMethod : PaymentMethod,
  eventTitle    : string, 
  userName      : string, 
  userEmail     : string, 
  userPhone?    : string
}


export interface GetMyBookingsParams {
  page?         : number;
  limit?        : number;
  status?       : string;
  eventFormat?  : EventFormat | "all";
  sortBy?       : BookingSortField;
  sortOrder?    : "asc" | "desc";
  search?       : string;
}


export interface GetMyBookingsResponse {
  bookings  : IBookingState[];
  pagination: IPagination;
}


export interface GetBookingsApiResponse {
  bookingsData  : IBookingState[];
  pagination    : IPagination;
  // message       : string;
}