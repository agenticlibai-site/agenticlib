import { sendEmail } from "@/lib/email";

const NOTIFY_TO = "srinidhi.murali@featstream.com";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

function str(v: unknown, max: number): string | null {
  return typeof v === "string" && v.length <= max ? v.trim() : null;
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));

    // Honeypot: real visitors never fill the hidden "website" field.
    if (body.website) return Response.json({ ok: true });

    const name    = str(body.name, 200);
    const company = str(body.company, 200);
    const email   = str(body.email, 254);
    const phone   = str(body.phone ?? "", 50);
    const message = str(body.message, 5000);

    if (!name)                        return Response.json({ error: "Please enter your name." }, { status: 400 });
    if (!company)                     return Response.json({ error: "Please enter your company name." }, { status: 400 });
    if (!email || !EMAIL_RE.test(email)) return Response.json({ error: "Please enter a valid work email." }, { status: 400 });
    if (phone === null)               return Response.json({ error: "Please enter a shorter phone number." }, { status: 400 });
    if (!message)                     return Response.json({ error: "Please tell us how we can help." }, { status: 400 });

    const country  = req.headers.get("x-vercel-ip-country") ?? "Unknown";
    const city     = req.headers.get("x-vercel-ip-city") ?? "";
    const location = [city, country].filter(Boolean).join(", ");

    await sendEmail({
      to:       NOTIFY_TO,
      replyTo:  email,
      subject:  `Demo request from ${name} (${company})`,
      fromName: "FeatureStream Website",
      html: `
        <h2>New demo request</h2>
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Company:</strong> ${escapeHtml(company)}</p>
        <p><strong>Work email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Phone:</strong> ${escapeHtml(phone || "—")}</p>
        <p><strong>How can we help?</strong></p>
        <p style="white-space:pre-wrap">${escapeHtml(message)}</p>
        <p><strong>Location:</strong> ${escapeHtml(location || "Unknown")}</p>
        <p><strong>Time:</strong> ${new Date().toISOString()}</p>
        <p style="color:#888">Reply to this email to answer them directly.</p>
      `,
    });

    return Response.json({ ok: true });
  } catch (err) {
    console.error("[demo] error:", err);
    return Response.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
