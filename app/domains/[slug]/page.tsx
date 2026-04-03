import { domains } from "../../../data/agents";

export default function DomainPage({
  params,
}: {
  params: { slug: string };
}) {
  const slug = params.slug;

  const domain = domains.find(
    (d) => d.slug.toLowerCase() === slug.toLowerCase()
  );

  if (!domain) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 px-6 py-24">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-semibold mb-4">Domain not found</h1>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 px-6 py-24">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <h1 className="text-5xl font-semibold tracking-tight mb-4">
          {domain.name} AI Agents
        </h1>

        <p className="text-lg text-zinc-500 mb-12">
          Curated AI agents for {domain.name}
        </p>

        {/* Agent Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {domain.agents.map((agent) => (
            <a
              key={agent.name}
              href={agent.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group"
            >
              <div className="relative rounded-2xl p-[1px] bg-gradient-to-br from-blue-200 via-white to-blue-300">
                
                <div className="rounded-2xl bg-white/60 backdrop-blur-xl p-6 shadow-md group-hover:shadow-xl transition-all duration-300 group-hover:scale-[1.02]">
                  
                  <div className="flex items-center justify-between">
                    
                    <div>
                      <div className="text-lg font-semibold">
                        {agent.name}
                      </div>

                      <div className="text-sm text-zinc-500 mt-1">
                        Visit official site
                      </div>
                    </div>

                    <div className="text-blue-500 group-hover:translate-x-1 transition-transform">
                      →
                    </div>

                  </div>

                </div>

              </div>
            </a>
          ))}
        </div>

      </div>
    </main>
  );
}