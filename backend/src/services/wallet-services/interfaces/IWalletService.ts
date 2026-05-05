
// backend/src/services/wallet-services/interfaces/IWalletService.ts

import { ClientSession } from "mongoose";
import {
   WalletCreditInput,
   WalletDebitInput,

   TransactionsFilterQuery,
   WalletTransferInput,
} from "@/types/wallet.types";

import {
   GetTransactionsResponse,
   WalletOverviewResponse,
} from "@/dtos/wallet.dto";




export interface IWalletService {

   // ─── Core Wallet Mutations ───────────────────────────────────────────────────
   transferFunds(transferInput: WalletTransferInput, options: { session: ClientSession }): Promise<void>;

   creditToWallet(input: WalletCreditInput, options?: { session?: ClientSession }): Promise<number>;
   debitFromWallet(input: WalletDebitInput): Promise<number>;


   // ─── Wallet Overview ─────────────────────────────────────────────────────────
   getWalletOverview(userId: string): Promise<WalletOverviewResponse>;


   // ─── Transaction History ─────────────────────────────────────────────────────
   getTransactions(filters : TransactionsFilterQuery): Promise<GetTransactionsResponse>;

}