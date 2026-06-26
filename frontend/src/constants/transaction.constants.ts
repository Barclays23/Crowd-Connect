// frontend/src/constants/transaction.constants.ts

export const TRANSACTION_TYPE = {
  BOOKING_REFUND  : "BOOKING_REFUND",
  CASHBACK        : "CASHBACK",
  REFERRAL_CREDIT : "REFERRAL_CREDIT",
  HOST_PAYOUT     : "HOST_PAYOUT",
  WALLET_PAYMENT  : "WALLET_PAYMENT",
  WITHDRAWAL      : "WITHDRAWAL",
} as const;



export const TRANSACTION_DIRECTION = {
    CREDIT : "CREDIT",
    DEBIT  : "DEBIT",
} as const;



export const TRANSACTION_STATUS = {
    PENDING   : "PENDING",
  COMPLETED : "COMPLETED",
  FAILED    : "FAILED",
} as const;



export type TransactionDirection = typeof TRANSACTION_DIRECTION[keyof typeof TRANSACTION_DIRECTION];
export type TransactionType = typeof TRANSACTION_TYPE[keyof typeof TRANSACTION_TYPE];
export type TransactionStatus = typeof TRANSACTION_STATUS[keyof typeof TRANSACTION_STATUS];