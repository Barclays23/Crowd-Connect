// backend/src/controllers/implementations/webhook.controller.ts

import { Request, Response, NextFunction } from 'express';
import { IWebhookController } from '@/controllers/interfaces/IWebhookController';
import { IWebhookService } from '@/services/webhook-services/interfaces/IWebhookService';
import { IPaymentService } from '@/services/payment-services/interfaces/IPaymentService';
import { StandardWebhookEvent } from '@/types/webhook.types';



export class WebhookController implements IWebhookController {

    constructor(
        private readonly _webhookService: IWebhookService,
        // private readonly _paymentService: IPaymentService,
        private readonly _paymentServices: Map<string, IPaymentService>  // check webhook router
    ) {}


    async handleWebhookEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            // 1. Extract provider from the URL (e.g., /api/webhooks/razorpay)
            const providerName = req.params.provider as string;
            const paymentService: IPaymentService | undefined = this._paymentServices.get(providerName);

            if (!paymentService) {
                console.error(`🚨 Webhook hit for unsupported provider: ${providerName}`);
                res.status(400).json({ status: "error", message: "Unsupported provider" });
                return;
            }

            // 2. Verify Signature (Provider handles its own header extraction!)
            const isValid = paymentService.verifyWebhookSignature(req.body, req.headers);

            if (!isValid) {
                console.error(`🚨 Invalid ${providerName} Webhook Signature`);
                res.status(400).json({ status: "error", message: "Invalid signature" });
                return;
            }

            // const rawPayload: unknown = JSON.parse(req.body.toString());
            const rawPayload = JSON.parse(req.body.toString()) as { 
                event?: string; 
                [key: string]: unknown; 
            };

            console.log('📝📝 webhook eventPayload :', rawPayload)
            console.log(`✅ Webhook received and verified: ${rawPayload.event || 'Unknown Event'}`);
            
            // 3. Normalize to our StandardEvent
            const standardEvent: StandardWebhookEvent | null = paymentService.normalizeWebhookPayload(rawPayload);

            if (!standardEvent) {
                res.status(200).json({ status: "ignored" });
                return;
            }

            // 4. Process Business Logic
            await this._webhookService.processWebhookEvent(standardEvent);
            
            res.status(200).json({ status: "ok" });

        } catch (error) {
            console.error(`Error processing webhook:`, error);
            res.status(200).json({ status: "error", message: "Webhook received but failed to process" });
        }
    }


    // async handleRazorpayWebhook(req: Request, res: Response, next: NextFunction): Promise<void> {
    //     try {
    //         const signature = req.headers['x-razorpay-signature'] as string;
    //         if (!signature) {
    //             res.status(400).json({ status: "error", message: "Missing Razorpay signature" });
    //             return;
    //         }

    //         // 1. Verify the signature
    //         const isValid = this._paymentService.verifyWebhookSignature(req.body, signature);

    //         if (!isValid) {
    //             console.error("🚨 Invalid Razorpay Webhook Signature");
    //             res.status(400).json({ status: "error", message: "Invalid signature" });
    //             return;
    //         }

    //         const eventPayload = JSON.parse(req.body.toString());
    //         console.log('📝📝 razorPay webhook eventPayload :', eventPayload)
    //         console.log(`✅ Webhook received and verified: ${eventPayload.event}`);


    //         const standardEvent = this._razorpayProvider.normalizeWebhookPayload(eventPayload);


    //         if (!standardEvent) {
    //             console.log(`ℹ️ Ignored unhandled Razorpay event: ${rawPayload.event}`);
    //             return res.status(200).json({ status: "ignored" });
    //         }

    //         await this._webhookService.processWebhookEvent(standardEvent);

    //         res.status(200).json({ status: "ok" });

    //     } catch (error) {
    //         console.error("Error processing webhook:", error);
    //         // Even on error, return 200 so Razorpay doesn't keep retrying a broken payload,
    //         // unless you specifically want them to retry.
    //         res.status(200).json({ status: "error", message: "Webhook received but failed to process" });
    //     }
    // }




    // async handleStripeWebhook(req: Request, res: Response, next: NextFunction): Promise<void> {
    //     // ... verify stripe signature ...

    //     const rawPayload = JSON.parse(req.body.toString());
        
    //     // 1. Stripe Provider translates the payload
    //     const standardEvent = this._stripeProvider.normalizeWebhookPayload(rawPayload);

    //     // 2. Pass it to the EXACT SAME Webhook Service!
    //     await this._webhookService.processWebhookEvent(standardEvent);
        
    //     res.status(200).send("ok");
    // }
}