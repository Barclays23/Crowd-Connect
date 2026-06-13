// src/services/payment-services/interfaces/IPaymentService.ts

import { CreateOrderResult, RefundResult } from "@/types/payment.types";
import { StandardWebhookEvent } from "@/types/webhook.types";

export interface InitiateRefundInput {
   paymentId: string;   // razorpayPaymentId from booking.payment
   bookingId: string;   // attached as receipt/note on Razorpay dashboard
   amount:    number;   // in Rupees
}




export interface IPaymentService {
    // Creates a payment order for a paid booking. Called during initiateBooking for paid events.
    createBookingOrder(amount: number, userId: string): Promise<CreateOrderResult>;

    // Verifies webhook signature after payment capture. Called in verifyPayment flow.
    verifyPaymentSignature(orderId: string, paymentId: string, signature: string): boolean;

    // Verifies webhook signature for incoming webhooks events.
    verifyWebhookSignature(rawBody: string | Buffer, headers: Record<string, string | string[] | undefined>): boolean;

    normalizeWebhookPayload(rawPayload: unknown): StandardWebhookEvent | null;

    // Initiates a refund via Razorpay or Stripe.
    initiateBookingRefund(input: InitiateRefundInput): Promise<RefundResult>;
}
