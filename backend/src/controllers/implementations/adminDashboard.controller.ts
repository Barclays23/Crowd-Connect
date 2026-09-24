// backend/src/controllers/adminDashboard.controller.ts
import { Request, Response, NextFunction } from "express";
import { HTTP_STATUS } from "@/constants/http-status.constants";
import { ApiResponse } from "@/utils/apiResponse.utils";
import { DashboardDateFilter, DashboardPreset } from "@/types/dashboard.types";
import { IDashboardService } from "@/services/dashboard.services/interfaces/IDashboardService";
import { IAdminDashboardController } from "@/controllers/interfaces/IAdminDashboardController";




export class AdminDashboardController implements IAdminDashboardController {
   constructor(
      private readonly _dashboardService: IDashboardService
   ) {}


   private extractFilter(req: Request): DashboardDateFilter {
      const preset = req.query.preset as DashboardPreset | undefined;
      const from = req.query.from as string | undefined;
      const to = req.query.to as string | undefined;
      return { preset, from, to };
   }

   getOverview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
         const filter = this.extractFilter(req);
         const data = await this._dashboardService.getAdminOverview(filter);

         res.status(HTTP_STATUS.OK).json(
            ApiResponse.success("Admin dashboard overview retrieved successfully", data)
         );

      } catch (error: unknown) {
         next(error);
      }
   };

   getRevenueChart = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
         const filter = this.extractFilter(req);
         const data = await this._dashboardService.getAdminRevenueChart(filter);

         res.status(HTTP_STATUS.OK).json(
            ApiResponse.success("Revenue chart retrieved successfully", data)
         );

      } catch (error: unknown) {
         next(error);
      }
   };

   getUserGrowthChart = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
         const filter = this.extractFilter(req);
         const data = await this._dashboardService.getAdminUserGrowthChart(filter);

         res.status(HTTP_STATUS.OK).json(
            ApiResponse.success("User growth chart retrieved successfully", data)
         );

      } catch (error: unknown) {
         next(error);
      }
   };

   getEventsByCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
         const filter = this.extractFilter(req);
         const data = await this._dashboardService.getAdminEventsByCategory(filter);

         res.status(HTTP_STATUS.OK).json(
            ApiResponse.success("Events by category retrieved successfully", data)
         );

      } catch (error: unknown) {
         next(error);
      }
   };

   getEventsByStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
         const filter = this.extractFilter(req);
         const data = await this._dashboardService.getAdminEventsByStatus(filter);

         res.status(HTTP_STATUS.OK).json(
            ApiResponse.success("Events by status retrieved successfully", data)
         );

      } catch (error: unknown) {
         next(error);
      }
   };

   getTopHosts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
         const filter = this.extractFilter(req);
         const data = await this._dashboardService.getAdminTopHosts(filter);

         res.status(HTTP_STATUS.OK).json(
            ApiResponse.success("Top hosts retrieved successfully", data)
         );

      } catch (error: unknown) {
         next(error);
      }
   };
}