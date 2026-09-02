import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    // Submissions logged here — visible in Vercel Functions logs under /api/sdai-feedback
    console.log(
      "[SDAI-FEEDBACK]",
      JSON.stringify({ ...data, _logged: new Date().toISOString() }, null, 2)
    );
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
