import { NextFunction, Request, Response } from "express";
import { HostUpgradeDTO, UserProfileDto } from "../../dtos/user.dto";
import { IHostController } from "../interfaces/IHostController";
import { HttpStatus } from "../../constants/statusCodes";
import { IHostServices } from "../../services/interfaces/IHostServices";
import { HttpResponse } from "../../constants/responseMessages";




export class HostController implements IHostController {
    constructor(
        private _hostService: IHostServices
    ) {}

    async applyHostUpgrade (req: Request, res: Response, next: NextFunction) : Promise<void> {
        try {
            const userId = req.user?.userId;
            const upgradeDto: HostUpgradeDTO = req.body;
            const documentFile: Express.Multer.File | undefined = req.file;

            console.log(`received data in hostController.applyHostUpgrade ---- 
                userId: ${userId},
                upgradeDto: ${upgradeDto}, 
                fileName: ${documentFile?.originalname}`
            );

            const upgradedProfile: UserProfileDto = await this._hostService.applyHostUpgrade({userId, upgradeDto, documentFile});

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

}