// backend/src/repositories/interfaces/INotificationRepository.ts
import { 
    NotificationEntity, 
    CreateNotificationInput 
} from "@/entities/notification.entity";
import { GetNotificationsResult } from "@/types/notification.types";




export interface INotificationRepository {
    createNotification(input: CreateNotificationInput): Promise<NotificationEntity>;
    getUserNotifications(userId: string, skip: number, limit: number): Promise<GetNotificationsResult>;
    markAsRead(notificationId: string, userId: string): Promise<void>;
    markAllAsRead(userId: string): Promise<void>;
    getUnreadCount(userId: string): Promise<number>;
}