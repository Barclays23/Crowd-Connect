// src/services/payment-services/implementations/payment.service.ts

import { PAYMENT_PURPOSES, PaymentPurpose } from "@/constants/payment.constants";
import { IPaymentProvider } from "@/providers/payment-providers/IPaymentProvider";
import { 
    InitiateRefundInput, 
    IPaymentService 
} from "@/services/payment-services/interfaces/IPaymentService";
import { 
    CreateOrderResult, 
    RefundResult 
} from "@/types/payment.types";




export class PaymentService implements IPaymentService {

    constructor(
        private readonly _provider: IPaymentProvider,  // RazorpayProvider | StripeProvider
    ) {}

    async createBookingOrder(totalAmount: number, userId: string): Promise<CreateOrderResult> {
        const purpose: PaymentPurpose = PAYMENT_PURPOSES.EVENT_BOOKING;
        const result: CreateOrderResult = await this._provider.createOrder(purpose, totalAmount, "INR", userId);
        return result;
    }


    verifyPaymentSignature(orderId: string, paymentId: string, signature: string): boolean {
        return this._provider.verifyPaymentSignature(orderId, paymentId, signature);
    }


    async initiateBookingRefund(input: InitiateRefundInput): Promise<RefundResult> {
        return this._provider.initiateRefund(input.paymentId, input.amount);
        // bookingId used for logging/notes — attach here if your provider supports it
    }
}