import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { seoDomains, getSeoDomain } from "@/data/seo-domains";
import { domains } from "@/data/agents";

// ── Static params ─────────────────────────────────────────────────────────────

export function generateStaticParams() {
  return seoDomains.map((d) => ({ slug: d.slug }));
}

// ── Metadata ──────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const domain = getSeoDomain(slug);
  if (!domain) return {};

  return {
    title: domain.metaTitle,
    description: domain.metaDescription,
    alternates: { canonical: `https://agenticlib.com/domain/${slug}` },
    openGraph: {
      title: domain.metaTitle,
      description: domain.metaDescription,
      url: `https://agenticlib.com/domain/${slug}`,
      siteName: "AgenticLib",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: domain.metaTitle,
      description: domain.metaDescription,
    },
  };
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function DomainSeoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const domain = getSeoDomain(slug);
  if (!domain) notFound();

  const agentDomain = domains.find((d) => d.slug === domain.agentLibrarySlug);
  const agents = agentDomain?.agents ?? [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">

      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-100">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="AgenticLib" className="h-6 w-auto" />
            <span className="text-base font-semibold tracking-tight">AgenticLib</span>
          </Link>
          <Link href="/explore" className="text-sm text-zinc-500 hover:text-zinc-900 transition">
            Browse all domains →
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">

        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-zinc-400">
          <ol className="flex items-center gap-2">
            <li><Link href="/" className="hover:text-zinc-600 transition">Home</Link></li>
            <li>/</li>
            <li><Link href="/explore" className="hover:text-zinc-600 transition">Domains</Link></li>
            <li>/</li>
            <li className="text-zinc-600">{domain.name}</li>
          </ol>
        </nav>

        {/* Hero - short intro */}
        <section className="mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-zinc-900 tracking-tight mb-4">
            {domain.h1}
          </h1>
          <p className="text-lg text-zinc-600 leading-relaxed max-w-2xl">{domain.intro}</p>
        </section>

        {/* ── AGENT CARDS - primary conversion area ─────────────────────────── */}
        {agents.length > 0 && (
          <section className="mb-14">
            <h2 className="text-xl font-semibold text-zinc-900 mb-5">
              {domain.name} AI Agents
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {agents.map((agent) => (
                <a
                  key={agent.name}
                  href={agent.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative rounded-2xl p-[1px] transition-all duration-300
                             bg-gradient-to-br from-blue-300/60 via-indigo-200/40 to-blue-400/50
                             hover:from-blue-400/80 hover:to-indigo-400/70
                             shadow-[0_4px_20px_rgba(59,130,246,0.10)]
                             hover:shadow-[0_8px_32px_rgba(59,130,246,0.28)]
                             hover:-translate-y-0.5"
                >
                  <div className="rounded-2xl px-6 py-5 flex items-center justify-between
                                  bg-gradient-to-br from-blue-50/90 to-white/95
                                  backdrop-blur-md">
                    <div>
                      <p className="text-xl font-semibold text-zinc-900 group-hover:text-blue-700 transition-colors">
                        {agent.name}
                      </p>
                      <p className="text-sm text-blue-400/80 mt-0.5">Visit official site</p>
                    </div>
                    <span className="text-blue-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all text-lg">
                      →
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* ── SUPPORTING CONTENT - SEO layer ────────────────────────────────── */}

        {/* Why AI Matters */}
        <section className="mb-12 pt-4 border-t border-zinc-100">
          <h2 className="text-xl font-semibold text-zinc-900 mb-3">
            Why AI Matters in {domain.name}
          </h2>
          <ul className="space-y-2 max-w-3xl">
            {domain.whyAiMatters.map((point, i) => (
              <li key={i} className="flex gap-3">
                <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-blue-400 mt-[7px]" />
                <span className="text-sm text-zinc-600 leading-relaxed">{point}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Use Cases */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-zinc-900 mb-5">
            Top Use Cases
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {domain.useCases.map((uc) => (
              <div
                key={uc.title}
                className="rounded-2xl bg-white border border-zinc-200 px-6 py-5
                           hover:border-blue-200 hover:shadow-sm transition-all duration-200"
              >
                <p className="text-sm font-semibold text-zinc-900 mb-1.5">{uc.title}</p>
                <p className="text-sm text-zinc-500 leading-relaxed">{uc.description}</p>
              </div>
            ))}
          </div>
        </section>

      </main>

      <footer className="border-t border-zinc-100 py-8 text-center text-sm text-zinc-400">
        <p>© {new Date().getFullYear()} AgenticLib — The AI Agent Discovery Platform</p>
        <p className="mt-1">
          <Link href="/" className="hover:text-zinc-600 transition">Home</Link>
          {" · "}
          <Link href="/explore" className="hover:text-zinc-600 transition">Browse Domains</Link>
          {" · "}
          <Link href="/blog" className="hover:text-zinc-600 transition">Blog</Link>
        </p>
      </footer>

    </div>
  );
}
