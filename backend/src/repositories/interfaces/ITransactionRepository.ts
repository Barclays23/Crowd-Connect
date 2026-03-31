// backend/src/repositories/interfaces/ITransactionRepository.ts

import { Types } from "mongoose";
import { TransactionsFilterQuery } from "@/types/wallet.types";
import { CreateTransactionInput, TransactionEntity } from "@/entities/transaction.entity";



export interface ITransactionRepository {
   createTransaction(transactionInput: CreateTransactionInput): Promise<TransactionEntity>;

   findTransactions(filters: TransactionsFilterQuery): Promise<TransactionEntity[]>;
   countTransactions(filters: TransactionsFilterQuery): Promise<number>;

   findRecentTxnByUserId(userId: string | Types.ObjectId, limit: number): Promise<TransactionEntity[]>;
}