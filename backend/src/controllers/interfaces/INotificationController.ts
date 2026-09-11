// backend/src/controllers/interfaces/INotificationController.ts
import { Request, Response, NextFunction } from "express";




export interface INotificationController {
  getMyNotifications(req: Request, res: Response, next: NextFunction): Promise<void>;
  markAsRead(req: Request, res: Response, next: NextFunction): Promise<void>;
  markAllAsRead(req: Request, res: Response, next: NextFunction): Promise<void>;
  getUnreadCount(req: Request, res: Response, next: NextFunction): Promise<void>;
}