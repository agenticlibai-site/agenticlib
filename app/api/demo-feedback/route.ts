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
  const { feedback, industry } = await req.json();

  if (!feedback?.trim() || !industry?.trim()) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const country = req.headers.get("x-vercel-ip-country") ?? "Unknown";
  const city = req.headers.get("x-vercel-ip-city") ?? "Unknown";
  const location = [city, country].filter((v) => v && v !== "Unknown").join(", ") || "Unknown";

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: "srinidhi.murali@agenticlib.com",
      subject: "New demo feedback received",
      html: `
        <h2 style="font-family:sans-serif;color:#18181b;">New Demo Feedback</h2>
        <table style="font-family:sans-serif;border-collapse:collapse;width:100%;max-width:480px;">
          <tr>
            <td style="padding:8px 12px;font-weight:600;color:#3f3f46;background:#f4f4f5;border-radius:4px;">Feedback</td>
            <td style="padding:8px 12px;color:#18181b;">${feedback.replace(/\n/g, "<br/>")}</td>
          </tr>
          <tr>
            <td style="padding:8px 12px;font-weight:600;color:#3f3f46;background:#f4f4f5;border-radius:4px;">Industry / Domain</td>
            <td style="padding:8px 12px;color:#18181b;">${industry}</td>
          </tr>
          <tr>
            <td style="padding:8px 12px;font-weight:600;color:#3f3f46;background:#f4f4f5;border-radius:4px;">Location</td>
            <td style="padding:8px 12px;color:#18181b;">📍 ${location}</td>
          </tr>
          <tr>
            <td style="padding:8px 12px;font-weight:600;color:#3f3f46;background:#f4f4f5;border-radius:4px;">Timestamp</td>
            <td style="padding:8px 12px;color:#18181b;">${new Date().toUTCString()}</td>
          </tr>
        </table>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Demo feedback email error:", err);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
