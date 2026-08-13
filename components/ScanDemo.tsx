"use client";

/**
 * ScanDemo — marketing mockup only.
 * All state transitions are scripted timers; no real network calls or LLM
 * queries are made. Used purely to illustrate the "scan your site" UX on
 * the landing page.
 */

import { useRef, useState } from "react";
import { ArrowRight, Map, Search, Users } from "lucide-react";

/* ── Constants ──────────────────────────────────────────────────── */

const STEP_MS = 900; // ms per status message

const STATUS = (domain: string): string[] => [
  `Reading ${domain}...`,
  `Matching against 10 tracked competitors in Sales...`,
  `Comparing feature coverage...`,
  `Drafting your 90-day roadmap...`,
  `Roadmap ready`,
];

// Each card activates when its corresponding status step begins
const CARDS = [
  { label: "Category match", Icon: Search },
  { label: "Competitor gaps", Icon: Users  },
  { label: "90-day roadmap",  Icon: Map    },
] as const;

/* ── Palette tokens ─────────────────────────────────────────────── */
const T = {
  paper:     "#F4F6FC",
  ink:       "#0E1320",
  violet:    "#5E6CE8",
  purple:    "#8E63D6",
  deepPurp:  "#3C3489",
  muted:     "#6B6880",
  neutral:   "#B0AABF",
  periw100:  "#DEE7FB",
  periw:     "#C9D6F7",
  sigGrad:   "linear-gradient(90deg,#7C3AED,#C73C8E,#F0617A)",
  analGrad:  "linear-gradient(135deg,#5E6CE8,#8E63D6,#C24D9E)",
  dotCoral:  "#E8657A",
  dotGreen:  "#3B6D11",
};

/* ── Component ──────────────────────────────────────────────────── */

export default function ScanDemo() {
  const [inputVal,  setInputVal]  = useState("");
  const [phase,     setPhase]     = useState<"input" | "scan">("input");
  const [stepIdx,   setStepIdx]   = useState(0);
  const [activated, setActivated] = useState<Set<number>>(new Set());
  const [done,      setDone]      = useState(false);

  const displayDomain = useRef("lamigo.com");
  const timerIds      = useRef<ReturnType<typeof setTimeout>[]>([]);

  function clearTimers() {
    timerIds.current.forEach(clearTimeout);
    timerIds.current = [];
  }

  function start() {
    clearTimers();

    // Strip protocol prefix the user may have typed
    const raw = inputVal.trim().replace(/^https?:\/\//, "");
    displayDomain.current = raw || "lamigo.com";

    setPhase("scan");
    setStepIdx(0);
    setActivated(new Set([0])); // card 0 lights up with the first message
    setDone(false);

    timerIds.current = [
      setTimeout(() => {
        setStepIdx(1);
        setActivated((p) => new Set([...p, 1]));
      }, STEP_MS),

      setTimeout(() => {
        setStepIdx(2);
        setActivated((p) => new Set([...p, 2]));
      }, STEP_MS * 2),

      setTimeout(() => {
        setStepIdx(3);
      }, STEP_MS * 3),

      setTimeout(() => {
        setStepIdx(4);
        setDone(true);
      }, STEP_MS * 4),
    ];
  }

  function reset() {
    clearTimers();
    setPhase("input");
    setInputVal("");
    setStepIdx(0);
    setActivated(new Set());
    setDone(false);
  }

  const msgs    = STATUS(displayDomain.current);
  const message = msgs[Math.min(stepIdx, msgs.length - 1)];

  /* ── Render ─────────────────────────────────────────────────────── */
  return (
    <div
      style={{
        background:         T.paper,
        borderRadius:       20,
        padding:            "40px 36px",
        maxWidth:           620,
        margin:             "0 auto",
        fontFamily:         "var(--font-schibsted), -apple-system, system-ui, sans-serif",
        WebkitFontSmoothing: "antialiased",
      }}
    >
      {phase === "input" ? (
        /* ══════════════════ STATE 1 · URL INPUT ════════════════════ */
        <div
          style={{
            display:      "flex",
            alignItems:   "center",
            background:   "#fff",
            border:       `1.5px solid ${T.periw}`,
            borderRadius: 12,
            padding:      "6px 6px 6px 16px",
            gap:          8,
          }}
        >
          {/* Prefix */}
          <span
            style={{
              fontSize:   15,
              color:      T.neutral,
              fontWeight: 500,
              flexShrink: 0,
              userSelect: "none",
            }}
          >
            https://
          </span>

          {/* Input */}
          <input
            type="text"
            placeholder="your-site.com"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && start()}
            style={{
              flex:       1,
              border:     "none",
              outline:    "none",
              fontSize:   16,
              fontWeight: 600,
              color:      T.ink,
              background: "transparent",
              fontFamily: "inherit",
              minWidth:   0,
            }}
          />

          {/* CTA */}
          <button
            onClick={start}
            style={{
              background:  T.sigGrad,
              color:       "#fff",
              border:      "none",
              borderRadius: 9,
              padding:     "11px 20px",
              fontSize:    15,
              fontWeight:  700,
              cursor:      "pointer",
              fontFamily:  "inherit",
              display:     "flex",
              alignItems:  "center",
              gap:         8,
              flexShrink:  0,
              boxShadow:   "0 4px 20px rgba(124,58,237,0.28)",
              whiteSpace:  "nowrap",
            }}
          >
            Show me <ArrowRight size={16} strokeWidth={2.5} />
          </button>
        </div>
      ) : (
        /* ══════════════════ STATE 2 · SCANNING ═════════════════════ */
        <>
          {/* Domain heading */}
          <div
            style={{
              display:     "flex",
              alignItems:  "center",
              gap:         14,
              marginBottom: 14,
            }}
          >
            <div
              style={{
                width:        40,
                height:       40,
                borderRadius: 10,
                background:   T.analGrad,
                flexShrink:   0,
              }}
            />
            <span
              style={{
                fontSize:      22,
                fontWeight:    800,
                letterSpacing: "-0.03em",
                color:         T.ink,
              }}
            >
              {displayDomain.current}
            </span>
          </div>

          {/* Status line */}
          <div
            style={{
              display:      "flex",
              alignItems:   "center",
              gap:          10,
              marginBottom: 28,
            }}
          >
            {/* Dot: coral → green when done */}
            <span
              style={{
                display:          "inline-block",
                width:            8,
                height:           8,
                borderRadius:     "50%",
                background:       done ? T.dotGreen : T.dotCoral,
                flexShrink:       0,
                transition:       "background 0.5s ease",
              }}
            />
            <span
              style={{
                fontSize:   14,
                fontWeight: 500,
                color:      T.violet,
              }}
            >
              {message}
            </span>
          </div>

          {/* Cards row */}
          <div
            style={{
              display:             "grid",
              gridTemplateColumns: "repeat(3,1fr)",
              gap:                 12,
            }}
          >
            {CARDS.map(({ label, Icon }, i) => {
              const active = activated.has(i);
              return (
                <div
                  key={i}
                  style={{
                    background:   T.periw100,
                    border:       `1.5px solid ${active ? T.purple : "rgba(94,108,232,0.20)"}`,
                    borderRadius: 12,
                    padding:      "20px 14px 18px",
                    display:      "flex",
                    flexDirection: "column",
                    alignItems:   "center",
                    gap:          12,
                    textAlign:    "center",
                    transition:   "border-color 0.4s ease",
                  }}
                >
                  <Icon
                    size={22}
                    strokeWidth={1.75}
                    color={active ? T.purple : T.neutral}
                    style={{ transition: "color 0.4s ease" }}
                  />
                  <span
                    style={{
                      fontSize:   13,
                      fontWeight: 700,
                      color:      active ? T.deepPurp : T.muted,
                      transition: "color 0.4s ease",
                    }}
                  >
                    {label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Reset */}
          <button
            onClick={reset}
            style={{
              display:    "block",
              margin:     "20px auto 0",
              background: "none",
              border:     "none",
              fontSize:   13,
              color:      T.neutral,
              cursor:     "pointer",
              fontFamily: "inherit",
            }}
          >
            ← Try another site
          </button>
        </>
      )}
    </div>
  );
}
