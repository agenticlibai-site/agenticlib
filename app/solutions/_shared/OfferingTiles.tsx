import { Frame } from "./SolutionTiles";
import type { OfferingScreens } from "./offeringScreens";

/* One example screen per offering, filled with each domain's data.
   Reuses the .st-* tile styles; extra rules live in offeringTileStyles. */

export const offeringTileStyles = `
  .ot-src { display: flex; gap: 4px; margin-top: 4px; flex-wrap: wrap; }
  .ot-src span { font-size: 10px; font-weight: 600; color: #6B675F; background: #F3F1EC; border-radius: 5px; padding: 1px 6px; }
  .ot-col { display: block; min-width: 0; flex: 1; }
  .ot-t { display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; min-width: 0; overflow: hidden; line-height: 1.35; }
  .ot-kind { display: block; margin-bottom: 1px; }
  .ot-ask { display: block; font-weight: 500; color: #3A3833; font-style: italic; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .ot-needs { display: block; margin-top: 2px; font-size: 11px; font-weight: 600; color: #16181D; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .ot-needs b { font-weight: 500; color: #8A8F9B; }
  .ot-agent { background: #F4FAF7; border-color: #CFE7DC; }
  .ot-fix { background: #F4FAF7; border-color: #B0DCCB; }
  .ot-search { margin-top: 11px; display: flex; align-items: center; gap: 7px; border: 1px solid #E8E6E0; border-radius: 8px; padding: 6px 10px; background: #fff; font-size: 11.5px; color: #8A867E; }
  .ot-type { flex: none; width: 66px; text-align: center; padding: 2px 0; border-radius: 6px; font-size: 10px; font-weight: 700; }
  .ot-type.Decision { background: #FFE4DC; color: #C2412B; }
  .ot-type.Workflow { background: #D5ECE1; color: #14503F; }
  .ot-type.Insight { background: #FFF1D6; color: #7A4A00; }
  .ot-type.Learning { background: #ECEAE5; color: #3A3833; }
  .ot-watch { margin-top: 8px; display: flex; align-items: center; gap: 6px; font-size: 11px; color: #5A5F6B; padding: 0 4px; }
  .ot-watch i { width: 7px; height: 7px; border-radius: 50%; background: #1F6F5C; flex: none; }
`;

type P = { d: OfferingScreens };

/* 1 — Customer Intelligence: unmet needs, with where each signal came from */
export function NeedsTile({ d, user }: P & { user: string }) {
  const cls = { Rising: "r", Steady: "n", New: "y" } as const;
  return (
    <Frame title={`${user} needs`} sub="Unmet needs found across every signal">
      <div className="st-list">
        {d.needs.map((x) => (
          <div key={x.text} className="st-row">
            <span className="ot-col">
              <span className="ot-t">{x.text}</span>
              <span className="ot-src">
                {x.sources.map((s) => (
                  <span key={s}>{s}</span>
                ))}
              </span>
            </span>
            <span className={`st-pill ${cls[x.trend]}`}>{x.trend}</span>
          </div>
        ))}
      </div>
    </Frame>
  );
}

/* 2 — Agent Workflow Intelligence: the workflow map, with where it gets stuck */
export function FlowTile({ d, name }: P & { name: string }) {
  const pill = { ok: ["g", "Smooth"], slow: ["y", "Friction"], stuck: ["r", "Stuck"] } as const;
  return (
    <Frame title={name} sub="Where users and the agent get stuck">
      <div className="st-steps">
        {d.flow.map((x, i) => (
          <div key={x.name} className={`st-row${x.state === "stuck" ? " hot" : ""}`}>
            <span className="st-num">{i + 1}</span>
            <span className="ot-col">
              <span className="ot-t">{x.name}</span>
              {x.note && <span className="st-why st-ell">{x.note}</span>}
            </span>
            <span className={`st-pill ${pill[x.state][0]}`}>{pill[x.state][1]}</span>
          </div>
        ))}
      </div>
    </Frame>
  );
}

/* 3 — Agent Capability Intelligence: what to build next, by value */
export function CapabilityTile({ d }: P) {
  return (
    <Frame title="Capability opportunities" sub="Abilities, tools and integrations ranked by value">
      <div className="st-list">
        {d.capabilities.map((x) => (
          <div key={x.name} className="st-row">
            <span className="ot-col">
              <span className="st-cap ot-kind">{x.kind}</span>
              <span className="ot-t">{x.name}</span>
              <span className="st-why st-ell">Unlocks: {x.unlocks}</span>
            </span>
            <span className={`st-pill ${x.value === "High" ? "g" : "y"}`}>{x.value} value</span>
          </div>
        ))}
      </div>
    </Frame>
  );
}

/* 5 — Agent Behaviour Intelligence: a failure in a real exchange, linked to an improvement */
export function ReviewTile({ d, user }: P & { user: string }) {
  return (
    <Frame title="Behaviour review" sub="Failures linked to product improvements">
      <div className="st-list">
        <div className="st-quote">
          <div className="st-who">{user}</div>
          {d.review.user}
        </div>
        <div className="st-quote ot-agent">
          <div className="st-who">Agent</div>
          {d.review.agent.map((p, i) => (typeof p === "string" ? <span key={i}>{p}</span> : <mark key={i}>{p.hl}</mark>))}
        </div>
        <div className="st-row hot">
          <span className="st-pill r">Failure</span>
          <span className="ot-t">{d.review.flag}</span>
        </div>
        <div className="st-row ot-fix">
          <span className="st-pill g">Opportunity</span>
          <span className="ot-t">{d.review.fix}</span>
        </div>
      </div>
    </Frame>
  );
}

/* 6 — Agent Product Knowledge Base: decisions, workflows, insights and learnings in one place */
export function KnowledgeBaseTile({ d }: P) {
  return (
    <Frame title="Product knowledge base" sub="Decisions, workflows, insights and learnings">
      <div className="ot-search" aria-hidden>
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
          <path d="M7 11.5a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9zM10.5 10.5 14 14" />
        </svg>
        Search product knowledge
      </div>
      <div className="st-list">
        {d.kb.map((x) => (
          <div key={x.text} className="st-row">
            <span className={`ot-type ${x.type}`}>{x.type}</span>
            <span className="ot-t">{x.text}</span>
          </div>
        ))}
      </div>
    </Frame>
  );
}

/* 6 — Evaluation & Continuous Improvement: a change from a real signal, tested, shipped, then watched */
export function EvalTile({ d }: P) {
  const cls = { Better: "g", Same: "n", Worse: "r" } as const;
  return (
    <Frame title="Evaluate and improve" sub={`Scenario: ${d.evaluation.scenario}`}>
      <div className="st-row ot-fix" style={{ marginTop: 11 }}>
        <span className="ot-col">
          <span className="st-cap ot-kind">Change tested</span>
          <span className="ot-t">{d.loop.change}</span>
          <span className="st-why">From signal: {d.loop.signal}</span>
        </span>
      </div>
      <div className="st-list">
        <div style={{ display: "flex", padding: "0 10px" }}>
          <span className="st-cap">Check · measured against</span>
          <span className="st-cap st-r">New vs previous</span>
        </div>
        {d.evaluation.rows.map((x) => (
          <div key={x.name} className="st-row">
            <span className="ot-col">
              <span className="ot-t">{x.name}</span>
              <span className="st-why">{x.against}</span>
            </span>
            <span className={`st-pill ${cls[x.result]}`}>{x.result}</span>
          </div>
        ))}
      </div>
      <div className="ot-watch">
        <i aria-hidden />
        Shipped. Now watching: {d.loop.watching}
      </div>
    </Frame>
  );
}
