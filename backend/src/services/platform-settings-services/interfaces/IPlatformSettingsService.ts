// backend/src/services/platform-settings-services/interfaces/IPlatformSettingsService.ts

import { 
    OperationalSettingsResponseDTO,
    PublicTermsResponseDTO, 
    UpdateOperationalSettingsDTO, 
    UpdateTermsDTO 
} from "@/dtos/settings.dto";
import { OperationalSettingsEntity, PlatformSettingsEntity } from "@/entities/platformSettings.entity";



export interface IPlatformSettingsService {
    // For Internal Services like BookingService, EventService, refundCalculations etc (returns the Domain Entity)
    getOperationalSettingsDomain(): Promise<OperationalSettingsEntity>;

    getOperationalSettings(): Promise<OperationalSettingsResponseDTO>;
    getTermsAndConditions(): Promise<PublicTermsResponseDTO>;

    updateOperationalSettings(updateData: UpdateOperationalSettingsDTO, adminId: string): Promise<PlatformSettingsEntity>
    updateTermsAndConditions(termsData: UpdateTermsDTO, adminId: string): Promise<PlatformSettingsEntity>;
}