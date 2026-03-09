// src/services/payment-services/interfaces/IPaymentService.ts

import { RefundResult } from "@/services/payment-services/interfaces/IPaymentProvider";

export interface InitiateRefundInput {
   paymentId: string;   // razorpayPaymentId from booking.payment
   bookingId: string;   // attached as receipt/note on Razorpay dashboard
   amount:    number;   // In paise (multiply rupees × 100 before passing)
}




export interface IPaymentService {
    // Creates a Razorpay order for a paid booking. Called during initiateBooking for paid events.
    createBookingOrder(amount: number, bookingId: string): Promise<{ orderId: string }>;

    // Verifies Razorpay webhook signature after payment capture. Called in verifyPayment flow.
    verifyPaymentSignature(orderId: string, paymentId: string, signature: string): boolean;

    // Initiates a refund via Razorpay.
    // Amount must be in paise.
    // Returns Razorpay refund object — store refund.id in booking.cancellation.refundId.
    initiateBookingRefund(input: InitiateRefundInput): Promise<RefundResult>;
}
