// backend/src/types/wallet.types.ts

import { TransactionDirection, TransactionReferenceType, TransactionStatus, TransactionType, WithdrawalStatus } from "@/constants/transaction.constants";
import { Types } from "mongoose";





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
  transactionType : TransactionType;
  direction     : TransactionDirection;
  amount        : number;                             // always positive
  balanceAfter  : number;                             // wallet snapshot after this tx
  status        : TransactionStatus;
  referenceType?: TransactionReferenceType;
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
  status            : WithdrawalStatus;
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
  fromTransactionType: TransactionType;
  toTransactionType: TransactionType;
  referenceType: TransactionReferenceType;
  referenceId: Types.ObjectId | string;
  description: string;
  metadata?: Record<string, unknown>;
}



export interface WalletCreditInput {
  userId            : string;
  amount            : number;
  transactionType   : TransactionType;
  referenceType?    : TransactionReferenceType;
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
  direction ?: TransactionDirection;
  transactionType ?: TransactionType;
  status    ?: TransactionStatus;
  startDate ?: string;
  endDate   ?: string;
}



// move to withdrawal types or input or dto
export interface GetWithdrawalRequestsFilter {
  page    : number;
  limit   : number;
  status ?: WithdrawalStatus;
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