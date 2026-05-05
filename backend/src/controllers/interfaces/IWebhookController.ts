import { NextFunction, Request, Response } from "express";




export interface IWebhookController {
    handleWebhookEvent(req: Request, res: Response, next: NextFunction): Promise<void>
    
    // handleRazorpayWebhook(req: Request, res: Response, next: NextFunction): Promise<void>

    // handleStripeWebhook(req: Request, res: Response, next: NextFunction): Promise<void>
}