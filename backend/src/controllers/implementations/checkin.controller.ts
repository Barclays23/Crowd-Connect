// backend/src/controllers/checkin.controller.ts

import { Request, Response, NextFunction } from "express";
import { CheckInResultDTO, GetAttendanceResult, ScanQRInput }                     from "@/types/checkin.types";
import { ICheckinService } from "@/services/checkin-services/interfaces/ICheckinService";
import { ICheckinController } from "@/controllers/interfaces/ICheckinController";
import { createHttpError } from "@/utils/httpError.utils";
import { HttpStatus } from "@/constants/statusCodes.constants";



export class CheckinController implements ICheckinController {

    constructor(
        private readonly _checkinService: ICheckinService
    ) {}


    // POST /api/events/:eventId/checkin
    async scanQRCode(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const eventId = req.params.eventId as string;
            const { qrToken, entryCount } = req.body;

            if (!qrToken) {
                throw createHttpError(HttpStatus.BAD_REQUEST, "QR token is required.");
            }
            
            const parsedEntryCount: number = entryCount !== undefined ? Number(entryCount) : 1;

            const input: ScanQRInput = {
                qrToken     : qrToken,
                entryCount  : parsedEntryCount
            };

            const checkinResult: CheckInResultDTO = await this._checkinService.scanQRCode(input, eventId);

            res.status(200).json({
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
    async getEventAttendance(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const eventId = req.params.eventId as string;

            const attendanceResult: GetAttendanceResult = await this._checkinService.getEventAttendance(eventId);

            res.status(200).json({
                success : true,
                data    : attendanceResult,
            });

        } catch (error) {
            next(error);
        }
    }
}