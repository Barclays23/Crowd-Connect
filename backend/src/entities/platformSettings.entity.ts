// backend/src/entities/platformSettings.entity.ts

export interface PlatformSettingsEntity {
    settingsId            : string;
    
    // Operational Numberic Settings
    commissionPercent     : number;
    refundTier1Hours      : number;
    refundTier2Hours      : number;

    refundTier1Percent    : number;
    refundTier2Percent    : number;
    refundTier3Percent    : number;

    gracePeriodHours      : number;
    gracePeriodRefundPercent: number;

    minPayoutAttendancePercent: number;

    // Terms & Conditions
    generalTerms               : string[];
    bookingTerms               : string[];
    cancellationTerms          : string[];
    hostTerms                  : string[];
    reviewTerms                : string[];

    updatedBy?            : string;
    updatedAt?            : Date;
}




// Entity for Booking, Events & Financial Logic
export type OperationalSettingsEntity = Pick<
  PlatformSettingsEntity,
  | "commissionPercent"
  | "refundTier1Hours"
  | "refundTier2Hours"
  | "refundTier1Percent"
  | "refundTier2Percent"
  | "refundTier3Percent"
  | "gracePeriodHours"
  | "gracePeriodRefundPercent"
  | "minPayoutAttendancePercent"
>;




// Entity for AI & Chatbot Logic
export type TermsSettingsEntity = Pick<
    PlatformSettingsEntity,
    | "generalTerms"
    | "bookingTerms"
    | "cancellationTerms"
    | "hostTerms"
    | "reviewTerms"
>;