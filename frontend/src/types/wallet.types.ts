// frontend/src/types/wallet.types.ts

import type { 
  TransactionDirection, 
  TransactionStatus, 
  TransactionType 
} from "@/constants/transaction.constants";



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



export interface GetTransactions {
  transactions : ITransactionState[];
}



export type TransactionSortField = "createdAt" | "amount";




// ─── REQUEST PAYLOADS ─────────────────────────────────────────────────────────

export interface GetTransactionsParams {
  page        : number;
  limit       : number;
  sortBy     ?: TransactionSortField;
  sortOrder  ?: "asc" | "desc";
  direction  ?: TransactionDirection | "all";
  type       ?: TransactionType | "all";
  status     ?: TransactionStatus | "all";
}




// ─── RESPONSE DATA PAYLOADS (The 'T' in ApiResponse<T>) ────────────────────────────────



export interface WalletOverviewData {
  walletBalance      : number;
  recentTransactions : ITransactionState[];
}