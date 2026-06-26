// backend/src/services/webhook-services/implementations/webhook.service.ts
import { IWebhookService } from "@/services/webhook-services/interfaces/IWebhookService";
import { IPaymentFailedStrategy } from "@/services/webhook-strategy-services/interfaces/IPaymentFailedStrategy";
import { IPaymentSuccessStrategy } from "@/services/webhook-strategy-services/interfaces/IPaymentSuccessStrategy";
import { IRefundStrategy } from "@/services/webhook-strategy-services/interfaces/IRefundStrategy";
import { 
    STANDARD_WEBHOOK_EVENT_TYPES,
    StandardWebhookEvent,
    StandardWebhookEventType, 
} from "@/types/webhook.types";





export class WebhookService implements IWebhookService {

    constructor(
        private readonly _paymentSuccessStrategies  : Map<string, IPaymentSuccessStrategy>,
        private readonly _paymentFailedStrategies   : Map<string, IPaymentFailedStrategy>,
        private readonly _refundStrategies          : Map<string, IRefundStrategy>
    ) {}



    async processWebhookEvent(webhookEvent: StandardWebhookEvent): Promise<void> {
        const eventType: StandardWebhookEventType = webhookEvent.eventType;
        console.log('webhookEvent for processing :', webhookEvent)
        console.log(`[WebhookService] Processing ${eventType} for purpose: ${webhookEvent.paymentPurpose}`);

        switch (eventType) {
            case STANDARD_WEBHOOK_EVENT_TYPES.PAYMENT_SUCCESS:
                // await this._handlePaymentCaptured(webhookEvent);
                await this._handlePaymentSuccess(webhookEvent);
                break;
                
            case STANDARD_WEBHOOK_EVENT_TYPES.PAYMENT_FAILED:
                await this._handlePaymentFailed(webhookEvent);
                break;
                
            case STANDARD_WEBHOOK_EVENT_TYPES.REFUND_SUCCESS:
                await this._handleRefundProcessed(webhookEvent);
                break;
                
            case STANDARD_WEBHOOK_EVENT_TYPES.REFUND_FAILED:
                console.error("Refund failed for Payment ID:", webhookEvent.paymentId);
                break;

            default:
                console.log(`Unhandled webhook event type: ${eventType}`);
        }
    }



    private async _handlePaymentSuccess(webhookEvent: StandardWebhookEvent): Promise<void> {
        const successStrategy: IPaymentSuccessStrategy | undefined = this._paymentSuccessStrategies.get(webhookEvent.paymentPurpose);

        if (!successStrategy) {
            console.error(`🚨 No payment success strategy registered for: ${webhookEvent.paymentPurpose}`);
            return;
        }

        await successStrategy.executeSuccess(webhookEvent);
    }



    private async _handlePaymentFailed(webhookEvent: StandardWebhookEvent): Promise<void> {
        const failedStrategy: IPaymentFailedStrategy | undefined = this._paymentFailedStrategies.get(webhookEvent.paymentPurpose);

        if (!failedStrategy) {
            console.error(`🚨 No payment failed strategy for purpose: ${webhookEvent.paymentPurpose}`);
            return;
        }

        await failedStrategy.executeFailed(webhookEvent);
    }



    private async _handleRefundProcessed(webhookEvent: StandardWebhookEvent): Promise<void> {
        const refundStrategy: IRefundStrategy | undefined = this._refundStrategies.get(webhookEvent.paymentPurpose);

        if (!refundStrategy) {
            console.error(`🚨 No refund strategy for purpose: ${webhookEvent.paymentPurpose}`);
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