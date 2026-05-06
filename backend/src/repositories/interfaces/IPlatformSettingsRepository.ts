// backend/src/repositories/interfaces/IPlatformSettingsRepository.ts

import { PlatformSettingsEntity } from "@/entities/platformSettings.entity";


export interface IPlatformSettingsRepository {
    getSettings(): Promise<PlatformSettingsEntity>;
    updateSettings(data: Partial<PlatformSettingsEntity>, adminId: string): Promise<PlatformSettingsEntity>;
}