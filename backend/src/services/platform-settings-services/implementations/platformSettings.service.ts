// backend/src/services/platformSettings-services/implementations/platformSettings.service.ts
import { IPlatformSettingsRepository } from '@/repositories/interfaces/IPlatformSettingsRepository';
import { IPlatformSettingsService } from '../interfaces/IPlatformSettingsService';
import { PlatformSettingsEntity } from '@/entities/platformSettings.entity';
import { createHttpError } from '@/utils/httpError.utils';
import { HttpStatus } from '@/constants/statusCodes.constants';



export class PlatformSettingsService implements IPlatformSettingsService {
    constructor(
        private readonly _settingsRepo: IPlatformSettingsRepository
    ) {}


    async getSettings(): Promise<PlatformSettingsEntity> {
        return this._settingsRepo.getSettings();
    }


    async updateSettings(
        updateData: Partial<PlatformSettingsEntity>,
        adminId: string
    ): Promise<PlatformSettingsEntity> {
        this._validateSettings(updateData);

        return this._settingsRepo.updateSettings(updateData, adminId);
    }



    private _validateSettings(data: Partial<PlatformSettingsEntity>): void {
        if (data.commissionPercent !== undefined) {
            if (data.commissionPercent < 0 || data.commissionPercent > 100) {
                throw createHttpError(HttpStatus.BAD_REQUEST, 'Commission must be between 0 and 100');
            }
        }

        if (data.refundTier1Hours !== undefined && data.refundTier2Hours !== undefined) {
            if (data.refundTier1Hours <= data.refundTier2Hours) {
                throw createHttpError(
                    HttpStatus.BAD_REQUEST,
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
                throw createHttpError(HttpStatus.BAD_REQUEST, `${field} must be between 0 and 100`);
            }
        }

        if (data.refundTier1Percent !== undefined && data.refundTier2Percent !== undefined) {
            if (data.refundTier1Percent < data.refundTier2Percent) {
                throw createHttpError(
                    HttpStatus.BAD_REQUEST,
                    'Tier 1 refund % should be >= Tier 2 refund %'
                );
            }
        }

        if (data.refundTier2Percent !== undefined && data.refundTier3Percent !== undefined) {
            if (data.refundTier2Percent < data.refundTier3Percent) {
                throw createHttpError(
                    HttpStatus.BAD_REQUEST,
                    'Tier 2 refund % should be >= Tier 3 refund %'
                );
            }
        }
    }
}