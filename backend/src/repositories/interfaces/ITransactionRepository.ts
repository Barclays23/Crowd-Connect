// backend/src/repositories/interfaces/ITransactionRepository.ts

import { ClientSession, Types } from "mongoose";
import { TransactionsFilterQuery } from "@/types/wallet.types";
import { CreateTransactionInput, TransactionEntity } from "@/entities/transaction.entity";



export interface ITransactionRepository {
   createTransaction(
      transactionInput: CreateTransactionInput, 
      options?: { session?: ClientSession }
   ): Promise<TransactionEntity>;

   findTransactions(filters: TransactionsFilterQuery): Promise<TransactionEntity[]>;
   countTransactions(filters: TransactionsFilterQuery): Promise<number>;

   findRecentTxnByUserId(userId: string | Types.ObjectId, limit: number): Promise<TransactionEntity[]>;

   startSession(): Promise<ClientSession>;
}