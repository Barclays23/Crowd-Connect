// backend/src/services/platformSettings-services/implementations/platformSettings.service.ts
import { IPlatformSettingsRepository } from '@/repositories/interfaces/IPlatformSettingsRepository';
import { IPlatformSettingsService } from '../interfaces/IPlatformSettingsService';
import { OperationalSettingsEntity, PlatformSettingsEntity, TermsSettingsEntity } from '@/entities/platformSettings.entity';
import { createHttpError } from '@/utils/httpError.utils';
import { HTTP_STATUS } from '@/constants/http-status.constants';
import { 
    OperationalSettingsResponseDTO,
    PublicTermsResponseDTO, 
    UpdateOperationalSettingsDTO, 
    UpdateTermsDTO 
} from '@/dtos/settings.dto';
import { FaqIngestionService } from '@/services/chat-services/implementations/faqIngestion.service';
import { 
    extractOperationalSettings, 
    extractTermsSettings, 
    mapEntityToOperationalDTO, 
    mapEntityToPublicTermsDTO 
} from '@/mappers/platformSettings.mapper';
import { SEED_TERMS_DATA } from '@/constants/termAndConditions.constants';



export class PlatformSettingsService implements IPlatformSettingsService {
    constructor(
        private readonly _settingsRepo: IPlatformSettingsRepository,
        private readonly _faqIngestionService: FaqIngestionService
    ) {}


    async getOperationalSettings(): Promise<OperationalSettingsResponseDTO> {
        const settings: PlatformSettingsEntity = await this._settingsRepo.getSettings();

        const operationalSettings = mapEntityToOperationalDTO(settings);

        return operationalSettings;
    }


    async getTermsAndConditions(): Promise<PublicTermsResponseDTO> {
        const settings: PlatformSettingsEntity = await this._settingsRepo.getSettings();

        const termsSettings: PublicTermsResponseDTO = mapEntityToPublicTermsDTO(settings);

        return termsSettings;
    }


    async getOperationalSettingsDomain(): Promise<OperationalSettingsEntity> {
        const settings: PlatformSettingsEntity = await this._settingsRepo.getSettings();
        return extractOperationalSettings(settings);
    }


    async updateOperationalSettings(updateData: UpdateOperationalSettingsDTO, adminId: string): Promise<PlatformSettingsEntity> {
        this._validateOperationalSettings(updateData);

        const updatedSettings: Promise<PlatformSettingsEntity> = this._settingsRepo.updateSettings(updateData, adminId);

        return updatedSettings;
    }



    async updateTermsAndConditions(termsData: UpdateTermsDTO, adminId: string): Promise<PlatformSettingsEntity> {
        // TODO: REMOVE THIS LINE IMMEDIATELY AFTER SEEDING IS DONE!
        // const temporarySeedData = SEED_TERMS_DATA;

        // Save standard settings to database
        const updatedSettings: PlatformSettingsEntity = await this._settingsRepo.updateSettings(
            termsData,
            // temporarySeedData,
            adminId
        );

        // Trigger the AI Vector ingestion asynchronously
        const domainTerms: TermsSettingsEntity = extractTermsSettings(updatedSettings);

        // Synchronize Vector DB in background (does not block HTTP response)
        this._faqIngestionService
            .reindexTermsKnowledgeBase(domainTerms)
            .catch((error: unknown) => {
                console.error("[PlatformSettingsService] Vector re-indexing ingestion failed in background:", error);
            });

        return updatedSettings;
    }



    private _validateOperationalSettings(data: UpdateOperationalSettingsDTO): void {
        if (data.commissionPercent !== undefined) {
            if (data.commissionPercent < 0 || data.commissionPercent > 100) {
                throw createHttpError(HTTP_STATUS.BAD_REQUEST, 'Commission must be between 0 and 100');
            }
        }

        if (data.refundTier1Hours !== undefined && data.refundTier2Hours !== undefined) {
            if (data.refundTier1Hours <= data.refundTier2Hours) {
                throw createHttpError(
                    HTTP_STATUS.BAD_REQUEST,
                    `Tier 1 cutoff (${data.refundTier1Hours}h) must be greater than Tier 2 cutoff (${data.refundTier2Hours}h)`
                );
            }
        }

        // where is admin commission percent??
        const percentFields = [
            'refundTier1Percent', 
            'refundTier2Percent', 
            'refundTier3Percent', 
            'gracePeriodRefundPercent'
        ] as const;

        for (const field of percentFields) {
            const val = data[field];
            if (val !== undefined && (val < 0 || val > 100)) {
                throw createHttpError(HTTP_STATUS.BAD_REQUEST, `${field} must be between 0 and 100`);
            }
        }

        if (data.refundTier1Percent !== undefined && data.refundTier2Percent !== undefined) {
            if (data.refundTier1Percent < data.refundTier2Percent) {
                throw createHttpError(
                    HTTP_STATUS.BAD_REQUEST,
                    'Tier 1 refund % should be >= Tier 2 refund %'
                );
            }
        }

        if (data.refundTier2Percent !== undefined && data.refundTier3Percent !== undefined) {
            if (data.refundTier2Percent < data.refundTier3Percent) {
                throw createHttpError(
                    HTTP_STATUS.BAD_REQUEST,
                    'Tier 2 refund % should be >= Tier 3 refund %'
                );
            }
        }
    }



    private _validateTerms(data: UpdateTermsDTO): void {
        const termKeys = ['generalTerms', 'bookingTerms', 'cancellationTerms', 'hostTerms', 'reviewTerms'] as const;
        
        for (const key of termKeys) {
            if (data[key] && !Array.isArray(data[key])) {
                throw createHttpError(HTTP_STATUS.BAD_REQUEST, `${key} must be an array of strings.`);
            }
        }
    }
}