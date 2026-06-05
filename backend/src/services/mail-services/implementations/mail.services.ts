// src/services/mail-services/implementations/mail.services.ts

import { IMailProvider } from "@/services/mail-services/interfaces/IMailProvider";
import { IMailService } from "@/services/mail-services/interfaces/IMailService";
import { SendEmailOptions } from "@/types/email.types";

// MailService
export class MailDeliveryService implements IMailService {
    constructor(
        private readonly _mailProvider: IMailProvider
    ) {}

    async sendEmailToUser(sendEmailOptions: SendEmailOptions): Promise<void> {
        try {
            await this._mailProvider.sendEmail(sendEmailOptions);

        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : String(error);
            console.error("🚨 MailService Error:", msg);
            throw new Error(`MailService failed to dispatch email: ${msg}`);
        }
    }
}