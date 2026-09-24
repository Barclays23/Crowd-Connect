// backend/src/controllers/interfaces/IUserDashboardController.ts
import { Request, Response, NextFunction } from "express";



export interface IUserDashboardController {
    getOverview(req: Request, res: Response, next: NextFunction): Promise<void>
    getBookingsChart(req: Request, res: Response, next: NextFunction): Promise<void>
    getSpendingChart(req: Request, res: Response, next: NextFunction): Promise<void>
    getCategoryChart(req: Request, res: Response, next: NextFunction): Promise<void>
    getStatusChart(req: Request, res: Response, next: NextFunction): Promise<void>
}