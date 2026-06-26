export const metadata = {
  title: "Marketing – AgenticLib",
  description: "Track your marketing AI agent's features, visibility, and sentiment against competitors.",
};

export default function MarketingPage() {
  return (
    <main className="min-h-screen">

      <div className="max-w-4xl mx-auto px-8 py-20 text-center">
        <div
          className="inline-block text-xs font-semibold px-3 py-1 rounded-full mb-6"
          style={{ background: "rgba(124,58,237,0.10)", color: "#7C3AED" }}
        >
          AI Agent Builder · Marketing
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-6" style={{ color: "#160F2E", letterSpacing: "-0.02em", lineHeight: 1.1 }}>
          Comparison Intelligence for Marketing AI Agents
        </h1>
        <p className="text-lg max-w-xl mx-auto" style={{ color: "rgba(22,15,46,0.6)", lineHeight: 1.6 }}>
          Track your marketing AI agent&apos;s features, visibility, and sentiment against competitors.
        </p>
        <p className="mt-16 text-sm" style={{ color: "rgba(22,15,46,0.35)" }}>Coming soon</p>
      </div>
    </main>
  );
}
