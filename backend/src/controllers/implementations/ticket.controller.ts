// backend/src/controllers/ticket.controller.ts

import { HttpStatus } from "@/constants/statusCodes.constants";
import { ITicketService } from "@/services/ticket-services/interfaces/ITicketService";
import { createHttpError } from "@/utils/httpError.utils";
import {Request, Response, NextFunction} from "express";



export class TicketController {
    constructor(private readonly _ticketService: ITicketService) {}

    async validateQr(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { qrToken, scanQuantity } = req.body;

            // Ensure scanQuantity defaults to 1 if not provided (useful for online events)
            const qtyToScan = scanQuantity ? Number(scanQuantity) : 1;

            if (!qrToken) {
                throw createHttpError(HttpStatus.BAD_REQUEST, "QR token is required.");
            }

            const result = await this._ticketService.validateQrToken(qrToken, qtyToScan);

            res.status(HttpStatus.OK).json({
                success: true,
                message: result.message,
                data: result
            });

        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : "Unknown error";
            console.error("Error in TicketController.validateQr:", msg);
            next(error);
        }
    }
}