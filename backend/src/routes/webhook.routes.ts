// backend/src/routes/webhook.routes.ts
import { Router } from 'express';
import { WEBHOOK_ROUTES } from '@/constants/routes.constants';
import { webhookController } from '@/container/dependencies';



const webhookRouter = Router();


// webhookRouter.post(WEBHOOK_ROUTES.RAZORPAY_WEBHOOK, webhookController.handleRazorpayWebhook.bind(webhookController));
webhookRouter.post(WEBHOOK_ROUTES.PROVIDER_WEBHOOK, webhookController.handleWebhookEvent.bind(webhookController));


export default webhookRouter;