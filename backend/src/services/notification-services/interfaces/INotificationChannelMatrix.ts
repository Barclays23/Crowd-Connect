// src/services/notification-services/interfaces/INotificationChannelMatrix.ts
import { 
    NOTIFICATION_TYPES, 
    NOTIFICATION_CHANNEL_TYPES 
} from "@/types/notification.types";



// SRP: this interface only knows "which channels does this notification type use".
export interface INotificationChannelMatrix {
    getChannelsFor(type: NOTIFICATION_TYPES): NOTIFICATION_CHANNEL_TYPES[];
}