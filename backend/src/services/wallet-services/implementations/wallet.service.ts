// backend/src/services/wallet-services/implementations/wallet.service.ts
import { ClientSession } from "mongoose";
import { IWalletService } from "@/services/wallet-services/interfaces/IWalletService";
import { IUserRepository } from "@/repositories/interfaces/IUserRepository";
import { ITransactionRepository } from "@/repositories/interfaces/ITransactionRepository";

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
import { createHttpError } from "@/utils/httpError.utils";
import { HTTP_STATUS } from "@/constants/http-status.constants";
import { USER_MESSAGES, WALLET_MESSAGES } from "@/constants/messages.constants";
import { 
   mapToCreateTransactionInput, 
   mapTransactionEntityToResponseDTO 
} from "@/mappers/wallet.mapper";
import { UserEntity } from "@/entities/user.entity";
import { TransactionEntity } from "@/entities/transaction.entity";
import { TRANSACTION_DIRECTIONS } from "@/constants/transaction.constants";





export class WalletService implements IWalletService {

   constructor(
      private _userRepository            : IUserRepository,
      private _transactionRepository     : ITransactionRepository,
   ) {}


   // ─── Core Wallet Mutations ───────────────────────────────────────────────────

   async creditToWallet(creditInput: WalletCreditInput, options: { session?: ClientSession } = {}): Promise<number> {
      const { userId, amount} = creditInput;
      const { session } = options;

      const newBalance: number | null = await this._userRepository.incrementWalletBalance(userId, amount, { session });

      if (newBalance === null) {
         throw createHttpError(HTTP_STATUS.NOT_FOUND, USER_MESSAGES.USER_NOT_FOUND)
      }

      const transactionInput = mapToCreateTransactionInput(
         creditInput, 
         TRANSACTION_DIRECTIONS.CREDIT, 
         newBalance
      );

      await this._transactionRepository.createTransaction(transactionInput, { session });
      
      return newBalance;

   }


   async debitFromWallet(debitInput: WalletDebitInput, options: { session?: ClientSession } = {}): Promise<number> {
      const { userId, amount } = debitInput;
      const { session } = options;

      const newBalance = await this._userRepository.decrementWalletBalance(userId, amount, { session });
      if (newBalance === null) {
         throw createHttpError(HTTP_STATUS.BAD_REQUEST, WALLET_MESSAGES.INSUFFICIENT_WALLET_BALANCE);
      }

      const transactionInput = mapToCreateTransactionInput(
         debitInput, 
         TRANSACTION_DIRECTIONS.DEBIT, 
         newBalance
      );

      await this._transactionRepository.createTransaction(transactionInput, { session });

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
      if (!user) throw createHttpError(HTTP_STATUS.NOT_FOUND, USER_MESSAGES.USER_NOT_FOUND);

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
            totalCount  : totalCount,
            limit       : filters.limit,
            currentPage : filters.page,
            totalPages  : Math.ceil(totalCount / filters.limit)
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





// D) Referral credit:
// await walletService.creditToWallet(referrerId, REFERRAL_AMOUNT, 'REFERRAL_CREDIT', null, null, `Referral: ${newUser.name} joined`);
