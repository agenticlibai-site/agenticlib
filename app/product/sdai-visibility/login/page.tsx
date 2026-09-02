import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createHash } from "node:crypto";

const SALT = "|sdai_gate_agenticlib_2026";

function computeToken(password: string): string {
  return createHash("sha256").update(password + SALT).digest("hex");
}

async function verifyPassword(formData: FormData) {
  "use server";
  const entered = String(formData.get("password") ?? "").trim();
  const correct = process.env.SDAI_ACCESS_PASSWORD ?? "";

  if (!entered || entered !== correct) {
    redirect("/product/sdai-visibility/login?error=1");
  }

  const token = computeToken(entered);
  const jar = await cookies();
  jar.set("sdai_auth", token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  redirect("/product/sdai-visibility/report");
}

export const metadata = {
  title: "Access Required – AgenticLib",
  robots: "noindex",
};

export default async function SdaiLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#F5F3FF",
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
            background: "rgba(124,58,237,0.10)",
            color: "#7C3AED",
            borderRadius: 999,
            padding: "4px 12px",
            marginBottom: 20,
          }}
        >
          Brand Intelligence · AI Video Creation
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
          AI Video Creation Visibility Report
        </h1>
        <p style={{ fontSize: 14, color: "#444", margin: "0 0 28px", lineHeight: 1.5 }}>
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
            .sdai-submit {
              background: #7C3AED;
              color: #fff;
              border: none;
              border-radius: 8px;
              padding: 13px 0;
              font-size: 15px;
              font-weight: 700;
              cursor: pointer;
              letter-spacing: 0.02em;
              width: 100%;
              box-shadow: 0 2px 0 #5B21B6;
              transition: transform 80ms ease, box-shadow 80ms ease, background 80ms ease;
            }
            .sdai-submit:hover { background: #6D28D9; }
            .sdai-submit:active {
              transform: translateY(2px);
              box-shadow: 0 0 0 #5B21B6;
              background: #5B21B6;
            }
          `}</style>
          <button type="submit" className="sdai-submit">
            Access report
          </button>
        </form>
      </div>

      {/* Feedback form button — visible to anyone on the login page */}
      <a
        href="/product/sdai-visibility/feedback"
        style={{
          display: "block",
          width: "100%",
          padding: "13px 0",
          textAlign: "center" as const,
          fontSize: 15,
          fontWeight: 700,
          color: "#7C3AED",
          textDecoration: "none",
          background: "rgba(124,58,237,0.08)",
          border: "1.5px solid rgba(124,58,237,0.25)",
          borderRadius: 12,
          letterSpacing: "0.01em",
          transition: "background 0.15s, border-color 0.15s",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.background = "rgba(124,58,237,0.14)";
          (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(124,58,237,0.5)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.background = "rgba(124,58,237,0.08)";
          (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(124,58,237,0.25)";
        }}
      >
        📋 Feedback form
      </a>
      </div>
    </main>
  );
}
