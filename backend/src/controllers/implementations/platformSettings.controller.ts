// backend/src/controllers/implementations/platformSettings.controller.ts
import { Request, Response, NextFunction } from 'express';
import { IPlatformSettingsService } from '@/services/platform-settings-services/interfaces/IPlatformSettingsService';
import { HTTP_STATUS } from '@/constants/http-status.constants';
import { ISettingsController } from '@/controllers/interfaces/ISettingsController';
import { OperationalSettingsResponseDTO, PublicTermsResponseDTO } from '@/dtos/settings.dto';
import { ApiResponse } from '@/utils/apiResponse.utils';
import { createHttpError } from '@/utils/httpError.utils';



export class PlatformSettingsController implements ISettingsController {
    constructor(
        private readonly _settingsService: IPlatformSettingsService
    ) {}



    getOperationalSettings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const settings: OperationalSettingsResponseDTO = await this._settingsService.getOperationalSettings();

            res.status(HTTP_STATUS.OK).json(
                ApiResponse.success<OperationalSettingsResponseDTO>("Operational settings retrieved", settings)
            );

        } catch (error: unknown) {
            next(error);
        }
    };



    getTermsAndConditions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const terms: PublicTermsResponseDTO = await this._settingsService.getTermsAndConditions();

            res.status(HTTP_STATUS.OK).json(
                ApiResponse.success<PublicTermsResponseDTO>("Terms and conditions retrieved successfully", terms)
            );

        } catch (error: unknown) {
            next(error);
        }
    };



    updateOperationalSettings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            if (!req.user || !req.user.userId) {
                throw createHttpError(HTTP_STATUS.UNAUTHORIZED, "Unauthorized: Admin information missing");
            }
            const adminId: string = req.user.userId;

            const updatedOperationSettings: OperationalSettingsResponseDTO = await this._settingsService.updateOperationalSettings(
                req.body,
                adminId
            );

            res.status(HTTP_STATUS.OK).json(
                ApiResponse.success<OperationalSettingsResponseDTO>(
                    "Platform operational settings updated successfully", 
                    updatedOperationSettings
                )
            );

        } catch (error: unknown) {
            next(error);
        }
    };


    updateTerms = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            if (!req.user || !req.user.userId) {
                throw createHttpError(HTTP_STATUS.UNAUTHORIZED, "Unauthorized: Admin information missing");
            }
            const adminId: string = req.user.userId;

            const updatedTerms: PublicTermsResponseDTO = await this._settingsService.updateTermsAndConditions(
                req.body,
                adminId
            );

            res.status(HTTP_STATUS.OK).json(
                ApiResponse.success<PublicTermsResponseDTO>("Policies updated and FAQ knowledge refreshed!", updatedTerms)
            );

        } catch (error: unknown) {
            next(error);
        }
    };


}