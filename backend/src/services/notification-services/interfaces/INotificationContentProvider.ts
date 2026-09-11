// backend/src/services/notification-services/interfaces/INotificationContentProvider.ts

import { 
    NOTIFICATION_TYPES, 
    NotificationContent, 
    NotificationRecipient
} from "@/types/notification.types";



// SRP: this interface only knows how to turn (type, recipient, data) into message content.
// It knows nothing about how that content gets delivered.
export interface INotificationContentProvider {
    buildNotificationContent(
        type: NOTIFICATION_TYPES,
        recipient: NotificationRecipient,
        data: Record<string, unknown>
    ): NotificationContent | Promise<NotificationContent>;
}
