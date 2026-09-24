// frontend/src/types/notification.types.ts

import type { IPagination } from "@/types/common.types";


export interface NotificationEntity {
    notificationId: string;
    userId: string;
    role: string;
    type: string;
    title: string;
    message: string;
    isRead: boolean;
    RELATED_ENTITY_TYPE?: string;
    relatedEntityId?: string;
    createdAt: string;
}





export interface NotificationsResponse {
    notifications: NotificationEntity[];
    pagination: IPagination;
    unreadCount: number;
}
