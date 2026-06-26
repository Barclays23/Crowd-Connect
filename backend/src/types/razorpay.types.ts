// backend/src/types/razorpay.types.ts

import { PaymentPurpose } from "@/constants/payment.constants";


export interface RazorpayNotes {
    // payment_purpose : string; // Kept as string to strictly satisfy Razorpay's Record<string, string | number>
    payment_purpose : PaymentPurpose;
    [key: string]   : string | number; 
}



export interface RazorPayOrderOptions {
  amount    : number;   // paise
  currency  : string;
  receipt   : string;
  notes     : RazorpayNotes;
}




export interface RazorpayBaseEntity {
    id          : string;
    amount      : number;
    currency    : string;
    status      : string;
    order_id?   : string;
    notes?      : RazorpayNotes;
    created_at  : number;
    payment_id? : string; // Only exists on refunds
}



export interface RazorpayWebhookPayload {
    entity: string;
    account_id: string;
    event: string;
    contains: string[];
    payload: {
        payment?: {
            entity: RazorpayBaseEntity;
        };
        refund?: {
            entity: RazorpayBaseEntity;
        };
    };
    created_at: number;
}
