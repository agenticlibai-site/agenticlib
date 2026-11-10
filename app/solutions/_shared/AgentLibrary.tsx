"use client";

import { useState } from "react";
import { TAGS, type UseCase } from "./useCases";

/* Hero UI screen for one business domain, as a clean app view.
   Left: the domain's use cases (searchable).
   Right: the selected use case's 7 features, each with a coloured tag.
   No "agent"/"parameter" wording in the UI. */

const DOT = ["#1F6F5C", "#E8604A", "#E0A526", "#C2412B", "#5E6B2E", "#FF8A73", "#8A5A2B", "#14503F"];

const initials = (name: string) =>
  name
    .split(/[\s&-]+/)
    .filter((w) => /^[A-Za-z]/.test(w) && !["and", "of", "the"].includes(w))
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");

const styles = `
  /* coral sky photo frame (public/corally palette background.png): square edges, same on every domain */
  .al-frame { margin: 44px 0 0; padding: 40px; border-radius: 0; position: relative; overflow: hidden;
    background: #F7C4A4 url("/corally%20palette%20background.png") center / cover no-repeat; }
  .al { background: #fff; border: 1px solid rgba(0,0,0,0.06); border-radius: 12px; box-shadow: 0 24px 60px -30px rgba(90,50,30,0.3); display: grid; grid-template-columns: 46px 220px minmax(0, 1fr); overflow: hidden; font-family: var(--font-schibsted), system-ui, sans-serif; color: #16181D; font-size: 13px; text-align: left; }
  .al-rail { border-right: 1px solid #EFEDE8; padding: 14px 0; display: flex; flex-direction: column; align-items: center; gap: 6px; color: #8A867E; }
  .al-rail span { width: 28px; height: 28px; border-radius: 8px; display: grid; place-items: center; }
  .al-rail span.on { background: #FFE9E3; color: #C2412B; }
  .al-list { border-right: 1px solid #EFEDE8; background: #FCFBF9; padding: 14px 10px 10px; min-width: 0; display: flex; flex-direction: column; }
  .al-list h2 { margin: 0 6px; font-size: 16px; font-weight: 600; letter-spacing: -0.01em; }
  .al-search { margin: 10px 0 0; display: flex; align-items: center; gap: 7px; border: 1px solid #E8E6E0; border-radius: 8px; padding: 5px 9px; background: #fff; color: #8A867E; }
  .al-search input { border: 0; outline: 0; background: none; font: inherit; font-size: 12px; color: #16181D; width: 100%; min-width: 0; }
  .al-search:focus-within { border-color: #1F6F5C; }
  .al-sub { margin: 10px 6px 4px; font-size: 11px; color: #8A867E; }
  .al-items { list-style: none; margin: 0; padding: 0; display: grid; gap: 2px; }
  .al-item { width: 100%; text-align: left; font: inherit; color: inherit; cursor: pointer; border: 0; background: none; border-radius: 7px; padding: 6px 8px; display: flex; gap: 9px; align-items: center; }
  .al-item:hover { background: #F3F1EC; }
  .al-item[aria-pressed="true"] { background: #fff; box-shadow: 0 0 0 1px #E8E6E0, 0 1px 2px rgba(0,0,0,0.04); }
  .al-item:focus-visible { outline: 2px solid #1F6F5C; outline-offset: 1px; }
  .al-item i { width: 8px; height: 8px; border-radius: 50%; flex: none; }
  .al-item b { flex: 1; min-width: 0; font-size: 12.5px; font-weight: 500; color: #3A3833; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .al-item em { font-style: normal; font-size: 11.5px; color: #A19D95; }
  .al-item[aria-pressed="true"] b { color: #16181D; font-weight: 600; }
  .al-av { flex: none; width: 32px; height: 32px; border-radius: 50%; display: grid; place-items: center; font-size: 11.5px; font-weight: 700; background: #E4F3EE; color: #14503F; }
  .al-main { min-width: 0; display: flex; flex-direction: column; }
  .al-head { display: flex; align-items: center; gap: 10px; padding: 12px 16px; border-bottom: 1px solid #EFEDE8; }
  .al-head-t { min-width: 0; flex: 1; }
  .al-head-t b { display: block; font-size: 14.5px; font-weight: 600; }
  .al-head-t span { display: block; font-size: 12px; color: #6B675F; margin-top: 1px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .al-nav { display: flex; align-items: center; gap: 4px; flex: none; }
  .al-count { font-size: 11.5px; color: #6B675F; background: #F3F1EC; border-radius: 6px; padding: 3px 8px; margin-right: 4px; white-space: nowrap; }
  .al-nav button { width: 26px; height: 26px; border-radius: 7px; border: 1px solid #E8E6E0; background: #fff; color: #3A3833; cursor: pointer; display: grid; place-items: center; }
  .al-nav button:hover { background: #F3F1EC; }
  .al-nav button:focus-visible { outline: 2px solid #1F6F5C; outline-offset: 1px; }
  .al-body { padding: 14px 16px 16px; }
  .al-sec-h { display: flex; align-items: baseline; gap: 8px; margin: 0 0 8px; font-family: var(--font-geist-mono), ui-monospace, monospace; font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; color: #8A867E; font-weight: 500; }
  .al-sec-h span { text-transform: none; letter-spacing: 0; font-family: var(--font-schibsted), system-ui, sans-serif; font-size: 12px; color: #A19D95; }
  .al-feats { list-style: none; margin: 0; padding: 0; border: 1px solid #EFEDE8; border-radius: 12px; overflow: hidden; }
  .al-feat { display: flex; align-items: center; gap: 12px; padding: 9px 14px; border-top: 1px solid #F3F1EC; font-size: 13.5px; font-weight: 500; color: #16181D; }
  .al-feat:first-child { border-top: 0; }
  .al-feat small { font-family: var(--font-geist-mono), ui-monospace, monospace; font-size: 11.5px; color: #E8604A; width: 18px; flex: none; }
  .al-feat > span { flex: 1; min-width: 0; }
  .al-pill { flex: none; font-size: 11px; font-weight: 600; border-radius: 999px; padding: 2px 9px; white-space: nowrap; }
  .al-empty { padding: 16px 8px; font-size: 13px; color: #6B675F; }
  @media (max-width: 1200px) {
    .al { grid-template-columns: 210px minmax(0, 1fr); }
    .al-rail { display: none; }
    .al-frame { padding: 28px; }
  }
  @media (max-width: 760px) {
    .al { grid-template-columns: minmax(0, 1fr); }
    .al-list { border-right: 0; border-bottom: 1px solid #EFEDE8; padding: 14px 12px 12px; }
    .al-sub { display: none; }
    .al-items { display: flex; gap: 6px; overflow-x: auto; margin: 12px -12px 0; padding: 0 12px 2px; scrollbar-width: none; }
    .al-items::-webkit-scrollbar { display: none; }
    .al-items li { flex: none; }
    .al-item { background: #fff; box-shadow: 0 0 0 1px #E8E6E0; padding: 6px 10px; }
    .al-item em { display: none; }
    .al-item[aria-pressed="true"] { box-shadow: 0 0 0 1.5px #1F6F5C; }
    .al-head { padding: 14px 14px; }
    .al-body { padding: 14px 14px 16px; }
    .al-count { display: none; }
    .al-sec-h span { display: none; }
    .al-feat { padding: 11px 12px; gap: 10px; font-size: 14px; }
    .al-feat small { width: 16px; }
    .al-pill { font-size: 11px; padding: 3px 8px; }
  }
  @media (max-width: 640px) {
    .al-frame { margin-top: 36px; padding: 14px; }
    .al { border-radius: 14px; }
  }
`;

const Ic = ({ d }: { d: string }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d={d} />
  </svg>
);
const RAIL = ["M2.5 2.5h4.5v4.5h-4.5zM9 2.5h4.5v4.5H9zM2.5 9h4.5v4.5h-4.5zM9 9h4.5v4.5H9z", "M7 11.5a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9zM10.5 10.5 14 14", "M2.5 13.5h11M4.5 11V7M8 11V4M11.5 11V8.5", "M3 4h10M3 8h10M3 12h6", "M8 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM8 1.5v2M8 12.5v2M1.5 8h2M12.5 8h2"];

export default function AgentLibrary({ cases, label }: { cases: UseCase[]; label: string }) {
  const [sel, setSel] = useState(0);
  const [q, setQ] = useState("");
  const n = cases.length;
  const c = cases[sel];
  const term = q.trim().toLowerCase();
  const match = (x: UseCase) => !term || [x.name, ...x.features.map(([f, t]) => `${f} ${TAGS[t].label}`)].some((t) => t.toLowerCase().includes(term));
  const pick = (i: number) => setSel(((i % n) + n) % n);
  const visible = cases.map((x, i) => ({ x, i })).filter(({ x }) => match(x));

  return (
    <div className="al-frame">
      <style>{styles}</style>
      <div className="al">
        <nav className="al-rail" aria-hidden>
          {RAIL.map((d, i) => (
            <span key={i} className={i === 0 ? "on" : undefined}>
              <Ic d={d} />
            </span>
          ))}
        </nav>

        <aside className="al-list">
          <h2>{label}</h2>
          <label className="al-search">
            <Ic d={RAIL[1]} />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search use cases" aria-label="Search use cases or features" />
          </label>
          <p className="al-sub">{n} use cases</p>
          <ul className="al-items">
            {visible.map(({ x, i }) => (
              <li key={x.name}>
                <button type="button" className="al-item" aria-pressed={i === sel} onClick={() => pick(i)}>
                  <i style={{ background: DOT[i % DOT.length] }} aria-hidden />
                  <b>{x.name}</b>
                  <em>{x.features.length}</em>
                </button>
              </li>
            ))}
          </ul>
          {!visible.length && <p className="al-empty">No matches for “{q}”.</p>}
        </aside>

        <div className="al-main">
          <div className="al-head">
            <span className="al-av" aria-hidden>
              {initials(c.name)}
            </span>
            <div className="al-head-t">
              <b>{c.name}</b>
              <span>{c.desc}</span>
            </div>
            <div className="al-nav">
              <span className="al-count">
                {sel + 1} of {n}
              </span>
              <button type="button" aria-label="Previous use case" onClick={() => pick(sel - 1)}>
                <Ic d="M10 3.5 5.5 8l4.5 4.5" />
              </button>
              <button type="button" aria-label="Next use case" onClick={() => pick(sel + 1)}>
                <Ic d="M6 3.5 10.5 8 6 12.5" />
              </button>
            </div>
          </div>

          <div className="al-body" aria-live="polite">
            <h3 className="al-sec-h">
              Features <span>for {c.name.toLowerCase()}</span>
            </h3>
            <ol className="al-feats">
              {c.features.map(([f, t], k) => (
                <li key={f} className="al-feat">
                  <small>{String(k + 1).padStart(2, "0")}</small>
                  <span>{f}</span>
                  <em className="al-pill" style={{ color: TAGS[t].fg, background: TAGS[t].bg, fontStyle: "normal" }}>
                    {TAGS[t].label}
                  </em>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
