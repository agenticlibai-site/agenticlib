import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createHash } from "node:crypto";

const SALT = "|hsai_gate_agenticlib_2026";

function computeToken(password: string): string {
  return createHash("sha256").update(password + SALT).digest("hex");
}

async function verifyPassword(formData: FormData) {
  "use server";
  const entered = String(formData.get("password") ?? "").trim();
  const correct = process.env.HSAI_ACCESS_PASSWORD ?? "";

  if (!entered || entered !== correct) {
    redirect("/product/hsai-visibility/login?error=1");
  }

  const token = computeToken(entered);
  const jar = await cookies();
  jar.set("hsai_auth", token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  redirect("/product/hsai-visibility");
}

export const metadata = {
  title: "Access Required – AgenticLib",
  robots: "noindex",
};

export default async function HsaiLoginPage({
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
        background: "#F7F8FC",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18, width: "100%", maxWidth: 400, padding: "0 16px" }}>
        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
            padding: "40px 44px",
            width: "100%",
            boxSizing: "border-box" as const,
          }}
        >
          <div
            style={{
              display: "inline-block",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase" as const,
              background: "rgba(4,120,87,0.10)",
              color: "#047857",
              borderRadius: 999,
              padding: "4px 12px",
              marginBottom: 20,
            }}
          >
            Brand Intelligence · Hospitality AI Agents
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
            SimbaStack: Ranger AI Report
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
              .hsai-submit {
                background: #047857;
                color: #fff;
                border: none;
                border-radius: 8px;
                padding: 13px 0;
                font-size: 15px;
                font-weight: 700;
                cursor: pointer;
                letter-spacing: 0.02em;
                width: 100%;
                box-shadow: 0 2px 0 #065f46;
                transition: transform 80ms ease, box-shadow 80ms ease, background 80ms ease;
              }
              .hsai-submit:hover { background: #036648; }
              .hsai-submit:active {
                transform: translateY(2px);
                box-shadow: 0 0 0 #065f46;
                background: #025337;
              }
            `}</style>
            <button type="submit" className="hsai-submit">
              Access report
            </button>
          </form>
        </div>

        {/* Feedback button */}
        <style>{`
          .hsai-feedback-btn {
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
            background: #047857;
            border: none;
            border-radius: 12px;
            letter-spacing: 0.01em;
            box-shadow: 0 4px 16px rgba(4,120,87,0.32), 0 1px 3px rgba(4,120,87,0.20);
            transition: background 0.15s, box-shadow 0.15s, transform 0.1s;
            box-sizing: border-box;
            margin-top: 12px;
          }
          .hsai-feedback-btn:hover {
            background: #036648;
            box-shadow: 0 6px 22px rgba(4,120,87,0.42), 0 2px 6px rgba(4,120,87,0.22);
            transform: translateY(-1px);
          }
          .hsai-feedback-btn:active {
            transform: translateY(1px);
            box-shadow: 0 2px 8px rgba(4,120,87,0.28);
          }
        `}</style>
        <a href="/product/hsai-visibility/feedback" className="hsai-feedback-btn">
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
