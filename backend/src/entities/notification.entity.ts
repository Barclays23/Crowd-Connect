// backend/src/entities/notification.entity.ts
import { Document, Types } from "mongoose";
import { 
    NOTIFICATION_TYPES, 
    NOTIFICATION_RECIPIENT_ROLES, 
    RELATED_ENTITY_TYPE 
} from "@/types/notification.types";



export interface INotificationDocument extends Document {
    userRef             : Types.ObjectId;
    role                : NOTIFICATION_RECIPIENT_ROLES;
    notificationType    : NOTIFICATION_TYPES;
    title               : string;
    message             : string;
    isRead              : boolean;
    RELATED_ENTITY_TYPE?: RELATED_ENTITY_TYPE;
    relatedEntityId?    : Types.ObjectId;
    createdAt           : Date;
}



export interface NotificationEntity {
    notificationId: string;
    userId: string;
    role: NOTIFICATION_RECIPIENT_ROLES;
    notificationType: NOTIFICATION_TYPES;
    title: string;
    message: string;
    isRead: boolean;
    RELATED_ENTITY_TYPE?: RELATED_ENTITY_TYPE;
    relatedEntityId?: string;
    createdAt: Date;
}


export interface CreateNotificationInput {
    userId: string;
    role: NOTIFICATION_RECIPIENT_ROLES;
    type: NOTIFICATION_TYPES;
    title: string;
    message: string;
    RELATED_ENTITY_TYPE?: RELATED_ENTITY_TYPE;
    relatedEntityId?: string;
}
