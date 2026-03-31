// backend/src/dtos/wallet.dto.ts

import { IPagination } from "@/types/common.types";
import { 
  PAYOUT_REQUEST_STATUS, 
  TRANSACTION_DIRECTION, 
  TRANSACTION_REFERENCE_TYPE, 
  TRANSACTION_STATUS, 
  TRANSACTION_TYPE, 
  WITHDRAWAL_STATUS, 
  IBankDetails 
} from "@/types/wallet.types";


// Request DTO Types
// ─────────────────────────────────────────












export interface TransactionResponseDTO {
  transactionId : string;
  type          : TRANSACTION_TYPE;
  direction     : TRANSACTION_DIRECTION;
  amount        : number;
  balanceAfter  : number;
  status        : TRANSACTION_STATUS;
  referenceType?: TRANSACTION_REFERENCE_TYPE;
  referenceId  ?: string;
  description  ?: string;
  createdAt     : string;
}


export interface PayoutRequestResponseDTO {
  _id              : string;
  eventRef         : { _id: string; title: string };
  hostRef          : { _id: string; name: string; email: string };
  grossAmount      : number;
  commissionRate   : number;
  commissionAmount : number;
  netAmount        : number;
  status           : PAYOUT_REQUEST_STATUS;
  requestedAt      : string;
  reviewedBy      ?: string;
  reviewedAt      ?: string;
  rejectionReason ?: string;
  notes           ?: string;
  createdAt        : string;
}


export interface WithdrawalRequestResponseDTO {
  _id               : string;
  amount            : number;
  status            : WITHDRAWAL_STATUS;
  bankDetails       : IBankDetails;
  razorpayPayoutId ?: string;
  processedAt      ?: string;
  failureReason    ?: string;
  createdAt         : string;
}




// ─────────────────────────────────────────
// Response DTO Types (Service → Controller)
// ─────────────────────────────────────────

export interface GetTransactionsResponse {
  transactions : TransactionResponseDTO[];
  pagination   : IPagination;
}

export interface WalletOverviewResponse {
  walletBalance      : number;
  recentTransactions : TransactionResponseDTO[];
}


export interface GetPayoutRequestsResponse {
  payoutRequests : PayoutRequestResponseDTO[];
  pagination     : IPagination;
}

export interface GetWithdrawalRequestsResponse {
  withdrawalRequests : WithdrawalRequestResponseDTO[];
  pagination         : IPagination;
}
