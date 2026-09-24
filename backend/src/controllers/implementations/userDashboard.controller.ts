// backend/src/controllers/implementations/userDashboard.controller.ts
import { Request, Response, NextFunction } from "express";
import { HTTP_STATUS } from "@/constants/http-status.constants";
import { ApiResponse } from "@/utils/apiResponse.utils";
import { createHttpError } from "@/utils/httpError.utils";
import { USER_MESSAGES } from "@/constants/messages.constants";
import { DashboardDateFilter, DashboardPreset } from "@/types/dashboard.types";
import { IDashboardService } from "@/services/dashboard.services/interfaces/IDashboardService";
import { IUserDashboardController } from "@/controllers/interfaces/IUserDashboardController";




export class UserDashboardController implements IUserDashboardController {
   constructor(
      private readonly _dashboardService: IDashboardService
   ) {}



   private extractFilter(req: Request): DashboardDateFilter {
      const preset = req.query.preset as DashboardPreset | undefined;
      const from = req.query.from as string | undefined;
      const to = req.query.to as string | undefined;
      return { preset, from, to };
   }



   // FOR USER DASHBOARDS _______________________________________________
   getOverview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
         if (!req.user?.userId) {
            throw createHttpError(HTTP_STATUS.UNAUTHORIZED, USER_MESSAGES.USER_NOT_FOUND);
         }

         const filter = this.extractFilter(req);
         const data = await this._dashboardService.getUserOverview(
            req.user.userId,
            filter,
            req.user.role
         );

         res.status(HTTP_STATUS.OK).json(
            ApiResponse.success("User dashboard overview retrieved successfully", data)
         );

      } catch (error: unknown) {
         next(error);
      }
   };

   getBookingsChart = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
         if (!req.user?.userId) {
            throw createHttpError(HTTP_STATUS.UNAUTHORIZED, USER_MESSAGES.USER_NOT_FOUND);
         }

         const filter = this.extractFilter(req);
            const data = await this._dashboardService.getUserBookingsChart(
            req.user.userId,
            filter
         );

         res.status(HTTP_STATUS.OK).json(
            ApiResponse.success("Bookings chart retrieved successfully", data)
         );
         
      } catch (error: unknown) {
         next(error);
      }
   };

   getSpendingChart = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
         if (!req.user?.userId) {
            throw createHttpError(HTTP_STATUS.UNAUTHORIZED, USER_MESSAGES.USER_NOT_FOUND);
         }

         const filter = this.extractFilter(req);
         const data = await this._dashboardService.getUserSpendingChart(
            req.user.userId,
            filter
         );

         res.status(HTTP_STATUS.OK).json(
            ApiResponse.success("Spending chart retrieved successfully", data)
         );
         
      } catch (error: unknown) {
         next(error);
      }
   };

   getCategoryChart = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
         if (!req.user?.userId) {
            throw createHttpError(HTTP_STATUS.UNAUTHORIZED, USER_MESSAGES.USER_NOT_FOUND);
         }

         const filter = this.extractFilter(req);
         const data = await this._dashboardService.getUserCategoryChart(
            req.user.userId,
            filter
         );

         res.status(HTTP_STATUS.OK).json(
            ApiResponse.success("Category chart retrieved successfully", data)
         );

      } catch (error: unknown) {
         next(error);
      }
   };

   getStatusChart = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
         if (!req.user?.userId) {
            throw createHttpError(HTTP_STATUS.UNAUTHORIZED, USER_MESSAGES.USER_NOT_FOUND);
         }

         const filter = this.extractFilter(req);
         const data = await this._dashboardService.getUserStatusChart(
            req.user.userId,
            filter
         );

         res.status(HTTP_STATUS.OK).json(
            ApiResponse.success("Status chart retrieved successfully", data)
         );

      } catch (error: unknown) {
         next(error);
      }
   };


   // FOR HOST DASHBOARDS _______________________________________________
   getHostEventsByStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
         if (!req.user?.userId) {
            throw createHttpError(HTTP_STATUS.UNAUTHORIZED, USER_MESSAGES.USER_NOT_FOUND);
         }

         const filter = this.extractFilter(req);
         const data = await this._dashboardService.getHostEventsByStatus(
            req.user.userId,
            filter
         );

         res.status(HTTP_STATUS.OK).json(
            ApiResponse.success("Host events by status retrieved successfully", data)
         );
      } catch (error) {
         next(error);
      }
   };

   getHostEventsByCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
         if (!req.user?.userId) {
            throw createHttpError(HTTP_STATUS.UNAUTHORIZED, USER_MESSAGES.USER_NOT_FOUND);
         }

         const filter = this.extractFilter(req);
         const data = await this._dashboardService.getHostEventsByCategory(
            req.user.userId,
            filter
         );

         res.status(HTTP_STATUS.OK).json(
            ApiResponse.success("Host events by category retrieved successfully", data)
         );
      } catch (error) {
         next(error);
      }
   };

   getHostTicketsSoldChart = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
         if (!req.user?.userId) {
            throw createHttpError(HTTP_STATUS.UNAUTHORIZED, USER_MESSAGES.USER_NOT_FOUND);
         }

         const filter = this.extractFilter(req);
         const data = await this._dashboardService.getHostTicketsSoldChart(
            req.user.userId,
            filter
         );

         res.status(HTTP_STATUS.OK).json(
            ApiResponse.success("Host tickets sold chart retrieved successfully", data)
         );
      } catch (error) {
         next(error);
      }
   };

   getHostRatingDistribution = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
         if (!req.user?.userId) {
            throw createHttpError(HTTP_STATUS.UNAUTHORIZED, USER_MESSAGES.USER_NOT_FOUND);
         }

         const data = await this._dashboardService.getHostRatingDistribution(
            req.user.userId
         );

         res.status(HTTP_STATUS.OK).json(
            ApiResponse.success("Host rating distribution retrieved successfully", data)
         );
      } catch (error) {
         next(error);
      }
   };
}