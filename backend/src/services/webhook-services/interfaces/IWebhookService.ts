// backend/src/services/webhook-services/interfaces/IWebhookService.ts

export interface IWebhookService {
    processWebhookEvent(eventPayload: any): Promise<void>;
}