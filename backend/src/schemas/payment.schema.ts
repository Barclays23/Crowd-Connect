// backend/src/schemas/payment.schema.ts

import { z } from "zod";



// ─── Payment Verification (paid events only) ─────────────────────────────────

// Razorpay IDs usually follow patterns like:
// order_XXXXXXXXXXXX
// pay_XXXXXXXXXXXX

export const verifyRazorPayPaymentSchema = z.object({
  paymentOrderId: z
    .string()
    .trim()
    .min(1, "OrderId is required")
    .regex(/^order_[A-Za-z0-9]+$/, "Invalid Razorpay Order ID"),

  paymentId: z
    .string()
    .trim()
    .min(1, "PaymentId is required")
    .regex(/^pay_[A-Za-z0-9]+$/, "Invalid Razorpay Payment ID"),

  signature: z
    .string()
    .trim()
    .min(1, "Signature is required")
    .length(64, "Invalid signature length") // HMAC SHA256 = 64 hex chars
    .regex(/^[a-f0-9]+$/i, "Invalid signature format"),
});



export const verifyStripePaymentSchema = z.object({
  paymentIntentId: z
    .string()
    .trim()
    .min(1, "Payment PaymentIntent ID is required")
    .regex(/^pi_[A-Za-z0-9]+$/, "Invalid Stripe PaymentIntent ID"),
});