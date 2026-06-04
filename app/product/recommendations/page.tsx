import Link from "next/link";

export const metadata = {
  title: "AI Agent Recommendations – AgenticLib",
  description: "Find the best AI agent for your use case.",
};

export default function RecommendationsPage() {
  return (
    <main className="min-h-screen" style={{ background: "#fafafa" }}>
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 px-6 py-3 flex items-center gap-4">
        <Link href="/" className="font-semibold text-zinc-900 text-sm hover:text-violet-600 transition-colors">
          ← AgenticLib
        </Link>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-semibold mb-3 text-zinc-900">AI Agent Recommendations</h1>
          <p className="text-zinc-600 text-base">
            Watch how AgenticLib turns a few simple questions into tailored AI agent recommendations.
          </p>
        </div>

        <div className="rounded-2xl overflow-hidden shadow-xl border border-gray-200">
          <video
            src="/AgenticLib demo video.mp4"
            controls
            poster="/recommendations-cover.png"
            className="w-full"
          />
        </div>
      </div>
    </main>
  );
}
