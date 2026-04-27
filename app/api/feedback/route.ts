import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function POST(req: NextRequest) {
  const { option, page, timestamp } = await req.json();

  if (!option) {
    return NextResponse.json({ error: "Missing option" }, { status: 400 });
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: "agenticlib.ai@gmail.com",
      subject: `AgenticLib Survey Response: ${option}`,
      html: `
        <h2 style="font-family:sans-serif;color:#18181b;">New Survey Response</h2>
        <table style="font-family:sans-serif;border-collapse:collapse;width:100%;max-width:480px;">
          <tr>
            <td style="padding:8px 12px;font-weight:600;color:#3f3f46;background:#f4f4f5;border-radius:4px;">Selected option</td>
            <td style="padding:8px 12px;color:#18181b;">${option}</td>
          </tr>
          <tr>
            <td style="padding:8px 12px;font-weight:600;color:#3f3f46;background:#f4f4f5;border-radius:4px;">Page</td>
            <td style="padding:8px 12px;color:#18181b;">${page ?? "unknown"}</td>
          </tr>
          <tr>
            <td style="padding:8px 12px;font-weight:600;color:#3f3f46;background:#f4f4f5;border-radius:4px;">Timestamp</td>
            <td style="padding:8px 12px;color:#18181b;">${timestamp ?? new Date().toISOString()}</td>
          </tr>
        </table>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Survey email error:", err);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
