// backend/src/entities/platformSettings.entity.ts

export interface PlatformSettingsEntity {
    settingsId            : string;
    
    commissionPercent     : number;
    refundTier1Hours      : number;
    refundTier2Hours      : number;

    refundTier1Percent    : number;
    refundTier2Percent    : number;
    refundTier3Percent    : number;

    gracePeriodHours      : number;
    gracePeriodRefundPercent: number;

    updatedBy?            : string;
    updatedAt?            : Date;
}