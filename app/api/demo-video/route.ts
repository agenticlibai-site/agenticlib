import { sql } from "@vercel/postgres";
import { sendEmail } from "@/lib/email";
import { companyEmailError } from "@/lib/companyEmail";

const NOTIFY_TO = "srinidhi.murali@featstream.com";

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

let tableReady = false;

async function ensureTable() {
  if (tableReady) return;
  await sql`
    CREATE TABLE IF NOT EXISTS demo_video_views (
      id SERIAL PRIMARY KEY,
      email VARCHAR(254) NOT NULL UNIQUE,
      country VARCHAR(100),
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;
  tableReady = true;
}

/** Records the company email someone gave to unlock the demo video. */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));

    // Honeypot: real visitors never fill the hidden "website" field.
    if (body.website) return Response.json({ ok: true });

    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const emailError = companyEmailError(email);
    if (emailError) return Response.json({ error: emailError }, { status: 400 });

    const country = req.headers.get("x-vercel-ip-country") ?? null;

    await ensureTable();
    const { rowCount } = await sql`
      INSERT INTO demo_video_views (email, country)
      VALUES (${email}, ${country})
      ON CONFLICT (email) DO NOTHING
    `;
    const returning = !rowCount;

    // Notify on every registration, flagging emails that have registered before.
    await sendEmail({
      to:       NOTIFY_TO,
      replyTo:  email,
      subject:  `Demo video watched by ${email}${returning ? " (again)" : ""}`,
      fromName: "FeatureStream Website",
      html: `
        <h2>Someone registered to watch the demo video</h2>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Country:</strong> ${escapeHtml(country ?? "Unknown")}</p>
        <p><strong>Time:</strong> ${new Date().toISOString()}</p>
        ${returning ? "<p>This email has registered before.</p>" : ""}
      `,
    }).catch((err) => console.error("[demo-video] notify failed:", err));

    return Response.json({ ok: true });
  } catch (err) {
    console.error("[demo-video] error:", err);
    return Response.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
