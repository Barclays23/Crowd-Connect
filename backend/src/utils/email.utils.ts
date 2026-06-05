import { SendEmailOptions } from "@/types/email.types";
import nodemailer from "nodemailer";



// this function will be replaced by the mail provider class functions (_mailService.sendEmailToUser)
// export async function sendEmail({ toAddress, mailSubject, text, htmlTemplate }: SendEmailOptions) {
//   try {
//     const transporter = nodemailer.createTransport({
//       // service   : process.env.SMTP_SERVICE,  
//       // service is replaced by the host, port, secure  (below)
//       // by explicitly declaring port: 465 and secure: true, you are forcing Nodemailer to use standard, encrypted HTTPS-style traffic
//       host      : "smtp.gmail.com",
//       port      : 465,               
//       secure    : true,
//       auth      : {
//         user: process.env.SMTP_USER,
//         pass: process.env.SMTP_PASS
//       }
//     });

//     const mailOptions = {
//       from    : process.env.SMTP_USER,
//       to      : toAddress,
//       subject : mailSubject || "No Subject",
//       text,
//       html    : htmlTemplate
//     };

//     const info = await transporter.sendMail(mailOptions);
//     console.log("Email sent successfully", );

//   } catch (error: unknown) {
//     console.error("🚨 Nodemailer Error Details:", error); 
//     const errorMessage = error instanceof Error ? error.message : String(error);
//     throw new Error(`Could not send email: ${errorMessage}`);
//   }
// }




export function normalizeEmail(email: string): string {
  if (!email || typeof email !== 'string') {
    throw new Error('Email is required');
  }

  const normalized = email.trim().toLowerCase();

  if (!normalized.includes('@')) {
    throw new Error('Invalid email format');
  }

  return normalized;
}