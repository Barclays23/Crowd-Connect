// frontend/src/types/razorpay.types.ts

export interface RazorpayPaymentSuccessResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface RazorpayPaymentFailedResponse {
  error: {
    code?: string;
    description?: string;
    source?: string;
    step?: string;
    reason?: string;
  };
}

export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;

  prefill: {
    name: string;
    email: string;
    contact?: string;
  };

  theme?: {
    color?: string;
  };

  handler: (response: RazorpayPaymentSuccessResponse) => void;

  modal?: {
    ondismiss?: () => void;
  };
}

export interface RazorpayInstance {
  open(): void;
  on(
    event: "payment.failed",
    callback: (response: RazorpayPaymentFailedResponse) => void
  ): void;
}