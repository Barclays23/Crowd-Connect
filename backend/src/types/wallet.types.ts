// backend/src/types/wallet.types.ts

import { Types } from "mongoose";




export enum TRANSACTION_TYPE {
  // ── User wallet ───────────────────────────────────────────────
  BOOKING_REFUND      = "BOOKING_REFUND",      // admin → user  (refund for booking cancelled / event cancelled / suspended)
  CASHBACK            = "CASHBACK",            // admin → user  (5-star review reward)
  REFERRAL_CREDIT     = "REFERRAL_CREDIT",     // admin → user  (referral bonus)
  WALLET_PAYMENT      = "WALLET_PAYMENT",      // user  → admin (user pay via wallet)
  WITHDRAWAL          = "WITHDRAWAL",          // host wallet → bank (host withdraws wallet balance to bank)
  WITHDRAWAL_REVERSAL = "WITHDRAWAL_REVERSAL", // failed payout → credit back

  // ── Host wallet ───────────────────────────────────────────────
  HOST_PAYOUT         = "HOST_PAYOUT",         // admin → host  (host receives net earnings after event)    

  // ── Admin wallet ──────────────────────────────────────────────  ← ADD THESE
  BOOKING_PAYMENT     = "BOOKING_PAYMENT",     // user  → admin (ticket purchase via Razorpay)
  HOSTING_FEE         = "HOSTING_FEE",         // user  → admin (role upgrade fee)
  COMMISSION_EARNED   = "COMMISSION_EARNED",   // retained from host payout
  REFUND_ISSUED       = "REFUND_ISSUED",       // admin → user  (debit from admin wallet)

  // ── Both ──────────────────────────────────────────────────────
  ADMIN_ADJUSTMENT    = "ADMIN_ADJUSTMENT",    // manual correction by super admin
}



export enum TRANSACTION_DIRECTION {
  CREDIT = "CREDIT",
  DEBIT  = "DEBIT",
}



export enum TRANSACTION_STATUS {
  PENDING   = "PENDING",
  COMPLETED = "COMPLETED",
  FAILED    = "FAILED",
}



export enum TRANSACTION_REFERENCE_TYPE {
  BOOKING             = "BOOKING",
  EVENT               = "EVENT",
  PAYOUT_REQUEST      = "PAYOUT_REQUEST",
  WITHDRAWAL_REQUEST  = "WITHDRAWAL_REQUEST",
  REVIEW              = "REVIEW",
}


// move to with drawal types ts
export enum WITHDRAWAL_STATUS {
  PENDING    = "PENDING",
  PROCESSING = "PROCESSING",   // Razorpay Payout API call initiated
  COMPLETED  = "COMPLETED",
  FAILED     = "FAILED",       // triggers auto wallet credit-back
}




// Sub-interfaces ─────────────────────────────────────────

export interface IBankDetails {
  accountHolderName : string;
  accountNumber     : string;
  ifsc              : string;
  bankName          : string;
}





// Model Interfaces ─────────────────────────────────────────

export interface ITransactionModel {
  _id           : Types.ObjectId;
  userRef       : Types.ObjectId;                     // ref: User — indexed
  transactionType : TRANSACTION_TYPE;
  direction     : TRANSACTION_DIRECTION;
  amount        : number;                             // always positive
  balanceAfter  : number;                             // wallet snapshot after this tx
  status        : TRANSACTION_STATUS;
  referenceType?: TRANSACTION_REFERENCE_TYPE;
  referenceId  ?: Types.ObjectId;                     // bookingId | eventId | payoutRequestId | etc.
  description  ?: string;                             // e.g. "Refund for booking at Jazz Night"
  metadata     ?: Record<string, unknown>;            // e.g. { razorpayRefundId, commissionRate }
  createdAt     : Date;
  updatedAt     : Date;
}


// move to with drawal types ts
export interface IWithdrawalRequestModel {
  _id               : Types.ObjectId;
  hostRef           : Types.ObjectId;              // ref: User
  amount            : number;                      // min: 1
  status            : WITHDRAWAL_STATUS;
  bankDetails       : IBankDetails;
  razorpayPayoutId ?: string;                      // set after Razorpay Payout API call
  processedAt      ?: Date;                        // when status changed to COMPLETED or FAILED
  failureReason    ?: string;                      // e.g. "Invalid IFSC code"
  createdAt         : Date;
  updatedAt         : Date;
}





// Populated variants (for service responses) ─────────────────────────────────────────

export interface IPopulatedUserFromTransaction {
  _id   : Types.ObjectId;
  name  : string;
  email : string;
}



export type ITransactionPopulated = Omit<ITransactionModel, "userRef"> & {
  userRef: IPopulatedUserFromTransaction;
};






// move to wallet.entity.ts?? or wallet.dto.ts ?? or keep here??
// Service Layer Input Types ─────────────────────────────────────────


// for double entry (credit & debit)
export interface WalletTransferInput {
  fromUserId: string;
  toUserId: string;
  transferAmount: number;
  fromTransactionType: TRANSACTION_TYPE;
  toTransactionType: TRANSACTION_TYPE;
  referenceType: TRANSACTION_REFERENCE_TYPE;
  referenceId: Types.ObjectId | string;
  description: string;
  metadata?: Record<string, unknown>;
}



export interface WalletCreditInput {
  userId            : string;
  amount            : number;
  transactionType   : TRANSACTION_TYPE;
  referenceType?    : TRANSACTION_REFERENCE_TYPE;
  referenceId  ?    : Types.ObjectId | string;
  description  ?    : string;
  metadata     ?    : Record<string, unknown>;
}

export type WalletDebitInput = WalletCreditInput;   // same shape, direction is set by the method




// move to withdrawal types or input or dto
// Host requests bank withdrawal
export interface CreateWithdrawalRequestInput {
  hostRef     : Types.ObjectId | string;
  amount      : number;
  bankDetails : IBankDetails;
}



// move to wallet.entity.ts?? or wallet.dto.ts ?? or keep here??
// Query / Filter Types ─────────────────────────────────────────

export interface TransactionsFilterQuery {
  userId    ?: string;
  page       : number;
  limit      : number;
  sortBy    ?: "createdAt" | "amount";
  sortOrder ?: "asc" | "desc";
  direction ?: TRANSACTION_DIRECTION;
  transactionType ?: TRANSACTION_TYPE;
  status    ?: TRANSACTION_STATUS;
  startDate ?: string;
  endDate   ?: string;
}



// move to withdrawal types or input or dto
export interface GetWithdrawalRequestsFilter {
  page    : number;
  limit   : number;
  status ?: WITHDRAWAL_STATUS;
}



// Money flow with wallet

// BOOKING PAYMENT (₹500 ticket, 10% commission):
//   Razorpay webhook confirms payment
//   → admin.walletBalance += 500   (BOOKING_PAYMENT  CREDIT  ₹500)

// HOST PAYOUT REQUEST approved:
//   → admin.walletBalance -= 450   (HOST_PAYOUT      DEBIT   ₹450)
//   → host.walletBalance  += 450   (HOST_PAYOUT      CREDIT  ₹450)
//   → admin keeps ₹50 commission — recorded via COMMISSION_EARNED or
//     just visible as the difference (your choice)

// CANCELS BOOKING (100% refund = ₹500):
//   Razorpay refund initiated
//   → admin.walletBalance -= 500   (REFUND_ISSUED    DEBIT   ₹500)
//   → user.walletBalance  += 500   (BOOKING_REFUND   CREDIT  ₹500)

// HOSTING FEE (₹999):
//   Razorpay webhook confirms payment
//   → admin.walletBalance += 999   (HOSTING_FEE      CREDIT  ₹999)
//   (non-refundable — no reverse transaction ever)