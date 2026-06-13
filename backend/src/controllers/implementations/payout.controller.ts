// backend/src/controllers/implementations/payout.controller.ts
import { Request, Response, NextFunction } from "express";
import { HttpStatus } from "@/constants/statusCodes.constants";
import { PayoutMessages } from "@/constants/responseMessages.constants";
import { IPayoutService } from "@/services/payout-services/interfaces/IPayoutService";
import { IPayoutController } from "@/controllers/interfaces/IPayoutController";
import { 
    GetEligibleEventsResponse, 
    GetPayoutsResponse, 
    PayoutResponseDTO 
} from "@/dtos/payout.dto";
import { GetPayoutsFilter, ReviewPayoutInput } from "@/types/payout.types";



export class PayoutController implements IPayoutController {
    constructor (
        private readonly _payoutServices: IPayoutService
    ){}

    async getEligibleEvents(req: Request, res: Response, next: NextFunction) {
        try {
            const hostId: string = req.user!.userId;

            const result: GetEligibleEventsResponse = await this._payoutServices.getEligibleEvents(hostId);
            // console.log('getEligibleEvents result :', result);

            res.status(HttpStatus.OK).json(result);

        } catch (err: unknown) {
            next(err);
        }
    }


    async requestPayout(req: Request, res: Response, next: NextFunction) {
        try {
            const hostId: string                = req.user!.userId;
            const eventId: string               = req.params.eventId as string;
            const files: Express.Multer.File[]  = req.files as Express.Multer.File[];

            const payoutData: PayoutResponseDTO = await this._payoutServices.requestPayout(hostId, eventId, files);

            res.status(HttpStatus.CREATED).json({
                message : PayoutMessages.PAYOUT_REQUEST_SUBMITTED,
                payoutData,
            });

        } catch (err: unknown) {
            next(err);
        }
    }


    // for hosts
    async getMyPayouts(req: Request, res: Response, next: NextFunction) {
        try {
            const hostId: string = req.user!.userId;

            const filters: GetPayoutsFilter = {
                page        : Number(req.query.page)  || 1,
                limit       : Number(req.query.limit) || 10,
                sortBy      : (req.query.sortBy as string)    || "requestedAt",
                sortOrder   : (req.query.sortOrder as "asc" | "desc") || "desc",
                status      : req.query.status as string | undefined,
            };

            const payoutResult: GetPayoutsResponse = await this._payoutServices.getMyPayouts(hostId, filters);

            res.status(HttpStatus.OK).json(payoutResult);

        } catch (err: unknown) {
            next(err);
        }
    }

    // for Admin
    async getAllPayouts(req: Request, res: Response, next: NextFunction) {
        try {
            const filters: GetPayoutsFilter = {
                page        : Number(req.query.page)  || 1,
                limit       : Number(req.query.limit) || 10,
                sortBy      : (req.query.sortBy as string)    || "requestedAt",
                sortOrder   : (req.query.sortOrder as "asc" | "desc") || "desc",
                status      : req.query.status as string | undefined,
                search      : req.query.search as string | undefined,
            };

            const payoutResult: GetPayoutsResponse = await this._payoutServices.getAllPayouts(filters);

            res.status(HttpStatus.OK).json(payoutResult);

        } catch (err: unknown) {
            next(err);
        }
    }


    async reviewPayout(req: Request, res: Response, next: NextFunction) {
        try {
            const adminId: string   = req.user!.userId;
            const payoutId          = req.params.payoutId as string;
            const { action, rejectionReason } = req.body;
            const payoutInput: ReviewPayoutInput = { action, rejectionReason };

            const payoutData = await this._payoutServices.reviewPayout(adminId, payoutId, payoutInput);

            res.status(HttpStatus.OK).json({
                message: action === "approve"
                    ? PayoutMessages.PAYOUT_APPROVED
                    : PayoutMessages.PAYOUT_REJECTED,
                payoutData,
            });

        } catch (err: unknown) {
            next(err);
        }
    }
}
