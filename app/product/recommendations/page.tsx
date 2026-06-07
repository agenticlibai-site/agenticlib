import Link from "next/link";

export const metadata = {
  title: "AI Agent Recommendations – AgenticLib",
  description: "Find the best AI agent for your use case.",
};

export default function RecommendationsPage() {
  return (
    <main className="min-h-screen" style={{ background: "linear-gradient(135deg, #0f0c29 0%, #1a1a5e 35%, #24243e 70%, #0d1b4b 100%)" }}>
      {/* Nav */}
      <nav className="px-6 py-4 flex items-center">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-sm font-medium transition-colors"
          style={{ color: "rgba(255,255,255,0.7)", textDecoration: "none" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "white"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.7)"; }}
        >
          ← AgenticLib
        </Link>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-5" style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)" }}>
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#a78bfa" }} />
            <span className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.7)" }}>Powered by AgenticLib</span>
          </div>
          <h1 className="text-5xl font-bold mb-4 text-white" style={{ letterSpacing: "-0.02em" }}>
            AI Agent Recommendations
          </h1>
          <p className="text-base mx-auto" style={{ color: "rgba(255,255,255,0.6)", maxWidth: 480 }}>
            Watch how AgenticLib turns a few simple questions into tailored AI agent recommendations.
          </p>
        </div>

        {/* Video */}
        <div className="rounded-2xl overflow-hidden" style={{ boxShadow: "0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.08)" }}>
          <video
            src="/AgenticLib demo video.mp4"
            controls
            poster="/recommendations-cover.png"
            className="w-full block"
          />
        </div>
      </div>
    </main>
  );
}
