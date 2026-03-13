// backend/src/constants/booking.constants.ts

export const ONLINE_MAX_TICKETS_PER_USER      = 1;   // Online: total tickets per user per event
export const OFFLINE_MAX_TICKETS_PER_USER     = 10;  // Offline: total tickets per user per event
export const OFFLINE_MAX_TICKETS_PER_BOOKING  = 5;   // Offline: tickets allowed in one transaction
export const MIN_TICKETS_PER_BOOKING          = 1;   // Minimum tickets for booking



export const BOOKING_MESSAGES = {
    BOOKING_INITIATED: "Booking initiated successfully",
    BOOKING_CONFIRMED: "Booking confirmed successfully",
    BOOKING_CANCELLED: "Booking has been cancelled.",

    // ─── ONLINE EVENT MESSAGES ────────────────────────────
    ONLINE_LIMIT_PER_USER: `You can only book ${ONLINE_MAX_TICKETS_PER_USER} ticket for online events`,
    ONLINE_LIMIT_EXCEEDED: "You already have an active booking for this online event",

    // ─── OFFLINE EVENT MESSAGES ────────────────────────────
    PER_BOOKING_LIMIT_EXCEEDED: `You cannot book more than ${OFFLINE_MAX_TICKETS_PER_BOOKING} tickets at a time.`,
    PER_USER_LIMIT_EXCEEDED: (bookedQty: number) => 
        `You already booked ${bookedQty} tickets for this event.
        You cannot book more than ${OFFLINE_MAX_TICKETS_PER_USER} tickets in total for this event`,

    // ─── AVAILABILITY MESSAGES ─────────────────────────────
    EVENT_NOT_BOOKABLE: "This event is not available for booking",
    TICKETS_SOLD_OUT: "All tickets for this event have been sold out. Please check later.",
    NOT_ENOUGH_TICKETS: (ticketsLeft: number) => `We are sorry, only ${ticketsLeft} ticket${ticketsLeft === 1 ? '' : 's'} left for this event.`,
    WAITLIST_AVAILABLE: "No tickets left, but you can join the waitlist",
    MIN_TICKETS_REQUIRED: `Minimum ${MIN_TICKETS_PER_BOOKING} ticket required`,


    // ─── PAYMENT MESSAGES ──────────────────────────────────
    PAYMENT_INITIATED: "Payment initiated",
    PAYMENT_VERIFIED: "Payment verified successfully",
    PAYMENT_FAILED: "Payment failed",
    PAYMENT_PENDING: "Payment is pending",
    PAYMENT_REFUNDED: "Payment refunded",
    REFUND_INITIATED: "Refund process started",
    PAYMENT_AMOUNT_MISMATCH: "Payment amount does not match booking amount",
    PAYMENT_GATEWAY_ERROR: "Payment gateway error. Please try again.",
    PAYMENT_VERIFICATION_FAILED: "Payment verification failed",
    MAX_RETRIES_EXCEEDED: "Maximum payment retry attempts exceeded",

    // ─── ERROR MESSAGES ────────────────────────────────────
    BOOKING_NOT_FOUND: "Booking not found",
    INVALID_TICKET_QUANTITY: "Invalid ticket quantity",
    CANNOT_BOOK_OWN_EVENT: "You cannot book your own event.",
    EVENT_ALREADY_SUSPENDED: "This event has been temporarily suspended",
    SUPER_ADMIN_CANNOT_BOOK: "Super admin cannot book events",
    
    // ─── CANCELLATION MESSAGES ────────────────────────────────────
    BOOKING_ALREADY_CANCELLED: "This booking is already cancelled",
    EVENT_ALREADY_CANCELLED: "This event is already cancelled",
    CANCELLATION_WINDOW_CLOSED: "Cannot cancel booking. Cancellation window has already closed",
    CANCELLATION_NOT_ALLOWED: "This booking cannot be cancelled",
    UNAUTHORIZED_BOOKING_CANCELLATION: "You are not authorized to cancel this booking",
    CANNOT_CANCEL_AFTER_ENTRY: "Cannot cancel booking after entry pass has been used",



    // EVENT_ALREADY_STARTED: "Cannot modify booking after event has started",
    EVENT_ALREADY_ENDED: "Event has already ended",
    


    // ─── CHECK-IN MESSAGES ─────────────────────────────────
    INVALID_TICKET: "Invalid ticket",
    QR_CODE_INVALID: "Invalid ticket or QR code",
    QR_CODE_EXPIRED: "QR code has expired",
    NO_TICKETS_REMAINING: "No tickets remaining for entry",
    CHECK_IN_SUCCESS: "Check-in successful",
    TICKET_FULLY_USED: (used: number, total: number) => 
    `This ticket has already been used for ${used} of ${total} entries`,
    CHECK_IN_NOT_STARTED: "Check-in for this event hasn't started yet",
    CHECK_IN_CLOSED: "The event time is over and check-in has closed",

} as const;