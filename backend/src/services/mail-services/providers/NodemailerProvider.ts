// src/services/mail-services/providers/NodemailerProvider.ts
import nodemailer from "nodemailer";
import { IMailProvider } from "../interfaces/IMailProvider";
import { SendEmailOptions } from "@/types/email.types";




export class NodemailerProvider implements IMailProvider {
    private transporter: nodemailer.Transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            service         : process.env.SMTP_SERVICE,  
            // service is replaced by the host, port, secure  (below)
            // by explicitly declaring port: 465 and secure: true, you are forcing Nodemailer to use standard, encrypted HTTPS-style traffic
            // host        : "smtp.gmail.com",
            // port        : 465,               
            // secure      : true,
            auth        : {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
    }

    async sendEmail({ toAddress, mailSubject, text, htmlTemplate }: SendEmailOptions): Promise<void> {
        const mailOptions = {
            from    : process.env.SMTP_USER,
            to      : toAddress,
            subject : mailSubject || "No Subject",
            text,
            html    : htmlTemplate
        };
        
        const info = await this.transporter.sendMail({
            from    : process.env.SMTP_USER,
            to      : toAddress,
            subject : mailSubject || "No Subject",
            text,
            html    : htmlTemplate
        });

        console.log("✅ Email sent successfully via NodeMailer");
    }
}