// src/services/notification-services/implementations/NotificationServiceFactory.ts
import { NOTIFICATION_CHANNEL_TYPES } from "@/types/notification.types";
import { INotificationChannel } from "@/services/notification-services/interfaces/INotificationChannel";
import { InAppNotificationChannel } from "@/services/notification-services/implementations/channels/InAppNotificationChannel";
import { EmailNotificationChannel } from "@/services/notification-services/implementations/channels/EmailNotificationChannel";
import { NotificationContentProvider } from "@/services/notification-services/implementations/NotificationContentProvider";
import { NotificationChannelMatrix } from "@/services/notification-services/implementations/NotificationChannelMatrix";
import { NotificationService } from "@/services/notification-services/implementations/notifications.services";
import { mailDispatcher } from "@/services/mail-services/implementations/MailServiceFactory";
import { NotificationRepository } from "@/repositories/implementations/notification.repository";
import { SocketService } from "@/services/socket-services/implementations/socket.service";




// REPOSITORY LAYER
const notificationRepository = new NotificationRepository();


// SERVICE LAYER
export const socketService         = new SocketService()



// NOTIFICATION CHANNELS
const inAppChannel      = new InAppNotificationChannel(notificationRepository, socketService);
const emailChannel      = new EmailNotificationChannel(mailDispatcher);
// const smsChannel        = new SmsNotificationChannel(smsDispatcher);
// const whatsappChannel   = new WhatsAppNotificationChannel(whatsAppDispatcher);



const channelRegistry = new Map<NOTIFICATION_CHANNEL_TYPES, INotificationChannel>([
    [NOTIFICATION_CHANNEL_TYPES.IN_APP, inAppChannel],
    [NOTIFICATION_CHANNEL_TYPES.EMAIL,  emailChannel],
    // [NOTIFICATION_CHANNEL_TYPES.SMS,  smsChannel],
    // [NOTIFICATION_CHANNEL_TYPES.WHATSAPP,  whatsappChannel],
]);

const contentProvider   = new NotificationContentProvider()
const channelMatrix     = new NotificationChannelMatrix()


export const notificationDispatcher = new NotificationService(channelRegistry, contentProvider, channelMatrix);