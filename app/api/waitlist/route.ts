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
    CREATE TABLE IF NOT EXISTS waitlist (
      id SERIAL PRIMARY KEY,
      email VARCHAR(254) NOT NULL UNIQUE,
      company_name VARCHAR(200) NOT NULL,
      business_domain VARCHAR(200) NOT NULL,
      country VARCHAR(100),
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;
  tableReady = true;
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));

    // Honeypot: real visitors never fill the hidden "website" field.
    if (body.website) return Response.json({ ok: true });

    const email   = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const company = typeof body.company === "string" ? body.company.trim() : "";
    const domain  = typeof body.domain === "string" ? body.domain.trim() : "";

    const emailError = companyEmailError(email);
    if (emailError) return Response.json({ error: emailError }, { status: 400 });
    if (!company || company.length > 200) {
      return Response.json({ error: "Please enter your company name." }, { status: 400 });
    }
    if (!domain || domain.length > 200) {
      return Response.json({ error: "Please enter your business domain, e.g. Legal or Healthcare." }, { status: 400 });
    }

    const country = req.headers.get("x-vercel-ip-country") ?? null;

    await ensureTable();
    const { rowCount } = await sql`
      INSERT INTO waitlist (email, company_name, business_domain, country)
      VALUES (${email}, ${company}, ${domain}, ${country})
      ON CONFLICT (email) DO NOTHING
    `;

    // Only notify on a new sign-up; a repeat submission just gets the same success message.
    if (rowCount) {
      await sendEmail({
        to:       NOTIFY_TO,
        replyTo:  email,
        subject:  `New waitlist sign-up: ${company} (${domain})`,
        fromName: "FeatureStream Website",
        html: `
          <h2>New waitlist sign-up</h2>
          <p><strong>Email:</strong> ${escapeHtml(email)}</p>
          <p><strong>Company:</strong> ${escapeHtml(company)}</p>
          <p><strong>Business domain:</strong> ${escapeHtml(domain)}</p>
          <p><strong>Country:</strong> ${escapeHtml(country ?? "Unknown")}</p>
          <p><strong>Time:</strong> ${new Date().toISOString()}</p>
        `,
      }).catch((err) => console.error("[waitlist] notify failed:", err));
    }

    return Response.json({ ok: true });
  } catch (err) {
    console.error("[waitlist] error:", err);
    return Response.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
