// backend/src/types/payment.types.ts



// Also check the same percentage value in frontend
export const ADMIN_COMMISSION_PERCENT = 10;

export const GRACE_PERIOD_REFUND_PERCENT = 100;   // 100% refund if cancelled within eligible grace period end.
export const ABOVE_H48_REFUND_PERCENT    = 100;   // 100% refund if cancelled >= 48 hours before event start
export const BELOW_H48_REFUND_PERCENT    = 50;    // 50% refund if cancelled < 48 hours but >= 24 hours before event start
export const BELOW_H24_REFUND_PERCENT    = 25;    // 25% refund if cancelled < 24 hours but before event start
export const NO_REFUND_PERCENT           = 0;