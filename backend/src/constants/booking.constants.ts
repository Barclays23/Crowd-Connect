// backend/src/constants/booking.constants.ts

export const ONLINE_MAX_TICKETS_PER_USER      = 1;   // Online: total tickets per user per event
export const OFFLINE_MAX_TICKETS_PER_USER     = 10;  // Offline: total tickets per user per event
export const OFFLINE_MAX_TICKETS_PER_BOOKING  = 5;   // Offline: tickets allowed in one transaction
export const MIN_TICKETS_PER_BOOKING          = 1;   // Minimum tickets for booking





export const BOOKING_STATUSES = {
  PENDING   : "pending",    // Razorpay order created; payment not yet confirmed
  CONFIRMED : "confirmed",  // Payment verified; QR issued; host earns this ticket
  FAILED    : "failed",     // Razorpay payment.failed webhook received
                            // Kept in DB for audit trail — never delete failed bookings
  CANCELLED : "cancelled",  // User cancelled — check payment.status for refund state
  ATTENDED  : "attended",   // remainingEntries hit 0 — ALL tickets in this booking scanned
                            // Partial scans stay as CONFIRMED (e.g. 3 of 5 scanned → CONFIRMED)
} as const
export type BookingStatus = (typeof BOOKING_STATUSES)[keyof typeof BOOKING_STATUSES];




// ─── Booking Flow ─────────────────────────────────────────────────────────────
//
// PENDING ──→ CONFIRMED ──→ ATTENDED          (all tickets scanned)
//          |            └──→ CONFIRMED         (no-show / partial — host still earns it)
//          └──→ FAILED                         (Razorpay payment.failed webhook)
//
// CONFIRMED ──→ CANCELLED
//                  └── payment.status = REFUNDED  (cancelled within refund window)
//                  └── payment.status = PAID      (cancelled past window — no refund)

