// frontend/src/types/wallet.types.ts

import type { IPagination } from "@/types/common.types";

export const TRANSACTION_TYPE = {
  BOOKING_REFUND  : "BOOKING_REFUND",
  CASHBACK        : "CASHBACK",
  REFERRAL_CREDIT : "REFERRAL_CREDIT",
  HOST_PAYOUT     : "HOST_PAYOUT",
  WALLET_PAYMENT  : "WALLET_PAYMENT",
  WITHDRAWAL      : "WITHDRAWAL",
} as const;

export type TRANSACTION_TYPE = typeof TRANSACTION_TYPE[keyof typeof TRANSACTION_TYPE];


export const TRANSACTION_DIRECTION = {
  CREDIT : "CREDIT",
  DEBIT  : "DEBIT",
} as const;

export type TRANSACTION_DIRECTION = typeof TRANSACTION_DIRECTION[keyof typeof TRANSACTION_DIRECTION];


export const TRANSACTION_STATUS = {
  PENDING   : "PENDING",
  COMPLETED : "COMPLETED",
  FAILED    : "FAILED",
} as const;

export type TRANSACTION_STATUS = typeof TRANSACTION_STATUS[keyof typeof TRANSACTION_STATUS];




export interface ITransactionState {
  transactionId : string;
  type          : TRANSACTION_TYPE;
  direction     : TRANSACTION_DIRECTION;
  amount        : number;
  balanceAfter  : number;
  status        : TRANSACTION_STATUS;
  description  ?: string;
  referenceType?: string;
  referenceId  ?: string;
  createdAt     : string;
}


export interface WalletOverviewResponse {
  walletBalance      : number;
  recentTransactions : ITransactionState[];
}


export interface GetTransactionsResponse {
  transactions : ITransactionState[];
  pagination   : IPagination;
}



export type TransactionSortField = "createdAt" | "amount";



export interface GetTransactionsParams {
  page       : number;
  limit      : number;
  sortBy    ?: TransactionSortField;
  sortOrder ?: "asc" | "desc";
  direction ?: TRANSACTION_DIRECTION | "all";
  type      ?: TRANSACTION_TYPE | "all";
  status    ?: TRANSACTION_STATUS | "all";
}