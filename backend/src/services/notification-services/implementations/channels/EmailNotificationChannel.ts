// backend/src/services/notification-services/implementations/channels/EmailNotificationChannel.ts
import { INotificationChannel } from "@/services/notification-services/interfaces/INotificationChannel";
import { IMailService } from "@/services/mail-services/interfaces/IMailService";
import { ChannelDispatchPayload, NOTIFICATION_CHANNEL_TYPES } from "@/types/notification.types";
import { renderTemplateWithHandleBars } from "@/utils/templateLoader1";
import { TemplatePayloadMap } from "@/types/email.types";





export class EmailNotificationChannel implements INotificationChannel {
    public readonly channelType = NOTIFICATION_CHANNEL_TYPES.EMAIL;

    constructor(private readonly _mailService: IMailService) {}

    async sendNotification(payload: ChannelDispatchPayload): Promise<void> {
        if (!payload.recipient.email) {
            console.warn(`[EmailNotificationChannel] No email on file for user ${payload.recipient.userId}, skipping.`);
            return;
        }

        if (!payload.content.emailSubject) {
            console.warn(`[EmailNotificationChannel] No subject built for type ${payload.type}, skipping.`);
            return;
        }

        let htmlTemplate: string;

        if (payload.content.emailTemplate && payload.content.emailTemplatePayload) {
            try {
                // The dispatch is polymorphic across notification types, so the generic's
                // strict K <-> TemplatePayloadMap[K] pairing is relaxed here with a cast.
                // Correctness relies on each content builder pairing the right enum value
                // with the matching payload shape (see NotificationContentProvider).
                htmlTemplate = await renderTemplateWithHandleBars(
                    payload.content.emailTemplate,
                    payload.content.emailTemplatePayload as TemplatePayloadMap[typeof payload.content.emailTemplate]
                );
                
            } catch (error) {
                // Missing/misspelled template file, bad payload shape, etc. Log and bail -
                // a broken email must never break the booking/event/payout flow that triggered it.
                console.error(`[EmailNotificationChannel] Failed to render "${payload.content.emailTemplate}" for ${payload.type}:`, error);
                return;
            }
        } else if (payload.content.emailText) {
            // No template wired up yet for this type - send a minimal plain wrapper rather than nothing.
            htmlTemplate = `<p>${payload.content.emailText}</p>`;
        } else {
            console.warn(`[EmailNotificationChannel] No email content available for type ${payload.type}, skipping.`);
            return;
        }

        await this._mailService.sendEmailToUser({
            toAddress:    payload.recipient.email,
            mailSubject:  payload.content.emailSubject,
            text:         payload.content.emailText ?? payload.content.inAppMessage,
            htmlTemplate,
        });
    }
}