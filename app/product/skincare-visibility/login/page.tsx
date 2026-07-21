import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createHash } from "node:crypto";

const SALT = "|skincare_gate_agenticlib_2026";

function computeToken(password: string): string {
  return createHash("sha256").update(password + SALT).digest("hex");
}

async function verifyPassword(formData: FormData) {
  "use server";
  const entered = String(formData.get("password") ?? "").trim();
  const correct = process.env.SKINCARE_ACCESS_PASSWORD ?? "";

  if (!entered || entered !== correct) {
    redirect("/product/skincare-visibility/login?error=1");
  }

  const token = computeToken(entered);
  const jar = await cookies();
  jar.set("skincare_auth", token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  redirect("/product/skincare-visibility");
}

export const metadata = {
  title: "Access Required – AgenticLib",
  robots: "noindex",
};

export default async function SkincareLoginPage({
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
        background: "linear-gradient(160deg, #EEF0FD 0%, #F4F5FD 45%, #F9FAFE 100%)",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
          padding: "40px 44px",
          width: "100%",
          maxWidth: 400,
        }}
      >
        <div
          style={{
            display: "inline-block",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            background: "rgba(59,77,190,0.10)",
            color: "#3B4DBE",
            borderRadius: 999,
            padding: "4px 12px",
            marginBottom: 20,
          }}
        >
          Skincare Intelligence
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
          Dewwie Report
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
              boxSizing: "border-box",
            }}
          />
          {error === "1" && (
            <p style={{ fontSize: 13, color: "#DC2626", margin: "-4px 0 0" }}>
              Incorrect password — please try again.
            </p>
          )}
          <button
            type="submit"
            style={{
              background: "#3B4DBE",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "13px 0",
              fontSize: 15,
              fontWeight: 700,
              cursor: "pointer",
              letterSpacing: "0.02em",
            }}
          >
            Access report
          </button>
        </form>
      </div>
    </main>
  );
}
