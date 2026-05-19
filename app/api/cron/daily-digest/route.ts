import { NextResponse } from "next/server";

// Popup analytics now send immediate emails per event.
// This cron endpoint is no longer needed.
export async function GET() {
  return NextResponse.json({ deprecated: true }, { status: 410 });
}
