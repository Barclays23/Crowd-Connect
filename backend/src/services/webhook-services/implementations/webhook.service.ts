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
    }






    private async _handleRefundProcessed(webhookEvent: StandardWebhookEvent): Promise<void> {

        const refundStrategy: IRefundStrategy | undefined = this._refundStrategies.get(webhookEvent.paymentPurpose);

        if (!refundStrategy) {
            console.error(`🚨 [Webhook Error] No refund strategy registered for type: ${webhookEvent.paymentPurpose}`);
            return;
        }

        await refundStrategy.executeRefund(webhookEvent);

    }
}






// Because the webhook is now responsible for crediting the user's wallet, your old cancelAllBookingsForEvent method should remove the transferFunds logic entirely.

// Your initial backend cancellation flow simply becomes:

// Hit the Razorpay API to initiate the refund.

// Update the booking status to CANCELLED and the payment status to REFUND_PENDING.

// Stop.

// Later (usually seconds, but sometimes hours), Razorpay will hit your webhook.
// The webhook will see the refund.processed event, find that REFUND_PENDING booking, update it to REFUNDED, and finally credit the wallet.

// Step 6: Testing Locally
// Because your local machine (localhost:5000) is not on the public internet, Razorpay cannot send webhooks to it directly. You must use a tool like ngrok.

// Install ngrok (npm install -g ngrok).

// Run ngrok http 5000 (or whatever port your backend runs on).

// Ngrok will give you a public URL like https://a1b2c3d4.ngrok-free.app.

// Copy that URL, go to your Razorpay Dashboard -> Webhooks, and paste it as https://a1b2c3d4.ngrok-free.app/api/webhooks.

// Now, when you trigger a refund in your local app, Razorpay will successfully ping your local terminal!