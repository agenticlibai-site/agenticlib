import { sendEmail } from "@/lib/email";

const NOTIFY_TO = "srinidhi.murali@featstream.com";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

export async function POST(req: Request) {
  try {
    const { email, message, page, website } = await req.json().catch(() => ({}));

    // Honeypot: real visitors never fill the hidden "website" field.
    if (website) return Response.json({ ok: true });

    if (typeof email !== "string" || email.length > 254 || !EMAIL_RE.test(email.trim())) {
      return Response.json({ error: "Please enter a valid email." }, { status: 400 });
    }
    if (typeof message !== "string" || !message.trim() || message.length > 5000) {
      return Response.json({ error: "Please enter your enquiry." }, { status: 400 });
    }

    const country  = req.headers.get("x-vercel-ip-country") ?? "Unknown";
    const city     = req.headers.get("x-vercel-ip-city") ?? "";
    const location = [city, country].filter(Boolean).join(", ");
    const from     = email.trim();

    await sendEmail({
      to:       NOTIFY_TO,
      replyTo:  from,
      subject:  `New website enquiry from ${from}`,
      fromName: "FeatureStream Website",
      html: `
        <h2>New website enquiry</h2>
        <p><strong>Email:</strong> ${escapeHtml(from)}</p>
        <p><strong>Enquiry:</strong></p>
        <p style="white-space:pre-wrap">${escapeHtml(message.trim())}</p>
        <p><strong>Page:</strong> ${escapeHtml(typeof page === "string" ? page.slice(0, 300) : "unknown")}</p>
        <p><strong>Location:</strong> ${escapeHtml(location || "Unknown")}</p>
        <p><strong>Time:</strong> ${new Date().toISOString()}</p>
        <p style="color:#888">Reply to this email to answer them directly.</p>
      `,
    });

    return Response.json({ ok: true });
  } catch (err) {
    console.error("[contact] error:", err);
    return Response.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
