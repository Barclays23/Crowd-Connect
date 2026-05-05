// backend/src/services/wallet-services/interfaces/IWithdrawalService.ts

import { 
   GetWithdrawalRequestsResponse, 
   WithdrawalRequestResponseDTO 
} from "@/dtos/wallet.dto";

import { 
   CreateWithdrawalRequestInput, 
   GetWithdrawalRequestsFilter 
} from "@/types/wallet.types";




export interface IWithdrawalService {
   
   // ─── Withdrawal Requests (Host Wallet → Bank) ────────────────────────────────
   createWithdrawalRequest(input: CreateWithdrawalRequestInput): Promise<WithdrawalRequestResponseDTO>;
   
   getWithdrawalRequests(hostId: string, filters: GetWithdrawalRequestsFilter): Promise<GetWithdrawalRequestsResponse>;
   
   // Called by Razorpay webhook — not a user-facing action
   handleWithdrawalWebhook(
      razorpayPayoutId : string,
      event            : "payout.processed" | "payout.failed",
      failureReason   ?: string,
   ): Promise<void>;
}