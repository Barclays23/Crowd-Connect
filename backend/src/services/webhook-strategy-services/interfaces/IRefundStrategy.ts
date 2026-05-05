// backend/src/services/webhook-services/interfaces/IRefundStrategy.ts

import { StandardWebhookEvent } from "@/types/webhook.types";

export interface IRefundStrategy {
    executeRefund(webhookEvent: StandardWebhookEvent): Promise<void>;
}