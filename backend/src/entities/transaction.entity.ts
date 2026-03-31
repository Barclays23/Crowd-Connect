// backend/src/entities/transaction.entity.ts

import { 
    TRANSACTION_DIRECTION, 
    TRANSACTION_REFERENCE_TYPE, 
    TRANSACTION_STATUS, 
    TRANSACTION_TYPE 
} from "@/types/wallet.types";
import { Types } from "mongoose";




export interface TransactionEntity {
  transactionId  : string;
  userRef        : string;
  transactionType: TRANSACTION_TYPE;
  direction      : TRANSACTION_DIRECTION;
  amount         : number;
  balanceAfter   : number;
  status         : TRANSACTION_STATUS;
  referenceType ?: TRANSACTION_REFERENCE_TYPE;
  referenceId   ?: string;
  description   ?: string;
  metadata      ?: Record<string, unknown>;
  createdAt      : Date;
  updatedAt      : Date;
}



export interface CreateTransactionInput {
  userRef        : Types.ObjectId;
  transactionType: TRANSACTION_TYPE;
  direction      : TRANSACTION_DIRECTION;
  amount         : number;
  balanceAfter   : number;
  status         : TRANSACTION_STATUS;
  referenceType ?: TRANSACTION_REFERENCE_TYPE;
  referenceId   ?: Types.ObjectId;
  description   ?: string;
  metadata      ?: Record<string, unknown>;
}