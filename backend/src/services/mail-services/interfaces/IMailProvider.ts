// src/services/mail-services/interfaces/IMailProvider.ts

import { SendEmailOptions } from "@/types/email.types";


export interface IMailProvider {
    sendEmail(sendEmailOptions: SendEmailOptions): Promise<void>;
}