// backend/src/services/platform-settings-services/interfaces/IPlatformSettingsService.ts

import { PlatformSettingsEntity } from "@/entities/platformSettings.entity";


export interface IPlatformSettingsService {
    getSettings(): Promise<PlatformSettingsEntity>;
    updateSettings(data: Partial<PlatformSettingsEntity>, adminId: string): Promise<PlatformSettingsEntity>;
}