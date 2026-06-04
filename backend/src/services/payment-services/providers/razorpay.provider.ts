// src/services/payment-services/providers/razorpay.provider.ts

import Razorpay from "razorpay";
import crypto   from "crypto";
import { 
    IPaymentProvider, 
} from "@/services/payment-services/interfaces/IPaymentProvider";
import { createHttpError } from "@/utils/httpError.utils";
import { HttpStatus } from "@/constants/statusCodes.constants";
import { PaymentMessages } from "@/constants/responseMessages.constants";
import { PaymentPurpose } from "@/constants/payment.constants";
import { 
    StandardWebhookEvent, 
    StandardWebhookEventType 
} from "@/types/webhook.types";
import { RazorPayOrderOptions, RazorpayWebhookPayload } from "@/types/razorpay.types";
import { CreateOrderResult, RefundResult } from "@/types/payment.types";




export class RazorpayProvider implements IPaymentProvider {

    private readonly _client: Razorpay;

    constructor() {
        this._client = new Razorpay({
            key_id      : process.env.RAZORPAY_KEY_ID!,
            key_secret  : process.env.RAZORPAY_KEY_SECRET!,
        });
    }



    async createOrder(purpose: PaymentPurpose, totalAmount: number, currency: string, userId: string): Promise<CreateOrderResult> {
        try {
            // Razorpay requires a minimum of ₹1.00 (100 paise)
            if (currency.toUpperCase() === 'INR' && totalAmount < 1.00) {
                throw createHttpError(HttpStatus.BAD_REQUEST, PaymentMessages.MINIMUM_AMOUNT_REQUIRED);
            }

            const shortPurpose  = purpose.slice(0, 8); 
            const timestamp     = Date.now().toString().slice(-6);
            const receiptId     = `${shortPurpose}_${userId}_${timestamp}`.slice(0, 40);  // max 40 chars allowed
            const amountInPaise = Math.round(totalAmount * 100);

            const options: RazorPayOrderOptions = {
                amount      : amountInPaise,
                currency    : "INR",
                receipt     : receiptId,
                notes       : {
                    payment_purpose: purpose  // "EVENT_BOOKING", "ROLE_UPGRADE"
                }
            };

            const order = await this._client.orders.create(options);
    
            return { 
                orderId : order.id, 
                amount  : order.amount as number, 
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
            // throw error;
            
            throw createHttpError(HttpStatus.BAD_GATEWAY, PaymentMessages.PAYMENT_SETUP_FAILED);
        }
    }


    
    // not async function ??
    verifyPaymentSignature(orderId: string, paymentId: string, signature: string): boolean {
        const body    = `${orderId}|${paymentId}`;

        // Verify Razorpay HMAC signature
        const generatedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
            .update(body)
            .digest("hex");

        return generatedSignature === signature;
    }



    // not async function ??
    verifyWebhookSignature(rawBody: string | Buffer, headers: Record<string, any>): boolean {
        const signature: string = headers['x-razorpay-signature'] as string;
        if (!signature) return false;

        const webhookSecret: string = process.env.RAZORPAY_WEBHOOK_SECRET!;
        
        if (!webhookSecret) {
            throw new Error("RAZORPAY_WEBHOOK_SECRET is not defined in environment variables.");
        }

        // Webhooks require hashing the raw JSON payload
        const expectedSignature: string = crypto
            .createHmac('sha256', webhookSecret)
            .update(rawBody)
            .digest('hex');

        return expectedSignature === signature;
    }



    normalizeWebhookPayload(rawPayload: unknown): StandardWebhookEvent | null {
        const razorpayData = rawPayload as RazorpayWebhookPayload;
        console.log('razorpay webhook rawPayload :', razorpayData)
        
        const eventName     = razorpayData.event;
        
        const paymentEntity = razorpayData.payload?.payment?.entity;
        const refundEntity  = razorpayData.payload?.refund?.entity;
        console.log('paymentEntity :', paymentEntity)
        console.log('refundEntity :', refundEntity)

        if (!paymentEntity && !refundEntity) return null;

        let type: StandardWebhookEventType;
        let amount          = 0;
        let paymentId       = paymentEntity?.id; // payment ID is usually always available
        let refundId        = undefined;
        let timestamp       = Date.now();
        let paymentPurpose  = PaymentPurpose.EVENT_BOOKING;

        // Translate Razorpay language to Internal Language
        switch (eventName) {
            case 'payment.captured':
                // (Money successfully deducted from user)
                // Handle successful payment
                type            = StandardWebhookEventType.PAYMENT_SUCCESS;
                amount          = (paymentEntity?.amount || 0) / 100;
                timestamp       = paymentEntity?.created_at ? paymentEntity.created_at * 1000 : Date.now();
                paymentPurpose  = (paymentEntity?.notes?.payment_purpose as PaymentPurpose) || PaymentPurpose.EVENT_BOOKING;
                break;

            case 'payment.failed':
                // (Card declined, wrong OTP)
                // Handle failed payment
                type            = StandardWebhookEventType.PAYMENT_FAILED;
                amount          = (paymentEntity?.amount || 0) / 100;
                timestamp       = paymentEntity?.created_at ? paymentEntity.created_at * 1000 : Date.now();
                paymentPurpose  = (paymentEntity?.notes?.payment_purpose as PaymentPurpose) || PaymentPurpose.EVENT_BOOKING; 
                break;

            case 'refund.processed': 
                // (Bank successfully refunded)
                type            = StandardWebhookEventType.REFUND_SUCCESS;
                amount          = (refundEntity?.amount || 0) / 100;
                refundId        = refundEntity?.id;
                timestamp       = refundEntity?.created_at ? refundEntity.created_at * 1000 : Date.now();
                paymentPurpose  = (paymentEntity?.notes?.payment_purpose as PaymentPurpose) || PaymentPurpose.EVENT_BOOKING;
                if (refundEntity?.payment_id) paymentId = refundEntity.payment_id;
                break;

            case 'refund.failed': 
                // (Bank rejected the refund)
                // Handle a failed refund (e.g., notify admin/user)
                // Optionally: Notify admin or user here
                type            = StandardWebhookEventType.REFUND_FAILED;
                amount          = (refundEntity?.amount || 0) / 100;
                refundId        = refundEntity?.id;
                timestamp       = refundEntity?.created_at ? refundEntity.created_at * 1000 : Date.now();
                paymentPurpose  = (paymentEntity?.notes?.payment_purpose as PaymentPurpose) || PaymentPurpose.EVENT_BOOKING;
                if (refundEntity?.payment_id) paymentId = refundEntity.payment_id;
                break;

            default: 
                console.log(`ℹ️ Unhandled webhook event received: ${eventName}`);
                return null; // Unhandled event
        }


        if (!paymentId) return null;

        return {
            eventType       : type,
            paymentId       : paymentId,
            refundId        : refundId,
            amount          : amount, 
            paymentPurpose  : paymentPurpose, 
            timestamp       : timestamp,
            rawPayload      : rawPayload
        };
    }



    async initiateRefund(paymentId: string, amountInRupees: number): Promise<RefundResult> {
        try {
            const amountInPaise = Math.round(amountInRupees * 100);
            console.log('Initiating Razorpay refund :', { paymentId, amountInRupees, amountInPaise});

            const refunddata = await this._client.payments.refund(paymentId, { amount: amountInPaise });

            // AFTER CALLING THIS API CALL, RAZORPAY WEBHOOK WILL HANDLE THE WEBHOOK EVENT
            // APPLICATION HANDLES IT BY WEBHOOK ROUTES, CONTROLLER, SERVICE LAYERS
            // AND THE WALLET TRANSFER HAPPENS THERE.

            console.log('Razorpay refund successful:', refunddata);

            return {
                refundId    : refunddata.id,
                amount      : refunddata.amount as number,
                status      : refunddata.status as RefundResult["status"],
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




