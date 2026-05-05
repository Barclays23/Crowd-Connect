// backend/src/types/payout.types.ts

import { IPopulatedUserFromTransaction } from "@/types/wallet.types";
import { Types } from "mongoose";


export enum PAYOUT_REQUEST_STATUS {
  PENDING  = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  PAID     = "PAID",
}



export interface IPayoutRequestModel {
  _id              : Types.ObjectId;
  eventRef         : Types.ObjectId;               // ref: Event — required
  hostRef          : Types.ObjectId;               // ref: User — indexed
  grossAmount      : number;                       // total collected ticket revenue for the event
  commissionRate   : number;                       // e.g. 0.10 for 10%
  commissionAmount : number;                       // grossAmount × commissionRate
  netAmount        : number;                       // grossAmount − commissionAmount → released to host wallet
  status           : PAYOUT_REQUEST_STATUS;
  requestedAt      : Date;
  reviewedBy      ?: Types.ObjectId;               // ref: User (admin who processed)
  reviewedAt      ?: Date;
  rejectionReason ?: string;
  notes           ?: string;                       // internal admin notes
  createdAt        : Date;
  updatedAt        : Date;
}



export interface IPopulatedEventFromPayout {
  _id   : Types.ObjectId;
  title : string;
}




// Populated variants (for service responses) ─────────────────────────────────────────

export type IPayoutRequestPopulated = Omit<IPayoutRequestModel, "hostRef" | "eventRef"> & {
  hostRef  : IPopulatedUserFromTransaction;
  eventRef : IPopulatedEventFromPayout;
};



// Input Types ─────────────────────────────────────────

// Host submits payout request
export interface CreatePayoutRequestInput {
  eventRef  : Types.ObjectId | string;
  hostRef   : Types.ObjectId | string;
  grossAmount: number;
}


// Admin approves/rejects
export interface ReviewPayoutRequestInput {
  payoutRequestId : string;
  adminId         : Types.ObjectId | string;
  decision        : "approve" | "reject";
  rejectionReason?: string;
  notes          ?: string;
}



// Query / Filter Types ─────────────────────────────────────────

export interface GetPayoutRequestsFilter {
  page     : number;
  limit    : number;
  status  ?: PAYOUT_REQUEST_STATUS;
  hostRef ?: string;                  // admin filtering by host
}