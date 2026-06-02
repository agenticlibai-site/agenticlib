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
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    const stack = err instanceof Error ? err.stack : undefined;
    console.error("[notify-play] GMAIL_USER:", process.env.GMAIL_USER);
    console.error("[notify-play] GMAIL_APP_PASSWORD set:", !!process.env.GMAIL_APP_PASSWORD);
    console.error("[notify-play] error message:", message);
    console.error("[notify-play] stack:", stack);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
