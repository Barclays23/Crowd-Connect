
// backend/src/services/wallet-services/interfaces/IWalletService.ts

import { Types } from "mongoose";
import {
   ReviewPayoutRequestInput,
   WalletCreditInput,
   WalletDebitInput,
   CreatePayoutRequestInput,
   CreateWithdrawalRequestInput,

   TransactionsFilterQuery,
   GetPayoutRequestsFilter,
   GetWithdrawalRequestsFilter,
} from "@/types/wallet.types";

import {
   GetPayoutRequestsResponse,
   GetTransactionsResponse,
   GetWithdrawalRequestsResponse,
   PayoutRequestResponseDTO,
   WalletOverviewResponse,
   WithdrawalRequestResponseDTO,
} from "@/dtos/wallet.dto";




export interface IWalletService {

   // ─── Core Wallet Mutations ───────────────────────────────────────────────────
   // Never update walletBalance directly — always go through these two methods.
   // Both return the new wallet balance after the operation.

   creditToWallet(input: WalletCreditInput): Promise<number>;
   debitFromWallet(input: WalletDebitInput): Promise<number>;


   // ─── Wallet Overview ─────────────────────────────────────────────────────────
   getWalletOverview(userId: string): Promise<WalletOverviewResponse>;


   // ─── Transaction History ─────────────────────────────────────────────────────
   getTransactions(filters : TransactionsFilterQuery): Promise<GetTransactionsResponse>;

   // ─── Payout Requests (Host → Admin → Host Wallet) ────────────────────────────
   createPayoutRequest(input: CreatePayoutRequestInput): Promise<PayoutRequestResponseDTO>;

   getPayoutRequests(filters: GetPayoutRequestsFilter): Promise<GetPayoutRequestsResponse>;

   getMyPayoutRequests(hostId: string, filters: GetPayoutRequestsFilter): Promise<GetPayoutRequestsResponse>;

   reviewPayoutRequest(input: ReviewPayoutRequestInput): Promise<PayoutRequestResponseDTO>;


   // ─── Withdrawal Requests (Host Wallet → Bank) ────────────────────────────────
   createWithdrawalRequest(input: CreateWithdrawalRequestInput): Promise<WithdrawalRequestResponseDTO>;

   getWithdrawalRequests(hostId: string, filters: GetWithdrawalRequestsFilter ): Promise<GetWithdrawalRequestsResponse>;

   // Called by Razorpay webhook — not a user-facing action
   handleWithdrawalWebhook(
      razorpayPayoutId : string,
      event            : "payout.processed" | "payout.failed",
      failureReason   ?: string,
   ): Promise<void>;
}