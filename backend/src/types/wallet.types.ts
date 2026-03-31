// backend/src/types/wallet.types.ts

import { Types } from "mongoose";



export enum TRANSACTION_TYPE {
  BOOKING_REFUND     = "BOOKING_REFUND",      // attendee cancelled / event cancelled / suspended
  CASHBACK           = "CASHBACK",            // 5-star review reward
  REFERRAL_CREDIT    = "REFERRAL_CREDIT",     // referral bonus
  HOST_PAYOUT        = "HOST_PAYOUT",         // host receives net earnings after event
  WALLET_PAYMENT     = "WALLET_PAYMENT",      // user pays booking using wallet balance (future)
  WITHDRAWAL         = "WITHDRAWAL",          // host withdraws wallet balance to bank
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



export enum PAYOUT_REQUEST_STATUS {
  PENDING  = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  PAID     = "PAID",
}


export enum WITHDRAWAL_STATUS {
  PENDING    = "PENDING",
  PROCESSING = "PROCESSING",   // Razorpay Payout API call initiated
  COMPLETED  = "COMPLETED",
  FAILED     = "FAILED",       // triggers auto wallet credit-back
}




// ─────────────────────────────────────────
// Sub-interfaces
// ─────────────────────────────────────────

export interface IBankDetails {
  accountHolderName : string;
  accountNumber     : string;
  ifsc              : string;
  bankName          : string;
}




// ─────────────────────────────────────────
// Model Interfaces
// ─────────────────────────────────────────

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


export interface IPayoutRequestModel {
  _id              : Types.ObjectId;
  eventRef         : Types.ObjectId;               // ref: Event — required
  hostRef          : Types.ObjectId;               // ref: User — indexed
  grossAmount      : number;                       // total collected ticket revenue for the event
  commissionRate   : number;                       // e.g. 0.10 for 10%
  commissionAmount : number;                       // grossAmount × commissionRate
  netAmount        : number;                       // grossAmount − commissionAmount → released to host wallet
  status           : PAYOUT_REQUEST_STATUS;
  requestedAt      : Date;
  reviewedBy      ?: Types.ObjectId;               // ref: User (admin who processed)
  reviewedAt      ?: Date;
  rejectionReason ?: string;
  notes           ?: string;                       // internal admin notes
  createdAt        : Date;
  updatedAt        : Date;
}


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




// ─────────────────────────────────────────
// Populated variants (for service responses)
// ─────────────────────────────────────────

export interface IPopulatedUserFromTransaction {
  _id   : Types.ObjectId;
  name  : string;
  email : string;
}


export interface IPopulatedEventFromPayout {
  _id   : Types.ObjectId;
  title : string;
}


export type ITransactionPopulated = Omit<ITransactionModel, "userRef"> & {
  userRef: IPopulatedUserFromTransaction;
};


export type IPayoutRequestPopulated = Omit<IPayoutRequestModel, "hostRef" | "eventRef"> & {
  hostRef  : IPopulatedUserFromTransaction;
  eventRef : IPopulatedEventFromPayout;
};



// move to wallet.entity.ts?? or wallet.dto.ts ?? or keep here??
// ─────────────────────────────────────────
// Service Layer Input Types   // move to wallet.entity.ts?? or wallet.dto.ts ?? or keep here??
// ─────────────────────────────────────────

// What WalletService.credit() / .debit() accepts
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


// Host submits payout request
export interface CreatePayoutRequestInput {
  eventRef  : Types.ObjectId | string;
  hostRef   : Types.ObjectId | string;
  grossAmount: number;
}

// Admin approves/rejects
export interface ReviewPayoutRequestInput {
  payoutRequestId : string;
  adminId         : Types.ObjectId | string;
  decision        : "approve" | "reject";
  rejectionReason?: string;
  notes          ?: string;
}

// Host requests bank withdrawal
export interface CreateWithdrawalRequestInput {
  hostRef     : Types.ObjectId | string;
  amount      : number;
  bankDetails : IBankDetails;
}



// move to wallet.entity.ts?? or wallet.dto.ts ?? or keep here??
// ─────────────────────────────────────────
// Query / Filter Types   // move to wallet.entity.ts?? or wallet.dto.ts ?? or keep here??
// ─────────────────────────────────────────

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

export interface GetPayoutRequestsFilter {
  page     : number;
  limit    : number;
  status  ?: PAYOUT_REQUEST_STATUS;
  hostRef ?: string;                  // admin filtering by host
}

export interface GetWithdrawalRequestsFilter {
  page    : number;
  limit   : number;
  status ?: WITHDRAWAL_STATUS;
}




