// // backend/src/services/payment-services/providers/stripe.provider.ts

// import Stripe from "stripe";
// import { IPaymentProvider, CreateOrderResult, RefundResult } from "@/services/payment-services/interfaces/IPaymentProvider";


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
//     verifySignature(orderId: string, paymentId: string, signature: string): boolean {
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



// ⚠️ Note on verifySignature — 
// Stripe's signature verification needs the raw request body (not parsed JSON), which doesn't fit cleanly into verifySignature(orderId, paymentId, signature). 
// When you build the Stripe webhook controller, you'll likely call this._client.webhooks.constructEvent() directly there instead of going through IPaymentProvider. 
// The interface will need a small adjustment at that point.