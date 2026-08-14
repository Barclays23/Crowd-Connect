// backend/src/controllers/implementations/platformSettings.controller.ts
import { Request, Response, NextFunction } from 'express';
import { IPlatformSettingsService } from '@/services/platform-settings-services/interfaces/IPlatformSettingsService';
import { HTTP_STATUS } from '@/constants/http-status.constants';
import { ISettingsController } from '@/controllers/interfaces/ISettingsController';
import { PlatformSettingsEntity } from '@/entities/platformSettings.entity';
import { OperationalSettingsResponseDTO, PublicTermsResponseDTO } from '@/dtos/settings.dto';
import { mapEntityToOperationalDTO, mapEntityToPublicTermsDTO } from '@/mappers/platformSettings.mapper';
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

            // res.status(HTTP_STATUS.OK).json({ success: true, message: "Operational settings retrieved", data: settings });

        } catch (error) { next(error); }
    };



    getTermsAndConditions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const terms: PublicTermsResponseDTO = await this._settingsService.getTermsAndConditions();

            res.status(HTTP_STATUS.OK).json(
                ApiResponse.success<PublicTermsResponseDTO>("Terms and conditions retrieved successfully", terms)
            );

            // res.status(HTTP_STATUS.OK).json({
            //     success: true,
            //     message: "Terms and conditions retrieved successfully",
            //     data: terms,
            // });

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

            const updatedOperation: PlatformSettingsEntity = await this._settingsService.updateOperationalSettings(
                req.body,
                adminId
            );

            const operationalResponse: OperationalSettingsResponseDTO = mapEntityToOperationalDTO(updatedOperation);

            res.status(HTTP_STATUS.OK).json(
                ApiResponse.success<OperationalSettingsResponseDTO>(
                    "Platform operational settings updated successfully", 
                    operationalResponse
                )
            );

            // res.status(HTTP_STATUS.OK).json({
            //     success: true,
            //     message: "Platform operational settings updated successfully",
            //     data: operationalResponse,
            // });

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

            const updatedTerms: PlatformSettingsEntity = await this._settingsService.updateTermsAndConditions(
                req.body,
                adminId
            );

            const termsResponse: PublicTermsResponseDTO = mapEntityToPublicTermsDTO(updatedTerms);

            res.status(HTTP_STATUS.OK).json(
                ApiResponse.success<PublicTermsResponseDTO>("Policies updated and FAQ knowledge refreshed!", termsResponse)
            );

            // res.status(HTTP_STATUS.OK).json({
            //     success: true,
            //     message: "Policies updated and FAQ knowledge refreshed!",
            //     data: termsResponse,
            // });

        } catch (error: unknown) {
            next(error);
        }
    };


}