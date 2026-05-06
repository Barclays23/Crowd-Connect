// backend/src/models/platformSettings.model.ts
import mongoose, { Document, Model, model, Schema } from 'mongoose';



// move this interface to platform-settings.types.ts
export interface IPlatformSettingsModel extends Document {
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

  createdAt : Date;
  updatedAt : Date;
  updatedBy?                : mongoose.Types.ObjectId;
}



const platformSettingsSchema = new Schema<IPlatformSettingsModel>(
  {
    commissionPercent       : { type: Number, required: true, default: 10,  min: 0, max: 100 },

    refundTier1Hours        : { type: Number, required: true, default: 48,  min: 0 },
    refundTier2Hours        : { type: Number, required: true, default: 24,  min: 0 },

    refundTier1Percent      : { type: Number, required: true, default: 100, min: 0, max: 100 },
    refundTier2Percent      : { type: Number, required: true, default: 50,  min: 0, max: 100 },
    refundTier3Percent      : { type: Number, required: true, default: 25,  min: 0, max: 100 },

    gracePeriodHours        : { type: Number, required: true, default: 48,  min: 0 },
    gracePeriodRefundPercent: { type: Number, required: true, default: 100, min: 0, max: 100 },

    updatedBy               : { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);



export const PlatformSettingsModel: Model<IPlatformSettingsModel> = model<IPlatformSettingsModel>(
  'PlatformSettings',
  platformSettingsSchema
);