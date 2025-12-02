import nodemailer from "nodemailer";

export async function sendEmail({ toAddress, mailSubject, text, htmlTemplate }) {
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
