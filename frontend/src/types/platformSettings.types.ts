// frontend/src/types/platformSettings.types.ts
export interface IPlatformSettings {
    commissionPercent           : number;

    refundTier1Hours            : number;
    refundTier2Hours            : number;
    
    refundTier1Percent          : number;
    refundTier2Percent          : number;
    refundTier3Percent          : number;
    
    gracePeriodHours            : number;
    gracePeriodRefundPercent    : number;

    minPayoutAttendancePercent  : number;

    // TERMS & CONDITIONS
    generalTerms?               : string[];
    bookingTerms?               : string[];
    hostTerms?                  : string[];
    cancellationTerms?          : string[];
    reviewTerms?                : string[];
}


export type ITermsAndConditions = Pick<
    IPlatformSettings,
    "generalTerms" | "bookingTerms" | "hostTerms" | "cancellationTerms" | "reviewTerms"
>;



export type IOperationalSettings = Omit<
    IPlatformSettings,
    "generalTerms" | "bookingTerms" | "hostTerms" | "cancellationTerms" | "reviewTerms"
>;