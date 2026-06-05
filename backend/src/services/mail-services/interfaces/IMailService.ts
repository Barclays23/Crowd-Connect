// src/services/mail-services/interfaces/IMailService.ts

import { SendEmailOptions } from "@/types/email.types";


export interface IMailService {
    sendEmailToUser(sendEmailOptions: SendEmailOptions): Promise<void>;
}