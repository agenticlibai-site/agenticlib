// "Built for agentic products" homepage section: header + seven-card bento grid.
// Each illustration is an inline SVG that scales to fit its card. All figures and names are placeholders.

import Link from "next/link";
import type { ReactNode } from "react";

const ACCENT = "var(--accent)";
const INK = "#16181D";
const SUBTLE = "#6B707C";
const BORDER = "#EDE6E0";
const BAR = "#E9E5DF";
const PANEL = "#F7F6F4";

// Chip tints: coral, butter, seafoam, neutral
const TONES = {
  coral: { fill: "#FDEDE7", text: "#B5442A" },
  butter: { fill: "#FFF3D6", text: "#8A5A00" },
  seafoam: { fill: "#E2F2F0", text: "#14503F" },
  neutral: { fill: "#F0EDE8", text: "#55524C" },
};
type Tone = keyof typeof TONES;

// 24×24 line icons (stroke only)
const ICONS = {
  dollar: <path d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18M14.5 9.5c-.6-.8-1.5-1.2-2.5-1.2-1.4 0-2.5.7-2.5 1.8 0 2.5 5 1.2 5 3.7 0 1.1-1.1 1.8-2.5 1.8-1 0-2-.4-2.6-1.2M12 6.5v1.8M12 15.7v1.8" />,
  heart: <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />,
  pulse: <path d="M3 12h4l3-7 4 14 3-7h4" />,
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  alert: <path d="M12 4l9 16H3zM12 10v4M12 17v.01" />,
  doc: <path d="M7 3h7l4 4v14H7zM14 3v4h4M9.5 12h5M9.5 16h5" />,
  sparkle: <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />,
  arrowUp: <path d="M12 19V5M5 12l7-7 7 7" />,
};
type IconName = keyof typeof ICONS;

function Icon({ name, x, y, size = 21, color = ACCENT, weight = 1.8 }: { name: IconName; x: number; y: number; size?: number; color?: string; weight?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${size / 24})`} fill="none" stroke={color} strokeWidth={weight} strokeLinecap="round" strokeLinejoin="round">
      {ICONS[name]}
    </g>
  );
}

function Chip({ x, y, w, label, tone }: { x: number; y: number; w: number; label: string; tone: Tone }) {
  const { fill, text } = TONES[tone];
  return (
    <>
      <rect x={x} y={y} width={w} height={24} rx={12} fill={fill} />
      <text x={x + w / 2} y={y + 16.14} textAnchor="middle" fontSize={11.5} fontWeight={700} fill={text}>{label}</text>
    </>
  );
}

// Two skeleton lines (title + subtitle)
function Lines({ x, y, w1 = 84, w2 = 56 }: { x: number; y: number; w1?: number; w2?: number }) {
  return (
    <>
      <rect x={x} y={y} width={w1} height={5} rx={2.5} fill={BAR} />
      <rect x={x} y={y + 11} width={w2} height={4} rx={2} fill={BAR} opacity={0.7} />
    </>
  );
}

function Art({ id, w, className, children }: { id: string; w: number; className?: string; children: ReactNode }) {
  return (
    <svg className={className} viewBox={`0 0 ${w} 290`} preserveAspectRatio="xMidYMid meet" role="img" aria-hidden="true" style={{ fontFamily: "inherit" }}>
      <defs>
        <filter id={`${id}-shadow`} x="-30%" y="-30%" width="160%" height="170%">
          <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#3A2418" floodOpacity="0.09" />
        </filter>
        <linearGradient id={`${id}-area`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--accent)" stopOpacity="0.25" />
          <stop offset="1" stopColor="var(--accent)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {children}
    </svg>
  );
}

const METRICS: { label: string; value: string; icon: IconName; line: string }[] = [
  { label: "Revenue", value: "+12%", icon: "dollar", line: "M0 38 C25 36 40 30 62 26 S105 14 130 10 S160 4 170 2" },
  { label: "Satisfaction", value: "4.6", icon: "heart", line: "M0 30 C25 34 45 26 70 24 S110 16 135 12 S160 8 170 6" },
  { label: "Product usage", value: "+18%", icon: "pulse", line: "M0 40 C20 38 45 34 70 26 S115 22 140 12 S162 6 170 2" },
];

function MetricCards({ id }: { id: string }) {
  return (
    <>
      {METRICS.map(({ label, value, icon, line }, i) => {
        const x = 91 + i * 230;
        return (
          <g key={label}>
            <rect x={x} y={50} width={200} height={176} rx={16} fill="#fff" stroke={BORDER} filter={`url(#${id}-shadow)`} />
            <rect x={x + 16} y={66} width={30} height={30} rx={10} fill={TONES.coral.fill} />
            <Icon name={icon} x={x + 22.6} y={72.6} size={16.8} />
            <text x={x + 58} y={87} fontSize={13} fontWeight={500} fill={SUBTLE}>{label}</text>
            <text x={x + 18} y={146} fontSize={40} fontWeight={700} letterSpacing={-1} fill={INK}>{value}</text>
            <g transform={`translate(${x + 16} 162)`}>
              <path d={`${line} V50 H0Z`} fill={`url(#${id}-area)`} />
              <path d={line} fill="none" stroke={ACCENT} strokeWidth={2.5} strokeLinecap="round" />
            </g>
          </g>
        );
      })}
    </>
  );
}

function OutcomesArt() {
  return (
    <>
      <Art id="bento-outcomes" w={842} className="bento-art-lg"><MetricCards id="bento-outcomes" /></Art>
      {/* Phone: crop to the first two metrics so the figures stay legible */}
      <svg className="bento-art-sm" viewBox="76 30 460 214" preserveAspectRatio="xMidYMid meet" role="img" aria-hidden="true" style={{ fontFamily: "inherit" }}>
        <defs>
          <filter id="bento-outcomes-sm-shadow" x="-30%" y="-30%" width="160%" height="170%">
            <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#3A2418" floodOpacity="0.09" />
          </filter>
          <linearGradient id="bento-outcomes-sm-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--accent)" stopOpacity="0.25" />
            <stop offset="1" stopColor="var(--accent)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <MetricCards id="bento-outcomes-sm" />
      </svg>
    </>
  );
}

function FeatureStatusArt() {
  const shadow = "url(#bento-status-shadow)";
  return (
    <Art id="bento-status" w={422}>
      <path d="M30 0 C60 130 230 200 422 262" fill="none" stroke={ACCENT} strokeOpacity={0.45} strokeWidth={1.3} />
      {/* Shipped */}
      <g>
        <rect x={34} y={40} width={272} height={54} rx={27} fill="#fff" stroke={BORDER} filter={shadow} />
        <circle cx={62} cy={67} r={14} fill="#2E9E7A" />
        <Icon name="check" x={55} y={60} size={14} color="#fff" weight={3} />
        <Lines x={88} y={58} />
        <Chip x={202} y={55} w={88} label="Shipped" tone="seafoam" />
      </g>
      {/* In Development */}
      <g opacity={0.9}>
        <rect x={64} y={110} width={272} height={54} rx={27} fill="#fff" stroke={BORDER} filter={shadow} />
        <circle cx={92} cy={137} r={14} fill="none" stroke={BAR} strokeWidth={2.4} opacity={0.6} />
        <circle cx={92} cy={137} r={14} fill="none" stroke="#E0A830" strokeWidth={2.4} strokeDasharray="46 100" transform="rotate(-90 92 137)" />
        <Lines x={118} y={128} w1={68} w2={46} />
        <Chip x={202} y={125} w={118} label="In Development" tone="butter" />
      </g>
      {/* Planned */}
      <g opacity={0.65}>
        <rect x={94} y={180} width={272} height={54} rx={27} fill="#fff" stroke={BORDER} filter={shadow} />
        <circle cx={122} cy={207} r={14} fill="none" stroke="#C9C4BC" strokeWidth={2} strokeDasharray="4 4" />
        <Lines x={148} y={198} />
        <Chip x={262} y={195} w={88} label="Planned" tone="neutral" />
      </g>
    </Art>
  );
}

function RequestsArt() {
  const rows: { label: string; tone: Tone; opacity: number }[] = [
    { label: "New feature", tone: "coral", opacity: 1 },
    { label: "Agentic fix", tone: "butter", opacity: 0.85 },
    { label: "Use case", tone: "seafoam", opacity: 0.6 },
  ];
  return (
    <Art id="bento-requests" w={416}>
      {rows.map(({ label, tone, opacity }, i) => {
        const y = 40 + i * 70;
        return (
          <g key={label} opacity={opacity}>
            <rect x={34} y={y} width={348} height={54} rx={16} fill="#fff" stroke={BORDER} filter="url(#bento-requests-shadow)" />
            <circle cx={62} cy={y + 27} r={14} fill={BAR} />
            <Lines x={88} y={y + 17} w1={130} w2={84} />
            <Chip x={274} y={y + 15} w={96} label={label} tone={tone} />
          </g>
        );
      })}
    </Art>
  );
}

function ErrorsArt() {
  const shadow = "url(#bento-errors-shadow)";
  return (
    <Art id="bento-errors" w={416}>
      {/* Timeline rail */}
      <path d="M62 30V270" stroke="#E2DDD6" strokeWidth={2} />
      <circle cx={62} cy={68} r={7} fill={ACCENT} stroke={PANEL} strokeWidth={3} />
      <circle cx={62} cy={138} r={7} fill="#C9C4BC" stroke={PANEL} strokeWidth={3} />
      <circle cx={62} cy={208} r={7} fill="#DDD8D1" stroke={PANEL} strokeWidth={3} />

      <rect x={88} y={40} width={304} height={56} rx={16} fill="#fff" stroke={BORDER} filter={shadow} />
      <rect x={100} y={52} width={32} height={32} rx={10} fill={TONES.coral.fill} />
      <Icon name="alert" x={107} y={59} size={18} />
      <text x={144} y={73} fontSize={13.5} fontWeight={600} fill={INK}>Tool call timeout</text>
      <Chip x={312} y={56} w={68} label="Error" tone="coral" />

      <g opacity={0.9}>
        <rect x={88} y={110} width={304} height={56} rx={16} fill="#fff" stroke={BORDER} filter={shadow} />
        <rect x={100} y={122} width={32} height={32} rx={10} fill={TONES.neutral.fill} />
        <Icon name="doc" x={107} y={129} size={18} color={TONES.neutral.text} />
        <text x={144} y={143} fontSize={13.5} fontWeight={600} fill={INK}>v2.3 released</text>
        <Chip x={296} y={126} w={84} label="Changelog" tone="neutral" />
      </g>

      <g opacity={0.6}>
        <rect x={88} y={180} width={304} height={56} rx={16} fill="#fff" stroke={BORDER} filter={shadow} />
        <rect x={100} y={192} width={32} height={32} rx={10} fill={BAR} />
        <Lines x={144} y={196} w1={130} w2={84} />
      </g>
    </Art>
  );
}

function CatalogueArt() {
  return (
    <Art id="bento-catalogue" w={416}>
      {[0, 1].map((row) =>
        [0, 1, 2].map((col) => {
          const x = 26 + col * 126;
          const y = 36 + row * 118;
          const active = row === 0 && col === 1;
          return (
            <g key={`${row}-${col}`} opacity={row === 1 ? 0.6 : 1}>
              <rect x={x} y={y} width={112} height={104} rx={14} fill="#fff" stroke={active ? ACCENT : BORDER} strokeWidth={active ? 1.5 : 1} filter="url(#bento-catalogue-shadow)" />
              <rect x={x + 8} y={y + 8} width={96} height={54} rx={9} fill={active ? TONES.coral.fill : TONES.neutral.fill} />
              {active && <Icon name="doc" x={x + 43} y={y + 22} size={26} weight={1.7} />}
              <Lines x={x + 12} y={y + 74} w1={70} w2={44} />
            </g>
          );
        }),
      )}
    </Art>
  );
}

function Waves({ count = 10, d }: { count?: number; d: (o: number) => string }) {
  return (
    <g fill="none" stroke={ACCENT} strokeOpacity={0.42} strokeWidth={1}>
      {Array.from({ length: count }, (_, i) => <path key={i} d={d(i * 5)} />)}
    </g>
  );
}

function AskWide({ id }: { id: string }) {
  return (
    <>
      <Waves d={(o) => `M0 ${170 + o} C260 ${176 + o} 420 ${236 + o} 680 ${206 + o} S1040 ${120 + o} 1280 ${104 + o}`} />
      <rect x={270} y={56} width={740} height={68} rx={34} fill="#fff" filter={`url(#${id}-shadow)`} />
      <Icon name="sparkle" x={304} y={80} size={20} weight={1.6} />
      <text x={348} y={95} fontSize={16.5} fill="#3B3E46">What should we fix first in our agent to stop losing deals?</text>
      <circle cx={972} cy={90} r={20} fill={ACCENT} />
      <Icon name="arrowUp" x={964} y={82} size={16} color={INK} weight={2.4} />
    </>
  );
}

function AskArt() {
  return (
    <>
      {/* Desktop/tablet: crop in on the search pill so the question stays legible */}
      <svg className="bento-art-lg" viewBox="240 20 800 250" preserveAspectRatio="xMidYMid meet" role="img" aria-hidden="true" style={{ fontFamily: "inherit" }}>
        <defs>
          <filter id="bento-ask-shadow" x="-30%" y="-30%" width="160%" height="170%">
            <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#3A2418" floodOpacity="0.09" />
          </filter>
        </defs>
        <AskWide id="bento-ask" />
      </svg>
      {/* Phone: narrower canvas, question wraps onto two lines */}
      <Art id="bento-ask-sm" w={400} className="bento-art-sm">
        <Waves d={(o) => `M0 ${170 + o} C80 ${176 + o} 130 ${236 + o} 210 ${206 + o} S330 ${120 + o} 400 ${104 + o}`} />
        <rect x={20} y={60} width={360} height={84} rx={42} fill="#fff" filter="url(#bento-ask-sm-shadow)" />
        <Icon name="sparkle" x={42} y={92} size={20} weight={1.6} />
        <text fontSize={14.5} fill="#3B3E46">
          <tspan x={76} y={98}>What should we fix first in our</tspan>
          <tspan x={76} y={118}>agent to stop losing deals?</tspan>
        </text>
        <circle cx={340} cy={102} r={20} fill={ACCENT} />
        <Icon name="arrowUp" x={332} y={94} size={16} color={INK} weight={2.4} />
      </Art>
    </>
  );
}

// Earlier cycles' docs, peeking out behind the newest one
function PastDoc({ x, y, h, label, opacity }: { x: number; y: number; h: number; label: string; opacity: number }) {
  return (
    <g opacity={opacity}>
      <rect x={x} y={y} width={180} height={h} rx={16} fill="#fff" stroke={BORDER} filter="url(#bento-prd-shadow)" />
      <Chip x={x + 12} y={y + 14} w={66} label={label} tone="neutral" />
      <rect x={x + 14} y={y + 56} width={58} height={7} rx={3.5} fill={INK} opacity={0.35} />
      <rect x={x + 14} y={y + 74} width={62} height={4} rx={2} fill={BAR} />
      <rect x={x + 14} y={y + 85} width={50} height={4} rx={2} fill={BAR} />
      <rect x={x + 14} y={y + 96} width={56} height={4} rx={2} fill={BAR} />
      <rect x={x + 14} y={y + 122} width={12} height={12} rx={3.5} fill={BAR} />
      <rect x={x + 14} y={y + 142} width={12} height={12} rx={3.5} fill={BAR} />
    </g>
  );
}

// One PRD / spec per build cycle, newest in front
function PrdArt() {
  return (
    <Art id="bento-prd" w={416}>
      <path d="M0 70 C120 40 250 150 416 120" fill="none" stroke={ACCENT} strokeOpacity={0.45} strokeWidth={1.3} />
      <PastDoc x={30} y={66} h={196} label="Cycle 12" opacity={0.55} />
      <PastDoc x={118} y={48} h={214} label="Cycle 13" opacity={0.85} />

      <rect x={206} y={28} width={180} height={234} rx={16} fill="#fff" stroke={BORDER} filter="url(#bento-prd-shadow)" />
      <Chip x={222} y={44} w={68} label="Cycle 14" tone="coral" />

      {/* PRD / Spec tabs */}
      <rect x={222} y={80} width={104} height={26} rx={13} fill={PANEL} />
      <rect x={225} y={83} width={50} height={20} rx={10} fill="#fff" stroke={BORDER} />
      <text x={250} y={96.5} textAnchor="middle" fontSize={11} fontWeight={700} fill={INK}>PRD</text>
      <text x={300} y={96.5} textAnchor="middle" fontSize={11} fontWeight={600} fill={SUBTLE}>Spec</text>

      <rect x={222} y={122} width={124} height={8} rx={4} fill={INK} opacity={0.85} />
      <rect x={222} y={138} width={88} height={5} rx={2.5} fill={BAR} />
      <rect x={222} y={156} width={146} height={4} rx={2} fill={BAR} opacity={0.8} />
      <rect x={222} y={167} width={120} height={4} rx={2} fill={BAR} opacity={0.8} />
      <path d="M222 186H370" stroke={BAR} />

      {/* Acceptance criteria */}
      {[0, 1, 2].map((i) => {
        const y = 198 + i * 20;
        return i < 2 ? (
          <g key={i}>
            <rect x={222} y={y} width={14} height={14} rx={4} fill="#2E9E7A" />
            <Icon name="check" x={224} y={y + 2} size={10} color="#fff" weight={3} />
            <rect x={246} y={y + 5} width={i === 0 ? 110 : 90} height={5} rx={2.5} fill={BAR} />
          </g>
        ) : (
          <g key={i}>
            <rect x={222.75} y={y + 0.75} width={12.5} height={12.5} rx={3.5} fill="none" stroke="#C9C4BC" strokeWidth={1.5} />
            <rect x={246} y={y + 5} width={78} height={5} rx={2.5} fill={BAR} />
          </g>
        );
      })}

      {/* Generated badge */}
      <circle cx={384} cy={30} r={17} fill={ACCENT} stroke="#fff" strokeWidth={3} />
      <Icon name="sparkle" x={376} y={22} size={16} color={INK} weight={1.8} />
    </Art>
  );
}

const CARDS: { title: string; body: string; Art: () => ReactNode; span?: "wide" | "fill" }[] = [
  { title: "Business outcomes improved", body: "Track revenue, customer satisfaction and product usage against every feature you ship.", Art: OutcomesArt, span: "wide" },
  { title: "Product feature status", body: "Track every feature from suggested to building to shipped.", Art: FeatureStatusArt },
  { title: "Classified customer requests", body: "Every request sorted automatically, so you see what customers want most.", Art: RequestsArt },
  { title: "Agentic errors & changelogs", body: "Track agent errors and changelogs side by side with what you ship.", Art: ErrorsArt },
  { title: "Product Catalogue", body: "Every feature you ship, browsable with its impact, evidence and status.", Art: CatalogueArt },
  { title: "PRDs & specs", body: "A PRD and spec for every build cycle, written from how your agentic workflows actually run.", Art: PrdArt, span: "fill" },
  { title: "Ask anything about your agentic product", body: "Answers come from your own chats, tickets, evals and roadmap.", Art: AskArt, span: "wide" },
];

export default function AgenticBento() {
  return (
    <section className="home-section" style={{ padding: "88px 24px 96px", background: "#fff", fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div className="bento-head">
          <div>
            <span className="eyebrow">Built for agentic products</span>
            <h2 className="display" style={{ fontSize: "clamp(36px,4.2vw,58px)", lineHeight: 1.04, margin: "22px 0 0", textWrap: "balance" }}>
              Track what matters in your <span style={{ color: ACCENT }}>agentic</span> product.
              <br />
              <span style={{ color: "#8A8F9B" }}>From every request to every outcome.</span>
            </h2>
          </div>
          <Link href="/#contact" className="btn-accent" style={{ flexShrink: 0 }}>
            Get started <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>

        <div className="bento-grid">
          {CARDS.map(({ title, body, Art, span }) => (
            <div key={title} className={`bento-card${span ? ` bento-${span}` : ""}`}>
              <div className="bento-art"><Art /></div>
              <div className="bento-copy">
                <h3 style={{ fontSize: 19, fontWeight: 600, letterSpacing: "-0.01em", lineHeight: 1.3, color: "#000", margin: 0 }}>{title}</h3>
                <p style={{ fontSize: 14.5, lineHeight: 1.5, color: "#5A5F6B", margin: "6px 0 0", maxWidth: 520 }}>{body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
