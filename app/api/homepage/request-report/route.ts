import { sendEmail } from "@/lib/email";

export async function POST(request: Request) {
  let email: string;
  try {
    const body = await request.json();
    email = (body.email ?? "").trim().toLowerCase();
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: "Invalid email address" }, { status: 400 });
  }

  const timestamp = new Date().toISOString().replace("T", " ").slice(0, 19) + " UTC";

  await sendEmail({
    subject: `[AgenticLib] Brand Report Request — ${email}`,
    html: `
      <h2>New Brand Report Request</h2>
      <table style="border-collapse:collapse;font-family:monospace">
        <tr><td style="padding:4px 12px 4px 0"><strong>Email</strong></td><td>${email}</td></tr>
        <tr><td style="padding:4px 12px 4px 0"><strong>Timestamp</strong></td><td>${timestamp}</td></tr>
        <tr><td style="padding:4px 12px 4px 0"><strong>Source</strong></td><td>Homepage demo — "Request your brand's report"</td></tr>
      </table>
      <p>Follow up with this contact to discuss brand visibility reporting options.</p>
    `,
  });

  return Response.json({ ok: true });
}
