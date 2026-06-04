// backend/src/mappers/platformSettings.mapper.ts

import { PlatformSettingsEntity } from '@/entities/platformSettings.entity';
import { IPlatformSettingsModel } from '@/types/platformSettings.types';




export function mapSettingsModelToEntity(
    model: IPlatformSettingsModel
): PlatformSettingsEntity {
    return {
        settingsId              : model._id.toString(),

        commissionPercent       : model.commissionPercent,

        refundTier1Hours        : model.refundTier1Hours,
        refundTier2Hours        : model.refundTier2Hours,
        
        refundTier1Percent      : model.refundTier1Percent,
        refundTier2Percent      : model.refundTier2Percent,
        refundTier3Percent      : model.refundTier3Percent,
        
        gracePeriodHours        : model.gracePeriodHours,
        gracePeriodRefundPercent: model.gracePeriodRefundPercent,

        minPayoutAttendancePercent: model.minPayoutAttendancePercent,
        
        updatedBy               : model.updatedBy?.toString(),
        updatedAt               : model.updatedAt,
    };
}