"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import SurveyPopup from "@/components/SurveyPopup";

const domains = [
  { label: "Education", slug: "education", icon: "🎓" },
  { label: "Real Estate", slug: "real-estate", icon: "🏠" },
  { label: "Legal", slug: "legal", icon: "⚖️" },
  { label: "Cybersecurity", slug: "cybersecurity", icon: "🔐" },
  { label: "Finance", slug: "finance", icon: "📈" },
  { label: "Accounting", slug: "accounting", icon: "🧾" },
  { label: "Banking", slug: "banking", icon: "🏦" },
  { label: "Loans & Insurance", slug: "loans-insurance", icon: "📋" },
  { label: "Financial Advisory", slug: "financial-advisory", icon: "💼" },
  { label: "Cash Flow Forecasting", slug: "cash-flow-forecasting", icon: "💰" },
  { label: "Pharmacy", slug: "pharmacy", icon: "💊" },
  { label: "Travel", slug: "travel", icon: "✈️" },
  { label: "Hospitality", slug: "hospitality", icon: "🏨" },
  { label: "Retail", slug: "retail", icon: "🛍️" },
  { label: "Telecommunication", slug: "telecommunication", icon: "📡" },
  { label: "Agriculture", slug: "agriculture", icon: "🌾" },
  { label: "Aerospace", slug: "aerospace", icon: "🚀" },
  { label: "Healthcare", slug: "healthcare", icon: "🏥" },
  { label: "Dental", slug: "dental", icon: "🦷" },
  { label: "Optometry", slug: "optometry", icon: "👁️" },
  { label: "Veterinary", slug: "veterinary", icon: "🐾" },
  { label: "Mental Health", slug: "mental-health", icon: "🧠" },
  { label: "Marketing", slug: "marketing", icon: "📢" },
  { label: "eCommerce", slug: "ecommerce", icon: "🛒" },
  { label: "Video Editing", slug: "video-editing", icon: "🎬" },
  { label: "Trading", slug: "trading", icon: "📊" },
  { label: "Media", slug: "media", icon: "📰" },
  { label: "AI Agent Developer", slug: "ai-agent-developer", icon: "🤖" },
  { label: "Digital Advertising", slug: "digital-advertising", icon: "🎯" },
  { label: "Customer Experience", slug: "customer-experience", icon: "💬" },
  { label: "Sports", slug: "sports", icon: "⚽" },
  { label: "Logistics", slug: "logistics", icon: "🚚" },
  { label: "Robotics", slug: "robotics", icon: "🦾" },
  { label: "AR / VR", slug: "ar-vr", icon: "🥽" },
  { label: "Procurement", slug: "procurement", icon: "📦" },
  { label: "General Purpose", slug: "general-purpose", icon: "⚡" },
  { label: "Technology", slug: "technology", icon: "💻" },
  { label: "Gaming", slug: "gaming", icon: "🎮" },
  { label: "Chemical Industry", slug: "chemical-industry", icon: "⚗️" },
  { label: "Hedge Funds", slug: "hedge-funds", icon: "📉" },
  { label: "Inventory Management", slug: "inventory-management", icon: "📦" },
  { label: "Material Manufacturing", slug: "material-manufacturing", icon: "🏭" },
  { label: "Fashion Design", slug: "fashion-design", icon: "👗" },
  { label: "Research & Innovation", slug: "research-innovation", icon: "🔬" },
  { label: "Life Sciences", slug: "life-sciences", icon: "🧬" },
  { label: "Recruitment", slug: "recruitment", icon: "🤝" },
  { label: "Film Making", slug: "film-making", icon: "🎬" },
  { label: "Automobile", slug: "automobile", icon: "🚗" },
  { label: "IP Management", slug: "ip-management", icon: "🔏" },
  { label: "Visual AI Avatars", slug: "visual-ai-avatars", icon: "🎭" },
  { label: "Vision Agents", slug: "vision-agents", icon: "🔭" },
  { label: "Branding", slug: "branding", icon: "✨" },
  { label: "Entertainment", slug: "entertainment", icon: "🎪" },
  { label: "Patient Service", slug: "patient-service", icon: "🩺" },
  { label: "Payroll", slug: "payroll", icon: "💵" },
  { label: "Creative Content", slug: "creative-content", icon: "🎨" },
  { label: "Content Creation", slug: "content-creation", icon: "✍️" },
  { label: "Kitchen & Food", slug: "kitchen", icon: "🍳" },
  { label: "Drone", slug: "drone", icon: "🚁" },
  { label: "Contract Review", slug: "contract-review", icon: "📝" },
  { label: "Fund Management", slug: "fund-management", icon: "💹" },
  { label: "Personal Finance", slug: "personal-finance", icon: "💳" },
  { label: "Insurance Claims", slug: "insurance-claims", icon: "🛡️" },
  { label: "Production Orchestration", slug: "production-orchestration", icon: "⚙️" },
  { label: "Productivity", slug: "productivity", icon: "🗂️" },
  { label: "Sales", slug: "sales", icon: "📣" },
];

export default function ExplorePage() {
  const [search, setSearch] = useState("");
  const router = useRouter();

  const filtered = domains.filter((d) =>
    d.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="min-h-screen">

<main className="max-w-5xl mx-auto px-6 pt-6 pb-16">

          <div className="mb-10">
            <h1 className="text-4xl font-bold text-zinc-900 tracking-tight mb-3">
              Browse by Business Domain
            </h1>
            <p className="text-zinc-500 text-lg mb-8">
              Explore AI agents curated for your specific business domain
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search bar */}
              <div className="relative flex-1">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  width="15" height="15" viewBox="0 0 24 24" fill="none"
                  stroke="#94a3b8" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                </svg>
                <input
                  type="text"
                  placeholder="Search domains..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-3 rounded-2xl border border-white/70 bg-white/60 backdrop-blur-sm text-base font-medium text-black placeholder-black shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300 focus:bg-white transition-all duration-200"
                />
              </div>

              {/* Jump-to dropdown */}
              <select
                defaultValue=""
                onChange={(e) => { if (e.target.value) router.push(`/domain/${e.target.value}`); }}
                className="sm:w-60 px-4 py-3 rounded-2xl border border-white/70 bg-white/60 backdrop-blur-sm text-base font-medium text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300 focus:bg-white transition-all duration-200 cursor-pointer appearance-none"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center" }}
              >
                <option value="" disabled>Jump to a domain...</option>
                {domains.map((d) => (
                  <option key={d.slug} value={d.slug}>
                    {d.icon}  {d.label}
                  </option>
                ))}
              </select>
            </div>

            {search && (
              <p className="mt-3 text-sm text-zinc-400">
                {filtered.length} result{filtered.length !== 1 ? "s" : ""} for &ldquo;{search}&rdquo;
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {filtered.length > 0 ? filtered.map(({ label, slug, icon }) => (
              <Link
                key={slug}
                href={`/domain/${slug}`}
                className="group flex items-center gap-3 bg-white/70 border border-zinc-200 rounded-2xl px-5 py-4 hover:border-violet-300 hover:bg-violet-50 hover:shadow-md transition-all duration-200"
              >
                <span className="text-2xl">{icon}</span>
                <div>
                  <p className="text-sm font-semibold text-zinc-800 group-hover:text-violet-700 transition-colors">
                    {label}
                  </p>
                  <p className="text-xs text-zinc-500">Browse AI Agents</p>
                </div>
              </Link>
            )) : (
              <div className="col-span-2 sm:col-span-3 py-16 text-center text-zinc-400 text-sm">
                No domains match &ldquo;{search}&rdquo;
              </div>
            )}
          </div>

        </main>

        <footer className="border-t border-zinc-100 py-8 text-center text-sm text-zinc-400">
          <p>© {new Date().getFullYear()} AgenticLib - The AI Agent Discovery Platform</p>
        </footer>

      </div>

      <SurveyPopup pageUrl="/explore" />
    </>
  );
}
