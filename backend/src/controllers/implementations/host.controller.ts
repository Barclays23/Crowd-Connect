import { NextFunction, Request, Response } from "express";
import { HostUpgradeRequestDto, UserProfileResponseDto } from "../../dtos/user.dto";
import { IHostController } from "../interfaces/IHostController";
import { HttpStatus } from "../../constants/statusCodes";
import { IHostServices } from "../../services/interfaces/IHostServices";
import { HttpResponse } from "../../constants/responseMessages";
import { UserRole } from "../../constants/roles-and-statuses";
import { GetHostsFilter, GetHostsResult, GetUsersFilter, GetUsersResult } from "../../types/user.types";




export class HostController implements IHostController {
    constructor(
        private _hostService: IHostServices
    ) {}

    async applyHostUpgrade (req: Request, res: Response, next: NextFunction) : Promise<void> {
        try {
            const userId = req.user?.userId;
            const upgradeDto: HostUpgradeRequestDto = req.body;
            const documentFile: Express.Multer.File | undefined = req.file;

            console.log("✅✅✅✅✅ received data in hostController.applyHostUpgrade ----");
            console.log("userId:", userId);
            console.log("upgradeDto:", upgradeDto);
            console.log("fileName:", documentFile?.originalname);


            const upgradedProfile: UserProfileResponseDto = await this._hostService.applyHostUpgrade({userId, upgradeDto, documentFile});

            res.status(HttpStatus.OK).json({
                success: true,
                message: HttpResponse.HOST_APPLY_SUCCESS,
                hostProfile: upgradedProfile,
            });

        } catch (err: any) {
            next(err);
            console.error('Error in hostController.applyHostUpgrade:', err);
            if (err && typeof err.statusCode === 'number') {
                res.status(err.statusCode).json({ message: err.message || 'Error' });
                return;
            }
            // Fallback to generic internal error
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: `${HttpResponse.INTERNAL_SERVER_ERROR} \n ${HttpResponse.HOST_APPLY_FAILED}`
            });
            return;
        }
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
                role: UserRole.HOST,
                status: status || undefined,
                hostStatus: hostStatus || undefined,
            };

            console.log('✅ Parsed filters for getAllHosts:', filters);

            const result: GetHostsResult = await this._hostService.getAllHosts(filters);
            // console.log('✅ Result in hostController.getAllHosts:', result);

            res.status(HttpStatus.OK).json({
                success: true,
                message: HttpResponse.SUCCESS_GET_HOSTS,
                hostsData: result.hosts,
                pagination: {
                    page: result.page,
                    limit: result.limit,
                    total: result.total,
                    totalPages: Math.ceil(result.total / result.limit),
                },
            });

        } catch (err: any) {
            next(err);
            console.error('Error in userController.getAllUsers:', err);

            // If a well-formed HTTP error was thrown, forward its status and message
            if (err && typeof err.statusCode === 'number') {
                res.status(err.statusCode).json({ message: err.message || 'Error' });
                return;
            }
            // Fallback to generic internal error
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: `${HttpResponse.INTERNAL_SERVER_ERROR} \n ${HttpResponse.FAILED_GET_USERS}`
            });
            return;
        }
    
    }

}