// backend/src/services/wallet-services/implementations/wallet.service.ts
import { ClientSession } from "mongoose";
import { IWalletService } from "@/services/wallet-services/interfaces/IWalletService";
import { IUserRepository } from "@/repositories/interfaces/IUserRepository";
import { ITransactionRepository } from "@/repositories/interfaces/ITransactionRepository";

import {
   WalletCreditInput,
   WalletDebitInput,
   CreateWithdrawalRequestInput,
   TransactionsFilterQuery,
   GetWithdrawalRequestsFilter,
   TRANSACTION_DIRECTION,
   WalletTransferInput,
} from "@/types/wallet.types";
import {
   GetTransactionsResponse,
   GetWithdrawalRequestsResponse,
   WalletOverviewResponse,
   WithdrawalRequestResponseDTO,
} from "@/dtos/wallet.dto";
import { createHttpError } from "@/utils/httpError.utils";
import { HttpStatus } from "@/constants/statusCodes.constants";
import { UserMessages, WalletMessages } from "@/constants/responseMessages.constants";
import { 
   mapToCreateTransactionInput, 
   mapTransactionEntityToResponseDTO 
} from "@/mappers/wallet.mapper";
import { UserEntity } from "@/entities/user.entity";
import { TransactionEntity } from "@/entities/transaction.entity";





export class WalletService implements IWalletService {

   constructor(
      private _userRepository            : IUserRepository,
      private _transactionRepository     : ITransactionRepository,
      // private _withdrawalRequestRepository : IWithdrawalRequestRepository,
   ) {}


   // ─── Core Wallet Mutations ───────────────────────────────────────────────────

   async creditToWallet(creditInput: WalletCreditInput, options: { session?: ClientSession } = {}): Promise<number> {
      const { userId, amount} = creditInput;
      const { session } = options;

      const newBalance: number | null = await this._userRepository.incrementWalletBalance(userId, amount, { session });

      if (newBalance === null) {
         throw createHttpError(HttpStatus.NOT_FOUND, UserMessages.USER_NOT_FOUND)
      }

      const transactionInput = mapToCreateTransactionInput(
         creditInput, 
         TRANSACTION_DIRECTION.CREDIT, 
         newBalance
      );

      const transactionData: TransactionEntity = await this._transactionRepository.createTransaction(transactionInput, { session });
      
      return newBalance;

      //  ## One architectural note on timing
         // You're crediting the wallet **immediately when the Razorpay refund is initiated**, not when it's confirmed. This is the pragmatic approach — Razorpay refunds almost never fail after initiation, and it gives the user instant feedback. But you should be aware of the tradeoff:

         // Razorpay refund initiated → wallet credited immediately  ← what you're doing (fine)
         // Razorpay refund confirmed via webhook → then credit wallet  ← more "correct" but delays UX
   }


   async debitFromWallet(debitInput: WalletDebitInput, options: { session?: ClientSession } = {}): Promise<number> {
      const { userId, amount } = debitInput;
      const { session } = options;

      const newBalance = await this._userRepository.decrementWalletBalance(userId, amount, { session });
      if (newBalance === null) {
         throw createHttpError(HttpStatus.BAD_REQUEST, WalletMessages.INSUFFICIENT_WALLET_BALANCE);
      }

      const transactionInput = mapToCreateTransactionInput(
         debitInput, 
         TRANSACTION_DIRECTION.DEBIT, 
         newBalance
      );

      const transactionData: TransactionEntity = await this._transactionRepository.createTransaction(transactionInput, { session });

      return newBalance;
   }



   // ─── Double-Entry Transfer (Critical for Refunds & Payouts) ──────────────────

   async transferFunds(transferInput: WalletTransferInput, options: { session: ClientSession }): Promise<void> {
      const { 
         fromUserId, toUserId, transferAmount, 
         fromTransactionType, toTransactionType, 
         referenceType, referenceId, description, 
         metadata 
      } = transferInput;

      // Debit From Sender
      await this.debitFromWallet({
         userId: fromUserId,
         amount: transferAmount,
         transactionType: fromTransactionType,
         referenceType,
         referenceId,
         description: `[Transfer Out] ${description}`,
         metadata
      }, { session: options.session });

      // Credit to Receiver
      await this.creditToWallet({
         userId: toUserId,
         amount: transferAmount,
         transactionType: toTransactionType,
         referenceType,
         referenceId,
         description: `[Transfer In] ${description}`,
         metadata
      }, { session: options.session });
   }


   async getWalletOverview(userId: string): Promise<WalletOverviewResponse> {
      const user: UserEntity | null = await this._userRepository.getUserById(userId.toString());
      if (!user) throw createHttpError(HttpStatus.NOT_FOUND, UserMessages.USER_NOT_FOUND);

      const recentTransactions: TransactionEntity[] = await this._transactionRepository.findRecentTxnByUserId(userId, 10);

      return {
         walletBalance      : user.walletBalance,
         recentTransactions : recentTransactions.map(mapTransactionEntityToResponseDTO),
      };
   }



   async getTransactions(filters : TransactionsFilterQuery): Promise<GetTransactionsResponse> {

      const [transactionResults, totalCount]: [TransactionEntity[], number] = await Promise.all([
         this._transactionRepository.findTransactions(filters),
         this._transactionRepository.countTransactions(filters),
      ]);

      return {
         transactions : transactionResults.map(mapTransactionEntityToResponseDTO),
         pagination: {
            totalCount: totalCount,
            limit: filters.limit,
            currentPage: filters.page,
            totalPages: Math.ceil(totalCount / filters.limit)
         }
      };
   }

}



// A) Booking cancellation refund — plug into your existing cancellation service:
// In BookingCancellationService, after Razorpay refund succeeds:
// await walletService.creditToWallet(
//   booking.userRef,
//   refundAmount,                      // the 100%/50%/25% calculated amount
//   'BOOKING_REFUND',
//   'BOOKING',
//   booking._id,
//   `Refund for booking at ${event.title}`
// );
// Also update booking.cancellation.refundedAt and payment.status = 'REFUNDED'





// B) Host payout — in your admin payout approval handler:
// Admin approves PayoutRequest
// const COMMISSION_RATE = 0.10;  // ADMIN_COMMISSION_PERCENT
// const commission = payoutRequest.grossAmount * ADMIN_COMMISSION_PERCENT;
// const netAmount   = payoutRequest.grossAmount - commission;

// await payoutRequest.updateOne({ status: 'PAID', reviewedBy: adminId, reviewedAt: new Date() });

// await walletService.creditToWallet(
//   payoutRequest.hostRef,
//   netAmount,
//   'HOST_PAYOUT',
//   'PAYOUT_REQUEST',
//   payoutRequest._id,
//   `Payout for event: ${event.title}`
// );
// Commission stays in your Razorpay account — just record it in PayoutRequest fields




// C) Cashback for 5-star review:
// const CASHBACK_AMOUNT = 50; // configurable
// await walletService.creditToWallet(userId, CASHBACK_AMOUNT, 'CASHBACK', 'REVIEW', review._id, '5-star review reward');



// D) Referral credit:
// await walletService.creditToWallet(referrerId, REFERRAL_AMOUNT, 'REFERRAL_CREDIT', null, null, `Referral: ${newUser.name} joined`);



// E) Host bank withdrawal — triggers Razorpay Payouts API:
// Debit wallet first, then call Razorpay Payouts
// await walletService.debitFromWallet(hostId, amount, 'WITHDRAWAL', 'WITHDRAWAL_REQUEST', withdrawalRequest._id, 'Bank withdrawal');
// const rzpPayout = await razorpay.payouts.create({ account_number, amount: amount * 100, currency: 'INR', mode: 'IMPS', ... });
// await withdrawalRequest.updateOne({ status: 'PROCESSING', razorpayPayoutId: rzpPayout.id });
// Razorpay webhook confirms COMPLETED or FAILED
// On FAILED: credit back the amount to wallet




// ---

// ## 4. API endpoints

// GET    /api/wallet                    → balance + last 10 transactions
// GET    /api/wallet/transactions       → paginated full history (filter by type/direction)

// POST   /api/payouts/request           → host submits payout for an event
// GET    /api/payouts/my                → host's payout request history
// GET    /api/admin/payouts             → admin views all pending payout requests
// PUT    /api/admin/payouts/:id/approve → admin releases to host wallet
// PUT    /api/admin/payouts/:id/reject  → admin rejects with reason

// POST   /api/wallet/withdraw           → host requests bank withdrawal
// GET    /api/wallet/withdrawals        → host's withdrawal history