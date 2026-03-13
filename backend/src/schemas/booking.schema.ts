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
  orderId:   z.string().min(1, "OrderId is required"),
  paymentId: z.string().min(1, "PaymentId is required"),
  signature: z.string().min(1, "Signature is required"),
});


// ─── Booking Cancellation ─────────────────────────────────────────────────────────────
export const cancelReasonBase = z
  .string()
  .trim()
  .min(1, "You must provide the reason to cancel booking.")
  // prevent symbol spam at the start
  .refine(
      (value) => !/^[^A-Za-z0-9]/.test(value), "Reason cannot start with special characters",
  )
  .min(20, "Reason must be at least 20 characters")
  .max(100, "Reason cannot be more than 100 characters")
  .regex(
      /\b[A-Za-z]{3,}\b/,
      "Reason must contain meaningful words"
  )
  // limit special characters dominance
  .refine((value) => {
      const total = value.length;
      const specialCount = (value.match(/[^A-Za-z0-9\s.,'()-]/g) || []).length;
      return specialCount / total <= 0.3; // 30%
  }, {
      message: "Reason contains too many special characters"
  })



export const cancelBookingSchema = z.object({
  cancelReason: cancelReasonBase
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