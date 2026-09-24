// src/services/notification-services/implementations/channels/InAppNotificationChannel.ts
import { NotificationEntity } from "@/entities/notification.entity";
import { INotificationRepository } from "@/repositories/interfaces/INotificationRepository";
import { INotificationChannel } from "@/services/notification-services/interfaces/INotificationChannel";
import { ISocketService } from "@/services/socket-services/interfaces/ISocketService";
import { 
    ChannelDispatchPayload, 
    NOTIFICATION_CHANNEL_TYPES 
} from "@/types/notification.types";





export class InAppNotificationChannel implements INotificationChannel {
    public readonly channelType = NOTIFICATION_CHANNEL_TYPES.IN_APP;

    constructor(
        private readonly _notificationRepository: INotificationRepository,
        private readonly _socketService: ISocketService
    ) {}



    async sendNotification(payload: ChannelDispatchPayload): Promise<void> {
        console.log('payload for InAppNotificationChannel.sendNotification :', payload)
        
        const savedNotification: NotificationEntity = await this._notificationRepository.createNotification({
            userId:            payload.recipient.userId,
            role:              payload.recipient.role,
            type:              payload.type,
            title:             payload.content.title,
            message:           payload.content.inAppMessage,
            RELATED_ENTITY_TYPE: payload.relatedEntity?.entityType,
            relatedEntityId:   payload.relatedEntity?.entityId,
        });
        console.log('savedNotification :', savedNotification)

        this._socketService.emitToUser(
            payload.recipient.userId, 
            "new_notification", // The event name the frontend will listen for
            savedNotification
        );

        console.log('socket emited notification to the user');
    }
}
