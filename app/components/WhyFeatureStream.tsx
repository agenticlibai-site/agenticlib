// "Why FeatureStream" homepage section: two-column header and four illustrated cards.
// Each illustration is a single SVG on a 308×358 canvas that scales to fit its panel.
// All figures in the illustrations (scores, +12%) are placeholders.

import type { ReactNode } from "react";

const ACCENT = "var(--accent)";
const INK = "#16181D";
const SUBTLE = "#6B707C";
const BORDER = "#EDE6E0";
const BAR = "#EEE8E2";
const TINT = "#FDEDE7"; // pale coral for pills and tiles
const TINT_TEXT = "#B5442A"; // dark coral, legible on TINT

// 24×24 line icons (stroke only)
const ICONS = {
  users: <path d="M16 20v-1a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v1M12 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7" />,
  pulse: <path d="M3 12h4l3-7 4 14 3-7h4" />,
  doc: <path d="M7 3h7l4 4v14H7zM14 3v4h4M9.5 12h5M9.5 16h5" />,
  chart: <path d="M4 19V5M4 19h16M8 15l4-5 3 3 4-6" />,
  globe: <path d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" />,
  chat: <path d="M4 5h16v11H9l-5 4z" />,
  trend: <path d="M3 17l6-6 4 4 8-8M15 7h6v6" />,
  sparkle: <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />,
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  x: <path d="M6 6l12 12M18 6L6 18" />,
  plus: <path d="M12 5v14M5 12h14" />,
  wrench: <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />,
  expand: <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />,
  layout: <path d="M3 4h18v16H3zM3 9h18M9 20V9" />,
};
type IconName = keyof typeof ICONS;

function Icon({ name, x, y, size = 22, color = ACCENT, weight = 1.8 }: { name: IconName; x: number; y: number; size?: number; color?: string; weight?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${size / 24})`} fill="none" stroke={color} strokeWidth={weight} strokeLinecap="round" strokeLinejoin="round">
      {ICONS[name]}
    </g>
  );
}

// Skeleton text lines
function Bars({ x, y, widths, gap = 10 }: { x: number; y: number; widths: number[]; gap?: number }) {
  return <>{widths.map((w, i) => <rect key={i} x={x} y={y + i * gap} width={w} height={4} rx={2} fill={BAR} />)}</>;
}

// Rounded pill with centred bold label
function Pill({ x, y, w, h, label, fill = TINT, color = TINT_TEXT, size = 12 }: { x: number; y: number; w: number; h: number; label: string; fill?: string; color?: string; size?: number }) {
  return (
    <>
      <rect x={x} y={y} width={w} height={h} rx={h / 2} fill={fill} />
      <text x={x + w / 2} y={y + h / 2 + size * 0.36} textAnchor="middle" fontSize={size} fontWeight={700} fill={color}>{label}</text>
    </>
  );
}

function Canvas({ id, children, defs }: { id: string; children: ReactNode; defs?: ReactNode }) {
  return (
    <svg viewBox="0 0 308 358" role="img" aria-hidden="true" style={{ fontFamily: "inherit" }}>
      <defs>
        <filter id={`${id}-shadow`} x="-30%" y="-30%" width="160%" height="170%">
          <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#3A2418" floodOpacity="0.09" />
        </filter>
        {defs}
      </defs>
      {children}
    </svg>
  );
}

function SignalIngestionArt() {
  const shadow = "url(#why-signal-shadow)";
  const nodes: { name: IconName; cx: number; cy: number }[] = [
    { name: "users", cx: 40, cy: 65 },
    { name: "pulse", cx: 66, cy: 123 },
    { name: "doc", cx: 40, cy: 181 },
    { name: "chart", cx: 66, cy: 239 },
    { name: "globe", cx: 40, cy: 297 },
  ];
  return (
    <Canvas id="why-signal">
      {/* Curves from each source into the insight card; the last two are dashed */}
      <g fill="none" stroke={ACCENT} strokeOpacity={0.6} strokeWidth={1.5}>
        {nodes.map(({ cx, cy }, i) => (
          <path key={i} d={`M${cx + 23} ${cy} C${cx + 110} ${cy} 150 181 192 181`} strokeDasharray={i >= 3 ? "4 4" : undefined} />
        ))}
      </g>
      {nodes.map(({ name, cx, cy }) => (
        <g key={name}>
          <circle cx={cx} cy={cy} r={23} fill="#fff" stroke="rgba(0,0,0,0.07)" filter={shadow} />
          <Icon name={name} x={cx - 11} y={cy - 11} />
        </g>
      ))}

      {/* Stacked insight card */}
      <rect x={210} y={100} width={86} height={170} rx={12} fill="#fff" stroke={BORDER} filter={shadow} opacity={0.5} />
      <rect x={202} y={108} width={86} height={170} rx={12} fill="#fff" stroke={BORDER} filter={shadow} opacity={0.75} />
      <rect x={194} y={116} width={86} height={170} rx={12} fill="#fff" stroke={BORDER} filter={shadow} />
      <rect x={206} y={130} width={30} height={30} rx={10} fill={ACCENT} />
      <Icon name="sparkle" x={212} y={136} size={18} color="#fff" />
      <Bars x={206} y={178} widths={[58, 46, 62, 40, 52]} />
      <Pill x={206} y={246} w={40} h={22} label="91" />
      <circle cx={192} cy={181} r={4} fill={ACCENT} />
    </Canvas>
  );
}

function EvidenceArt() {
  const shadow = "url(#why-evidence-shadow)";
  const reasons: IconName[] = ["chat", "chart", "trend"];
  return (
    <Canvas id="why-evidence">
      {/* Suggestion card with a faint one behind */}
      <rect x={38} y={52} width={232} height={146} rx={14} fill="#fff" stroke={BORDER} opacity={0.55} />
      <rect x={24} y={64} width={260} height={146} rx={14} fill="#fff" stroke={BORDER} filter={shadow} />
      <rect x={42} y={80} width={34} height={34} rx={11} fill={ACCENT} />
      <Icon name="sparkle" x={49} y={87} size={20} color="#fff" />
      <text x={86} y={94} fontSize={13} fontWeight={600} fill={INK}>Suggestion</text>
      <rect x={86} y={104} width={90} height={4} rx={2} fill={BAR} />
      <Pill x={228} y={84} w={40} h={22} label="91" />
      <path d="M42 128H266" stroke={BAR} strokeWidth={1.5} />
      <text x={42} y={150} fontFamily="var(--font-geist-mono), ui-monospace, monospace" fontSize={9.5} letterSpacing={1.5} fill={SUBTLE}>WHY</text>
      {reasons.map((name, i) => {
        const x = 42 + i * 77;
        return (
          <g key={name}>
            <rect x={x} y={160} width={70} height={34} rx={11} fill="#FCF8F5" stroke={BORDER} />
            <Icon name={name} x={x + 9.5} y={169.5} size={15} />
            <Bars x={x + 31} y={169} widths={[28, 18]} />
          </g>
        );
      })}

      {/* Approve / Reject */}
      <rect x={24} y={238} width={126} height={46} rx={23} fill={ACCENT} filter={shadow} />
      <Icon name="check" x={42} y={253} size={16} color={INK} weight={2.6} />
      <text x={68} y={266} fontSize={14} fontWeight={700} fill={INK}>Approve</text>
      <rect x={158} y={238} width={126} height={46} rx={23} fill="#fff" stroke="#DDD5CE" filter={shadow} />
      <Icon name="x" x={177} y={254} size={14} color={INK} weight={2.4} />
      <text x={202} y={266} fontSize={14} fontWeight={700} fill={INK}>Reject</text>
    </Canvas>
  );
}

// Recommendation types: tile/pill tints drawn from the coral, butter and seafoam frame palette
const AGENT_CARDS: { title: string; sub: string; icon: IconName; tint: string; tone: string; score: string }[] = [
  { title: "New feature", sub: "What to build", icon: "plus", tint: TINT, tone: TINT_TEXT, score: "91" },
  { title: "Agentic fix", sub: "What to repair", icon: "wrench", tint: "#FFF3D6", tone: "#A8700C", score: "84" },
  { title: "Use case expansion", sub: "Where to grow", icon: "expand", tint: "#F1EEEA", tone: "#55524C", score: "78" },
  { title: "Agentic UI design", sub: "How it should feel", icon: "layout", tint: "#E2F2F0", tone: "#1F6F5C", score: "72" },
];

function BuiltForAgentsArt() {
  return (
    <Canvas id="why-agents">
      {AGENT_CARDS.map(({ title, sub, icon, tint, tone, score }, i) => {
        const x = 14 + i * 22;
        const y = 30 + i * 66;
        return (
          <g key={title}>
            <rect x={x} y={y} width={214} height={78} rx={14} fill="#fff" stroke={BORDER} filter="url(#why-agents-shadow)" />
            <rect x={x + 14} y={y + 14} width={34} height={34} rx={10} fill={tint} />
            <Icon name={icon} x={x + 21.65} y={y + 21.65} size={18.7} color={i === 0 ? ACCENT : tone} />
            <text x={x + 58} y={y + 29} fontSize={13} fontWeight={600} fill={INK}>{title}</text>
            <text x={x + 58} y={y + 45} fontSize={11} fill={SUBTLE}>{sub}</text>
            <Pill x={x + 164} y={y + 46} w={38} h={20} label={score} fill={tint} color={tone} size={11} />
          </g>
        );
      })}
    </Canvas>
  );
}

function SharperEachLaunchArt() {
  const line = "M42 154 C80 152 96 140 122 136 S170 118 196 108 S240 96 268 92";
  return (
    <Canvas
      id="why-launch"
      defs={
        <linearGradient id="why-launch-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--accent)" stopOpacity="0.25" />
          <stop offset="1" stopColor="var(--accent)" stopOpacity="0" />
        </linearGradient>
      }
    >
      {/* Launched */}
      <rect x={24} y={40} width={260} height={136} rx={14} fill="#fff" stroke={BORDER} filter="url(#why-launch-shadow)" />
      <rect x={42} y={56} width={30} height={30} rx={10} fill={TINT} />
      <Icon name="trend" x={48.5} y={62.5} size={17} />
      <text x={82} y={76} fontSize={13} fontWeight={600} fill={INK}>Launched</text>
      <Pill x={224} y={58} w={44} h={24} label="+12%" />
      <path d={`${line} V164 H42Z`} fill="url(#why-launch-area)" />
      <path d={line} fill="none" stroke={ACCENT} strokeWidth={3} strokeLinecap="round" />
      <circle cx={268} cy={92} r={5} fill={ACCENT} stroke="#fff" strokeWidth={2} />

      {/* Feeds into */}
      <path d="M154 190V224" stroke={ACCENT} strokeWidth={1.5} strokeDasharray="4 4" />
      <path d="M148 217l6 8 6-8" fill="none" stroke={ACCENT} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />

      {/* Next build */}
      <rect x={24} y={238} width={260} height={84} rx={14} fill="#fff" stroke={ACCENT} strokeWidth={1.3} strokeDasharray="5 5" />
      <rect x={42} y={258} width={34} height={34} rx={11} fill={ACCENT} />
      <Icon name="sparkle" x={49} y={265} size={20} color="#fff" />
      <text x={88} y={272} fontSize={13} fontWeight={600} fill={INK}>Next build</text>
      <Bars x={88} y={282} widths={[120, 80]} />
    </Canvas>
  );
}

const CARDS = [
  { title: "Signal ingestion", body: "Private and external signals, synthesised.", Art: SignalIngestionArt },
  { title: "Evidence, not instinct", body: "Every suggestion comes with the proof behind it. Approve or reject with confidence.", Art: EvidenceArt },
  { title: "Built for agents", body: "New features. Agentic fixes. Use case expansions. Agentic UI design. Made for how agents actually ship.", Art: BuiltForAgentsArt },
  { title: "Sharper each launch", body: "Ship it. Measure it. The result feeds your next recommendation.", Art: SharperEachLaunchArt },
];

export default function WhyFeatureStream() {
  return (
    <section style={{ padding: "72px 24px 88px", background: "#fff", fontFamily: "var(--font-schibsted), system-ui, sans-serif" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div className="why-head">
          <div>
            <span className="eyebrow">Introducing FeatureStream</span>
            <h2 className="display" style={{ fontSize: "clamp(36px,4.2vw,58px)", lineHeight: 1.03, margin: "22px 0 0", textWrap: "balance" }}>
              Context-aware product management for teams building AI agents.
            </h2>
          </div>
          <div>
            <p style={{ fontSize: 17, lineHeight: 1.6, color: "#333", margin: 0, maxWidth: "52ch" }}>Product owners of AI agents manage customer, market, domain, use case and product usage signals across too many tools to know what to build next. Customer needs shift, agent behaviour changes, competitors ship. FeatureStream keeps all of it in view and tells you what to build next.</p>
            <p style={{ fontSize: 17, lineHeight: 1.5, fontWeight: 600, color: "#000", margin: "14px 0 0" }}>Built to streamline the process involved in creating and managing an agentic product.</p>
          </div>
        </div>

        <div className="why-cards">
          {CARDS.map(({ title, body, Art }) => (
            <div key={title} style={{ minWidth: 0 }}>
              <div className="why-card-art"><Art /></div>
              <h3 className="display" style={{ fontSize: 30, lineHeight: 1.15, margin: "22px 0 0", letterSpacing: "-0.01em" }}>{title}</h3>
              <p style={{ fontSize: 16, lineHeight: 1.55, color: "#222", margin: "8px 0 0" }}>{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
