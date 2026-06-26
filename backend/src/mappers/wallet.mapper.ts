// backend/src/mappers/wallet.mapper.ts

import { 
    ITransactionModel, 
    TransactionsFilterQuery, 
    WalletCreditInput, 
    WalletDebitInput 
} from "@/types/wallet.types";
import { CreateTransactionInput, TransactionEntity } from "@/entities/transaction.entity";
import { TransactionResponseDTO } from "@/dtos/wallet.dto";
import { Types } from "mongoose";
import { Request } from "express";
import { TRANSACTION_STATUSES, TransactionDirection, TransactionStatus, TransactionType } from "@/constants/transaction.constants";





// HTTP Request → DTO / FILTER  (used in Controller)
export function mapTransactionQueryToFilter(req: Request) {

    const filters: TransactionsFilterQuery = {
       userId    : req.user!.userId,
       page      : parseInt(req.query.page as string)  || 1,
       limit     : parseInt(req.query.limit as string) || 10,
       sortBy    : (req.query.sortBy    as "createdAt" | "amount") || "createdAt",
       sortOrder : (req.query.sortOrder as "asc" | "desc") || "desc",
       ...(req.query.direction  && { direction : req.query.direction  as TransactionDirection }),
       ...(req.query.type       && { transactionType : req.query.type as TransactionType }),
       ...(req.query.status     && { status    : req.query.status     as TransactionStatus }),
       ...(req.query.startDate  && { startDate : req.query.startDate  as string }),
       ...(req.query.endDate    && { endDate   : req.query.endDate    as string }),
    };

    return filters;
}




// DB Model → Entity  (used in TransactionRepository)
export function mapTransactionModelToEntity(doc: ITransactionModel): TransactionEntity {
  return {
    transactionId  : doc._id.toString(),
    userRef        : doc.userRef.toString(),
    transactionType: doc.transactionType,
    direction      : doc.direction,
    amount         : doc.amount,
    balanceAfter   : doc.balanceAfter,
    status         : doc.status,
    referenceType  : doc.referenceType,
    referenceId    : doc.referenceId?.toString(),
    description    : doc.description,
    metadata       : doc.metadata,
    createdAt      : doc.createdAt,
    updatedAt      : doc.updatedAt,
  };
}


// Entity → DTO  (used in WalletService)
export function mapTransactionEntityToResponseDTO(entity: TransactionEntity): TransactionResponseDTO {
  return {
    transactionId: entity.transactionId,
    type         : entity.transactionType,
    direction    : entity.direction,
    amount       : entity.amount,
    balanceAfter : entity.balanceAfter,
    status       : entity.status,
    referenceType: entity.referenceType,
    referenceId  : entity.referenceId,
    description  : entity.description,
    createdAt    : entity.createdAt.toISOString(),
  };
}




export function mapToCreateTransactionInput(
    input: WalletCreditInput | WalletDebitInput,
    direction: TransactionDirection,
    newBalance: number
): CreateTransactionInput {
    return {
        userRef: new Types.ObjectId(input.userId.toString()),
        transactionType: input.transactionType,
        direction,
        amount: input.amount,
        balanceAfter : newBalance,
        status: TRANSACTION_STATUSES.COMPLETED,
        referenceType: input.referenceType,
        referenceId: input.referenceId 
            ? new Types.ObjectId(input.referenceId.toString()) 
            : undefined,
        description: input.description,
        metadata: input.metadata,
    };
}