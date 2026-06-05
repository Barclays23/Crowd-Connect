// src/services/notification-services/implementations/notification.service.ts

import { IMailService } from "@/services/mail-services/interfaces/IMailService";
import { INotificationService } from "@/services/notification-services/interfaces/INotificationService";
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