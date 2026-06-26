// backend/src/types/payout.types.ts

import { PayoutRequestStatus } from "@/constants/payout.constants";
import { IPopulatedUserFromTransaction } from "@/types/wallet.types";
import { Types } from "mongoose";




export interface IPayoutRequestModel {
  _id              : Types.ObjectId;
  eventRef         : Types.ObjectId;               // ref: Event — required
  hostRef          : Types.ObjectId;               // ref: User — indexed

  eventTitle       : string;  // need this? it can take from eventRef i think  // Needed for UI display
  hostName         : string;  // why this need? it can get from userref i think   // Needed for UI display
  ticketsSold      : number;  // need this? it can take from eventRef i think   // Snapshot of sales
  checkedInCount   : number;

  grossAmount      : number;                       // total collected ticket revenue for the event
  commissionRate   : number;                       // percentage - e.g. 0.10 for 10%
  commissionAmount : number;                       // grossAmount × commissionRate %
  netAmount        : number;                       // grossAmount − commissionAmount → released to host wallet
  
  status           : PayoutRequestStatus;
  requestedAt      : Date;
  reviewedAt      ?: Date;
  reviewedBy      ?: Types.ObjectId;               // ref: User (admin who processed)
  rejectionReason ?: string;
  notes           ?: string;                       // internal admin notes
  proofUrls        : string[];
  
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








// DB Input Types ─────────────────────────────────────────

export interface CreatePayoutInput {
  eventRef        : string;
  hostRef         : string;
  eventTitle      : string;
  hostName        : string;
  grossAmount     : number;
  commissionRate  : number;
  commissionAmount: number;
  netAmount       : number;
  ticketsSold     : number;
  checkedInCount  : number;
  status          : PayoutRequestStatus;
  proofUrls       : string[];
  requestedAt     : Date;
}


// Admin approves/rejects
export interface ReviewPayoutInput {
  action          : "approve" | "reject";
  rejectionReason?: string;
  notes          ?: string;
}



export interface UpdatePayoutInput {
  status?           : PayoutRequestStatus;
  reviewedBy?       : string;
  reviewedAt?       : Date;
  rejectionReason?  : string;
  notes?            : string;
}






// Query / Filter Types ─────────────────────────────────────────

export type PayoutFilterQuery = Partial<IPayoutRequestModel> & Record<string, unknown>;

export interface GetPayoutsFilter {
  page        : number;
  limit       : number;
  sortBy?     : string;
  sortOrder?  : "asc" | "desc";
  status?     : string;
  search?     : string;
  hostId?     : string;
}