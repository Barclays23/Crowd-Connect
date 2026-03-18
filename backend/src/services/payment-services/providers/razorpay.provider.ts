// src/services/payment-services/providers/razorpay.provider.ts

import Razorpay from "razorpay";
import crypto   from "crypto";
import { CreateOrderResult, IPaymentProvider, RefundResult } from "@/services/payment-services/interfaces/IPaymentProvider";
import { createHttpError } from "@/utils/httpError.utils";
import { HttpStatus } from "@/constants/statusCodes.constants";
import { PaymentMessages } from "@/constants/responseMessages.constants";


export class RazorpayProvider implements IPaymentProvider {

    private readonly _client: Razorpay;

    constructor() {
        this._client = new Razorpay({
            key_id:     process.env.RAZORPAY_KEY_ID!,
            key_secret: process.env.RAZORPAY_KEY_SECRET!,
        });
    }

    async createOrder(purpose: string, totalAmount: number, currency: string, userId: string): Promise<CreateOrderResult> {
        try {
            const shortPurpose = purpose.slice(0, 8); 
            const timestamp = Date.now().toString().slice(-6);

            const receiptId = `${shortPurpose}_${userId}_${timestamp}`.slice(0, 40);  // max 40 chars allowed

            const amountInPaise = Math.round(totalAmount * 100);
    
            const order = await this._client.orders.create({ 
                amount: amountInPaise, 
                currency, 
                receipt: receiptId 
            });
    
            return { 
                orderId: order.id, 
                amount: order.amount as number, 
                currency: order.currency 
            };

        } catch (error: unknown) {
            let errorMessage = "Payment gateway failed to initialize.";

            if (typeof error === "object" && error !== null && "error" in error) {
                const rzpError = error as any;
                errorMessage = rzpError.error?.description || errorMessage;
            } else if (error instanceof Error) {
                errorMessage = error.message;
            }

            console.error(`[CRITICAL] Razorpay Create Order Error: ${errorMessage}`);
            
            throw createHttpError(HttpStatus.BAD_GATEWAY, PaymentMessages.PAYMENT_SETUP_FAILED);
        }
    }

    verifySignature(orderId: string, paymentId: string, signature: string): boolean {
        const body    = `${orderId}|${paymentId}`;

        // Verify Razorpay HMAC signature
        const generatedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
            .update(body)
            .digest("hex");

        return generatedSignature === signature;
    }

    async initiateRefund(paymentId: string, amount: number): Promise<RefundResult> {
        const amountInPaise = Math.round(amount * 100);

        const refund = await this._client.payments.refund(paymentId, { amount: amountInPaise });

        return {
            refundId: refund.id,
            amount:   refund.amount as number,
            status:   refund.status as RefundResult["status"],
        };
    }
}