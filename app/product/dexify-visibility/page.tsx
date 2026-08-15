export const metadata = {
  title: "Tradie AI Agent Visibility – AgenticLib",
  description:
    "Which AI agent brands appear when LLMs are asked about voice quoting, invoicing, and admin agents for tradespeople. Updated daily.",
};

export default function DexifyVisibilityPage() {
  return (
    <main className="min-h-screen page-gap-fix">
      <div className="max-w-4xl mx-auto px-8 py-20 text-center">
        <div
          className="inline-block text-xs font-semibold px-3 py-1 rounded-full mb-6"
          style={{ background: "rgba(234,88,12,0.10)", color: "#EA580C" }}
        >
          AI Agent Builder · Trades
        </div>
        <h1
          className="text-4xl md:text-5xl font-bold mb-6"
          style={{ color: "#000000", letterSpacing: "-0.02em", lineHeight: 1.1 }}
        >
          Comparison Intelligence for Tradie AI Agents
        </h1>
        <p className="text-lg max-w-xl mx-auto" style={{ color: "#000000", lineHeight: 1.6 }}>
          Track your tradie AI agent&apos;s features, visibility, and sentiment against competitors.
        </p>
        <p className="mt-16 text-sm" style={{ color: "#000000" }}>Coming soon</p>
      </div>
    </main>
  );
}
