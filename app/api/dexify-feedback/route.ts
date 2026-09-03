import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function POST(req: Request) {
  try {
    const data = await req.json();

    console.log("[DEXIFY-FEEDBACK]", JSON.stringify({ ...data, _logged: new Date().toISOString() }, null, 2));

    const company = data.company_name || "Not provided";
    const followup = data.q2b_what_specifically
      ? `<tr><td style="padding:8px 12px;font-weight:600;color:#3f3f46;background:#f4f4f5;">↳ What specifically?</td><td style="padding:8px 12px;color:#18181b;">${data.q2b_what_specifically}</td></tr>`
      : "";

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: "srinidhi.murali@agenticlib.com",
      subject: `Dexify Report Feedback — ${company}`,
      html: `
        <h2 style="font-family:sans-serif;color:#EA580C;margin:0 0 4px;">Dexify Report Feedback</h2>
        <p style="font-family:sans-serif;color:#6b7280;font-size:13px;margin:0 0 20px;">Submitted ${new Date(data.submittedAt ?? Date.now()).toLocaleString("en-AU", { timeZone: "Australia/Sydney" })} AEST</p>
        <table style="font-family:sans-serif;border-collapse:collapse;width:100%;max-width:560px;">
          <tr>
            <td style="padding:8px 12px;font-weight:600;color:#3f3f46;background:#f4f4f5;border-radius:4px;width:200px;">Company</td>
            <td style="padding:8px 12px;color:#18181b;">${company}</td>
          </tr>
          <tr>
            <td style="padding:8px 12px;font-weight:600;color:#3f3f46;background:#f4f4f5;">What didn't you know before?</td>
            <td style="padding:8px 12px;color:#18181b;">${data.q1_didnt_know || "—"}</td>
          </tr>
          <tr>
            <td style="padding:8px 12px;font-weight:600;color:#3f3f46;background:#f4f4f5;">Changed what you're building?</td>
            <td style="padding:8px 12px;color:#18181b;">${data.q2_changed_plans || "—"}</td>
          </tr>
          ${followup}
          <tr>
            <td style="padding:8px 12px;font-weight:600;color:#3f3f46;background:#f4f4f5;">What's missing?</td>
            <td style="padding:8px 12px;color:#18181b;">${data.q3_whats_missing || "—"}</td>
          </tr>
        </table>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[DEXIFY-FEEDBACK] email error:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
