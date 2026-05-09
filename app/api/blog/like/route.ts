import { NextRequest, NextResponse } from "next/server";
import { blogs } from "@/data/blogs";

// In-memory store: slug → { likes, likedSessions }
// Resets on server restart — good enough for a simple social-proof feature.
const store = new Map<string, number>(
  blogs.map((b) => [b.slug, Math.floor(Math.random() * 18) + 3])
);

export async function GET() {
  return NextResponse.json(Object.fromEntries(store));
}

export async function POST(req: NextRequest) {
  const { slug, action } = (await req.json()) as { slug: string; action: "like" | "unlike" };

  if (!slug || !store.has(slug)) {
    return NextResponse.json({ error: "Unknown slug" }, { status: 400 });
  }

  const current = store.get(slug)!;
  const next = action === "unlike" ? Math.max(0, current - 1) : current + 1;
  store.set(slug, next);

  return NextResponse.json({ slug, likes: next });
}
