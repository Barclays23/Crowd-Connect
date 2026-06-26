// frontend/src/constants/payment.constants.ts


export const PAYMENT_PURPOSES = {
  EVENT_BOOKING   : "booking",
  ROLE_UPGRADE    : "upgrade",
  // ROLE_UPGRADE    : "role_upgrade",
  // MERCHANDISE     : "merchandise"
} as const;


export const PAYMENT_METHODS = {
  ONLINE : 'ONLINE',
  WALLET : 'WALLET',
  NONE   : 'NONE' // For free events
} as const;



export const PAYMENT_STATUSES = {
  PENDING   : "pending",
  COMPLETED : "completed",
  FAILED    : "failed",
  REFUNDED  : "refunded",
} as const;



export type PaymentMethod   = (typeof PAYMENT_METHODS)[keyof typeof PAYMENT_METHODS];
export type PaymentStatus   = (typeof PAYMENT_STATUSES)[keyof typeof PAYMENT_STATUSES];
export type PaymentPurpose  = (typeof PAYMENT_PURPOSES)[keyof typeof PAYMENT_PURPOSES];