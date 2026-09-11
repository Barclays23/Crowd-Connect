// services/notification-services/interfaces/INotificationQueryService.ts
import { GetNotificationsRequestDTO, GetNotificationsResponseDTO } from "@/dtos/notification.dto";




export interface INotificationQueryService {
    getUserNotifications(query: GetNotificationsRequestDTO): Promise<GetNotificationsResponseDTO>;

    markAsRead(notificationId: string, userId: string): Promise<void>;

    markAllAsRead(userId: string): Promise<void>;

    getUnreadCount(userId: string): Promise<number>;
}