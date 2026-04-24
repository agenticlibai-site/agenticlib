"use client";
import { useParams } from "next/navigation";
import { domains } from "../../../data/agents";
import posthog from "posthog-js";

export default function DomainPage() {
  const params = useParams();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;

  const domain = domains.find(
    (d) => d.slug.toLowerCase() === slug?.toLowerCase()
  );

  if (!domain) {
    return (
      <main className="min-h-screen px-6 py-24">
        <h1 className="text-3xl font-semibold">Domain not found</h1>
      </main>
    );
  }

  const hasCategories = domain.agents.some((a) => "category" in a && a.category);

  type Agent = { name: string; url: string; category?: string };

  const agentGrid = (agents: Agent[]) => (
    <div className="grid md:grid-cols-2 gap-6">
      {agents.map((agent) => (
        <a
          key={agent.name}
          href={agent.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group"
          onClick={() =>
            posthog.capture("agent_link_clicked", {
              agent_name: agent.name,
              domain_slug: domain.slug,
              domain_name: domain.name,
            })
          }
        >
          <div className="relative rounded-2xl p-[1px] bg-gradient-to-br from-blue-200 via-white to-blue-300">
            <div className="rounded-2xl bg-white/60 backdrop-blur-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-semibold">{agent.name}</div>
                  <div className="text-sm text-zinc-500 mt-1">Visit official site</div>
                </div>
                <div className="text-blue-500 transition-transform group-hover:translate-x-1">→</div>
              </div>
            </div>
          </div>
        </a>
      ))}
    </div>
  );

  const renderAgents = () => {
    if (!hasCategories) return agentGrid(domain.agents as Agent[]);

    const grouped = (domain.agents as Agent[]).reduce<Record<string, Agent[]>>(
      (acc, agent) => {
        const cat = ("category" in agent && agent.category) ? agent.category : "Other";
        (acc[cat] ??= []).push(agent);
        return acc;
      },
      {}
    );

    return (
      <div className="space-y-12">
        {Object.entries(grouped).map(([category, agents]) => (
          <div key={category}>
            <h2 className="text-xl font-semibold text-zinc-800 mb-4 pb-2 border-b border-zinc-200">
              {category}
            </h2>
            {agentGrid(agents)}
          </div>
        ))}
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 px-6 py-24">
      <div className="max-w-5xl mx-auto">

        <h1 className="text-5xl font-semibold mb-4">
          {domain.name} AI Agents
        </h1>

        <p className="text-lg text-zinc-500 mb-12">
          Curated AI agents for {domain.name}
        </p>

        {renderAgents()}

      </div>
    </main>
  );
}
