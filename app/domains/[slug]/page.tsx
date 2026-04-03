import { domains } from "../../../data/agents";

export default async function DomainPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params; // ⭐ THIS IS THE KEY

  const domain = domains.find(
    (d) => d.slug.toLowerCase() === slug.toLowerCase()
  );

  if (!domain) {
    return (
      <main className="min-h-screen px-6 py-24">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-semibold mb-4">Domain not found</h1>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-6 py-24">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-semibold mb-3">{domain.name}</h1>

        <div className="grid gap-4">
          {domain.agents.map((agent) => (
            <a
              key={agent.name}
              href={agent.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-xl border border-zinc-200 bg-white/70 backdrop-blur-sm px-6 py-5 hover:bg-white transition-colors"
            >
              <div className="text-lg font-medium">{agent.name} →</div>
            </a>
          ))}
        </div>
      </div>
    </main>
  );
}