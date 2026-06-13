// src/services/payment-services/implementations/payment.service.ts

import { PaymentPurpose } from "@/constants/payment.constants";
import { IPaymentProvider } from "@/services/payment-services/interfaces/IPaymentProvider";
import { 
    InitiateRefundInput, 
    IPaymentService 
} from "@/services/payment-services/interfaces/IPaymentService";
import { 
    CreateOrderResult, 
    RefundResult 
} from "@/types/payment.types";
import { StandardWebhookEvent } from "@/types/webhook.types";




export class PaymentService implements IPaymentService {

    constructor(
        private readonly _provider: IPaymentProvider,  // RazorpayProvider | StripeProvider
    ) {}

    async createBookingOrder(totalAmount: number, userId: string): Promise<CreateOrderResult> {
        const purpose: PaymentPurpose = PaymentPurpose.EVENT_BOOKING;
        const result: CreateOrderResult = await this._provider.createOrder(purpose, totalAmount, "INR", userId);
        return result;
    }


    verifyPaymentSignature(orderId: string, paymentId: string, signature: string): boolean {
        return this._provider.verifyPaymentSignature(orderId, paymentId, signature);
    }


    verifyWebhookSignature(rawBody: string | Buffer, headers: Record<string, string | string[] | undefined>): boolean {
        return this._provider.verifyWebhookSignature(rawBody, headers);
    }


    normalizeWebhookPayload(rawPayload: unknown): StandardWebhookEvent | null {
        return this._provider.normalizeWebhookPayload(rawPayload);
    }


    async initiateBookingRefund(input: InitiateRefundInput): Promise<RefundResult> {
        return this._provider.initiateRefund(input.paymentId, input.amount);
        // bookingId used for logging/notes — attach here if your provider supports it
    }
}