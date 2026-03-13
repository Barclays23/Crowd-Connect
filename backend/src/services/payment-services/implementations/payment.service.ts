// src/services/payment-services/implementations/payment.service.ts

import { IPaymentProvider, RefundResult } from "@/services/payment-services/interfaces/IPaymentProvider";
import { InitiateRefundInput, IPaymentService } from "@/services/payment-services/interfaces/IPaymentService";




export class PaymentService implements IPaymentService {

    constructor(
        private readonly _provider: IPaymentProvider,  // RazorpayProvider | StripeProvider
    ) {}

    async createBookingOrder(amount: number, bookingId: string): Promise<{ orderId: string }> {
        const result = await this._provider.createOrder(amount, "INR", bookingId);
        return { orderId: result.orderId };
    }

    verifyPaymentSignature(orderId: string, paymentId: string, signature: string): boolean {
        return this._provider.verifySignature(orderId, paymentId, signature);
    }

    async initiateBookingRefund(input: InitiateRefundInput): Promise<RefundResult> {
        return this._provider.initiateRefund(input.paymentId, input.amount);
        // bookingId used for logging/notes — attach here if your provider supports it
    }
}