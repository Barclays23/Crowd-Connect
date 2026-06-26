// frontend/src/types/wallet.types.ts

import type { 
  TransactionDirection, 
  TransactionStatus, 
  TransactionType 
} from "@/constants/transaction.constants";
import type { IPagination } from "@/types/common.types";



export interface ITransactionState {
  transactionId : string;
  type          : TransactionType;
  direction     : TransactionDirection;
  amount        : number;
  balanceAfter  : number;
  status        : TransactionStatus;
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
  direction ?: TransactionDirection | "all";
  type      ?: TransactionType | "all";
  status    ?: TransactionStatus | "all";
}