// backend/src/controllers/implementations/platformSettings.controller.ts
import { Request, Response, NextFunction } from 'express';
import { IPlatformSettingsService } from '@/services/platform-settings-services/interfaces/IPlatformSettingsService';
import { HTTP_STATUS } from '@/constants/http-status.constants';
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

            res.status(HTTP_STATUS.OK).json({ 
                success: true, 
                message: "Platform settings retrieved successfully",
                data: settings 
            });

        } catch (error) {
            next(error);
        }
    };



    updateSettings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            if (!req.user || !req.user.userId) {
                res.status(HTTP_STATUS.UNAUTHORIZED).json({ success: false, message: "Unauthorized: Admin information missing" });
                return;
            }
            
            const adminId: string = req.user.userId;
            const updatedSettings: PlatformSettingsEntity = await this._settingsService.updatePlatformSettings(req.body, adminId);

            res.status(HTTP_STATUS.OK).json({ 
                success: true, 
                message: "Platform settings updated successfully",
                data: updatedSettings 
            });
            
        } catch (error) {
            next(error);
        }
    };
}