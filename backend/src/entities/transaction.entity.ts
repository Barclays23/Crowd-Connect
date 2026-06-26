// backend/src/entities/transaction.entity.ts
import { TransactionDirection, TransactionReferenceType, TransactionStatus, TransactionType } from "@/constants/transaction.constants";
import { Types } from "mongoose";




export interface TransactionEntity {
  transactionId  : string;
  userRef        : string;
  transactionType: TransactionType;
  direction      : TransactionDirection;
  amount         : number;
  balanceAfter   : number;
  status         : TransactionStatus;
  referenceType ?: TransactionReferenceType;
  referenceId   ?: string;
  description   ?: string;
  metadata      ?: Record<string, unknown>;
  createdAt      : Date;
  updatedAt      : Date;
}



export interface CreateTransactionInput {
  userRef        : Types.ObjectId;
  transactionType: TransactionType;
  direction      : TransactionDirection;
  amount         : number;
  balanceAfter   : number;
  status         : TransactionStatus;
  referenceType ?: TransactionReferenceType;
  referenceId   ?: Types.ObjectId;
  description   ?: string;
  metadata      ?: Record<string, unknown>;
}