// backend/src/controllers/implementations/notification.controller.ts
import { Request, Response, NextFunction } from "express";
import { INotificationController } from "@/controllers/interfaces/INotificationController";
import { HTTP_STATUS } from "@/constants/http-status.constants";
import { ApiResponse } from "@/utils/apiResponse.utils";
import { createHttpError } from "@/utils/httpError.utils";
import { USER_MESSAGES } from "@/constants/messages.constants";
import { INotificationQueryService } from "@/services/notification-services/interfaces/INotificationQueryService";
import {
    GetNotificationsRequestDTO, 
    GetNotificationsResponseDTO 
   } from "@/dtos/notification.dto";





export class NotificationController implements INotificationController {
   constructor(
      private readonly _notificationQueryService: INotificationQueryService
   ) {}



   async getMyNotifications(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
         if (!req.user?.userId) {
            throw createHttpError(HTTP_STATUS.UNAUTHORIZED, USER_MESSAGES.USER_NOT_FOUND);
         }

         const page: number  = Math.max(1, parseInt(req.query.page as string) || 1);
         const limit: number = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));

         const requestDto: GetNotificationsRequestDTO = {
            userId: req.user.userId,
            page,
            limit
         };

         const notificationsResponse: GetNotificationsResponseDTO = await this._notificationQueryService.getUserNotifications(requestDto);

         res.status(HTTP_STATUS.OK).json(
            ApiResponse.success<GetNotificationsResponseDTO>(
               "Notifications retrieved successfully.",
               notificationsResponse
            )
         );

      } catch (error) {
         next(error);
      }
   }



   async getUnreadCount(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
         if (!req.user?.userId) {
            throw createHttpError(HTTP_STATUS.UNAUTHORIZED, USER_MESSAGES.USER_NOT_FOUND);
         }

         const unreadCount: number = await this._notificationQueryService.getUnreadCount(req.user.userId);

         res.status(HTTP_STATUS.OK).json(
            ApiResponse.success("Unread count retrieved.", { unreadCount: unreadCount })
         );

      } catch (error) {
         next(error);
      }
   }



   async markAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
         if (!req.user?.userId) {
            throw createHttpError(HTTP_STATUS.UNAUTHORIZED, USER_MESSAGES.USER_NOT_FOUND);
         }

         const notificationId = req.params.notificationId as string;

         await this._notificationQueryService.markAsRead(notificationId, req.user.userId);

         res.status(HTTP_STATUS.OK).json(ApiResponse.success("Notification marked as read."));

      } catch (error) {
         next(error);
      }
   }



   async markAllAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
         if (!req.user?.userId) {
            throw createHttpError(HTTP_STATUS.UNAUTHORIZED, USER_MESSAGES.USER_NOT_FOUND);
         }

         await this._notificationQueryService.markAllAsRead(req.user.userId);

         res.status(HTTP_STATUS.OK).json(ApiResponse.success("All notifications marked as read."));

      } catch (error) {
         next(error);
      }
   }

}