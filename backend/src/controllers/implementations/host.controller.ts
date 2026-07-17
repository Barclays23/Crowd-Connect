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
    UserProfileResponseDto 
} from "@/dtos/user.dto";
import { IHostManagementServices } from "@/services/host-services/interfaces/IHostManagementServices";
import { HOST_MESSAGES } from "@/constants/messages.constants";




export class HostController implements IHostController {
    constructor(
        private _hostService: IHostManagementServices
    ) {}



    async applyHostUpgrade (req: Request, res: Response, next: NextFunction) : Promise<void> {
        try {
            if (!req.user || !req.user.userId) {
                res.status(HTTP_STATUS.UNAUTHORIZED).json({ success: false, message: "Unauthorized: User information missing" });
                return;
            }

            const userId = req.user?.userId;
            const upgradeDto: HostUpgradeRequestDto = req.body;
            const documentFile: Express.Multer.File | undefined = req.file;

            const upgradedProfile: UserProfileResponseDto = await this._hostService.applyHostUpgrade({userId, upgradeDto, documentFile});

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: HOST_MESSAGES.HOST_APPLY_SUCCESS,
                // hostProfile: upgradedProfile,
                data: upgradedProfile,
            });

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

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: HOST_MESSAGES.SUCCESS_GET_HOSTS,
                // hostsData: result.hosts,
                data: result.hosts,
                pagination: result.pagination,
            });

        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Unknown Error';
            console.error('Error in userController.getAllUsers:', msg);
            next(err);
        };
    
    }


    async getOrganiserProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const hostId = req.params.hostId as string;
            
            const organizerProfile = await this._hostService.getOrganiserProfile(hostId);

            res.status(200).json({
                success: true,
                message: "Organiser profile fetched successfully",
                data: organizerProfile
            });

        } catch (error) {
            next(error);
        }
    }


    async manageHostStatus (req: Request, res: Response, next: NextFunction) : Promise<void> {
        try {
            const hostId = req.params?.hostId as string;
            const {action, reason} = req.body;

            const updatedHost: HostStatusUpdateResponseDto = await this._hostService.manageHostStatus({hostId, action, reason});
            
            let responseMessage: string = ''
            if (action === 'approve') responseMessage = HOST_MESSAGES.HOST_APPROVE_SUCCESS;
            else if (action === 'reject') responseMessage = HOST_MESSAGES.HOST_REJECT_SUCCESS;
            else if (action === 'block') responseMessage = HOST_MESSAGES.HOST_BLOCK_SUCCESS;

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: responseMessage,
                // updatedHost: updatedHost,
                data: updatedHost,
            });


        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Unknown Error';
            console.error('Error in hostController.manageHostStatus:', msg);
            next(err);
        };
    }


    async updateHostByAdmin (req: Request, res: Response, next: NextFunction): Promise<void>{
        try {
            const hostId = req.params?.hostId as string;
            const updateDto: HostUpdateRequestDto = req.body;
            const documentFile: Express.Multer.File | undefined = req.file;

            console.log("upgradeDto body: ", req.body);
            console.log("hostId:", hostId);
            console.log("fileName:", documentFile?.originalname);

            const updatedHostProfile: UserProfileResponseDto = await this._hostService.updateHostByAdmin({hostId, updateDto, documentFile});

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: HOST_MESSAGES.HOST_UPDATE_SUCCESS,
                // updatedHost: updatedHostProfile,
                data: updatedHostProfile,
            });


        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Unknown Error';
            console.error('Error in hostController.updateHostByAdmin:', msg);
            next(err);
        };
    }

}