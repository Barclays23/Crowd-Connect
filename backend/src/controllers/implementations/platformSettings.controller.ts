// backend/src/controllers/implementations/platformSettings.controller.ts
import { Request, Response, NextFunction } from 'express';
import { IPlatformSettingsService } from '@/services/platform-settings-services/interfaces/IPlatformSettingsService';
import { HttpStatus } from '@/constants/statusCodes.constants';
import { ISettingsController } from '@/controllers/interfaces/ISettingsController';
import { PlatformSettingsEntity } from '@/entities/platformSettings.entity';



export class PlatformSettingsController implements ISettingsController {
    constructor(
        private readonly _settingsService: IPlatformSettingsService
    ) {}


    getSettings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {          
            const settings: PlatformSettingsEntity = await this._settingsService.getPlatformSettings();
            console.log('platform settings fetched :', settings)

            res.status(HttpStatus.OK).json({ success: true, settingsData: settings });

        } catch (error) {
            next(error);
        }
    };



    updateSettings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            if (!req.user || !req.user.userId) {
                res.status(HttpStatus.UNAUTHORIZED).json({ success: false, message: "Unauthorized: Admin information missing" });
                return;
            }
            
            const adminId: string = req.user.userId;
            const updated: PlatformSettingsEntity = await this._settingsService.updatePlatformSettings(req.body, adminId);

            res.status(HttpStatus.OK).json({ success: true, data: updated });
            
        } catch (error) {
            next(error);
        }
    };
}