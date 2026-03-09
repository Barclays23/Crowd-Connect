// src/services/payment-services/providers/razorpay.provider.ts

import Razorpay from "razorpay";
import crypto   from "crypto";
import { CreateOrderResult, IPaymentProvider, RefundResult } from "@/services/payment-services/interfaces/IPaymentProvider";

export class RazorpayProvider implements IPaymentProvider {

    private readonly _client: Razorpay;

    constructor() {
        this._client = new Razorpay({
            key_id:     process.env.RAZORPAY_KEY_ID!,
            key_secret: process.env.RAZORPAY_KEY_SECRET!,
        });
    }

    async createOrder(amount: number, currency: string, receipt: string): Promise<CreateOrderResult> {
        const order = await this._client.orders.create({ amount, currency, receipt });
        return { orderId: order.id, amount: order.amount as number, currency: order.currency };
    }

    verifySignature(orderId: string, paymentId: string, signature: string): boolean {
        const body    = `${orderId}|${paymentId}`;
        const expected = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
            .update(body)
            .digest("hex");
        return expected === signature;
    }

    async initiateRefund(paymentId: string, amount: number): Promise<RefundResult> {
        const refund = await this._client.payments.refund(paymentId, { amount });
        return {
            refundId: refund.id,
            amount:   refund.amount as number,
            status:   refund.status as RefundResult["status"],
        };
    }
}