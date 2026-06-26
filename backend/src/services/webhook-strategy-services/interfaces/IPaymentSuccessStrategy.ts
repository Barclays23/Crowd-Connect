// backend/src/services/webhook-strategy-services/interfaces/IPaymentSuccessStrategy.ts

import { StandardWebhookEvent } from "@/types/webhook.types";

export interface IPaymentSuccessStrategy {
    executeSuccess(webhookEvent: StandardWebhookEvent): Promise<void>;
}