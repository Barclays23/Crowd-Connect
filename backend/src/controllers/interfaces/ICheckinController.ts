import { Request, Response, NextFunction } from "express";




export interface ICheckinController {
    scanQRCode(req: Request, res: Response, next: NextFunction): Promise<void>

    getEventAttendance(req: Request, res: Response, next: NextFunction): Promise<void>
}