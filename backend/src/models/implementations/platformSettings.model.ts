// backend/src/models/platformSettings.model.ts
import { Model, model, Schema } from 'mongoose';
import { IPlatformSettingsModel } from '@/types/platformSettings.types';




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

    minPayoutAttendancePercent: { type: Number, default: 30, min: 0, max: 100 },

    generalTerms            : { type: [String], default: [] },
    bookingTerms            : { type: [String], default: [] },
    hostTerms               : { type: [String], default: [] },
    cancellationTerms       : { type: [String], default: [] },
    reviewTerms             : { type: [String], default: [] },

    updatedBy               : { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);



export const PlatformSettingsModel: Model<IPlatformSettingsModel> = model<IPlatformSettingsModel>(
  'PlatformSettings',
  platformSettingsSchema
);