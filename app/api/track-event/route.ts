import { NextRequest, NextResponse } from "next/server";
import { trackEvent } from "@/lib/serverAnalytics";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    console.error("[track-event] failed to parse JSON body");
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    console.error("[track-event] body is not an object:", typeof body);
    return NextResponse.json({ error: "Body must be an object" }, { status: 400 });
  }

  const { event, payload } = body as Record<string, unknown>;

  if (typeof event !== "string" || !event.trim()) {
    console.error("[track-event] missing or invalid event field:", event);
    return NextResponse.json({ error: "event must be a non-empty string" }, { status: 400 });
  }

  console.log("[track-event] received:", event, payload);

  try {
    await trackEvent(event, payload);
    console.log("[track-event] done:", event);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[track-event] trackEvent threw for event:", event, err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
