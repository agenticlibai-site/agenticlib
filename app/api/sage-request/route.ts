import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

const TYPE_LABELS: Record<string, string> = {
  "use-case":        "More Use Cases",
  "business-domain": "Business Domain",
  "competitor":      "Competitor Brands",
  "analytics":       "More Analytics",
  "other":           "Other",
};

export async function POST(req: NextRequest) {
  const { type, detail, email } = await req.json() as {
    type:    string;
    detail:  string;
    email?:  string;
  };

  if (!type || !detail?.trim()) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const typeLabel = TYPE_LABELS[type] ?? type;
  const country   = req.headers.get("x-vercel-ip-country") ?? "Unknown";
  const city      = req.headers.get("x-vercel-ip-city")    ?? "Unknown";
  const location  = [city, country].filter(v => v && v !== "Unknown").join(", ") || "Unknown";

  try {
    await sendEmail({
      subject:  `[AgenticLib SAGE] New platform request — ${typeLabel}`,
      fromName: "AgenticLib SAGE",
      to:       "srinidhi.murali@agenticlib.com",
      html: `
        <h2 style="font-family:sans-serif;color:#18181b;margin:0 0 16px;">Platform Request — SAGE</h2>
        <table style="font-family:sans-serif;border-collapse:collapse;width:100%;max-width:520px;">
          <tr>
            <td style="padding:10px 14px;font-weight:600;color:#3f3f46;background:#f4f4f5;border-radius:4px;white-space:nowrap;">Request Type</td>
            <td style="padding:10px 14px;color:#18181b;">${typeLabel}</td>
          </tr>
          <tr>
            <td style="padding:10px 14px;font-weight:600;color:#3f3f46;background:#f4f4f5;border-radius:4px;white-space:nowrap;">Details</td>
            <td style="padding:10px 14px;color:#18181b;">${detail.trim().replace(/\n/g, "<br/>")}</td>
          </tr>
          ${email ? `
          <tr>
            <td style="padding:10px 14px;font-weight:600;color:#3f3f46;background:#f4f4f5;border-radius:4px;white-space:nowrap;">Reply-to</td>
            <td style="padding:10px 14px;color:#18181b;"><a href="mailto:${email}">${email}</a></td>
          </tr>` : ""}
          <tr>
            <td style="padding:10px 14px;font-weight:600;color:#3f3f46;background:#f4f4f5;border-radius:4px;white-space:nowrap;">Location</td>
            <td style="padding:10px 14px;color:#18181b;">📍 ${location}</td>
          </tr>
          <tr>
            <td style="padding:10px 14px;font-weight:600;color:#3f3f46;background:#f4f4f5;border-radius:4px;white-space:nowrap;">Timestamp</td>
            <td style="padding:10px 14px;color:#18181b;">${new Date().toUTCString()}</td>
          </tr>
        </table>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[sage-request] email error:", err);
    return NextResponse.json({ error: "Failed to send request" }, { status: 500 });
  }
}
