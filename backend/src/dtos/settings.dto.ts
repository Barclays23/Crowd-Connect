// backend/src/dtos/settings.dto.ts

// REQUESTS ------------------------------------------------------

export interface UpdateOperationalSettingsDTO {
  commissionPercent?: number;
  refundTier1Hours?: number;
  refundTier2Hours?: number;
  refundTier1Percent?: number;
  refundTier2Percent?: number;
  refundTier3Percent?: number;
  gracePeriodHours?: number;
  gracePeriodRefundPercent?: number;
  minPayoutAttendancePercent?: number;
}

export interface UpdateTermsDTO {
  generalTerms?: string[];
  bookingTerms?: string[];
  cancellationTerms?: string[];
  hostTerms?: string[];
  reviewTerms?: string[];
}




// RESPONSES ------------------------------------------------------

export interface PublicTermsResponseDTO {
  generalTerms: string[];
  bookingTerms: string[];
  cancellationTerms: string[];
  hostTerms: string[];
  reviewTerms: string[];
}



export interface OperationalSettingsResponseDTO {
    commissionPercent: number;
    refundTier1Hours: number;
    refundTier2Hours: number;
    refundTier1Percent: number;
    refundTier2Percent: number;
    refundTier3Percent: number;
    gracePeriodHours: number;
    gracePeriodRefundPercent: number;
    minPayoutAttendancePercent: number;
}

