// backend/src/controllers/checkin.controller.ts

import { Request, Response, NextFunction } from "express";
import { 
    CheckInResultDTO, 
    GetAttendanceResult, 
    ScanQRInput 
} from "@/types/checkin.types";
import { ICheckinService } from "@/services/checkin-services/interfaces/ICheckinService";
import { ICheckinController } from "@/controllers/interfaces/ICheckinController";
import { createHttpError } from "@/utils/httpError.utils";
import { HTTP_STATUS } from "@/constants/http-status.constants";



export class CheckinController implements ICheckinController {

    constructor(
        private readonly _checkinService: ICheckinService
    ) {}


    // POST /api/event/:eventId/checkin
    // POST /api/checkin/:eventId/scan
    async scanQRCode(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const eventId = req.params.eventId as string;
            const { qrToken, entryCount } = req.body as ScanQRInput;

            if (!qrToken) {
                throw createHttpError(HTTP_STATUS.BAD_REQUEST, "QR token is required.");
            }
            
            const parsedEntryCount: number = entryCount !== undefined ? Number(entryCount) : 1;

            const scanQRInput: ScanQRInput = {
                qrToken     : qrToken,
                entryCount  : parsedEntryCount
            };

            const checkinResult: CheckInResultDTO = await this._checkinService.scanQRCode(scanQRInput, eventId);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: checkinResult.isFullyUsed
                    ? `Entry complete — all ${checkinResult.quantity} ticket(s) used.`
                    : `${checkinResult.entriesThisScan} admitted. ${checkinResult.remainingEntries} ticket(s) remaining.`,
                data: checkinResult,
            });

        } catch (error) {
            next(error);
        }
    }



    // GET /api/events/:eventId/checkin/attendance
    // GET /api/checkin/:eventId/attendance
    async getEventAttendance(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const eventId = req.params.eventId as string;

            const attendanceResult: GetAttendanceResult = await this._checkinService.getEventAttendance(eventId);

            res.status(HTTP_STATUS.OK).json({
                success : true,
                message : "Attendance retrieved successfully",
                data    : attendanceResult,
            });

        } catch (error) {
            next(error);
        }
    }
}