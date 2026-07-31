// backend/src/mappers/platformSettings.mapper.ts

import { OperationalSettingsResponseDTO, PublicTermsResponseDTO } from '@/dtos/settings.dto';
import { OperationalSettingsEntity, PlatformSettingsEntity, TermsSettingsEntity } from '@/entities/platformSettings.entity';
import { IPlatformSettingsModel } from '@/types/platformSettings.types';


// MODEL TO ENTITY --------------------------------------------------------------

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

        generalTerms               : model.generalTerms || [],
        bookingTerms               : model.bookingTerms || [],
        cancellationTerms          : model.cancellationTerms || [],
        hostTerms                  : model.hostTerms || [],
        reviewTerms                : model.reviewTerms || [],
            
        updatedBy               : model.updatedBy?.toString(),
        updatedAt               : model.updatedAt,
    };
}





// DOMAIN EXTRACTION -----------------------------------------------------------

// domain object for internal services (e.g., BookingService, EventService, Refund Calculator etc).
export function extractOperationalSettings(
    entity: PlatformSettingsEntity
): OperationalSettingsEntity {
    return {
        commissionPercent          : entity.commissionPercent,
        refundTier1Hours           : entity.refundTier1Hours,
        refundTier2Hours           : entity.refundTier2Hours,
        refundTier1Percent         : entity.refundTier1Percent,
        refundTier2Percent         : entity.refundTier2Percent,
        refundTier3Percent         : entity.refundTier3Percent,
        gracePeriodHours           : entity.gracePeriodHours,
        gracePeriodRefundPercent   : entity.gracePeriodRefundPercent,
        minPayoutAttendancePercent : entity.minPayoutAttendancePercent,
    };
}


// legal domain object for internal AI/Vector services (e.g., FaqIngestionService).
export function extractTermsSettings(
    entity: PlatformSettingsEntity
): TermsSettingsEntity {
    return {
        generalTerms      : entity.generalTerms,
        bookingTerms      : entity.bookingTerms,
        cancellationTerms : entity.cancellationTerms,
        hostTerms         : entity.hostTerms,
        reviewTerms       : entity.reviewTerms,
    };
}





// ENTITY to RESPONSE DTO --------------------------------------------------------------

export function mapEntityToOperationalDTO(
    entity: PlatformSettingsEntity
): OperationalSettingsResponseDTO {
    return {
        commissionPercent          : entity.commissionPercent,
        refundTier1Hours           : entity.refundTier1Hours,
        refundTier2Hours           : entity.refundTier2Hours,
        refundTier1Percent         : entity.refundTier1Percent,
        refundTier2Percent         : entity.refundTier2Percent,
        refundTier3Percent         : entity.refundTier3Percent,
        gracePeriodHours           : entity.gracePeriodHours,
        gracePeriodRefundPercent   : entity.gracePeriodRefundPercent,
        minPayoutAttendancePercent : entity.minPayoutAttendancePercent,
    };
}



export function mapEntityToPublicTermsDTO(
    entity: PlatformSettingsEntity
): PublicTermsResponseDTO {
    return {
        generalTerms               : entity.generalTerms,
        bookingTerms               : entity.bookingTerms,
        cancellationTerms          : entity.cancellationTerms,
        hostTerms                  : entity.hostTerms,
        reviewTerms                : entity.reviewTerms,
    };
}