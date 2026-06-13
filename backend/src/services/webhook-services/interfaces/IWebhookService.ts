// backend/src/services/webhook-services/interfaces/IWebhookService.ts

import { StandardWebhookEvent } from "@/types/webhook.types";

export interface IWebhookService {
    processWebhookEvent(eventPayload: StandardWebhookEvent): Promise<void>;
}