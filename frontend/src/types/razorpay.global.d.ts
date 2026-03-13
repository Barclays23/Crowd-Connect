// src/types/razorpay.global.d.ts
import type { RazorpayOptions, RazorpayInstance } from "./razorpay.types";

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

export {};