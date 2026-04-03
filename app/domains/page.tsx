<div className="grid md:grid-cols-2 gap-6">
  {domains.map((domain) => (
    <Link key={domain.slug} href={`/domains/${domain.slug}`} className="group">
      
      <div className="relative rounded-2xl p-[1px] bg-gradient-to-br from-blue-200 via-white to-blue-300">
        
        <div className="rounded-2xl bg-white/60 backdrop-blur-xl p-6 shadow-md group-hover:shadow-xl transition-all duration-300 group-hover:scale-[1.02]">
          
          <div className="flex items-center justify-between">
            
            <div>
              <div className="text-xl font-semibold">
                {domain.name}
              </div>

              <div className="text-sm text-zinc-500 mt-1">
                Browse AI agents
              </div>
            </div>

            <div className="text-blue-500 group-hover:translate-x-1 transition-transform">
              →
            </div>

          </div>

        </div>
      </div>

    </Link>
  ))}
</div>