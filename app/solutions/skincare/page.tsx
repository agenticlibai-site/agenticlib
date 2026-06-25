import Link from "next/link";
import {
  getSkincareDailySummary,
  getSkincareWeeklySummary,
  getSkincareLLMVisibility,
  initSkincareDB,
} from "@/lib/skincare-visibility/db";
import SkincareCharts from "./SkincareCharts";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Skincare Visibility – AgenticLib",
  description: "Track how AI skincare agent brands appear across Claude and GPT-4o mini responses over time.",
};

async function getData() {
  try {
    await initSkincareDB();
    const [dailySummary, weeklySummary, llmVisibility] = await Promise.all([
      getSkincareDailySummary(7),
      getSkincareWeeklySummary(),
      getSkincareLLMVisibility(),
    ]);
    return { dailySummary, weeklySummary, llmVisibility };
  } catch {
    return { dailySummary: [], weeklySummary: [], llmVisibility: [] };
  }
}

export default async function SkincarePage() {
  const { dailySummary, weeklySummary, llmVisibility } = await getData();

  return (
    <main
      className="min-h-screen relative overflow-hidden"
      style={{ background: "linear-gradient(160deg, #FDE8F2 0%, #FFF0F8 45%, #FFF8FC 100%)" }}
    >
      {/* Background grain */}
      <svg className="pointer-events-none fixed inset-0 w-full h-full z-0" style={{ opacity: 0.10 }} aria-hidden="true">
        <filter id="grain-sk">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain-sk)" />
      </svg>

      {/* Decorative blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div style={{ position: "absolute", top: "-80px", right: "-120px", width: "600px", height: "600px", borderRadius: "50%", background: "rgba(194,24,106,0.07)", filter: "blur(80px)" }} />
        <div style={{ position: "absolute", bottom: "-100px", left: "-100px", width: "400px", height: "400px", borderRadius: "50%", background: "rgba(232,68,122,0.06)", filter: "blur(70px)" }} />
      </div>

      {/* Nav */}
      <nav className="relative z-10 px-6 py-5 flex items-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold transition-colors"
          style={{ textDecoration: "none", background: "white", borderRadius: 8, padding: "8px 16px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", color: "#C2186A" }}
        >
          ← AgenticLib
        </Link>
      </nav>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 pb-20">
        {/* Header */}
        <div className="mb-10">
          <div
            className="inline-block text-xs font-semibold px-3 py-1 rounded-full mb-4"
            style={{ background: "rgba(194,24,106,0.10)", color: "#C2186A" }}
          >
            Skincare Intelligence
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3" style={{ color: "#160F2E", letterSpacing: "-0.02em" }}>
            Skincare Visibility
          </h1>
          <p className="text-base max-w-xl" style={{ color: "rgba(22,15,46,0.6)", lineHeight: 1.6 }}>
            How AI skincare agent brands appear in Claude and GPT-4o mini responses across 13 prompts,
            3 runs each, collected daily.
          </p>
        </div>

        {/* Charts */}
        <SkincareCharts
          dailySummary={dailySummary}
          weeklySummary={weeklySummary}
          llmVisibility={llmVisibility}
        />
      </div>
    </main>
  );
}
