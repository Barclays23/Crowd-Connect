// src/controllers/implementations/host.controller.ts

import { NextFunction, Request, Response } from "express";
import { IHostController } from "../interfaces/IHostController";
import { HTTP_STATUS } from "@/constants/http-status.constants";
import { HostStatus, USER_ROLES, UserStatus } from "@/constants/user-system.constants";
import { 
    GetHostsFilter, 
    GetHostsResult,
} from "@/types/user.types";

import { 
    HostStatusUpdateResponseDto, 
    HostUpdateRequestDto, 
    HostUpgradeRequestDto, 
    OrganiserProfileResponseDTO, 
    UserProfileResponseDto 
} from "@/dtos/user.dto";
import { IHostManagementServices } from "@/services/host-services/interfaces/IHostManagementServices";
import { HOST_MESSAGES, USER_MESSAGES } from "@/constants/messages.constants";
import { mapUserEntityToProfileDto } from "@/mappers/user.mapper";
import { HostEntity, UserProfileEntity } from "@/entities/user.entity";
import { createHttpError } from "@/utils/httpError.utils";
import { ApiResponse } from "@/utils/apiResponse.utils";




export class HostController implements IHostController {
    constructor(
        private _hostService: IHostManagementServices
    ) {}



    async applyHostRoleUpgrade (req: Request, res: Response, next: NextFunction) : Promise<void> {
        try {
            if (!req.user || !req.user.userId) {
                throw createHttpError(HTTP_STATUS.UNAUTHORIZED, USER_MESSAGES.USER_INFORMATION_MISSING);
            }

            const userId = req.user?.userId;
            const upgradeDto: HostUpgradeRequestDto = req.body;

            const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
            const documentFile: Express.Multer.File | undefined = files?.hostDocument?.[0];
            const logoFile: Express.Multer.File | undefined = files?.organizationLogo?.[0];

            const hostEntity: HostEntity = await this._hostService.applyHostRoleUpgrade({userId, upgradeDto, documentFile, logoFile});

            const upgradedProfile: UserProfileResponseDto = mapUserEntityToProfileDto(hostEntity);

            res.status(HTTP_STATUS.OK).json(
                ApiResponse.success<UserProfileResponseDto>(HOST_MESSAGES.HOST_APPLY_SUCCESS, upgradedProfile)
            );

            // res.status(HTTP_STATUS.OK).json({
            //     success: true,
            //     message: HOST_MESSAGES.HOST_APPLY_SUCCESS,
            //     data: upgradedProfile,
            // });

        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Unknown Error';
            console.error('Error in hostController.applyHostUpgrade:', msg);
            next(err);
        };
    }


    async getAllHosts(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const page = parseInt(req.query.page as string, 10) || 1;
            const limit = parseInt(req.query.limit as string, 10) || 10;
            const search = (req.query.search as string)?.trim() || '';
            const status = (req.query.status as string)?.trim() || '';
            const hostStatus = (req.query.hostStatus as string)?.trim() || '';

            const filters: GetHostsFilter = {
                page,
                limit,
                search,
                role: USER_ROLES.HOST,
                status: status ? status as UserStatus : undefined,
                hostStatus: hostStatus ? hostStatus as HostStatus : undefined,
            };

            console.log('✅ Parsed filters for getAllHosts:', filters);

            const result: GetHostsResult = await this._hostService.getAllHosts(filters);
            // console.log('✅ Result in hostController.getAllHosts:', result);

            res.status(HTTP_STATUS.OK).json(
                ApiResponse.success<UserProfileResponseDto[]|null>(HOST_MESSAGES.SUCCESS_GET_HOSTS, result.hosts, result.pagination)
            );

            // res.status(HTTP_STATUS.OK).json({
            //     success: true,
            //     message: HOST_MESSAGES.SUCCESS_GET_HOSTS,
            //     data: result.hosts,
            //     pagination: result.pagination,
            // });

        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Unknown Error';
            console.error('Error in userController.getAllUsers:', msg);
            next(err);
        };
    
    }


    async convertToHost(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.params?.userId as string;
            const upgradeDto: HostUpgradeRequestDto = req.body;

            const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
            const documentFile: Express.Multer.File | undefined = files?.hostDocument?.[0];
            const logoFile: Express.Multer.File | undefined = files?.organizationLogo?.[0];

            const upgradedProfile: UserProfileEntity = await this._hostService.convertToHost({userId, upgradeDto, documentFile, logoFile});

            const profileResponse: UserProfileResponseDto = mapUserEntityToProfileDto(upgradedProfile);

            res.status(HTTP_STATUS.OK).json(
                ApiResponse.success<UserProfileResponseDto>("User successfully converted to host.", profileResponse)
            );

            // res.status(HTTP_STATUS.OK).json({
            //     success: true,
            //     message: "User successfully converted to host.",
            //     data: profileResponse,
            // });

        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Unknown Error';
            console.error('Error in hostController.convertToHost:', msg);
            next(err);
        }
    }


    async getOrganiserProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const hostId = req.params.hostId as string;
            
            const organizerProfile: OrganiserProfileResponseDTO = await this._hostService.getOrganiserProfile(hostId);

            res.status(HTTP_STATUS.OK).json(
                ApiResponse.success<OrganiserProfileResponseDTO>("Organiser profile fetched successfully", organizerProfile)
            );

            // res.status(200).json({
            //     success: true,
            //     message: "Organiser profile fetched successfully",
            //     data: organizerProfile
            // });

        } catch (error) {
            next(error);
        }
    }


    async manageHostApplication (req: Request, res: Response, next: NextFunction) : Promise<void> {
        try {
            const hostId = req.params?.hostId as string;
            const {action, reason} = req.body;

            if (!['approve', 'reject'].includes(action)) {
                throw createHttpError(HTTP_STATUS.BAD_REQUEST, "Invalid application action");
            }

            const updatedHost: HostStatusUpdateResponseDto = await this._hostService.manageHostApplication({hostId, action, reason});

            const responseMessage: string  = action === 'approve' ? HOST_MESSAGES.HOST_APPROVE_SUCCESS : HOST_MESSAGES.HOST_REJECT_SUCCESS;

            res.status(HTTP_STATUS.OK).json(
                ApiResponse.success<HostStatusUpdateResponseDto>(responseMessage, updatedHost)
            );

            // res.status(HTTP_STATUS.OK).json({
            //     success: true,
            //     message: responseMessage,
            //     data: updatedHost,
            // });


        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Unknown Error';
            console.error('Error in hostController.manageHostApplication:', msg);
            next(err);
        };
    }


    async manageHostPermission (req: Request, res: Response, next: NextFunction) : Promise<void> {
        try {
            const hostId = req.params?.hostId as string;
            const { action, reason } = req.body;

            if (!['block', 'unblock'].includes(action)) {
                throw createHttpError(HTTP_STATUS.BAD_REQUEST, "Invalid permission action");
            }

            const updatedHost: HostStatusUpdateResponseDto = await this._hostService.manageHostPermission({hostId, action, reason});
            
            const responseMessage = action === 'block' ? HOST_MESSAGES.HOST_BLOCK_SUCCESS : HOST_MESSAGES.HOST_UNBLOCK_SUCCESS;

            res.status(HTTP_STATUS.OK).json(
                ApiResponse.success<HostStatusUpdateResponseDto>(responseMessage, updatedHost)
            );

            // res.status(HTTP_STATUS.OK).json({
            //     success: true,
            //     message: responseMessage,
            //     data: updatedHost,
            // });

        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Unknown Error';
            console.error('Error in hostController.manageHostPermission:', msg);
            next(err);
        };
    }


    async updateHostDetailsByHost (req: Request, res: Response, next: NextFunction): Promise<void>{
        try {
            const hostId = req.user?.userId as string;
            const updateDto: HostUpdateRequestDto = req.body;
            const documentFile: Express.Multer.File | undefined = req.file;

            const updatedHost: HostEntity = await this._hostService.updateHostDetailsByHost({hostId, updateDto, documentFile});

            const hostProfile: UserProfileResponseDto = mapUserEntityToProfileDto(updatedHost);

            res.status(HTTP_STATUS.OK).json(
                ApiResponse.success(
                    HOST_MESSAGES.HOST_UPDATE_DETAILS_SUCCESS + ' Your details need to be verified for your hosting permissions.', 
                    hostProfile
                )
            );

            // res.status(HTTP_STATUS.OK).json({
            //     success: true,
            //     message: HOST_MESSAGES.HOST_UPDATE_DETAILS_SUCCESS + ' Your details need to be verified for your hosting permissions.',
            //     data: hostProfile,
            // });

        } catch (err: unknown) {
            next(err);
        };
    }


    async updateHostLogoByHost (req: Request, res: Response, next: NextFunction): Promise<void>{
        try {
            const hostId = req.user?.userId as string;
            const logoFile: Express.Multer.File | undefined = req.file;

            if (!logoFile) {
                throw createHttpError(HTTP_STATUS.BAD_REQUEST, "Logo file is required.");
            }

            const updatedHost: UserProfileEntity = await this._hostService.updateHostLogoByHost({hostId, logoFile});

            const hostProfile: UserProfileResponseDto = mapUserEntityToProfileDto(updatedHost);

            res.status(HTTP_STATUS.OK).json(
                ApiResponse.success<UserProfileResponseDto>(HOST_MESSAGES.HOST_UPDATE_LOGO_SUCCESS, hostProfile)
            );

            // res.status(HTTP_STATUS.OK).json({
            //     success: true,
            //     message: HOST_MESSAGES.HOST_UPDATE_LOGO_SUCCESS,
            //     data: hostProfile,
            // });

        } catch (err: unknown) {
            next(err);
        };
    }



    async updateHostDetailsByAdmin (req: Request, res: Response, next: NextFunction): Promise<void>{
        try {
            const hostId = req.params?.hostId as string;
            const updateDto: HostUpdateRequestDto = req.body;
            const documentFile: Express.Multer.File | undefined = req.file;

            console.log("fileName:", documentFile?.originalname);

            const updatedHost: HostEntity = await this._hostService.updateHostDetailsByAdmin({hostId, updateDto, documentFile});

            const hostProfile: UserProfileResponseDto = mapUserEntityToProfileDto(updatedHost)

            res.status(HTTP_STATUS.OK).json(
                ApiResponse.success<UserProfileResponseDto>(HOST_MESSAGES.HOST_UPDATE_DETAILS_SUCCESS, hostProfile)
            );

            // res.status(HTTP_STATUS.OK).json({
            //     success: true,
            //     message: HOST_MESSAGES.HOST_UPDATE_DETAILS_SUCCESS,
            //     data: hostProfile,
            // });


        } catch (err: unknown) {
            next(err);
        };
    }


    async updateHostLogoByAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const hostId = req.params?.hostId as string;
            const logoFile: Express.Multer.File | undefined = req.file;

            if (!logoFile) {
                throw createHttpError(HTTP_STATUS.BAD_REQUEST, "Logo file is required.");
            }

            const updatedHost: UserProfileEntity = await this._hostService.updateHostLogoByAdmin({ hostId, logoFile });
            const hostProfile: UserProfileResponseDto = mapUserEntityToProfileDto(updatedHost);

            res.status(HTTP_STATUS.OK).json(
                ApiResponse.success<UserProfileResponseDto>(HOST_MESSAGES.HOST_UPDATE_LOGO_SUCCESS, hostProfile)
            );

            // res.status(HTTP_STATUS.OK).json({
            //     success: true,
            //     message: HOST_MESSAGES.HOST_UPDATE_LOGO_SUCCESS,
            //     data: hostProfile,
            // });

        } catch (err: unknown) {
            next(err);
        }
    }


}