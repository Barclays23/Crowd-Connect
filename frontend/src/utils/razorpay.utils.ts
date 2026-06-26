// frontend/src/utils/razorpay.ts
import { APP_CONFIG, getAppBrandColor } from "@/constants/app.constants";
import type { 
   RazorpayCheckoutOptions, 
   RazorpayInstance, 
   RazorpayInternalOptions, 
   RazorpayPaymentFailedResponse, 
   RazorpayPaymentSuccessResponse 
} from "@/types/razorpay.types";

// need to move this to .env file??
export const RAZORPAY_SCRIPT_ID = "razorpay-checkout-sdk-script";

declare global {
   interface Window {
      Razorpay: unknown; // Using unknown instead of any to enforce strict type checking
   }
}




export function loadRazorpayScript(): Promise<boolean> {
   return new Promise((resolve) => {
      if (document.getElementById(RAZORPAY_SCRIPT_ID)) {
         resolve(true);
         return;
      }

      const script   = document.createElement("script");
      script.src     = "https://checkout.razorpay.com/v1/checkout.js";
      script.id      = RAZORPAY_SCRIPT_ID;
      script.async   = true;
      
      script.onload  = () => resolve(true);
      script.onerror = () => resolve(false);

      document.body.appendChild(script);
   });
}






export async function openRazorpayCheckout(options: RazorpayCheckoutOptions): Promise<void> {
   const scriptLoaded: boolean = await loadRazorpayScript();
   
   if (!scriptLoaded) {
      throw new Error("Failed to load payment gateway. Check your internet connection.");
   }

   return new Promise<void>((resolve, reject) => {
      const RazorpayConstructor = window.Razorpay as new (opts: RazorpayInternalOptions) => RazorpayInstance;

      const rzpOptions: RazorpayInternalOptions = {
         key         : options.order.keyId,
         amount      : options.order.amount,
         currency    : options.order.currency,
         order_id    : options.order.orderId,

         // Dynamically apply app defaults if specific ones aren't provided
         name        : options.name || APP_CONFIG.APP_NAME,
         image       : options.image || APP_CONFIG.LOGO_URL,
         // Read your CSS variable dynamically!
         theme       : { 
            color          : options.theme?.color || getAppBrandColor(),
            backdrop_color : options.theme?.backdrop_color 
         },
         description : options.description,
         prefill     : options.prefill,

         handler     : async (response: RazorpayPaymentSuccessResponse) => {
            try {
               await options.onVerify(response); // Execute the injected specific logic (booking/upgrade)
               resolve();
            } catch (err) {
               reject(err);
            }
         },

         modal: {
            confirm_close  : options.confirmClose ?? true,
            ondismiss      : () => reject(new Error("CANCELLED_BY_USER")),
         },
      };

      const rzp = new RazorpayConstructor(rzpOptions);

      rzp.on("payment.failed", (res: RazorpayPaymentFailedResponse) => {
         reject(new Error(res.error?.description ?? "Payment failed"));
      });

      rzp.open();
   });
}