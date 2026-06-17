"use client";
import Link from "next/link";
import { useRef } from "react";
import { Target, Lightbulb, ArrowLeftRight, Database, Rocket, BarChart2 } from "lucide-react";

export default function RecommendationsPage() {
  const videoPlayedRef = useRef(false);

  const handleVideoPlay = () => {
    if (videoPlayedRef.current) return;
    videoPlayedRef.current = true;
    fetch("/api/notify-play", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source: "AI Agent Recommendations Page" }),
    }).catch(() => {});
  };

  return (
    <main className="min-h-screen relative overflow-hidden" style={{ background: "linear-gradient(180deg, #F5F3FF 0%, #FFFFFF 100%)" }}>

      {/* Decorative blurred circles */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div style={{
          position: "absolute",
          top: "-80px",
          right: "-120px",
          width: "600px",
          height: "600px",
          borderRadius: "50%",
          background: "rgba(91,91,214,0.08)",
          filter: "blur(80px)",
        }} />
        <div style={{
          position: "absolute",
          bottom: "-100px",
          left: "-100px",
          width: "400px",
          height: "400px",
          borderRadius: "50%",
          background: "rgba(91,91,214,0.08)",
          filter: "blur(70px)",
        }} />
      </div>

      {/* Nav */}
      <nav className="relative z-10 px-6 py-5 flex items-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold transition-colors hover:bg-[#f5f3ff]"
          style={{ textDecoration: "none", background: "white", borderRadius: 8, padding: "8px 16px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", color: "#5B5BD6" }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 4L6 8l4 4" stroke="#5B5BD6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Home
        </Link>
      </nav>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 pb-20 pt-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 text-zinc-900" style={{ letterSpacing: "-0.02em" }}>
            Sage - AI Agent Recommendations
          </h1>
          <p className="text-base text-zinc-500 mx-auto" style={{ maxWidth: 480 }}>
            Watch how Sage AI turns a few simple questions into tailored AI agent recommendations.
          </p>
        </div>

        <div className="rounded-2xl overflow-hidden bg-white" style={{ boxShadow: "0 4px 6px rgba(0,0,0,0.04), 0 20px 60px rgba(91,91,214,0.10), 0 0 0 1px rgba(91,91,214,0.08)" }}>
          <video
            src="/AgenticLib demo video.mp4"
            controls
            poster="/recommendations-cover.png"
            className="w-full block"
            onPlay={handleVideoPlay}
          />
        </div>
      </div>

      {/* What makes us unique */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 pb-24">
        <h2 className="text-3xl font-semibold mb-3 text-zinc-900">
          Uniqueness of Sage AI
        </h2>
        <p className="text-zinc-900 text-xl font-medium mb-10">
          Sagentic is AgenticLib's AI-powered recommendation platform - built to match you to the right agent from the start, so finding the perfect fit for your workflow actually feels effortless.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            {
              Icon: Target,
              title: "Requirements-first matching",
              body: "Most directories show you a list. AgenticLib starts by understanding what you actually need: your team size, workflow, and goals. It then matches you to the right agent. No browsing, no guesswork.",
            },
            {
              Icon: Lightbulb,
              title: "Dynamic, explainable matching",
              body: "Every recommendation explains itself. See which agents were considered, why your top pick ranked highest, and what trade-offs exist, so you make the decision with full context, not blind trust.",
            },
            {
              Icon: Rocket,
              title: "Business domain oriented",
              body: "AgenticLib is organised by industry - real estate, finance, marketing, customer support, and more. Every recommendation is built around the specific context and needs of your business domain.",
            },
            {
              Icon: Database,
              title: "Data-driven architecture",
              body: "AgenticLib surfaces structured, decision-relevant intelligence rather than generic AI summaries. Every agent profile is built around the dimensions that actually matter for your use case.",
            },
            {
              Icon: ArrowLeftRight,
              title: "Compare agents seamlessly",
              body: "Get a side-by-side breakdown of any two agents across capabilities, pricing, use cases, and visual performance metrics - all in one view.",
            },
            {
              Icon: BarChart2,
              title: "Comparison Analytics",
              body: "See how AI agents are recommended, described, and rated across Claude Sonnet 4.6, GPT-5.5, and Gemini 3.5 in real queries. AgenticLib tracks LLM visibility and sentiment so you deploy with confidence, not guesswork.",
            },
          ].map(({ Icon, title, body }) => (
            <div
              key={title}
              className="flex flex-col gap-3 rounded-2xl p-6"
              style={{
                background: "#fafbff",
                border: "1px solid #e2e8f0",
                boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
              }}
            >
              <Icon size={32} strokeWidth={1.5} style={{ color: "#6c4cf1" }} />
              <h3 className="font-semibold text-zinc-900 text-base leading-snug">{title}</h3>
              <p className="text-zinc-800 text-base leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
