import Link from "next/link";
import { domains } from "../../data/agents";

export default function DomainsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 px-6 py-24">
      <div className="max-w-5xl mx-auto">
        
        <h1 className="text-5xl font-semibold tracking-tight mb-4">
          Explore Business Domains
        </h1>

        <p className="text-lg text-zinc-500 mb-12">
          Browse AI agents by business domain
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          {domains.map((domain) => (
            <Link
              key={domain.slug}
              href={`/domains/${domain.slug}`}
            >
              <div className="group relative rounded-2xl p-[1px] bg-gradient-to-br from-blue-200 via-white to-blue-300">
                
                <div className="rounded-2xl bg-white/60 backdrop-blur-xl p-6 shadow-md transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
                  
                  <div className="flex items-center justify-between">
                    
                    <div>
                      <div className="text-xl font-semibold">
                        {domain.name}
                      </div>

                      <div className="text-sm text-zinc-500 mt-1">
                        Browse AI agents
                      </div>
                    </div>

                    <div className="text-blue-500 transition-transform group-hover:translate-x-1">
                      →
                    </div>

                  </div>

                </div>

              </div>
            </Link>
          ))}
        </div>

      </div>
    </main>
  );
}