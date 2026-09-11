import { GetNotificationsResponseDTO } from "@/dtos/notification.dto";
import { INotificationDocument, NotificationEntity } from "@/entities/notification.entity";
import { GetNotificationsResult } from "@/types/notification.types";





export function mapNotificationDocToEntity(doc: INotificationDocument): NotificationEntity {
    return {
        notificationId      : doc._id.toString(),
        userId              : doc.userRef.toString(),
        role                : doc.role,
        notificationType    : doc.notificationType,
        title               : doc.title,
        message             : doc.message,
        isRead              : doc.isRead,
        RELATED_ENTITY_TYPE : doc.RELATED_ENTITY_TYPE,
        relatedEntityId     : doc.relatedEntityId?.toString(),
        createdAt           : doc.createdAt,
    };
}





export function mapToNotificationsResponseDTO(
    result: GetNotificationsResult, 
    page: number, 
    limit: number
): GetNotificationsResponseDTO {
    const totalPages = Math.ceil(result.totalCount / limit);

    return {
        notifications: result.notifications,
        unreadCount: result.unreadCount,
        pagination: {
            totalCount: result.totalCount,
            limit: limit,
            currentPage: page,
            totalPages: totalPages
        }
    };
}
