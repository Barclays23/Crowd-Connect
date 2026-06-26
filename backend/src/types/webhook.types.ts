// backend/src/types/webhook.types.ts

import { PaymentPurpose } from "@/constants/payment.constants";


// move to constants
export const STANDARD_WEBHOOK_EVENT_TYPES = {
    PAYMENT_SUCCESS : "PAYMENT_SUCCESS",
    PAYMENT_FAILED  : "PAYMENT_FAILED",
    
    REFUND_SUCCESS  : "REFUND_SUCCESS",
    REFUND_FAILED   : "REFUND_FAILED",
}
export type StandardWebhookEventType = typeof STANDARD_WEBHOOK_EVENT_TYPES[keyof typeof STANDARD_WEBHOOK_EVENT_TYPES];



export interface StandardWebhookEvent {
    eventType       : StandardWebhookEventType;
    paymentId       : string;
    orderId         : string;           // Razorpay order_id OR Stripe payment_intent_id
    refundId?       : string;
    amount          : number;           // Normalized to Rupees (not paise or cents)
    paymentPurpose  : PaymentPurpose;   // Extracted from notes or metadata
    timestamp       : number;
    rawPayload      : unknown;          // Keep the original just in case the strategy needs it
}