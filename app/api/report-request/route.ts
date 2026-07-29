import { sendEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const { email } = await req.json().catch(() => ({}));

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return Response.json({ error: "Valid email required" }, { status: 400 });
    }

    const country = req.headers.get("x-vercel-ip-country") ?? "Unknown";
    const city    = req.headers.get("x-vercel-ip-city") ?? "";
    const location = [city, country].filter(Boolean).join(", ");

    await sendEmail({
      subject:  `Report Request`,
      fromName: "AgenticLib",
      html: `
        <h2>New Free Report Request</h2>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Location:</strong> ${location || "Unknown"}</p>
        <p><strong>Time:</strong> ${new Date().toISOString()}</p>
      `,
    });

    return Response.json({ ok: true });
  } catch (err) {
    console.error("[report-request] error:", err);
    return Response.json({ error: "Failed to send" }, { status: 500 });
  }
}
