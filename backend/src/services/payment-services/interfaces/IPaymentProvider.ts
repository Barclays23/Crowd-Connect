// src/services/payment-services/interfaces/IPaymentProvider.ts

import { CreateOrderResult, RefundResult } from "@/types/payment.types";
import { StandardWebhookEvent } from "@/types/webhook.types";





export interface IPaymentProvider {
  createOrder(purpose: string, amount: number, currency: string, userId: string): Promise<CreateOrderResult>;

  verifyPaymentSignature(orderId: string, paymentId: string, signature: string): boolean;
  
  verifyWebhookSignature(rawBody: string | Buffer, headers: Record<string, string | string[] | undefined>): boolean;

  normalizeWebhookPayload(rawPayload: unknown): StandardWebhookEvent | null
  
  initiateRefund(paymentId: string, amount: number): Promise<RefundResult>;
}


// services/payment-services/providers/RazorpayProvider.ts implements IPaymentProvider
// services/payment-services/providers/StripeProvider.ts implements IPaymentProvider  ← swap later
