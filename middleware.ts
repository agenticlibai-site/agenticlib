import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SALT = "|sales_gate_agenticlib_2026";

async function expectedToken(): Promise<string> {
  const password = process.env.SALES_ACCESS_PASSWORD ?? "";
  const data = new TextEncoder().encode(password + SALT);
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

  if (
    pathname.startsWith("/product/sales-visibility") &&
    !pathname.startsWith("/product/sales-visibility/login")
  ) {
    const token = request.cookies.get("sales_auth")?.value;
    const expected = await expectedToken();

    if (!token || token !== expected) {
      const url = request.nextUrl.clone();
      url.pathname = "/product/sales-visibility/login";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/product/sales-visibility/:path*"],
};
