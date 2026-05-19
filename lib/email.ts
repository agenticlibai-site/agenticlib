import nodemailer from "nodemailer";

const TO = "agenticlib.ai@gmail.com";

interface SendEmailOptions {
  subject: string;
  html: string;
}

export async function sendEmail({ subject, html }: SendEmailOptions): Promise<void> {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user) throw new Error("[email] EMAIL_USER env var is not set — cannot send email");
  if (!pass) throw new Error("[email] EMAIL_PASS env var is not set — cannot send email");

  // Transporter created per-call so it always reads current env vars.
  // Gmail App Password must be set in Vercel dashboard (not just .env.local).
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user, pass },
  });

  const from = `AgenticLib Analytics <${user}>`;

  console.log("[email] sending to:", TO, "subject:", subject);

  const info = await transporter.sendMail({ from, to: TO, subject, html });

  console.log("[email] sent — messageId:", info.messageId, "response:", info.response);
}
