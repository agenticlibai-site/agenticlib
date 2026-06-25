import Link from "next/link";

export const metadata = {
  title: "Product – AgenticLib",
  description: "See AgenticLib in action.",
};

export default function ProductPage() {
  return (
    <main className="min-h-screen">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 px-6 py-3 flex items-center gap-4">
        <Link href="/" className="font-semibold text-zinc-900 text-sm hover:text-violet-600 transition-colors">
          ← AgenticLib
        </Link>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-16 flex flex-col gap-16">

        {/* Demo 1 */}
        <section className="text-center">
          <h2 className="text-4xl font-semibold mb-3 text-zinc-900">See how it works</h2>
          <p className="text-zinc-600 text-base mb-8">
            Watch how AgenticLib turns a few simple questions into tailored AI agent recommendations.
          </p>
          <div className="rounded-2xl overflow-hidden shadow-xl border border-gray-200">
            <video
              src="/AgenticLib demo video.mp4"
              controls
              poster="/recommendations-cover.png"
              className="w-full"
            />
          </div>
        </section>

        {/* Demo 2 */}
        <section className="text-center">
          <h2 className="text-4xl font-semibold mb-3 text-zinc-900">Where we&apos;re headed</h2>
          <p className="text-zinc-600 text-base mb-8">
            Compare, research, and decide — all in one place.
          </p>
          <div className="rounded-2xl overflow-hidden shadow-xl border border-gray-200">
            <video
              src="/C&R Video.mp4"
              controls
              poster="/research-cover.png"
              className="w-full"
            />
          </div>
        </section>

      </div>
    </main>
  );
}
