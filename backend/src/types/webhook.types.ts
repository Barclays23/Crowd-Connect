// backend/src/types/webhook.types.ts

import { PaymentPurpose } from "@/constants/payment.constants";

// import { PaymentPurpose } from "@/constants/payment.constants";



export enum StandardWebhookEventType {
    PAYMENT_SUCCESS = "PAYMENT_SUCCESS",
    PAYMENT_FAILED = "PAYMENT_FAILED",
    
    REFUND_SUCCESS = "REFUND_SUCCESS",
    REFUND_FAILED = "REFUND_FAILED",
}





export interface StandardWebhookEvent {
    eventType: StandardWebhookEventType;
    paymentId: string;
    refundId?: string;
    amount: number; // Normalized to Rupees (not paise or cents)
    paymentPurpose: PaymentPurpose; // Extracted from notes or metadata
    timestamp: number;
    rawPayload: any; // Keep the original just in case the strategy needs it
}