import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST() {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: "agenticlib.ai@gmail.com",
      subject: "Someone just played the AgenticLib demo video",
      text: `A visitor clicked play on the demo video at ${new Date().toUTCString()}.`,
      html: `<p>A visitor clicked <strong>play</strong> on the AgenticLib demo video.</p><p style="color:#888;font-size:13px;">${new Date().toUTCString()}</p>`,
    });

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    const stack = err instanceof Error ? err.stack : undefined;
    console.error("[notify-play] EMAIL_USER:", process.env.EMAIL_USER);
    console.error("[notify-play] EMAIL_PASS set:", !!process.env.EMAIL_PASS);
    console.error("[notify-play] error message:", message);
    console.error("[notify-play] stack:", stack);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
