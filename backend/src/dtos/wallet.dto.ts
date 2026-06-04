// backend/src/dtos/wallet.dto.ts
import { 
  TRANSACTION_DIRECTION, 
  TRANSACTION_REFERENCE_TYPE, 
  TRANSACTION_STATUS, 
  TRANSACTION_TYPE, 
  WITHDRAWAL_STATUS, 
  IBankDetails 
} from "@/types/wallet.types";
import { IPagination } from "@/types/common.types";


// Request DTO Types ─────────────────────────────────────────









// Response DTO Types ─────────────────────────────────────────

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




// move to withdrawal
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



// move to withdrawal
export interface GetWithdrawalRequestsResponse {
  withdrawalRequests : WithdrawalRequestResponseDTO[];
  pagination         : IPagination;
}
