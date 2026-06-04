// backend/src/controllers/interfaces/IPayoutController.ts
import { Request, Response, NextFunction } from 'express';


export interface IPayoutController {
    // for hosts
    getEligibleEvents(req: Request, res: Response, next: NextFunction): Promise<void>;
    requestPayout(req: Request, res: Response, next: NextFunction): Promise<void>;
    getMyPayouts(req: Request, res: Response, next: NextFunction): Promise<void>;

    // for admin
    getAllPayouts(req: Request, res: Response, next: NextFunction): Promise<void>;
    reviewPayout(req: Request, res: Response, next: NextFunction): Promise<void>;
}