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



    async initiateRefund(paymentId: string, amountInRupees: number): Promise<RefundResult> {
        try {
            const amountInPaise = Math.round(amountInRupees * 100);
            console.log('Initiating Razorpay refund :', { paymentId, amountInRupees, amountInPaise});

            const refund = await this._client.payments.refund(paymentId, { amount: amountInPaise });

            console.log('Razorpay refund successful:', refund);

            return {
                refundId: refund.id,
                amount: refund.amount as number,
                status: refund.status as RefundResult["status"],
            };
        } catch (error: unknown) {
            const description = this.extractRazorpayErrorDescription(error);
            console.error("Razorpay Refund Failed Error :", description);
            throw createHttpError(HttpStatus.BAD_REQUEST, description);
        }
    }




    private extractRazorpayErrorDescription(error: unknown): string {
        if (typeof error === "string") {
            return error;
        }

        if (!error || typeof error !== "object") {
            return "Failed to initiate refund";
        }

        // Safe type narrowing
        const errObj = error as {
            error?: unknown;
            description?: unknown;
            message?: unknown;
        };

        // Razorpay most common structure: { error: { description: "..." } }
        if (errObj.error && typeof errObj.error === "object") {
            const innerError = errObj.error as { description?: unknown };
            if (typeof innerError.description === "string") {
            return innerError.description;
            }
        }

        // Direct description
        if (typeof errObj.description === "string") {
            return errObj.description;
        }

        // Direct message
        if (typeof errObj.message === "string") {
            return errObj.message;
        }

        return "Failed to initiate refund";
    }
}




