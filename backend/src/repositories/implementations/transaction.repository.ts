// backend/src/repositories/implementations/transaction.repository.ts

import { Types } from "mongoose";
import { ITransactionRepository } from "@/repositories/interfaces/ITransactionRepository";
import { CreateTransactionInput, TransactionEntity } from "@/entities/transaction.entity";
import { TransactionsFilterQuery, ITransactionModel } from "@/types/wallet.types";
import Transaction from "@/models/implementations/walletTransaction.model";
import { BaseRepository } from "@/repositories/base.repository";
import { mapTransactionModelToEntity } from "@/mappers/wallet.mapper";



export class TransactionRepository extends BaseRepository<ITransactionModel> implements ITransactionRepository {

   constructor() {
      super(Transaction)
      this.model = Transaction;
   }


   async createTransaction(createInput: CreateTransactionInput): Promise<TransactionEntity> {
      const transactionDoc = await this.createOne(createInput);
      return mapTransactionModelToEntity(transactionDoc);
   }


   async findTransactions(filters : TransactionsFilterQuery): Promise<TransactionEntity[]> {
      const query     = this.buildQuery(filters);

      const sortField = filters.sortBy === "amount" ? "amount" : "createdAt";
      const sort      = { [sortField]: filters.sortOrder === "asc" ? 1 : -1 } as Record<string, 1 | -1>;
      const skip      = (filters.page - 1) * filters.limit;

      const docs = await this
         .findMany(query)
         .sort(sort)
         .skip(skip)
         .limit(filters.limit)
         .lean();

      return docs.map(mapTransactionModelToEntity);
   }


   async countTransactions(filters: TransactionsFilterQuery): Promise<number> {
      const query = this.buildQuery(filters);
      return this.countDocuments(query);
   }


   async findRecentTxnByUserId(
      userId : string | Types.ObjectId,
      limit  : number,
   ): Promise<TransactionEntity[]> {
      const docs = await this
         .findMany({ userRef: new Types.ObjectId(userId.toString()) })
         .sort({ createdAt: -1 })
         .limit(limit)
         .lean();

      return docs.map(mapTransactionModelToEntity);
   }




   private buildQuery(filters: TransactionsFilterQuery): Record<string, unknown> {
      const query: Record<string, unknown> = {};

      if (filters.userId)    query.userRef          = new Types.ObjectId(filters.userId.toString());
      if (filters.direction) query.direction        = filters.direction;
      if (filters.type)      query.transactionType  = filters.type;
      if (filters.status)    query.status           = filters.status;

      if (filters.startDate || filters.endDate) {
         const dateRange: Record<string, Date> = {};
         if (filters.startDate) dateRange.$gte = new Date(filters.startDate);
         if (filters.endDate)   dateRange.$lte = new Date(new Date(filters.endDate).setHours(23, 59, 59, 999));
         query.createdAt = dateRange;
      }

      return query;
   }
}