import type { ReactNode } from "react";
import type { Tiles } from "./solutions";
import type { DomainCopy } from "./domainCopy";

/* Small illustrative tiles above each solution pillar: plain beige panel
   (never a gradient frame/border), serif titles, white rows, pastel pills.
   Qualitative only: no figures, no company names. */

export const tileStyles = `
  .st { position: relative; box-sizing: border-box; border-radius: 16px; border: 1px solid var(--t-border, #ECE9E3); background: radial-gradient(90% 70% at 100% 0%, rgba(255,255,255,0.85), transparent 65%), linear-gradient(160deg, var(--t-a, #F7F6F3) 0%, var(--t-b, #F7F6F3) 100%); overflow: hidden; margin-bottom: 28px; }
  .st-app { padding: 18px; font-family: var(--font-schibsted), system-ui, sans-serif; color: #16181D; overflow: hidden; }
  .st-h { font-family: var(--font-instrument-serif), Georgia, serif; font-size: 23px; line-height: 1.1; letter-spacing: -0.01em; white-space: nowrap; color: var(--t-accent, #16181D); }
  .st-sub { margin-top: 3px; font-size: 11.5px; color: #5A5F6B; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .st-list { margin-top: 11px; display: grid; gap: 6px; }
  .st-row { background: #fff; border: 1px solid rgba(0,0,0,0.06); box-shadow: 0 1px 2px rgba(60,30,10,0.05); border-radius: 10px; padding: 7px 10px; display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 600; min-width: 0; }
  .st-row.hot { background: #FFF6F2; border-color: #F6C3B5; }
  .st-row.sel { background: #fff; border: 1.5px solid var(--t-border, #B0DCCB); display: block; }
  .st-pill { flex: none; padding: 2px 8px; border-radius: 999px; font-size: 10.5px; font-weight: 700; white-space: nowrap; }
  .st-pill.g { background: #D5ECE1; color: #14503F; }
  .st-pill.y { background: #FFF1D6; color: #7A4A00; }
  .st-pill.r { background: #FDECEC; color: #C0392B; }
  .st-pill.n { background: #ECEAE5; color: #3A3833; }
  .st-quote { background: #fff; border: 1px solid #E8E6E0; border-radius: 10px; padding: 8px 10px; font-size: 12px; line-height: 1.5; font-weight: 400; }
  .st-quote mark { background: #FFE7A3; color: inherit; border-radius: 3px; padding: 0 2px; }
  .st-who { font-size: 10.5px; font-weight: 700; color: #5A5F6B; margin-bottom: 2px; }
  .st-ell { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .st-r { margin-left: auto; }
  .st-steps { margin-top: 11px; display: grid; gap: 4px; position: relative; }
  .st-steps::before { content: ""; position: absolute; left: 20px; top: 14px; bottom: 14px; width: 1.5px; background: rgba(0,0,0,0.08); }
  .st-steps .st-row { position: relative; padding: 5px 10px; }
  .st-num { flex: none; width: 18px; height: 18px; border-radius: 50%; display: grid; place-items: center; font-family: var(--font-geist-mono), ui-monospace, monospace; font-size: 10px; background: var(--t-a, #ECEAE5); color: var(--t-accent, #3A3833); }
  .st-row.hot .st-num { background: #E8604A; color: #fff; }
  .st-cap { font-family: var(--font-geist-mono), ui-monospace, monospace; font-size: 10px; letter-spacing: 0.06em; text-transform: uppercase; color: #8A8F9B; }
  .st-chips { margin-top: 11px; display: flex; flex-wrap: wrap; gap: 5px; }
  .st-chip { padding: 4px 9px; border-radius: 999px; font-size: 11px; font-weight: 600; background: #fff; border: 1px solid #E8E6E0; color: #8A8F9B; white-space: nowrap; }
  .st-chip.on { color: var(--t-accent, #1F6F5C); background: var(--t-b, #D5ECE1); border-color: var(--t-border, #B0DCCB); }
  .st-why { display: block; margin-top: 1px; font-size: 10.5px; font-weight: 500; color: #5A5F6B; }
  @media (max-width: 1000px) { .st { max-width: 520px; } }
`;

export function Frame({ title, sub, children }: { title: string; sub: string; children: ReactNode }) {
  return (
    <div className="st" aria-hidden>
      <div className="st-app">
        <div className="st-h">{title}</div>
        <div className="st-sub">{sub}</div>
        {children}
      </div>
    </div>
  );
}

/* 1 — the agent's workflow, step with most friction flagged */
export function WorkflowTile({ t, c }: { t: Tiles; c: DomainCopy }) {
  return (
    <Frame title={t.workflow.name} sub={c.screens.workflowSub}>
      <div className="st-steps">
        {t.workflow.steps.map((x, i) => (
          <div key={x} className={`st-row${i === t.workflow.stuck ? " hot" : ""}`}>
            <span className="st-num">{i + 1}</span>
            <span className="st-ell">{x}</span>
            {i === t.workflow.stuck && <span className="st-pill r st-r">Most friction</span>}
          </div>
        ))}
      </div>
    </Frame>
  );
}

/* 2 — capabilities to build next */
export function RoadmapTile({ t, c }: { t: Tiles; c: DomainCopy }) {
  const cls = { Now: "g", Next: "y", Later: "n" } as const;
  return (
    <Frame title="Capability roadmap" sub={c.screens.roadmapSub}>
      <div className="st-list">
        {t.roadmap.map((x) => (
          <div key={x.name} className="st-row">
            <span className="st-ell" style={{ display: "block" }}>
              {x.name}
              <span className="st-why">{x.kind}</span>
            </span>
            <span className={`st-pill ${cls[x.status]} st-r`}>{x.status}</span>
          </div>
        ))}
      </div>
    </Frame>
  );
}

/* 3 — a message with the friction marked, issues ranked */
export function BehaviourTile({ t, c }: { t: Tiles; c: DomainCopy }) {
  return (
    <Frame title="Conversation review" sub={c.screens.reviewSub}>
      <div className="st-list">
        <div className="st-quote">
          <div className="st-who">{t.message.who}</div>
          {t.message.parts.map((p, i) => (typeof p === "string" ? <span key={i}>{p}</span> : <mark key={i}>{p.hl}</mark>))}
        </div>
        {t.issues.map((x) => (
          <div key={x.label} className="st-row">
            <span className={`st-pill ${x.risk === "High" ? "r" : "y"}`}>{x.risk}</span>
            <span className="st-ell">{x.label}</span>
          </div>
        ))}
      </div>
    </Frame>
  );
}

/* 4 — new version vs previous on one scenario */
export function EvaluationTile({ t }: { t: Tiles }) {
  const cls = { Better: "g", Same: "n", Worse: "r" } as const;
  return (
    <Frame title="Version comparison" sub={`Scenario: ${t.evaluation.scenario}`}>
      <div className="st-list">
        <div style={{ display: "flex", padding: "0 10px" }}>
          <span className="st-cap">Criteria</span>
          <span className="st-cap st-r">New vs previous</span>
        </div>
        {t.evaluation.rows.map((x) => (
          <div key={x.name} className="st-row">
            <span className="st-ell">{x.name}</span>
            <span className={`st-pill ${cls[x.result]} st-r`}>{x.result}</span>
          </div>
        ))}
      </div>
    </Frame>
  );
}

/* 5 — signals from everywhere linked to one need */
export function ContextTile({ t, c }: { t: Tiles; c: DomainCopy }) {
  return (
    <Frame title={`${c.user} context`} sub={`Signals linked to one ${c.user.toLowerCase()} need`}>
      <div className="st-chips">
        {c.sources.map((x) => (
          <span key={x} className={`st-chip${c.linked.includes(x) ? " on" : ""}`}>{x}</span>
        ))}
      </div>
      <div className="st-list">
        <div className="st-row sel">
          <span className="st-cap">{c.user} need</span>
          <div style={{ marginTop: 3, lineHeight: 1.4 }}>{t.context.need}</div>
          <div style={{ marginTop: 7 }}>
            <span className="st-pill g">Linked to roadmap</span>
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* 6 — why the agent works the way it does */
export function KnowledgeTile({ t, c }: { t: Tiles; c: DomainCopy }) {
  return (
    <Frame title="Decision log" sub={c.screens.decisionSub}>
      <div className="st-list">
        {t.decisions.map((x) => (
          <div key={x.text} className="st-row">
            <span className="st-ell" style={{ display: "block" }}>
              {x.text}
              <span className="st-why st-ell">Why: {x.why}</span>
            </span>
          </div>
        ))}
      </div>
    </Frame>
  );
}
