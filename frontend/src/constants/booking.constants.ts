// frontend/src/constants/booking.constants.ts

export const MAX_ONLINE_TICKETS_PER_USER      = 1;   // Online: total tickets per user per event
export const MAX_OFFLINE_TICKETS_PER_USER     = 10;  // Offline: total tickets per user per event
export const MAX_OFFLINE_TICKETS_PER_BOOKING  = 5;   // Offline: tickets allowed in one transaction
export const MIN_TICKETS_PER_BOOKING          = 1;   // Minimum tickets for booking



// Booking quantity constraints - just for UI display
export const BOOKING_CONSTRAINTS = {
  ONLINE: {
    MAX_PER_BOOKING : MAX_ONLINE_TICKETS_PER_USER,      // Online: max 1 ticket per booking per user
    MESSAGE         : `You can book only ${MAX_ONLINE_TICKETS_PER_USER} ticket for online events.`
  },
  OFFLINE: {
    MAX_PER_BOOKING : MAX_OFFLINE_TICKETS_PER_BOOKING,       // Offline: max 5 tickets per booking
    MESSAGE         : `A maximum of ${MAX_OFFLINE_TICKETS_PER_BOOKING} tickets is allowed per booking.`
  },
  MIN_PER_BOOKING   : MIN_TICKETS_PER_BOOKING,
} as const;


export const BOOKING_STATUS = {
  PENDING     : "pending",
  CONFIRMED   : "confirmed",
  FAILED      : "failed",
  CANCELLED   : "cancelled",
  ATTENDED    : "attended",
} as const;

export type BookingStatus = typeof BOOKING_STATUS[keyof typeof BOOKING_STATUS];



// cancellable booking statuses
export const cancellableStatuses = new Set<BookingStatus>([
  BOOKING_STATUS.CONFIRMED,
  BOOKING_STATUS.PENDING,
]);
