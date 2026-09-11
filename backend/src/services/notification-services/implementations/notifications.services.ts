// src/services/notification-services/implementations/notification.service.ts

// import { IMailService } from "@/services/mail-services/interfaces/IMailService";
// import { INotificationService } from "@/services/notification-services/interfaces/INotificationService";
// import { ISmsService } from "@/services/sms-services/interfaces/ISmsService";
// import { IPushService } from "@/services/push-services/interfaces/IPushService";


// export class NotificationService implements INotificationService {
//     constructor(
//         private readonly _mailService: IMailService,
//         // private readonly _smsService: ISmsService,
//         // private readonly _pushService: IPushService
//     ) {}

//     // ... methods go here


    // async notifyEventCancellation(user: any, eventName: string) {
    //     const message = `Sadly, ${eventName} has been canceled. Refunds are being processed.`;

    //     // 1. Always send an in-app notification (saved to database)
    //     await this.saveToDatabaseNotificationLog(user.id, message);

    //     // 2. Email Implementation (Using your updated function name!)
    //     if (user.preferences.emailNotifications) {
    //         await this._mailService.sendEmailToUser({
    //             toAddress: user.email,
    //             mailSubject: `Update regarding ${eventName}`,
    //             htmlTemplate: `<p>${message}</p>` // Or load a Handlebars template
    //         });
    //     }

    //     // 3. SMS Implementation (Future)
    //     // if (user.preferences.smsNotifications && user.phone) {
    //     //     await this._smsService.sendSms(user.phone, message);
    //     // }
    // }

        // async sendEventSuspendedToHost(
        //     hostRef: string,
        //     event: EventEntity,
        //     suspendReason: string
        // ): Promise<void> {}
    
        // async sendEventSuspendedToAttendees(
        //     eventId: string,
        //     suspendReason: string
        // ): Promise<void> {}

// }





// src/services/notification-services/implementations/notification.service.ts
import { INotificationService } from "@/services/notification-services/interfaces/INotificationService";
import { INotificationChannel } from "@/services/notification-services/interfaces/INotificationChannel";
import { INotificationContentProvider } from "@/services/notification-services/interfaces/INotificationContentProvider";
import { INotificationChannelMatrix } from "@/services/notification-services/interfaces/INotificationChannelMatrix";
import { NOTIFICATION_CHANNEL_TYPES, NotificationContent, NotifyRequest } from "@/types/notification.types";






export class NotificationService implements INotificationService {
    constructor(
        private readonly _channels          : Map<NOTIFICATION_CHANNEL_TYPES, INotificationChannel>,
        private readonly _contentProvider   : INotificationContentProvider,
        private readonly _channelMatrix     : INotificationChannelMatrix,
    ) {}


    async notify(request: NotifyRequest): Promise<void> {
        const channelTypes: NOTIFICATION_CHANNEL_TYPES[] = request.channelsOverride ?? this._channelMatrix.getChannelsFor(request.type);
        console.log('notification channelTypes :', channelTypes);

        const content: NotificationContent = await this._contentProvider.buildNotificationContent(request.type, request.recipient, request.data);

        console.log('notification content :', content);

        const dispatches = channelTypes.map(async (channelType) => {
            const channel: INotificationChannel | undefined = this._channels.get(channelType);
            console.log('notification channel :', channel);

            if (!channel) {
                console.warn(`[NotificationService] No channel registered for: ${channelType}`);
                return;
            }

            try {
                console.log(`NOTIFICATION SENDING 
                    to : ${request.recipient.email} 
                    for : ${request.type}. 
                    content title : ${content.title}.`
                )

                await channel.sendNotification({
                    recipient       : request.recipient,
                    type            : request.type,
                    content,
                    relatedEntity   : request.relatedEntity,
                });

            } catch (error) {
                // A failed email/SMS must never break the booking/event/payout flow that triggered it.
                console.error(`[NotificationService] ${channelType} delivery failed for ${request.type}:`, error);
            }
        });

        await Promise.allSettled(dispatches);
    }


    async notifyMany(requests: NotifyRequest[]): Promise<void> {
        await Promise.allSettled(requests.map((req) => this.notify(req)));
    }
}