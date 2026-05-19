import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

interface SendEmailOptions {
  subject: string;
  html: string;
}

const TO = "agenticlib.ai@gmail.com";
const FROM = `AgenticLib Analytics <${process.env.EMAIL_USER}>`;

export async function sendEmail({ subject, html }: SendEmailOptions): Promise<void> {
  await transporter.sendMail({ from: FROM, to: TO, subject, html });
}
