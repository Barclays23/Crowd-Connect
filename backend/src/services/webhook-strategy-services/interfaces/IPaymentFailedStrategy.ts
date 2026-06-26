// backend/src/services/webhook-strategy-services/interfaces/IPaymentFailedStrategy.ts
import { StandardWebhookEvent } from "@/types/webhook.types";


export interface IPaymentFailedStrategy {
    executeFailed(webhookEvent: StandardWebhookEvent): Promise<void>;
}