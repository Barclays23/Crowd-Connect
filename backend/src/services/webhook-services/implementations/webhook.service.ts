// backend/src/services/webhook-services/implementations/webhook.service.ts

import { executeWithTransactionRetry } from "@/utils/transaction.utils";
import { ClientSession } from "mongoose";
import { IWalletService } from "@/services/wallet-services/interfaces/IWalletService";
import { IBookingRepository } from "@/repositories/interfaces/IBookingRepository";
import { MarkRefundedInput } from "@/entities/booking.entity";
import { PAYMENT_STATUS } from "@/types/booking.types";
import { TRANSACTION_REFERENCE_TYPE, TRANSACTION_TYPE } from "@/types/wallet.types";
import { IWebhookService } from "@/services/webhook-services/interfaces/IWebhookService";
import { IRefundStrategy } from "@/services/webhook-strategy-services/interfaces/IRefundStrategy";
import { PaymentPurpose } from "@/constants/payment.constants";
import { StandardWebhookEvent, StandardWebhookEventType } from "@/types/webhook.types";





export class WebhookService implements IWebhookService {

    constructor(
        private readonly _refundStrategies: Map<string, IRefundStrategy>
    ) {}



    async processWebhookEvent(webhookEvent: StandardWebhookEvent): Promise<void> {
        const eventType = webhookEvent.eventType;
        console.log('webhookEvent for processing :', webhookEvent)

        switch (eventType) {
            case StandardWebhookEventType.PAYMENT_SUCCESS:
                break;
            case StandardWebhookEventType.PAYMENT_FAILED:
                break;
            case StandardWebhookEventType.REFUND_SUCCESS:
                await this._handleRefundProcessed(webhookEvent);
                break;
            case StandardWebhookEventType.REFUND_FAILED:
                console.error("Refund failed for Payment ID:", webhookEvent.paymentId);
                break;
        }

        // switch (eventType) {
        //     case 'payment.captured':
        //         // (Money successfully deducted from user)
        //         // Handle successful payment (if you aren't doing it optimistically)
        //         break;
        //     case 'payment.failed':
        //         // (Card declined, wrong OTP)
        //         // Handle failed payment (if you aren't doing it optimistically)
        //         break;

        //     case 'refund.processed':
        //         // (Bank successfully refunded)
        //         await this._handleRefundProcessed(eventPayload.payload.refund.entity);
        //         break;

        //     case 'refund.failed':
        //         // (Bank rejected the refund)
        //         // Handle a failed refund (e.g., notify admin/user)
        //         // Optionally: Notify admin or user here
        //         console.error("Refund failed:", eventPayload.payload.refund.entity);
        //         break;

        //     default:
        //         console.log(`ℹ️ Unhandled webhook event received: ${eventType}`);
        // }
    }






    private async _handleRefundProcessed(webhookEvent: StandardWebhookEvent): Promise<void> {

        const strategy: IRefundStrategy | undefined = this._refundStrategies.get(webhookEvent.paymentPurpose);

        if (!strategy) {
            console.error(`🚨 [Webhook Error] No refund strategy registered for type: ${webhookEvent.paymentPurpose}`);
            return;
        }

        // execute the refund process
        // Execute it blindly. (OCP & Polymorphism in action!)
        await strategy.executeRefund(webhookEvent);

        // console.log(`[Webhook] Processing confirmed refund ${refundId} for payment ${paymentId}`);

        // 1. Find the exact booking associated with this payment ID
        // const booking = await this._bookingRepository.getBookingByPaymentId(paymentId);

        // if (!booking) {
        //     console.error(`[Webhook Error] No booking found for paymentId: ${paymentId}`);
        //     return;
        // }
        
        // If the booking is already fully cancelled and refunded, ignore it (idempotency)
        // if (booking.payment?.status === PAYMENT_STATUS.REFUNDED) {
        //     console.log(`[Webhook] Booking ${booking.bookingId} is already refunded. Ignoring.`);
        //     return; 
        // }

        // const superAdminId = process.env.SUPER_ADMIN_ID!;

        // DB updates using the transaction utility
        // await executeWithTransactionRetry(async (session: ClientSession) => {
            
        //     // ── Double-Entry Transfer (Debit Admin Wallet-> Credit User Wallet) ───────────────────
        //     // process wallet transaction ONLY because the webhook confirmed it
        //     await this._walletService.transferFunds({
        //         fromUserId          : superAdminId,
        //         toUserId            : booking.user.userId,
        //         transferAmount      : refundAmount,
        //         fromTransactionType : TRANSACTION_TYPE.REFUND_ISSUED,
        //         toTransactionType   : TRANSACTION_TYPE.BOOKING_REFUND,
        //         referenceType       : TRANSACTION_REFERENCE_TYPE.BOOKING,
        //         referenceId         : booking.bookingId.toString(),
        //         description         : `Refund for cancelled booking - ${booking.event.title}. Ticket No.${booking.ticketNo}`,
        //         // description         : `Refund for cancelled booking. Ticket No.${booking.ticketNo}`,
        //         metadata            : { refundId: refundId },
        //     }, { session });


        //     // Update booking to show the refund is officially completed
        //     const refundDetails: MarkRefundedInput = {
        //         paymentStatus: PAYMENT_STATUS.REFUNDED,
        //         refundId: refundId,
        //         refundedAt: new Date(refundData.created_at * 1000)  // Razorpay sends seconds, JS needs ms
        //     };

        //     await this._bookingRepository.markBookingAsRefunded(booking.bookingId, refundDetails, { session });

        // });

        // console.log(`✅ [Webhook] Refund ${refundId} successfully applied to wallet.`);
    }
}





// Step 5: How This Changes Your Previous Code
// Because the webhook is now responsible for crediting the user's wallet, your old cancelAllBookingsForEvent method should remove the transferFunds logic entirely.

// Your initial backend cancellation flow simply becomes:

// Hit the Razorpay API to initiate the refund.

// Update the booking status to CANCELLED and the payment status to REFUND_PENDING.

// Stop.

// Later (usually seconds, but sometimes hours), Razorpay will hit your webhook. The webhook will see the refund.processed event, find that REFUND_PENDING booking, update it to REFUNDED, and finally credit the wallet.

// Step 6: Testing Locally
// Because your local machine (localhost:5000) is not on the public internet, Razorpay cannot send webhooks to it directly. You must use a tool like ngrok.

// Install ngrok (npm install -g ngrok).

// Run ngrok http 5000 (or whatever port your backend runs on).

// Ngrok will give you a public URL like https://a1b2c3d4.ngrok-free.app.

// Copy that URL, go to your Razorpay Dashboard -> Webhooks, and paste it as https://a1b2c3d4.ngrok-free.app/api/webhooks.

// Now, when you trigger a refund in your local app, Razorpay will successfully ping your local terminal!