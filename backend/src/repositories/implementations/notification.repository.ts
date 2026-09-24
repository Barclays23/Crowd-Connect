// backend/src/repositories/implementations/notification.repository.ts
import { Types } from "mongoose";
import { 
    NotificationEntity, 
    CreateNotificationInput, 
    INotificationDocument
} from "@/entities/notification.entity";
import { NotificationModel } from "@/models/implementations/notification.model";
import { BaseRepository } from "@/repositories/base.repository";
import { INotificationRepository } from "@/repositories/interfaces/INotificationRepository";
import { mapNotificationDocToEntity } from "@/mappers/notification.mappers";
import { GetNotificationsResult } from "@/types/notification.types";






export class NotificationRepository extends BaseRepository<INotificationDocument> implements INotificationRepository {

    constructor() {
        super(NotificationModel);
    }


    async createNotification(input: CreateNotificationInput): Promise<NotificationEntity> {
        console.log('creating the notification in database.')
        const doc: INotificationDocument = await this.createOne({
            userRef             : new Types.ObjectId(input.userId),
            role                : input.role,
            notificationType    : input.type,
            title               : input.title,
            message             : input.message,
            RELATED_ENTITY_TYPE : input.RELATED_ENTITY_TYPE,
            relatedEntityId     : input.relatedEntityId ? new Types.ObjectId(input.relatedEntityId) : undefined,
        });

        console.log('created notification document :', doc)

        return mapNotificationDocToEntity(doc);
    }

    
    async getUserNotifications(userId: string, skip: number, limit: number): Promise<GetNotificationsResult> {
        const [docs, totalCount, unreadCount] = await Promise.all([
            this.findMany({ userRef: userId }, { skip, limit, sort: { createdAt: -1 } }),
            this.countDocuments({ userRef: userId }),
            this.countDocuments({ userRef: userId, isRead: false }),
        ]);

        return {
            notifications: docs.map((doc) => mapNotificationDocToEntity(doc)),
            totalCount,
            unreadCount,
        };
    }


    async markAsRead(notificationId: string, userId: string): Promise<void> {
        await this.updateOne({ _id: notificationId, userRef: userId }, { $set: { isRead: true } });
    }

    async markAllAsRead(userId: string): Promise<void> {
        await this.updateMany({ userRef: userId, isRead: false }, { $set: { isRead: true } });
    }

    async getUnreadCount(userId: string): Promise<number> {
        return this.countDocuments({ userRef: userId, isRead: false });
    }

}