import { sendEmail } from "@/lib/email";

const NOTIFY_TO = "srinidhi.murali@agenticib.com";

export async function POST(req: Request) {
  try {
    const { email, plan } = await req.json().catch(() => ({}));

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return Response.json({ error: "Valid email required" }, { status: 400 });
    }

    const country  = req.headers.get("x-vercel-ip-country") ?? "Unknown";
    const city     = req.headers.get("x-vercel-ip-city") ?? "";
    const location = [city, country].filter(Boolean).join(", ");
    const planLabel = plan === "premium" ? "Premium ($25/mo)" : "Free";

    await sendEmail({
      to:      NOTIFY_TO,
      subject: `New pricing signup — ${planLabel}`,
      fromName: "AgenticLib",
      html: `
        <h2>New Pricing Sign-up</h2>
        <p><strong>Plan:</strong> ${planLabel}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Location:</strong> ${location || "Unknown"}</p>
        <p><strong>Time:</strong> ${new Date().toISOString()}</p>
      `,
    });

    return Response.json({ ok: true });
  } catch (err) {
    console.error("[pricing-signup] error:", err);
    return Response.json({ error: "Failed to send" }, { status: 500 });
  }
}
