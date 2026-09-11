// src/services/notification-services/interfaces/INotificationChannel.ts
import { 
    NOTIFICATION_CHANNEL_TYPES, 
    ChannelDispatchPayload 
} from "@/types/notification.types";



// LSP: every concrete channel (InApp, Email, and tomorrow's Sms/WhatsApp) is interchangeable here.
export interface INotificationChannel {
    readonly channelType: NOTIFICATION_CHANNEL_TYPES;
    sendNotification(payload: ChannelDispatchPayload): Promise<void>;
}




// ── Tomorrow's SMS / WhatsApp channels plug in exactly the same way ──────────
// export class SmsNotificationChannel implements INotificationChannel {
//     public readonly channelType = NOTIFICATION_CHANNEL_TYPES.SMS;
//     constructor(private readonly _smsService: ISmsService) {}
//     async send(payload: ChannelDispatchPayload): Promise<void> {
//         if (!payload.recipient.mobile || !payload.content.smsText) return;
//         await this._smsService.sendSms(payload.recipient.mobile, payload.content.smsText);
//     }
// }