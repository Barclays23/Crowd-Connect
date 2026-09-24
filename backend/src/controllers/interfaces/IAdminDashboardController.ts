// backend/src/controllers/interfaces/IAdminDashboardController.ts
import { Request, Response, NextFunction } from "express";


export interface IAdminDashboardController {
    getOverview(req: Request, res: Response, next: NextFunction): Promise<void>
    getRevenueChart(req: Request, res: Response, next: NextFunction): Promise<void>
    getUserGrowthChart(req: Request, res: Response, next: NextFunction): Promise<void>
    getEventsByCategory(req: Request, res: Response, next: NextFunction): Promise<void>
    getEventsByStatus(req: Request, res: Response, next: NextFunction): Promise<void>
    getTopHosts(req: Request, res: Response, next: NextFunction): Promise<void>
}