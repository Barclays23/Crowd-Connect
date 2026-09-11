// src/models/implementations/notification.model.ts
import { model, Schema } from "mongoose";
import { INotificationDocument } from "@/entities/notification.entity";
import { NOTIFICATION_RECIPIENT_ROLES } from "@/types/notification.types";




const notificationSchema = new Schema<INotificationDocument>(
    {
        userRef:           { type: Schema.Types.ObjectId, ref: "User", required: true },
        role:              { type: String, enum: Object.values(NOTIFICATION_RECIPIENT_ROLES), required: true },
        notificationType:  { type: String, required: true },
        title:             { type: String, required: true },
        message:           { type: String, required: true },
        isRead:            { type: Boolean, default: false },
        RELATED_ENTITY_TYPE: { type: String },
        relatedEntityId:   { type: Schema.Types.ObjectId },
    },
    { timestamps: { createdAt: true, updatedAt: false } }
);



// Fast "unread inbox, most recent first" query per user
notificationSchema.index({ userRef: 1, isRead: 1, createdAt: -1 });




export const NotificationModel = model<INotificationDocument>("Notification", notificationSchema);