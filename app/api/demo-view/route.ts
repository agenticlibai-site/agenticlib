import { sendEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    // Vercel injects geo headers automatically in production
    const city    = request.headers.get("x-vercel-ip-city")    ?? "Unknown city";
    const country = request.headers.get("x-vercel-ip-country") ?? "Unknown country";
    const region  = request.headers.get("x-vercel-ip-country-region") ?? "";

    const location = [decodeURIComponent(city), region, country].filter(Boolean).join(", ");
    const timestamp = new Date().toLocaleString("en-AU", { timeZone: "Australia/Sydney", dateStyle: "medium", timeStyle: "short" });

    await sendEmail({
      subject: `👀 Someone watched the Sage AI demo — ${location}`,
      html: `
        <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:24px;">
          <h2 style="margin:0 0 16px;font-size:20px;color:#1a1a2e;">Demo view</h2>
          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="padding:8px 0;color:#666;font-size:14px;width:100px;">Location</td>
              <td style="padding:8px 0;font-size:14px;font-weight:600;color:#1a1a2e;">${location}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#666;font-size:14px;">Time</td>
              <td style="padding:8px 0;font-size:14px;color:#1a1a2e;">${timestamp} AEST</td>
            </tr>
          </table>
        </div>
      `,
      fromName: "AgenticLib Demo",
    });

    return Response.json({ ok: true });
  } catch (err) {
    // Fail silently — never block the user's demo experience
    console.error("[demo-view] email failed:", err);
    return Response.json({ ok: false });
  }
}
