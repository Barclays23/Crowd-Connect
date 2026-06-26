// backend/src/constants/transaction.constants.ts


export const TRANSACTION_TYPES = {
  // ── User wallet ───────────────────────────────────────────────
  BOOKING_REFUND      : "BOOKING_REFUND",      // admin → user  (refund for booking cancelled / event cancelled / suspended)
  CASHBACK            : "CASHBACK",            // admin → user  (5-star review reward)
  REFERRAL_CREDIT     : "REFERRAL_CREDIT",     // admin → user  (referral bonus)
  WALLET_PAYMENT      : "WALLET_PAYMENT",      // user  → admin (user pay via wallet)
  WITHDRAWAL          : "WITHDRAWAL",          // host wallet → bank (host withdraws wallet balance to bank)
  WITHDRAWAL_REVERSAL : "WITHDRAWAL_REVERSAL", // failed payout → credit back

  // ── Host wallet ───────────────────────────────────────────────
  HOST_PAYOUT         : "HOST_PAYOUT",         // admin → host  (host receives net earnings after event)    

  // ── Admin wallet ──────────────────────────────────────────────  ← ADD THESE
  BOOKING_PAYMENT     : "BOOKING_PAYMENT",     // user  → admin (ticket purchase via Razorpay)
  HOSTING_FEE         : "HOSTING_FEE",         // user  → admin (role upgrade fee)
  COMMISSION_EARNED   : "COMMISSION_EARNED",   // retained from host payout
  REFUND_ISSUED       : "REFUND_ISSUED",       // admin → user  (debit from admin wallet)

  // ── Both ──────────────────────────────────────────────────────
  ADMIN_ADJUSTMENT    : "ADMIN_ADJUSTMENT",    // manual correction by super admin
}
export type TransactionType   = typeof TRANSACTION_TYPES[keyof typeof TRANSACTION_TYPES];


export const TRANSACTION_DIRECTIONS = {
  CREDIT : "CREDIT",
  DEBIT  : "DEBIT",
}
export type TransactionDirection   = typeof TRANSACTION_DIRECTIONS[keyof typeof TRANSACTION_DIRECTIONS];



export const TRANSACTION_STATUSES = {
  PENDING   : "PENDING",
  COMPLETED : "COMPLETED",
  FAILED    : "FAILED",
}
export type TransactionStatus   = typeof TRANSACTION_STATUSES[keyof typeof TRANSACTION_STATUSES];


export const TRANSACTION_REFERENCE_TYPES = {
  BOOKING             : "BOOKING",
  EVENT               : "EVENT",
  PAYOUT_REQUEST      : "PAYOUT_REQUEST",
  WITHDRAWAL_REQUEST  : "WITHDRAWAL_REQUEST",
  REVIEW              : "REVIEW",
}
export type TransactionReferenceType   = typeof TRANSACTION_REFERENCE_TYPES[keyof typeof TRANSACTION_REFERENCE_TYPES];



// move to with drawal types ts
export const WITHDRAWAL_STATUSES = {
  PENDING    : "PENDING",
  PROCESSING : "PROCESSING",   // Razorpay Payout API call initiated
  COMPLETED  : "COMPLETED",
  FAILED     : "FAILED",       // triggers auto wallet credit-back
}
export type WithdrawalStatus   = typeof WITHDRAWAL_STATUSES[keyof typeof WITHDRAWAL_STATUSES];