import Link from "next/link";
import { domains } from "../../data/agents";

export default function DomainsPage() {
  return (
    <main className="min-h-screen px-6 py-24">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-semibold mb-4">Explore Domains</h1>
        <p className="text-zinc-500 mb-8">
          Browse AI agents by domain
        </p>

        <div className="grid gap-4">
          {domains.map((domain) => (
            <Link
              key={domain.slug}
              href={`/domains/${domain.slug}`}
              className="block rounded-xl border border-zinc-200 bg-white/70 backdrop-blur-sm px-6 py-5 hover:bg-white transition-colors"
            >
              <div className="text-xl font-medium">
                {domain.name} →
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}