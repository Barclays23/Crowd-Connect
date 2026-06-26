// frontend/src/types/razorpay.types.ts

import type { BasePaymentOrderDetails } from "@/types/payment.types";


export interface RazorpayPaymentSuccessResponse {
  razorpay_order_id   : string;
  razorpay_payment_id : string;
  razorpay_signature  : string;
}


export interface RazorpayPaymentFailedResponse {
  error : {
    code?         : string;
    description?  : string;
    source?       : string;
    step?         : string;
    reason?       : string;
  };
}



export interface RazorpayPrefill {
  name?     : string;
  email?    : string;
  contact?  : string;
}

export interface RazorpayTheme {
  color?          : string;  // The primary hex color for the checkout
  backdrop_color? : string;  // The background overlay color (optional)
}


export interface RazorpayInternalOptions {
  key         : string;
  amount      : number;
  currency    : string;
  name        : string;     // Your App Title
  description?: string;     // Subtitle / context
  image?      : string;     // Absolute HTTPS URL to your logo

  order_id    : string;

  prefill     : RazorpayPrefill;
  theme?      : RazorpayTheme;

  handler     : (response: RazorpayPaymentSuccessResponse) => void;

  modal?      : {
    ondismiss?      : () => void;
    confirm_close?  : boolean;
  };
}




export interface RazorpayCheckoutOptions {
  order         : BasePaymentOrderDetails;
  description   : string;
  name?         : string;
  image?        : string;
  theme?        : RazorpayTheme;
  prefill       : RazorpayPrefill;
  confirmClose? : boolean;
  onVerify      : (response: RazorpayPaymentSuccessResponse) => Promise<void>;
}



export interface RazorpayInstance {
  open()      : void;
  on(
    event     : "payment.failed",
    callback  : (response: RazorpayPaymentFailedResponse) => void
  ): void;
}
