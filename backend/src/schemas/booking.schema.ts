// backend/src/schemas/booking.schema.ts

import { z } from "zod";


// ─── Booking Initiation (free + paid events) ──────────────────────────────────
export const initiateBookingSchema = z.object({
  quantity: z
    .number("quantity must be a number")
    .int("quantity must be a whole number")
    .min(1, "You must choose at least 1 ticket.")
    .max(10, "Booking quantity cannot exceed 10"),
  // Online events only allow quantity 1 — enforced at service layer, not here.
  // Schema validates the shape; business rules validate the logic.
});


// ─── Payment Verification (paid events only) ─────────────────────────────────
export const verifyPaymentSchema = z.object({
  razorpayOrderId:   z.string().min(1, "razorpayOrderId is required"),
  razorpayPaymentId: z.string().min(1, "razorpayPaymentId is required"),
  razorpaySignature: z.string().min(1, "razorpaySignature is required"),
});

// ─── Cancellation ─────────────────────────────────────────────────────────────
// Kept here — cancel route will be added in the next implementation phase.

export const cancelBookingSchema = z.object({
  reason: z.string().min(1, "Cancellation reason is required").optional(),
});

// ─── Query filters ────────────────────────────────────────────────────────────

// export const getBookingsQuerySchema = z.object({
//   page:   z.coerce.number().int().min(1).default(1),
//   limit:  z.coerce.number().int().min(1).max(50).default(10),
//   status: z.nativeEnum(BOOKING_STATUS).optional(),  // only valid status values pass
// });

// // Admin has one extra filter — eventId
// export const getAdminBookingsQuerySchema = getBookingsQuerySchema.extend({
//   eventId: objectId.optional(),
// });