export const metadata = {
  title: "Insurance Broker AI Agent Visibility – AgenticLib",
  description:
    "Which AI agent brands appear when LLMs are asked about renewal management, document processing, and claims advocacy for insurance brokers. Updated daily.",
  robots: { index: false, follow: false },
};

export default function RalfiVisibilityPage() {
  return (
    <main className="min-h-screen page-gap-fix">
      <div className="max-w-4xl mx-auto px-8 py-20 text-center">
        <div
          className="inline-block text-xs font-semibold px-3 py-1 rounded-full mb-6"
          style={{ background: "rgba(5,150,105,0.10)", color: "#059669" }}
        >
          Brand Intelligence · Insurance Brokers
        </div>
        <h1
          className="text-4xl md:text-5xl font-bold mb-6"
          style={{ color: "#000000", letterSpacing: "-0.02em", lineHeight: 1.1 }}
        >
          Comparison Intelligence for Insurance Broker AI Agents
        </h1>
        <p className="text-lg max-w-xl mx-auto" style={{ color: "#000000", lineHeight: 1.6 }}>
          Track visibility, sentiment, and product feature intelligence for AI agents in the insurance broker market.
        </p>
        <p className="mt-16 text-sm" style={{ color: "#000000" }}>
          Access restricted.{" "}
          <a href="/product/ralfi-visibility/login" style={{ color: "#059669", textDecoration: "underline" }}>
            Sign in
          </a>
        </p>
      </div>
    </main>
  );
}
