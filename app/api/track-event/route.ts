import { NextRequest, NextResponse } from "next/server";
import { trackEvent } from "@/lib/serverAnalytics";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Body must be an object" }, { status: 400 });
  }

  const { event, payload } = body as Record<string, unknown>;

  if (typeof event !== "string" || !event.trim()) {
    return NextResponse.json({ error: "event must be a non-empty string" }, { status: 400 });
  }

  console.log("[api/track-event] received:", event, payload);
  await trackEvent(event, payload);
  console.log("[api/track-event] processed:", event);

  return NextResponse.json({ ok: true });
}
