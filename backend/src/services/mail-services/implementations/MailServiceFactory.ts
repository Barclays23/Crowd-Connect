// src/services/mail-services/implementations/MailServiceFactory.ts

import { MailDeliveryService } from "@/services/mail-services/implementations/mail.services";
import { IMailService } from "@/services/mail-services/interfaces/IMailService";
import { NodemailerProvider } from "@/services/mail-services/providers/NodemailerProvider";
import { ResendProvider } from "@/services/mail-services/providers/ResendProvider";


export class MailServiceFactory {
    static create(): IMailService {
        const activeMailProvider: string = process.env.ACTIVE_EMAIL_PROVIDER || 'nodemailer';
        // const activeMailProvider: string = 'nodemailer';
        console.log('activeMailProvider :', activeMailProvider);

        switch (activeMailProvider.toLowerCase()) {
            case 'resend':
                return new MailDeliveryService(new ResendProvider());
            case 'nodemailer':
                return new MailDeliveryService(new NodemailerProvider());
            // case 'sendgrid':
                // return new MailDeliveryService(new SendgridProvider());
            default:
                return new MailDeliveryService(new NodemailerProvider());
        }
    }
}


export const mailDispatcher: IMailService = MailServiceFactory.create();