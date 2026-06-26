// backend/src/constants/payout.constants.ts

export const PAYOUT_REQUEST_STATUSES = {
  PENDING    : "pending",
  // REQUESTED  : 'requested',   // Host clicked "Request Payout"
  APPROVED   : 'approved',    // Admin reviewed & approved (only need if using payment gateways/webhooks)
  REJECTED   : 'rejected',    // Admin denied (fraud, low attendance, policy violation)
  // PROCESSED  : 'processed',   // Razorpay transfer succeeded
  // FAILED     : 'failed',      // Transfer failed (e.g. invalid account, insufficient balance)
  PAID       : "paid",
}
export type PayoutRequestStatus   = typeof PAYOUT_REQUEST_STATUSES[keyof typeof PAYOUT_REQUEST_STATUSES];