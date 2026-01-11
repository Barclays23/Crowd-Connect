import nodemailer from "nodemailer";

interface SendEmailOptions {
  toAddress: string;
  mailSubject?: string;
  text?: string;
  htmlTemplate?: string;
}

export async function sendEmail({ toAddress, mailSubject, text, htmlTemplate }: SendEmailOptions) {
  try {
    const transporter = nodemailer.createTransport({
      service: process.env.SMTP_SERVICE,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: toAddress,
      subject: mailSubject || "No Subject",
      text,
      html: htmlTemplate
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully", );

  } catch (error) {
    console.error("Email sending failed:", error);
    throw new Error("Could not send email");
  }
}




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