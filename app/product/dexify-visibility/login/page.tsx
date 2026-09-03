import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createHash } from "node:crypto";

const SALT = "|dexify_gate_agenticlib_2026";

function computeToken(password: string): string {
  return createHash("sha256").update(password + SALT).digest("hex");
}

async function verifyPassword(formData: FormData) {
  "use server";
  const entered = String(formData.get("password") ?? "").trim();
  const correct = process.env.DEXIFY_ACCESS_PASSWORD ?? "";

  if (!entered || entered !== correct) {
    redirect("/product/dexify-visibility/login?error=1");
  }

  const token = computeToken(entered);
  const jar = await cookies();
  jar.set("dexify_auth", token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  redirect("/product/dexify-visibility");
}

export const metadata = {
  title: "Access Required – AgenticLib",
  robots: "noindex",
};

export default async function DexifyLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main
      className="page-gap-fix"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#FFF8F5",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18, width: "100%", maxWidth: 400 }}>
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
          padding: "40px 44px",
          width: "100%",
        }}
      >
        <div
          style={{
            display: "inline-block",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase" as const,
            background: "rgba(234,88,12,0.10)",
            color: "#EA580C",
            borderRadius: 999,
            padding: "4px 12px",
            marginBottom: 20,
          }}
        >
          Brand Intelligence · Tradie AI
        </div>

        <h1
          style={{
            fontSize: 22,
            fontWeight: 800,
            color: "#000",
            letterSpacing: "-0.02em",
            lineHeight: 1.2,
            margin: "0 0 8px",
          }}
        >
          Dexify: Tradie AI Agent Visibility
        </h1>
        <p style={{ fontSize: 14, color: "#000", margin: "0 0 28px", lineHeight: 1.5 }}>
          This report is available to invited partners only. Enter the access password below.
        </p>

        <form action={verifyPassword} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <input
            name="password"
            type="password"
            placeholder="Enter access password"
            required
            autoFocus
            style={{
              width: "100%",
              padding: "12px 14px",
              fontSize: 15,
              border: error ? "1.5px solid #DC2626" : "1.5px solid rgba(0,0,0,0.15)",
              borderRadius: 8,
              outline: "none",
              color: "#000",
              background: "#fff",
              boxSizing: "border-box" as const,
            }}
          />
          {error === "1" && (
            <p style={{ fontSize: 13, color: "#DC2626", margin: "-4px 0 0" }}>
              Incorrect password — please try again.
            </p>
          )}
          <style>{`
            .dexify-submit {
              background: #EA580C;
              color: #fff;
              border: none;
              border-radius: 8px;
              padding: 13px 0;
              font-size: 15px;
              font-weight: 700;
              cursor: pointer;
              letter-spacing: 0.02em;
              width: 100%;
              box-shadow: 0 2px 0 #C2410C;
              transition: transform 80ms ease, box-shadow 80ms ease, background 80ms ease;
            }
            .dexify-submit:hover { background: #DC2D0B; }
            .dexify-submit:active {
              transform: translateY(2px);
              box-shadow: 0 0 0 #C2410C;
              background: #B91C0A;
            }
          `}</style>
          <button type="submit" className="dexify-submit">
            Access report
          </button>
        </form>
      </div>

      {/* Feedback form button */}
      <style>{`
        .dexify-feedback-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          width: 100%;
          padding: 14px 0;
          text-align: center;
          font-size: 15px;
          font-weight: 700;
          color: #fff;
          text-decoration: none;
          background: #EA580C;
          border: none;
          border-radius: 12px;
          letter-spacing: 0.01em;
          box-shadow: 0 4px 16px rgba(234,88,12,0.32), 0 1px 3px rgba(234,88,12,0.20);
          transition: background 0.15s, box-shadow 0.15s, transform 0.1s;
          box-sizing: border-box;
        }
        .dexify-feedback-btn:hover {
          background: #DC2D0B;
          box-shadow: 0 6px 22px rgba(234,88,12,0.42), 0 2px 6px rgba(234,88,12,0.22);
          transform: translateY(-1px);
        }
        .dexify-feedback-btn:active {
          transform: translateY(1px);
          box-shadow: 0 2px 8px rgba(234,88,12,0.28);
        }
      `}</style>
      <a href="/product/dexify-visibility/feedback" className="dexify-feedback-btn">
        <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
          <path d="M4 6h12M4 10h8M4 14h6" stroke="white" strokeWidth="1.7" strokeLinecap="round"/>
          <rect x="2" y="2" width="16" height="16" rx="3" stroke="white" strokeWidth="1.5" fill="none" opacity="0.4"/>
        </svg>
        Share your feedback
      </a>
      </div>
    </main>
  );
}
