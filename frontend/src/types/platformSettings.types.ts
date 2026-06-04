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

    generalTerms?               : string[];
    bookingTerms?               : string[];
    hostTerms?                  : string[];
    cancellationTerms?          : string[];
    reviewTerms?                : string[];
}


export type PolicyKey = "generalTerms" | "bookingTerms" | "cancellationTerms" | "hostTerms" | "reviewTerms";


export const POLICY_SECTIONS: { key: PolicyKey; title: string; desc: string }[] = [
    { key: "generalTerms", title: "General Platform Terms", desc: "Rules for all users utilizing CrowdConnect." },
    { key: "bookingTerms", title: "Booking & Ticketing Terms", desc: "Agreements presented during checkout." },
    { key: "cancellationTerms", title: "Cancellation & Refunds", desc: "Rules outlining grace periods and refunds." },
    { key: "hostTerms", title: "Host Agreement", desc: "Terms hosts agree to when creating events and requesting payouts." },
    { key: "reviewTerms", title: "Review Guidelines", desc: "Community standards for posting ratings." },
];


export interface SettingsResponse {
    success: boolean;
    message: string;
    settingsData: IPlatformSettings;
}
