import Link from "next/link";

export const metadata = {
  title: "AI Agent Recommendations – AgenticLib",
  description: "Find the best AI agent for your use case.",
};

export default function RecommendationsPage() {
  return (
    <main className="min-h-screen relative overflow-hidden" style={{ background: "linear-gradient(180deg, #F5F3FF 0%, #FFFFFF 100%)" }}>

      {/* Decorative blurred circles */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div style={{
          position: "absolute",
          top: "-80px",
          right: "-120px",
          width: "600px",
          height: "600px",
          borderRadius: "50%",
          background: "rgba(91,91,214,0.08)",
          filter: "blur(80px)",
        }} />
        <div style={{
          position: "absolute",
          bottom: "-100px",
          left: "-100px",
          width: "400px",
          height: "400px",
          borderRadius: "50%",
          background: "rgba(91,91,214,0.08)",
          filter: "blur(70px)",
        }} />
      </div>

      {/* Nav */}
      <nav className="relative z-10 px-6 py-5 flex items-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-zinc-700 hover:text-zinc-900 transition-colors"
          style={{ textDecoration: "none", background: "white", border: "1px solid #e5e7eb", borderRadius: 999, padding: "8px 18px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
        >
          <span style={{ fontSize: 15 }}>‹</span> Home
        </Link>
      </nav>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 pb-20 pt-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 text-zinc-900" style={{ letterSpacing: "-0.02em" }}>
            AI Agent Recommendations
          </h1>
          <p className="text-base text-zinc-500 mx-auto" style={{ maxWidth: 480 }}>
            Watch how AgenticLib turns a few simple questions into tailored AI agent recommendations.
          </p>
        </div>

        {/* Video card */}
        <div className="rounded-2xl overflow-hidden bg-white" style={{ boxShadow: "0 4px 6px rgba(0,0,0,0.04), 0 20px 60px rgba(91,91,214,0.10), 0 0 0 1px rgba(91,91,214,0.08)" }}>
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
