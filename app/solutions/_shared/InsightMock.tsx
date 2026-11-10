import type { Investigation } from "./solutions";

/* Illustrative product mock: a FeatureStream dashboard with the assistant
   panel overlapping it. All figures are example data, labelled as such. */

const TEAL = "#1F6F5C";
const CORAL = "#FF8A73";

// Deterministic example series (30 points) for the trend chart
const seriesA = [62, 64, 61, 66, 70, 68, 72, 71, 74, 73, 76, 75, 78, 80, 79, 82, 81, 84, 83, 86, 85, 88, 87, 89, 90, 88, 91, 92, 91, 94];
const seriesB = [30, 31, 29, 32, 33, 31, 34, 33, 35, 33, 34, 36, 35, 34, 36, 37, 35, 36, 38, 37, 36, 38, 37, 39, 38, 37, 39, 40, 38, 40];

function path(data: number[], w: number, h: number) {
  const max = 100;
  return data
    .map((v, i) => `${i === 0 ? "M" : "L"}${((i / (data.length - 1)) * w).toFixed(1)},${(h - (v / max) * h).toFixed(1)}`)
    .join(" ");
}

function Icon({ kind }: { kind: Investigation["steps"][number]["kind"] }) {
  const p = { width: 16, height: 16, viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (kind) {
    case "calendar":
      return (
        <svg {...p}>
          <rect x="2.5" y="3.5" width="11" height="10" rx="2" />
          <path d="M2.5 6.5h11M5.5 2v3M10.5 2v3" />
        </svg>
      );
    case "doc":
      return (
        <svg {...p}>
          <path d="M4 2.5h5l3 3v8H4z" />
          <path d="M6 8.5h4M6 11h3" />
        </svg>
      );
    case "grid":
      return (
        <svg {...p}>
          <rect x="2.5" y="2.5" width="4.5" height="4.5" rx="1" />
          <rect x="9" y="2.5" width="4.5" height="4.5" rx="1" />
          <rect x="2.5" y="9" width="4.5" height="4.5" rx="1" />
          <rect x="9" y="9" width="4.5" height="4.5" rx="1" />
        </svg>
      );
    default:
      return null;
  }
}

export default function InsightMock({ inv }: { inv: Investigation }) {
  const fMax = inv.funnel.steps[0][1];
  return (
    <div className="im" aria-label="Illustrative example of a FeatureStream investigation">
      <style>{`
        .im { position: relative; margin-top: 52px; background: linear-gradient(160deg, #E4F3EE 0%, #F1F8F4 55%, #FDEFEA 100%); border-radius: 28px; padding: 40px 40px 40px 300px; font-family: var(--font-dm-sans), system-ui, sans-serif; }
        .im-dash { background: #fff; border-radius: 18px; border: 1px solid rgba(0,0,0,0.06); box-shadow: 0 20px 50px -24px rgba(31,111,92,0.35); padding: 26px 28px 28px 92px; }
        .im-crumb { font-size: 12.5px; color: #8A867E; display: flex; gap: 6px; align-items: center; }
        .im-crumb b { color: #3A3833; font-weight: 500; }
        .im-dash h3 { font-family: var(--font-instrument-serif), Georgia, serif; font-weight: 400; font-size: 34px; line-height: 1.1; margin: 14px 0 0; letter-spacing: -0.01em; max-width: 560px; }
        .im-sub { margin: 8px 0 0; font-size: 14px; color: #6B675F; }
        .im-card { border: 1px solid rgba(0,0,0,0.08); border-radius: 14px; padding: 16px 18px; background: #fff; }
        .im-card h4 { margin: 0; font-size: 13px; font-weight: 600; color: #22201C; }
        .im-legend { display: flex; gap: 14px; margin-top: 6px; font-size: 11.5px; color: #6B675F; }
        .im-legend i { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 6px; vertical-align: 0; }
        .im-trend { margin-top: 20px; }
        .im-trend svg { display: block; width: 100%; height: 110px; margin-top: 10px; }
        .im-row { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.25fr); gap: 14px; margin-top: 14px; }
        .im-funnel { display: flex; align-items: flex-end; gap: 12px; margin-top: 14px; }
        .im-fcol { flex: 1; display: flex; flex-direction: column; justify-content: flex-end; }
        .im-fbar { flex-shrink: 0; background: ${TEAL}; border-radius: 6px 6px 2px 2px; opacity: 0.9; }
        .im-fcol:nth-child(2) .im-fbar { opacity: 0.6; }
        .im-fcol:nth-child(3) .im-fbar { background: ${CORAL}; opacity: 1; }
        .im-fval { font-size: 12px; font-weight: 600; margin-bottom: 4px; color: #22201C; }
        .im-flab { font-size: 11px; color: #6B675F; margin-top: 6px; line-height: 1.3; min-height: 28px; }
        .im-reasons { margin-top: 12px; display: grid; gap: 9px; }
        .im-r { display: grid; grid-template-columns: minmax(0, 1fr) 34px; gap: 10px; align-items: center; font-size: 11.5px; color: #3A3833; }
        .im-r-track { grid-column: 1 / -1; height: 7px; border-radius: 4px; background: #F1EEE8; overflow: hidden; margin-top: -4px; }
        .im-r-fill { height: 100%; border-radius: 4px; background: ${CORAL}; }
        .im-r:not(:first-child) .im-r-fill { background: #F6C2B6; }
        .im-r span:last-child { text-align: right; font-weight: 600; }

        .im-panel { position: absolute; left: 40px; top: 72px; width: 330px; background: #fff; border-radius: 18px; box-shadow: 0 30px 60px -20px rgba(0,0,0,0.28), 0 0 0 1px rgba(0,0,0,0.05); padding: 18px 18px 20px; z-index: 2; }
        .im-ph { display: flex; align-items: center; gap: 10px; }
        .im-spark { width: 30px; height: 30px; border-radius: 9px; background: var(--frame-gradient, linear-gradient(135deg, #FF8A73, #F9D46B, #7DDCCF)); display: grid; place-items: center; flex-shrink: 0; }
        .im-ph b { font-size: 15px; font-weight: 600; flex: 1; }
        .im-ph-ic { display: flex; gap: 8px; color: #A19D95; }
        .im-steps { list-style: none; margin: 14px 0 0; padding: 0; display: grid; gap: 4px; }
        .im-steps li { display: flex; gap: 10px; align-items: flex-start; font-size: 13.5px; line-height: 1.45; color: #3A3833; padding: 5px 0; }
        .im-steps li > span:first-child { color: ${TEAL}; flex-shrink: 0; width: 16px; display: grid; place-items: center; padding-top: 2px; }
        .im-dot { width: 6px; height: 6px; border-radius: 50%; background: #3A3833; margin-top: 6px; }
        .im-steps li.im-find { padding-left: 26px; }
        .im-steps li.im-find > span:first-child { display: none; }
        .im-steps li.im-find::before { content: ""; width: 5px; height: 5px; border-radius: 50%; background: #3A3833; flex-shrink: 0; margin-top: 8px; margin-left: -16px; margin-right: 5px; }
        .im-steps li.im-chiprow { display: block; padding: 2px 0 4px; }
        .im-steps li.im-chiprow > span.im-chip { display: inline-block; width: auto; color: ${TEAL}; padding: 4px 10px; }
        .im-chip { display: inline-block; margin-left: 26px; padding: 4px 10px; border-radius: 8px; background: #E4F3EE; color: ${TEAL}; font-weight: 600; font-size: 12.5px; }
        .im-asm { margin-top: 10px; display: flex; gap: 8px; align-items: center; font-size: 13.5px; font-weight: 600; color: #E8604A; }
        .im-asm i { width: 14px; height: 14px; border-radius: 50%; border: 2px solid #F6C2B6; border-top-color: #E8604A; animation: im-spin 1s linear infinite; }
        @keyframes im-spin { to { transform: rotate(360deg); } }
        @media (prefers-reduced-motion: reduce) { .im-asm i { animation: none; } }
        .im-note { position: absolute; right: 22px; bottom: 12px; font-size: 11px; color: #6B675F; font-family: var(--font-geist-mono), ui-monospace, monospace; }

        @media (max-width: 1000px) {
          .im { padding: 28px 24px 40px; }
          .im-panel { position: relative; left: auto; top: auto; width: auto; max-width: 420px; margin: 0 0 -40px 0; }
          .im-dash { padding: 64px 24px 24px; }
        }
        @media (max-width: 640px) {
          .im { margin-top: 36px; padding: 16px 12px 36px; border-radius: 20px; }
          .im-panel { margin: 0 4px -32px; padding: 16px 14px 18px; }
          .im-dash { padding: 52px 16px 18px; border-radius: 14px; }
          .im-dash h3 { font-size: 26px; }
          .im-row { grid-template-columns: minmax(0, 1fr); }
          .im-trend { display: none; }
          .im-note { right: 14px; bottom: 10px; }
        }
      `}</style>

      {/* Assistant panel */}
      <div className="im-panel">
        <div className="im-ph">
          <span className="im-spark" aria-hidden>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="#000"><path d="M8 1.5l1.6 4.2 4.4 1.3-4.4 1.3L8 12.5 6.4 8.3 2 7l4.4-1.3z" /><path d="M13 11l.6 1.4 1.4.6-1.4.6L13 15l-.6-1.4L11 13l1.4-.6z" /></svg>
          </span>
          <b>{inv.panelTitle}</b>
          <span className="im-ph-ic" aria-hidden>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M11 2.5l2.5 2.5L6 12.5H3.5V10z" /></svg>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M4 4l8 8M12 4l-8 8" /></svg>
          </span>
        </div>
        <ul className="im-steps">
          {inv.steps.map((st) =>
            st.kind === "chip" ? (
              <li key={st.text} className="im-chiprow">
                <span className="im-chip">{st.text}</span>
              </li>
            ) : (
              <li key={st.text} className={st.kind === "dot" ? "im-find" : undefined}>
                <span aria-hidden><Icon kind={st.kind} /></span>
                <span>{st.text}</span>
              </li>
            ),
          )}
        </ul>
        <div className="im-asm"><i aria-hidden />Assembling…</div>
      </div>

      {/* Dashboard */}
      <div className="im-dash">
        <div className="im-crumb">
          <span>Investigations</span>
          <span aria-hidden>›</span>
          <b>{inv.panelTitle}</b>
        </div>
        <h3>{inv.question}</h3>
        <p className="im-sub">{inv.subtitle}</p>

        <div className="im-card im-trend">
          <h4>{inv.trend.title}</h4>
          <div className="im-legend">
            <span><i style={{ background: TEAL }} />{inv.trend.a}</span>
            <span><i style={{ background: CORAL }} />{inv.trend.b}</span>
          </div>
          <svg viewBox="0 0 600 110" preserveAspectRatio="none" aria-hidden>
            {[0, 1, 2, 3].map((g) => (
              <line key={g} x1="0" x2="600" y1={10 + g * 32} y2={10 + g * 32} stroke="#EEEBE5" strokeWidth="1" vectorEffect="non-scaling-stroke" />
            ))}
            <path d={path(seriesA, 600, 110)} fill="none" stroke={TEAL} strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
            <path d={path(seriesB, 600, 110)} fill="none" stroke={CORAL} strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
          </svg>
        </div>

        <div className="im-row">
          <div className="im-card">
            <h4>{inv.funnel.title}</h4>
            <div className="im-funnel">
              {inv.funnel.steps.map(([label, v]) => (
                <div key={label} className="im-fcol">
                  <span className="im-fval">{v.toLocaleString("en-US")}</span>
                  <div className="im-fbar" style={{ height: Math.round((v / fMax) * 96) }} />
                  <span className="im-flab">{label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="im-card">
            <h4>{inv.reasons.title}</h4>
            <div className="im-reasons">
              {inv.reasons.rows.map(([label, v]) => (
                <div key={label} className="im-r">
                  <span>{label}</span>
                  <span>{v}%</span>
                  <div className="im-r-track"><div className="im-r-fill" style={{ width: `${v}%` }} /></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <span className="im-note">Illustrative example</span>
    </div>
  );
}
