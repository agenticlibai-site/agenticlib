"use client";
import { useEffect, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { Headphones, TrendingUp, Film, Megaphone } from "lucide-react";

function useInView(threshold = 0.25) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

// ── Step 01: Domain click → checkbox selection ────────────────────────────────
type DomainItem = { label: string; Icon: LucideIcon; iconBg: string; iconColor: string; desc: string };
const DOMAINS: DomainItem[] = [
  { label: "Customer Support", Icon: Headphones, iconBg: "#DBEAFE", iconColor: "#3B82F6", desc: "Chat & ticket AI" },
  { label: "Finance",          Icon: TrendingUp, iconBg: "#DCFCE7", iconColor: "#16A34A", desc: "Analysis & forecasting" },
  { label: "Media",            Icon: Film,       iconBg: "#EDE9FE", iconColor: "#7C3AED", desc: "Video & audio AI" },
  { label: "Marketing",        Icon: Megaphone,  iconBg: "#FCE7F3", iconColor: "#EC4899", desc: "Content & campaigns" },
];
const GOALS = [
  "Generate more leads and pipeline",
  "Create content at scale",
  "Improve ad and copy performance",
  "Build brand awareness",
  "Produce video content",
];

function WizardVisual({ active }: { active: boolean }) {
  const [phase, setPhase]         = useState<"domain" | "checkbox">("domain");
  const [phaseOpacity, setPhaseOpacity] = useState(1);
  const [clicked, setClicked]     = useState(false);
  const [checked, setChecked]     = useState([false, false, false, false, false]);

  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    const check = (i: number) => { if (!cancelled) setChecked(p => { const n = [...p]; n[i] = true; return n; }); };
    const ts = [
      setTimeout(() => { if (!cancelled) setClicked(true); },                                700),
      setTimeout(() => { if (!cancelled) setPhaseOpacity(0); },                              1300),
      setTimeout(() => { if (!cancelled) { setPhase("checkbox"); setPhaseOpacity(1); } },    1600),
      setTimeout(() => check(3),                                                              2300),
      setTimeout(() => check(4),                                                              2800),
    ];
    return () => { cancelled = true; ts.forEach(clearTimeout); };
  }, [active]);

  return (
    <div
      className="w-full max-w-sm rounded-2xl bg-white p-5"
      style={{ boxShadow: "0 4px 24px rgba(91,91,214,0.10)", border: "1px solid #e8e8f0" }}
    >
      <div style={{ opacity: phaseOpacity, transition: "opacity 0.25s ease" }}>
        {phase === "domain" ? (
          <>
            <p className="text-base font-bold text-black leading-snug mb-0.5">
              What&apos;s your business domain?
            </p>
            <p className="text-xs text-black/50 mb-4">
              Select the industry you want to find an agent in.
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              {DOMAINS.map((d) => {
                const sel = d.label === "Marketing" && clicked;
                const { Icon } = d;
                return (
                  <div
                    key={d.label}
                    className="rounded-xl overflow-hidden"
                    style={{
                      border: sel ? `2px solid ${d.iconColor}` : "1.5px solid #f0f0f0",
                      transform: sel ? "scale(1.03)" : "scale(1)",
                      boxShadow: sel ? `0 2px 16px ${d.iconColor}40` : "none",
                      transition: "all 0.25s ease",
                    }}
                  >
                    <div className="h-10 flex items-center px-3" style={{ background: d.iconBg }}>
                      <Icon size={16} strokeWidth={1.8} color={d.iconColor} />
                    </div>
                    <div className="px-3 py-2" style={{ background: sel ? `${d.iconBg}66` : "white" }}>
                      <p className="text-xs font-bold text-black leading-tight">{d.label}</p>
                      <p className="text-[10px] text-black/50 leading-tight mt-0.5">{d.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <>
            <p className="text-base font-bold text-black leading-snug mb-0.5">
              What is your primary marketing goal?
            </p>
            <p className="text-xs text-black/50 mb-3">Select all that apply.</p>
            <div className="flex flex-col">
              {GOALS.map((goal, i) => (
                <div key={goal}>
                  <div
                    className="flex items-center gap-3 py-2.5 px-2 rounded-lg"
                    style={{ background: checked[i] ? "#FDF0F7" : "transparent", transition: "background 0.25s" }}
                  >
                    <div
                      style={{
                        width: 18, height: 18, borderRadius: 4, flexShrink: 0,
                        border: checked[i] ? "none" : "1.5px solid #d1d5db",
                        background: checked[i] ? "#EC4899" : "white",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        transition: "all 0.2s",
                      }}
                    >
                      {checked[i] && (
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path d="M1.5 4.5L3.5 6.5L8.5 1.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                    <span
                      className="text-xs leading-snug"
                      style={{
                        color: checked[i] ? "#000000" : "#000000",
                        fontWeight: checked[i] ? 600 : 400,
                        transition: "all 0.2s",
                      }}
                    >
                      {goal}
                    </span>
                  </div>
                  {i < GOALS.length - 1 && (
                    <div style={{ height: 1, background: "#f3f4f6", margin: "0 4px" }} />
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Step 02: Recommendation card - palette matched to wizard ──────────────────
const TAGS = [
  { text: "Content generation", bg: "#FCE7F3", color: "#EC4899" },
  { text: "SEO optimized",      bg: "#DBEAFE", color: "#3B82F6" },
  { text: "Multi-channel",      bg: "#DCFCE7", color: "#16A34A" },
];

function RecommendVisual({ active }: { active: boolean }) {
  const [score, setScore]       = useState(0);
  const [showName, setShowName] = useState(false);
  const [tagCount, setTagCount] = useState(0);

  const R = 28;
  const circ = 2 * Math.PI * R;
  const dashoffset = circ * (1 - score / 100);

  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    let iv: ReturnType<typeof setInterval> | null = null;
    const t1 = setTimeout(() => { if (!cancelled) setShowName(true); }, 400);
    const t2 = setTimeout(() => {
      if (cancelled) return;
      let n = 0;
      iv = setInterval(() => {
        n += 3;
        if (n >= 91) { setScore(91); if (iv) clearInterval(iv); } else setScore(n);
      }, 30);
    }, 700);
    const t3 = setTimeout(() => { if (!cancelled) setTagCount(1); }, 1400);
    const t4 = setTimeout(() => { if (!cancelled) setTagCount(2); }, 1700);
    const t5 = setTimeout(() => { if (!cancelled) setTagCount(3); }, 2000);
    return () => {
      cancelled = true;
      [t1, t2, t3, t4, t5].forEach(clearTimeout);
      if (iv) clearInterval(iv);
    };
  }, [active]);

  return (
    <div
      className="w-full max-w-sm rounded-2xl bg-white p-6"
      style={{ boxShadow: "0 4px 24px rgba(91,91,214,0.10)", border: "1px solid #e8e8f0" }}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-black/50 mb-4">Top match</p>
      <div className="flex items-center gap-4 mb-5">
        <div className="relative flex-shrink-0">
          <svg width="72" height="72" viewBox="0 0 72 72">
            <circle cx="36" cy="36" r={R} fill="none" stroke="#EDE9FE" strokeWidth="7" />
            <circle
              cx="36" cy="36" r={R} fill="none"
              stroke="#8B5CF6" strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray={circ}
              strokeDashoffset={dashoffset}
              style={{ transform: "rotate(-90deg)", transformOrigin: "center" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold text-black leading-none">{score}</span>
            <span className="text-[9px] text-black/50 mt-0.5">score</span>
          </div>
        </div>
        <div style={{ opacity: showName ? 1 : 0, transform: showName ? "translateY(0)" : "translateY(8px)", transition: "opacity 0.5s ease, transform 0.5s ease" }}>
          <p className="text-lg font-bold text-black">Jasper AI</p>
          <p className="text-xs text-black/50">Marketing copywriting agent</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {TAGS.map((tag, i) => (
          <span
            key={tag.text}
            className="text-xs px-3 py-1 rounded-full font-medium"
            style={{
              background: tag.bg, color: tag.color,
              opacity: tagCount > i ? 1 : 0,
              transform: tagCount > i ? "translateY(0)" : "translateY(6px)",
              transition: "opacity 0.35s ease, transform 0.35s ease",
            }}
          >
            {tag.text}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Step 03: Agent ranked list in different colours ───────────────────────────
const AGENTS = [
  { name: "Jasper AI",   category: "Copywriting",       score: 91, color: "#7C3AED", bg: "#EDE9FE" },
  { name: "Copy.ai",     category: "Content AI",        score: 78, color: "#EC4899", bg: "#FCE7F3" },
  { name: "Writesonic",  category: "SEO & Content",     score: 74, color: "#16A34A", bg: "#DCFCE7" },
  { name: "Anyword",     category: "Performance copy",  score: 69, color: "#F59E0B", bg: "#FEF3C7" },
];

function CompareVisual({ active }: { active: boolean }) {
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    const ts = [
      setTimeout(() => { if (!cancelled) setVisibleCount(1); }, 300),
      setTimeout(() => { if (!cancelled) setVisibleCount(2); }, 650),
      setTimeout(() => { if (!cancelled) setVisibleCount(3); }, 1000),
      setTimeout(() => { if (!cancelled) setVisibleCount(4); }, 1350),
    ];
    return () => { cancelled = true; ts.forEach(clearTimeout); };
  }, [active]);

  return (
    <div
      className="w-full max-w-sm rounded-2xl bg-white p-6"
      style={{ boxShadow: "0 4px 24px rgba(91,91,214,0.10)", border: "1px solid #e8e8f0" }}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-black/50 mb-4">
        Top matches for Marketing
      </p>
      <div className="flex flex-col gap-2.5">
        {AGENTS.map((agent, i) => (
          <div
            key={agent.name}
            className="flex items-center gap-3 rounded-xl p-3"
            style={{
              borderLeft: `4px solid ${agent.color}`,
              background: agent.bg,
              opacity: visibleCount > i ? 1 : 0,
              transform: visibleCount > i ? "translateY(0)" : "translateY(10px)",
              transition: "opacity 0.4s ease, transform 0.4s ease",
            }}
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-black truncate">{agent.name}</p>
              <p className="text-[10px] text-black/50 leading-tight mt-0.5">{agent.category}</p>
            </div>
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 text-white"
              style={{ background: agent.color }}
            >
              {agent.score}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Exported section ──────────────────────────────────────────────────────────
function StepText({ num, title, body }: { num: string; title: string; body: string }) {
  return (
    <div className="flex-1">
      <p className="text-6xl font-bold leading-none mb-3" style={{ color: "#8B5CF6", opacity: 0.15 }}>
        {num}
      </p>
      <h3 className="text-2xl font-semibold text-black mb-3 leading-snug">{title}</h3>
      <p className="text-black/60 text-lg leading-relaxed">{body}</p>
    </div>
  );
}

export default function HowItWorks() {
  const { ref: ref1, inView: inView1 } = useInView();
  const { ref: ref2, inView: inView2 } = useInView();
  const { ref: ref3, inView: inView3 } = useInView();

  const stepText = [
    {
      num: "01",
      title: "Tell us what you need",
      body: "Answer a few quick questions about your domain, team size, and goal. No browsing required - AgenticLib builds your profile on the fly.",
    },
    {
      num: "02",
      title: "Get your match - instantly",
      body: "Our recommendation engine scores agents against your exact requirements and returns a ranked result with full reasoning. You see why, not just who.",
    },
    {
      num: "03",
      title: "Compare and decide with confidence",
      body: "Explore your top match alongside alternatives - side-by-side capabilities, pricing, and a projected time savings estimate so you choose with full context.",
    },
  ];

  return (
    <section style={{ background: "#F8F8FF", paddingTop: "80px", paddingBottom: "80px" }}>
      <div className="max-w-5xl mx-auto px-6">
        <h2 className="text-3xl font-semibold text-black mb-2">How It Works</h2>
        <p className="text-black/60 text-lg mb-16">Three steps from use case to the right agent.</p>

        <div className="flex flex-col gap-20">
          {/* Step 01 - visual right, text left */}
          <div className="flex flex-col gap-10 md:flex-row-reverse md:items-center md:gap-16">
            <div ref={ref1} className="flex-1 flex justify-center">
              <WizardVisual active={inView1} />
            </div>
            <StepText {...stepText[0]} />
          </div>

          {/* Step 02 - visual left, text right */}
          <div className="flex flex-col gap-10 md:flex-row md:items-center md:gap-16">
            <div ref={ref2} className="flex-1 flex justify-center">
              <RecommendVisual active={inView2} />
            </div>
            <StepText {...stepText[1]} />
          </div>

          {/* Step 03 - visual right, text left */}
          <div className="flex flex-col gap-10 md:flex-row-reverse md:items-center md:gap-16">
            <div ref={ref3} className="flex-1 flex justify-center">
              <CompareVisual active={inView3} />
            </div>
            <StepText {...stepText[2]} />
          </div>
        </div>
      </div>
    </section>
  );
}
