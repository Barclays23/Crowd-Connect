// backend/src/repositories/implementations/platformSettings.repository.ts
import { PlatformSettingsEntity } from '@/entities/platformSettings.entity';
import { mapSettingsModelToEntity } from '@/mappers/platformSettings.mapper';
import { PlatformSettingsModel } from '@/models/implementations/platformSettings.model';
import { BaseRepository } from '@/repositories/base.repository';
import { IPlatformSettingsRepository } from '@/repositories/interfaces/IPlatformSettingsRepository';
import { IPlatformSettingsModel } from '@/types/platformSettings.types';



export class PlatformSettingsRepository extends BaseRepository<IPlatformSettingsModel> implements IPlatformSettingsRepository {

    constructor() {
        super(PlatformSettingsModel);
    }


    async getSettings(): Promise<PlatformSettingsEntity> {
        let settings: IPlatformSettingsModel | null = await this.findOne({});

        if (!settings) {
            settings = await PlatformSettingsModel.create({});
            console.log('⚙️ Default Platform Settings initialized.');
        }

        const settingsEntity: PlatformSettingsEntity = mapSettingsModelToEntity(settings);
        
        return settingsEntity;
    }



    async updateSettings(updateData: Partial<PlatformSettingsEntity>, adminId: string): Promise<PlatformSettingsEntity> {
        const updatedSettings: IPlatformSettingsModel | null = await this.findOneAndUpdate(
            {},
            { $set: { ...updateData, updatedBy: adminId } },
            { new: true }
        );

        if (!updatedSettings) {
            const createdSettings: IPlatformSettingsModel = await PlatformSettingsModel.create({ ...updateData, updatedBy: adminId });

            return mapSettingsModelToEntity(createdSettings);
        }

        return mapSettingsModelToEntity(updatedSettings);
    }
}