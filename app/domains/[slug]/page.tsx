import { domains } from "../../../data/agents";

export default function DomainPage({
  params,
}: {
  params: { slug: string };
}) {
  const domain = domains.find((d) => d.slug === params.slug);

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
        <p className="text-zinc-500 mb-8">
          Browse through our collection of AI agents for {domain.name}
        </p>

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