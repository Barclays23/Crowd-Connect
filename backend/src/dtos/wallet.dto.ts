// backend/src/dtos/wallet.dto.ts
import { 
  IBankDetails 
} from "@/types/wallet.types";
import { IPagination } from "@/types/common.types";
import { TransactionDirection, TransactionReferenceType, TransactionStatus, TransactionType, WithdrawalStatus } from "@/constants/transaction.constants";


// Request DTO Types ─────────────────────────────────────────









// Response DTO Types ─────────────────────────────────────────

export interface TransactionResponseDTO {
  transactionId : string;
  type          : TransactionType;
  direction     : TransactionDirection;
  amount        : number;
  balanceAfter  : number;
  status        : TransactionStatus;
  referenceType?: TransactionReferenceType;
  referenceId  ?: string;
  description  ?: string;
  createdAt     : string;
}




// move to withdrawal
export interface WithdrawalRequestResponseDTO {
  _id               : string;
  amount            : number;
  status            : WithdrawalStatus;
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



// move to withdrawal
export interface GetWithdrawalRequestsResponse {
  withdrawalRequests : WithdrawalRequestResponseDTO[];
  pagination         : IPagination;
}
