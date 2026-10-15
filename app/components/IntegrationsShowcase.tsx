// Integrations section: glass logo bubbles floating along a wave, with the categories listed below.
// Logos are static brand SVGs in /public/integrations/brand. Styles live under .int-* in globals.css.

type Bubble = { logo: string; name: string; x: number; y: number; size: number; tint?: boolean };

// x/y are the bubble centre as % of the field; size is % of the field width.
const BUBBLES: Bubble[] = [
  { logo: "zendesk", name: "Zendesk", x: 5, y: 74, size: 5.2 },
  { logo: "salesforce", name: "Salesforce", x: 13.5, y: 80, size: 9.4 },
  { logo: "linear", name: "Linear", x: 22, y: 58, size: 6.2 },
  { logo: "intercom", name: "Intercom", x: 28, y: 84, size: 6.4 },
  { logo: "mixpanel", name: "Mixpanel", x: 34.5, y: 52, size: 6.6 },
  { logo: "amplitude", name: "Amplitude", x: 43.5, y: 78, size: 9.2 },
  { logo: "notion", name: "Notion", x: 47, y: 40, size: 9.4 },
  { logo: "posthog", name: "PostHog", x: 54.5, y: 82, size: 5.8 },
  { logo: "grafana", name: "Grafana", x: 60.5, y: 54, size: 8.2 },
  { logo: "new-relic", name: "New Relic", x: 63.5, y: 26, size: 5.6 },
  { logo: "hubspot", name: "HubSpot", x: 77, y: 60, size: 20, tint: true },
  { logo: "datadog", name: "Datadog", x: 86.5, y: 18, size: 8.8 },
];

// A bundle of thin strands: fanned out on the left, dipping under the bottom-left bubbles,
// tightening as they rise through the middle, then sweeping up to the top right (1200×400 field space).
type Pt = [number, number];
const strand = (k: number): Pt[] => [
  [-20, 210 + k * 22], [120, 230 + k * 18], [200, 352 + k * 8], [330, 346 + k * 6],
  [460, 346 + k * 6 - (352 + k * 8 - 346 - k * 6)], [520, 282 + k * 5], [640, 226 + k * 3],
  [760, 170 + k], [900, 128 + k * 8], [1220, 68 + k * 14],
];
const STRANDS = [-3, -2, -1, 0, 1, 2, 3];
const WAVES = STRANDS.map((k) => {
  const p = strand(k).map(([x, y]) => `${x} ${y}`);
  return `M ${p[0]} C ${p[1]}, ${p[2]}, ${p[3]} C ${p[4]}, ${p[5]}, ${p[6]} C ${p[7]}, ${p[8]}, ${p[9]}`;
});

// Glowing dots sitting on the strands, as % of the field.
const bezier = (p: Pt[], seg: number, t: number): Pt => {
  const [a, b, c, d] = p.slice(seg * 3, seg * 3 + 4);
  const u = 1 - t;
  const f = (i: 0 | 1) => u * u * u * a[i] + 3 * u * u * t * b[i] + 3 * u * t * t * c[i] + t * t * t * d[i];
  return [f(0), f(1)];
};
const SPARKS: Pt[] = [
  [-2, 0, 0.45], [1, 0, 0.8], [3, 1, 0.2], [-1, 1, 0.55], [2, 1, 0.85],
  [0, 2, 0.15], [-3, 2, 0.35], [1, 2, 0.55], [-1, 2, 0.75], [3, 2, 0.9],
].map(([k, seg, t]) => {
  const [x, y] = bezier(strand(k), seg, t);
  return [(x / 1200) * 100, (y / 400) * 100];
});

const CATEGORIES = [
  { label: "Observability platforms", examples: "Datadog, New Relic, Grafana" },
  { label: "CRM & Note-taking", examples: "Salesforce, HubSpot, Notion" },
  { label: "Customer support & ticketing", examples: "Intercom, Zendesk, Linear" },
  { label: "Usage analytics", examples: "Mixpanel, Amplitude, PostHog" },
];

export default function IntegrationsShowcase() {
  return (
    <section style={{ padding: "88px 24px 96px", background: "#fff", fontFamily: "var(--font-schibsted), system-ui, sans-serif" }}>
      <div style={{ maxWidth: 880, margin: "0 auto" }}>
        <div className="int-stage">
          <div className="int-head">
            <span className="eyebrow">Built around your workflow</span>
            <h2 className="display" style={{ fontSize: "clamp(30px,3.4vw,46px)", lineHeight: 1.03, margin: "16px 0 16px", textWrap: "balance" }}>
              Connects to the tools you already use.
            </h2>
            <p style={{ fontSize: 15.5, lineHeight: 1.6, color: "#000", margin: 0, maxWidth: "54ch", marginInline: "auto" }}>
              FeatureStream integrates with the tools your team already uses, reads from them directly and synthesises signals to create a ranked list of suggestions by impact your product owner can approve or reject.
            </p>
          </div>

          <div className="int-field">
            <svg className="int-waves" viewBox="0 0 1200 400" preserveAspectRatio="none" aria-hidden="true">
              <g fill="none" stroke="#fff" strokeWidth={1.6} strokeLinecap="round" style={{ filter: "drop-shadow(0 0 1.5px rgba(214, 120, 90, 0.6))" }}>
                {WAVES.map((d, i) => <path key={i} d={d} vectorEffect="non-scaling-stroke" opacity={i % 2 ? 1 : 0.8} />)}
              </g>
            </svg>
            {SPARKS.map(([x, y], i) => (
              <span key={i} className="int-spark" style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${(i % 5) * -0.7}s` }} />
            ))}
            {BUBBLES.map((b, i) => (
              <div
                key={b.logo}
                className={`int-bubble${b.tint ? " int-bubble-tint" : ""}`}
                style={{ left: `${b.x}%`, top: `${b.y}%`, ["--s" as string]: b.size, animationDelay: `${(i % 4) * -1.6}s`, animationDuration: `${6 + (i % 3)}s` }}
              >
                <img src={`/integrations/brand/${b.logo}.svg`} alt={b.name} width={48} height={48} loading="lazy" />
              </div>
            ))}
          </div>
        </div>

        <div className="int-cats">
          {CATEGORIES.map((c) => (
            <div key={c.label}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#000" }}>{c.label}</div>
              <div style={{ fontSize: 13.5, color: "#55524C", marginTop: 5 }}>{c.examples}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
