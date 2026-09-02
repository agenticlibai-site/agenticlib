import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SALES_SALT  = "|sales_gate_agenticlib_2026";
const DEXIFY_SALT = "|dexify_gate_agenticlib_2026";
const SDAI_SALT   = "|sdai_gate_agenticlib_2026";

async function hashToken(password: string, salt: string): Promise<string> {
  const data = new TextEncoder().encode(password + salt);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function middleware(request: NextRequest) {
  const { pathname, hostname } = request.nextUrl;

  // Skip gate on localhost
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return NextResponse.next();
  }

  // ── Sales visibility gate ───────────────────────────────────────────────────
  if (
    pathname.startsWith("/product/sales-visibility") &&
    !pathname.startsWith("/product/sales-visibility/login")
  ) {
    const token = request.cookies.get("sales_auth")?.value;
    const expected = await hashToken(process.env.SALES_ACCESS_PASSWORD ?? "", SALES_SALT);
    if (!token || token !== expected) {
      const url = request.nextUrl.clone();
      url.pathname = "/product/sales-visibility/login";
      return NextResponse.redirect(url);
    }
  }

  // ── Dexify visibility gate ──────────────────────────────────────────────────
  if (
    pathname.startsWith("/product/dexify-visibility") &&
    !pathname.startsWith("/product/dexify-visibility/login")
  ) {
    const token = request.cookies.get("dexify_auth")?.value;
    const expected = await hashToken(process.env.DEXIFY_ACCESS_PASSWORD ?? "", DEXIFY_SALT);
    if (!token || token !== expected) {
      const url = request.nextUrl.clone();
      url.pathname = "/product/dexify-visibility/login";
      return NextResponse.redirect(url);
    }
  }

  // ── SDAI visibility gate ────────────────────────────────────────────────────
  if (
    pathname.startsWith("/product/sdai-visibility") &&
    !pathname.startsWith("/product/sdai-visibility/login")
  ) {
    const token = request.cookies.get("sdai_auth")?.value;
    const expected = await hashToken(process.env.SDAI_ACCESS_PASSWORD ?? "", SDAI_SALT);
    if (!token || token !== expected) {
      const url = request.nextUrl.clone();
      url.pathname = "/product/sdai-visibility/login";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/product/sales-visibility/:path*",
    "/product/dexify-visibility/:path*",
    "/product/sdai-visibility/:path*",
  ],
};
