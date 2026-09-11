// backend/src/dtos/notification.dto.ts
import { NotificationEntity } from "@/entities/notification.entity";
import { IPagination } from "@/types/common.types";




export interface GetNotificationsRequestDTO {
    userId: string;
    page: number;
    limit: number;
}

export interface GetNotificationsResponseDTO {
    notifications: NotificationEntity[];
    unreadCount: number;
    pagination: IPagination;
}
