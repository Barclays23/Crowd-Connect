// src/services/mail-services/providers/ResendProvider.ts
import { Resend } from "resend";
import { IMailProvider } from "../interfaces/IMailProvider";
import { SendEmailOptions } from "@/types/email.types";


export class ResendProvider implements IMailProvider {
    private resend: Resend;

    constructor() {
        this.resend = new Resend(process.env.RESEND_API_KEY);
    }

    async sendEmail({ toAddress, mailSubject, text, htmlTemplate }: SendEmailOptions): Promise<void> {
        const { error } = await this.resend.emails.send({
            // from    : process.env.DEFAULT_SENDER_EMAIL as string,
            from    : `Crowd Connect <${process.env.DEFAULT_SENDER_EMAIL}>`,
            to      : toAddress,
            subject : mailSubject || "No Subject",
            text    : text || "",
            html    : htmlTemplate
        });

        if (error) throw new Error(error.message);

        console.log("✅ Email sent successfully via Resend");
    }
}