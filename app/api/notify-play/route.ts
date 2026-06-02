import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST() {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: "agenticlib.ai@gmail.com",
      subject: "Someone just played the AgenticLib demo video",
      text: `A visitor clicked play on the demo video at ${new Date().toUTCString()}.`,
      html: `<p>A visitor clicked <strong>play</strong> on the AgenticLib demo video.</p><p style="color:#888;font-size:13px;">${new Date().toUTCString()}</p>`,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("notify-play error:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
