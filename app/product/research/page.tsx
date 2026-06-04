import Link from "next/link";

export const metadata = {
  title: "Research & Compare – AgenticLib",
  description: "Compare AI agents side by side.",
};

export default function ResearchPage() {
  return (
    <main className="min-h-screen" style={{ background: "#fafafa" }}>
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 px-6 py-3 flex items-center gap-4">
        <Link href="/" className="font-semibold text-zinc-900 text-sm hover:text-violet-600 transition-colors">
          ← AgenticLib
        </Link>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-semibold mb-3 text-zinc-900">Research & Compare</h1>
          <p className="text-zinc-600 text-base">
            Compare, research, and decide — all in one place.
          </p>
        </div>

        <div className="rounded-2xl overflow-hidden shadow-xl border border-gray-200">
          <video
            src="/C&R Video.mp4"
            controls
            poster="/research-cover.png"
            className="w-full"
          />
        </div>
      </div>
    </main>
  );
}
