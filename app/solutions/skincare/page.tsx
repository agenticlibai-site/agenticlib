import Link from "next/link";

export const metadata = {
  title: "Skincare Intelligence – AgenticLib",
  description: "Track your skincare AI agent's features, visibility, and sentiment against competitors.",
};

export default function SkincarePage() {
  return (
    <main className="min-h-screen">
      <nav className="px-8 py-5">
        <Link
          href="/"
          style={{ textDecoration: "none", background: "white", borderRadius: 8, padding: "8px 16px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", color: "#C2186A", fontSize: 14, fontWeight: 600 }}
        >
          ← AgenticLib
        </Link>
      </nav>

      <div className="max-w-4xl mx-auto px-8 py-20 text-center">
        <div
          className="inline-block text-xs font-semibold px-3 py-1 rounded-full mb-6"
          style={{ background: "rgba(194,24,106,0.10)", color: "#C2186A" }}
        >
          AI Agent Builder · Skincare
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-6" style={{ color: "#160F2E", letterSpacing: "-0.02em", lineHeight: 1.1 }}>
          Comparison Intelligence for Skincare AI Agents
        </h1>
        <p className="text-lg max-w-xl mx-auto" style={{ color: "rgba(22,15,46,0.6)", lineHeight: 1.6 }}>
          Track your skincare AI agent&apos;s features, visibility, and sentiment against competitors.
        </p>
        <p className="mt-16 text-sm" style={{ color: "rgba(22,15,46,0.35)" }}>Coming soon</p>
      </div>
    </main>
  );
}
