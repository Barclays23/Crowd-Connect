// backend/src/constants/payment.constants.ts




export const PAYMENT_GATEWAY_CONFIG = {
    PROVIDER    : "RAZORPAY", // Easy to change to STRIPE later
    PUBLIC_KEY  : process.env.RAZORPAY_KEY_ID || "",
} as const;


export const PAYMENT_PURPOSES = {
    EVENT_BOOKING   : "booking",
    ROLE_UPGRADE    : "upgrade",
    // ROLE_UPGRADE    : "role_upgrade",
    // MERCHANDISE     : "merchandise"
} as const;

export type PaymentPurpose = (typeof PAYMENT_PURPOSES)[keyof typeof PAYMENT_PURPOSES];




export const PAYMENT_METHODS = { // PaymentMethod
    ONLINE  : 'ONLINE',  // ONLINE_PAYMENT
    WALLET  : 'WALLET',  // WALLET_PAYMENT
    NONE    : 'NONE'     // NO_PAYMENT (For free events, no payments)
} as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[keyof typeof PAYMENT_METHODS];




export const PAYMENT_STATUSES = {
  PENDING   : "pending",
  COMPLETED : "completed",
  FAILED    : "failed",
  REFUNDED  : "refunded",
} as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[keyof typeof PAYMENT_STATUSES];







// Also check the same percentage value in frontend
// export const ADMIN_COMMISSION_PERCENT = 10;

// export const GRACE_PERIOD_REFUND_PERCENT = 100;   // 100% refund if cancelled within eligible grace period end.
// export const ABOVE_H48_REFUND_PERCENT    = 100;   // 100% refund if cancelled >= 48 hours before event start
// export const BELOW_H48_REFUND_PERCENT    = 50;    // 50% refund if cancelled < 48 hours but >= 24 hours before event start
// export const BELOW_H24_REFUND_PERCENT    = 25;    // 25% refund if cancelled < 24 hours but before event start
// export const NO_REFUND_PERCENT           = 0;