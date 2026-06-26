// // backend/src/services/payment-services/providers/stripe.provider.ts

// import Stripe from "stripe";
// import { IPaymentProvider, CreateOrderResult, RefundResult } from "@/services/payment-services/interfaces/IPaymentProvider";
// import { StandardWebhookEvent, StandardWebhookEventType } from "@/types/webhook.types";
// import { PaymentPurpose } from "@/constants/payment.constants";




// export class StripeProvider implements IPaymentProvider {

//     private readonly _client: Stripe;

//     constructor() {
//         this._client = new Stripe(process.env.STRIPE_SECRET_KEY!, {
//             apiVersion: "2025-02-24.acacia",
//         });
//     }


//     // Stripe equivalent of Razorpay order → PaymentIntent
//     async createOrder(amount: number, currency: string, receipt: string): Promise<CreateOrderResult> {
//         const paymentIntent = await this._client.paymentIntents.create({
//             amount,            // paise / smallest currency unit
//             currency,          // "inr"
//             metadata: { bookingId: receipt },
//         });

//         return {
//             orderId:  paymentIntent.id,   // used as orderId throughout the app
//             amount:   paymentIntent.amount,
//             currency: paymentIntent.currency,
//         };
//     }


//     // Stripe signature verification via webhook secret
//     verifyPaymentSignature(orderId: string, paymentId: string, signature: string): boolean {
//         try {
//             // rawBody must be passed as orderId (workaround — see note below)
//             this._client.webhooks.constructEvent(
//                 orderId,                              // raw request body string
//                 signature,                            // "stripe-signature" header
//                 process.env.STRIPE_WEBHOOK_SECRET!,
//             );
//             return true;
//         } catch {
//             return false;
//         }
//     }




//     normalizeWebhookPayload(rawPayload: any): StandardWebhookEvent | null {
//         const eventName = rawPayload.type; // Stripe uses 'type' instead of 'event'
//         const entity = rawPayload.data.object; // Stripe puts the data inside 'data.object'

//         let type: StandardWebhookEventType;

//         // Translate Stripe language to Internal Language
//         switch (eventName) {
//             case 'payment_intent.succeeded': 
//                 type = StandardWebhookEventType.PAYMENT_SUCCESS; 
//                 break;
//             case 'payment_intent.payment_failed': 
//                 type = StandardWebhookEventType.PAYMENT_FAILED; 
//                 break;
//             case 'charge.refunded': 
//                 type = StandardWebhookEventType.REFUND_SUCCESS; 
//                 break;
//             case 'charge.refund.updated': 
//                 type = StandardWebhookEventType.REFUND_FAILED; 
//                 break;
//             default: 
//                 return null; // Unhandled event
//         }

//         return {
//             eventType: type,
//             paymentId: entity.payment_intent || entity.id, // Stripe naming differences
//             refundId: entity.id, // For refunds, this is the 're_...' id
//             amount: entity.amount / 100, // Stripe also deals in cents, so divide by 100
            
//             // Stripe stores custom data in 'metadata', not 'notes' like Razorpay!
//             paymentPurpose: entity.metadata?.payment_purpose || PaymentPurpose.EVENT_BOOKING, 
//             timestamp: entity.created ? entity.created * 1000 : Date.now(),
//             rawPayload: rawPayload
//         };
//     }




        // normalizeWebhookPayload(rawPayload: unknown): StandardWebhookEvent | null {
        //     // Stripe payload type casting
        //     const stripeData = rawPayload as { type: string; data: { object: any } };
        //     const eventName = stripeData.type; 
        //     const entity = stripeData.data.object; 

        //     let type: StandardWebhookEventType;

        //     switch (eventName) {
        //         case 'payment_intent.succeeded': 
        //             type = StandardWebhookEventType.PAYMENT_SUCCESS; 
        //             break;
        //         case 'payment_intent.payment_failed': 
        //             type = StandardWebhookEventType.PAYMENT_FAILED; 
        //             break;
        //         case 'charge.refunded': 
        //             type = StandardWebhookEventType.REFUND_SUCCESS; 
        //             break;
        //         case 'charge.refund.updated': 
        //             type = StandardWebhookEventType.REFUND_FAILED; 
        //             break;
        //         default: 
        //             return null; 
        //     }

        //     return {
        //         eventType: type,
        //         // In Stripe, the PaymentIntent ID acts as the Order ID
        //         orderId: entity.payment_intent || entity.id, 
        //         paymentId: entity.payment_intent || entity.id, 
        //         refundId: eventName.includes('refund') ? entity.id : undefined, 
        //         amount: entity.amount / 100, 
        //         paymentPurpose: entity.metadata?.payment_purpose as PaymentPurpose || PaymentPurpose.EVENT_BOOKING, 
        //         timestamp: entity.created ? entity.created * 1000 : Date.now(),
        //         rawPayload: rawPayload
        //     };
        // }



//     async initiateRefund(paymentId: string, amount: number): Promise<RefundResult> {
//         const refund = await this._client.refunds.create({
//             payment_intent: paymentId,
//             amount,          // paise
//         });

//         return {
//             refundId: refund.id,
//             amount:   refund.amount ?? amount,
//             status:   this._mapRefundStatus(refund.status),
//         };
//     }




//     private _mapRefundStatus(status: Stripe.Refund.Status | null): RefundResult["status"] {
//         switch (status) {
//             case "succeeded": return "processed";
//             case "pending":   return "pending";
//             case "failed":    return "failed";
//             default:          return "pending";
//         }
//     }

// }



// // ⚠️ Note on verifySignature — 
// // Stripe's signature verification needs the raw request body (not parsed JSON), which doesn't fit cleanly into verifySignature(orderId, paymentId, signature). 
// // When you build the Stripe webhook controller, you'll likely call this._client.webhooks.constructEvent() directly there instead of going through IPaymentProvider. 
// // The interface will need a small adjustment at that point.