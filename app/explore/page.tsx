"use client";
import Link from "next/link";
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
];

export default function ExplorePage() {
  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">

        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-100">
          <div className="max-w-5xl mx-auto px-6 py-4">
            <Link href="/" className="flex items-center gap-2">
              <img src="/logo.png" alt="AgenticLib" className="h-6 w-auto" />
              <span className="text-base font-semibold tracking-tight">AgenticLib</span>
            </Link>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-6 py-16">

          <div className="mb-12">
            <h1 className="text-4xl font-bold text-zinc-900 tracking-tight mb-3">
              Browse by Business Domain
            </h1>
            <p className="text-zinc-500 text-lg">
              Explore AI agents curated for your specific business domain
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {domains.map(({ label, slug, icon }) => (
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
            ))}
          </div>

        </main>

        <footer className="border-t border-zinc-100 py-8 text-center text-sm text-zinc-400">
          <p>© {new Date().getFullYear()} AgenticLib — The AI Agent Discovery Platform</p>
        </footer>

      </div>

      <SurveyPopup pageUrl="/explore" />
    </>
  );
}
