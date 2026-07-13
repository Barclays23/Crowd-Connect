// frontend/src/types/payment.types.ts


// Base Order Type (Reusable for bookings, Role Upgrades, etc.)
export interface BasePaymentOrderDetails {
  orderId   : string;
  amount    : number;   // in paise (₹ × 100)
  currency  : string;
  keyId     : string;   // Razorpay/stripe key_id frontend SDK
}



export interface VerifyPaymentPayload {
  paymentOrderId: string;
  paymentId: string;
  signature: string;
}