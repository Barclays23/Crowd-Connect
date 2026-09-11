// src/services/notification-services/implementations/notification-query.service.ts

import { INotificationQueryService } from "@/services/notification-services/interfaces/INotificationQueryService";
import { GetNotificationsRequestDTO, GetNotificationsResponseDTO } from "@/dtos/notification.dto";
import { INotificationRepository } from "@/repositories/interfaces/INotificationRepository";
import { GetNotificationsResult } from "@/types/notification.types";
import { mapToNotificationsResponseDTO } from "@/mappers/notification.mappers";





export class NotificationQueryService implements INotificationQueryService {

    constructor(
        private readonly _notificationRepository: INotificationRepository
    ) {}


    async getUserNotifications(query: GetNotificationsRequestDTO): Promise<GetNotificationsResponseDTO> {
        const { userId, page, limit } = query;
        const skip: number = (page - 1) * limit;

        const notificationsResult: GetNotificationsResult = await this._notificationRepository.getUserNotifications(userId, skip, limit);

        return mapToNotificationsResponseDTO(notificationsResult, page, limit);
    }



    async markAsRead(notificationId: string, userId: string): Promise<void> {
        await this._notificationRepository.markAsRead(
            notificationId,
            userId
        );
    }


    async markAllAsRead(userId: string): Promise<void> {
        await this._notificationRepository.markAllAsRead(
            userId
        );
    }

    
    async getUnreadCount(userId: string): Promise<number> {
        return this._notificationRepository.getUnreadCount(
            userId
        );
    }
}