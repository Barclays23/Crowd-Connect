// frontend/src/utils/razorpay.ts

export const RAZORPAY_SCRIPT_ID = "razorpay-checkout-sdk-script";

export function loadRazorpayScript(): Promise<boolean> {
   return new Promise((resolve) => {
      // already loaded?
      if (document.getElementById(RAZORPAY_SCRIPT_ID)) {
         resolve(true);
         return;
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.id = RAZORPAY_SCRIPT_ID;
      script.async = true;
      
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);

      document.body.appendChild(script);
   });
}