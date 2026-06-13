// src/models/implementations/walletTransaction.model.ts

import { model, Model, Schema } from "mongoose";
import { 
   ITransactionModel, 
   TRANSACTION_DIRECTION, 
   TRANSACTION_REFERENCE_TYPE, 
   TRANSACTION_STATUS, 
   TRANSACTION_TYPE 
} from "@/types/wallet.types";



const transactionSchema = new Schema<ITransactionModel>({
   userRef: { 
      type: Schema.Types.ObjectId,
      ref: 'User', 
      required: true, 
      index: true 
   },
   transactionType: {
      type: String,
      enum: TRANSACTION_TYPE,
      required: true
   },
   direction: { 
      type: String, 
      enum: TRANSACTION_DIRECTION, 
      required: true 
   },
   amount: { 
      type: Number, 
      required: true, 
      min: 0 
   },
   balanceAfter:  { 
      type: Number, 
      required: true 
   },     // snapshot after this txn
   status:        { 
      type: String, 
      enum: TRANSACTION_STATUS,
      default: TRANSACTION_STATUS.COMPLETED
   },
   referenceType: { 
      type: String, 
      enum: TRANSACTION_REFERENCE_TYPE
   },
   referenceId:   { 
      type: Schema.Types.ObjectId,
   },
   description:   { 
      type: String 
   },
   metadata:      { 
      type: Schema.Types.Mixed 
   },          // razorpayRefundId, etc.

},
{ 
   timestamps: true 
}
);


// userRef: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
// Add compound index for common queries:
// { userRef: 1, createdAt: -1 }


const Transaction: Model<ITransactionModel> = model<ITransactionModel>("Transaction", transactionSchema);
export default Transaction;