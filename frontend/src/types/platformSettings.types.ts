// frontend/src/types/platformSettings.types.ts
export interface IPlatformSettings {
    commissionPercent       : number;

    refundTier1Hours        : number;
    refundTier2Hours        : number;
    
    refundTier1Percent      : number;
    refundTier2Percent      : number;
    refundTier3Percent      : number;
    
    gracePeriodHours        : number;
    gracePeriodRefundPercent: number;
}


export interface SettingsResponse {
    success: boolean;
    message: string;
    settingsData: IPlatformSettings;
}
