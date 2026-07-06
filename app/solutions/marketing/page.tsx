import HomepageDemoSection from "@/app/components/HomepageDemoSection";

export const metadata = {
  title: "Marketing – AgenticLib",
  description: "Track your marketing AI agent's features, visibility, and sentiment against competitors.",
};

export default function MarketingPage() {
  return (
    <main className="min-h-screen" style={{ background: "linear-gradient(170deg, #FEF0F5 0%, #FDFAFF 28%, #FFF8FC 52%, #F8F3FF 76%, #FEF0F5 100%)" }}>
      <div className="max-w-4xl mx-auto px-8 pt-16 pb-4 text-center">
        <div
          className="inline-block text-xs font-semibold px-3 py-1 rounded-full mb-6"
          style={{ background: "rgba(124,58,237,0.10)", color: "#7C3AED" }}
        >
          AI Agent Builder · Marketing
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-6" style={{ color: "#000000", letterSpacing: "-0.02em", lineHeight: 1.1 }}>
          Comparison Intelligence for Marketing AI Agents
        </h1>
        <p className="text-lg max-w-xl mx-auto" style={{ color: "#000000", lineHeight: 1.6 }}>
          Track your marketing AI agent&apos;s features, visibility, and sentiment against competitors.
        </p>
      </div>

      <HomepageDemoSection />
    </main>
  );
}
