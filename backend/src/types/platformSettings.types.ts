// backend/src/types/platformSettings.types.ts

import { Document, Types } from "mongoose";

export interface IPlatformSettingsModel extends Document {
  _id                       : Types.ObjectId;

  commissionPercent         : number;

  // Refund time cutoffs (hours before event start)
  refundTier1Hours          : number;    // default: 48  → full refund above this
  refundTier2Hours          : number;    // default: 24  → partial refund between tier2 and tier1

  // Refund percentages
  refundTier1Percent        : number;  // default: 100 (>= 48h)
  refundTier2Percent        : number;  // default: 50  (24h–48h)
  refundTier3Percent        : number;  // default: 25  (<24h but before event)

  // Grace period for major event changes
  gracePeriodHours          : number;    // default: 48
  gracePeriodRefundPercent  : number; // default: 100

  minPayoutAttendancePercent: number;

  generalTerms              : string[];
  bookingTerms              : string[];
  cancellationTerms         : string[];
  hostTerms                 : string[];
  reviewTerms               : string[];

  createdAt                 : Date;
  updatedAt                 : Date;
  updatedBy?                : Types.ObjectId;
}
