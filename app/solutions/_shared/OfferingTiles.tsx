import type { ReactNode } from "react";
import { Frame } from "./SolutionTiles";
import type { OfferingScreens } from "./offeringScreens";

/* One example screen per offering, each built around a single visual that shows what the
   offering's copy promises. Reuses the .st-* tile styles; extra rules live in
   offeringTileStyles. Qualitative only: no figures. */

export const offeringTileStyles = `
  .st-app > .st-h, .st-app > .st-sub { flex: none; }
  .ot-t { display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; min-width: 0; overflow: hidden; line-height: 1.35; }
  .ot-t1 { -webkit-line-clamp: 1; }
  .ot-ic { flex: none; width: 22px; height: 22px; border-radius: 7px; display: grid; place-items: center; }
  .ot-ic svg { width: 13px; height: 13px; }
  .ot-lab { font-family: var(--font-geist-mono), ui-monospace, monospace; font-size: 9.5px; letter-spacing: 0.07em; text-transform: uppercase; font-weight: 600; }
  .ot-legend { display: flex; gap: 12px; margin-top: 12px; font-size: 10.5px; color: #6B6760; font-weight: 500; }
  .ot-legend span { display: inline-flex; align-items: center; gap: 5px; }
  .ot-legend i { width: 8px; height: 8px; border-radius: 50%; }

  /* 1 — needs as a frequency chart */
  .ot-need { position: relative; display: flex; align-items: center; gap: 10px; padding: 8px 10px; border-radius: 10px; background: #FBFAF8; font-size: 12px; font-weight: 600; overflow: hidden; min-height: 36px; box-sizing: border-box; }
  .ot-need > i { position: absolute; left: 0; top: 0; bottom: 0; background: #FDE7DF; border-radius: 10px 0 0 10px; }
  .ot-need.top > i { background: #FBCDBF; }
  .ot-need > span { position: relative; }
  .ot-need .ot-t { flex: 1; }
  .ot-trend { flex: none; display: inline-flex; align-items: center; gap: 3px; font-size: 10.5px; font-weight: 700; padding: 2px 7px; border-radius: 99px; background: rgba(255,255,255,0.85); }
  .ot-trend.Rising { color: #C2412B; }
  .ot-trend.Steady { color: #6B6760; }
  .ot-trend.New { color: #8A5A00; }
  .ot-opp { display: flex; gap: 10px; align-items: center; border-radius: 12px; padding: 10px 12px; background: #1F6F5C; color: #fff; }
  .ot-opp .ot-ic { background: rgba(255,255,255,0.16); color: #fff; }
  .ot-opp .ot-lab { color: #BFE3D5; display: block; }
  .ot-opp b { display: block; margin-top: 2px; font-size: 13px; font-weight: 600; line-height: 1.3; }

  /* 2 — workflow as a journey map */
  .ot-map { position: relative; margin-top: 18px; display: grid; gap: 2px; }
  .ot-map::before { content: ""; position: absolute; left: 12%; right: 12%; top: 16px; height: 2px; background: linear-gradient(90deg, #9FCDBB, #E0A526 45%, #E8604A 60%, #9FCDBB); opacity: .55; border-radius: 2px; }
  .ot-node { position: relative; display: flex; flex-direction: column; align-items: center; text-align: center; gap: 8px; font-size: 11.5px; font-weight: 600; line-height: 1.25; color: #3A3833; padding: 0 2px; }
  .ot-node b { width: 34px; height: 34px; border-radius: 50%; display: grid; place-items: center; font-family: var(--font-geist-mono), ui-monospace, monospace; font-size: 12px; background: #EAF5F0; color: #1F6F5C; border: 2px solid #fff; box-shadow: 0 0 0 1.5px #9FCDBB; }
  .ot-node.slow b { background: #FFF1D6; color: #7A4A00; box-shadow: 0 0 0 1.5px #E0A526; }
  .ot-node.stuck b { background: #E8604A; color: #fff; box-shadow: 0 0 0 4px #FFD9CE; }
  .ot-node.stuck { color: #C2412B; }
  .ot-zoom { position: relative; border-radius: 14px; border: 1px solid #F6C3B5; background: #FFF6F2; padding: 13px 14px; display: grid; gap: 11px; }
  .ot-zoom::before { content: ""; position: absolute; top: -7px; left: var(--x, 50%); width: 12px; height: 12px; background: #FFF6F2; border-left: 1px solid #F6C3B5; border-top: 1px solid #F6C3B5; transform: translateX(-50%) rotate(45deg); }
  .ot-zoom-r { display: flex; gap: 10px; align-items: flex-start; font-size: 13px; font-weight: 600; line-height: 1.35; }
  .ot-zoom-r .ot-lab { display: block; margin-bottom: 2px; }
  .ot-zoom-r.bad .ot-ic { background: #FDDCD3; color: #C2412B; }
  .ot-zoom-r.bad .ot-lab { color: #C2412B; }
  .ot-zoom-r.good { padding-top: 9px; border-top: 1px dashed #F2C9BC; }
  .ot-zoom-r.good .ot-ic { background: #D5ECE1; color: #1F6F5C; }
  .ot-zoom-r.good .ot-lab { color: #1F6F5C; }
  .ot-slow { display: grid; gap: 6px; padding: 10px 12px; border-radius: 12px; background: #FFFAF0; }
  .ot-slow .ot-lab { color: #8A5A00; }
  .ot-slow div { display: flex; align-items: center; gap: 8px; font-size: 11.5px; color: #4A4740; font-weight: 500; }
  .ot-slow i { flex: none; width: 7px; height: 7px; border-radius: 50%; background: #E0A526; }
  .ot-slow b { font-weight: 700; color: #22201C; }

  .ot-q .ot-kchip.m { display: none; }

  /* 3 — build next: one clear first pick, then the queue */
  .ot-first { border-radius: 14px; padding: 12px; background: linear-gradient(160deg, #F4FAF7, #E3F2EB); border: 1.5px solid #9FCDBB; }
  .ot-first-h { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
  .ot-badge { display: inline-flex; align-items: center; gap: 5px; padding: 3px 9px; border-radius: 99px; background: #1F6F5C; color: #fff; font-size: 10.5px; font-weight: 700; }
  .ot-first h4 { margin: 8px 0 0; font-size: 15px; font-weight: 700; line-height: 1.25; color: #16181D; }
  .ot-first p { margin: 3px 0 0; font-size: 12px; color: #3A3833; line-height: 1.35; }
  .ot-first .ot-whyf { margin-top: 9px; padding-top: 8px; border-top: 1px dashed #B0DCCB; font-size: 11.5px; color: #14503F; font-weight: 600; line-height: 1.35; }
  .ot-kchip { display: inline-flex; align-items: center; gap: 5px; font-size: 10.5px; font-weight: 700; padding: 2px 8px; border-radius: 99px; }
  .ot-kchip.Integration { background: #E1F0EA; color: #14503F; }
  .ot-kchip.Ability { background: #FDE7DF; color: #A93A26; }
  .ot-kchip.Behaviour { background: #FFF1D6; color: #7A4A00; }
  .ot-kchip.Tool { background: #F1E7DD; color: #6B4423; }
  .ot-q { display: flex; align-items: center; gap: 10px; padding: 8px 10px; border-radius: 10px; background: #FBFAF8; font-size: 12px; font-weight: 600; }
  .ot-q > b { flex: none; width: 20px; font-family: var(--font-geist-mono), ui-monospace, monospace; font-size: 11px; color: #A8A298; }
  .ot-q .ot-mid { flex: 1; min-width: 0; }
  .ot-q .st-why { font-weight: 500; }
  .ot-val { flex: none; display: flex; gap: 3px; }
  .ot-val i { width: 5px; height: 14px; border-radius: 2px; background: #E6E2DB; }
  .ot-val i.on { background: #1F6F5C; }
  .ot-val.m i.on { background: #E0A526; }

  /* 4 — behaviour: the conversation, the failure marked, the fix */
  .ot-chat { display: grid; gap: 8px; }
  .ot-bub { max-width: 84%; padding: 8px 11px; font-size: 12px; line-height: 1.45; border-radius: 14px; }
  .ot-bub .st-who { font-size: 10px; margin-bottom: 1px; }
  .ot-bub.u { justify-self: start; background: #F3F1EC; border-bottom-left-radius: 4px; }
  .ot-bub.a { justify-self: end; background: #EAF5F0; border-bottom-right-radius: 4px; position: relative; }
  .ot-bub.a mark { background: none; color: #A93A26; text-decoration: underline wavy #E8604A; text-underline-offset: 3px; text-decoration-thickness: 1.2px; }
  .ot-flag { justify-self: end; display: inline-flex; align-items: center; gap: 6px; margin-top: -2px; padding: 4px 9px 4px 5px; border-radius: 99px; background: #FDECEC; color: #C0392B; font-size: 11px; font-weight: 700; }
  .ot-flag .ot-ic, .ot-ok .ot-ic { width: 18px; height: 18px; border-radius: 50%; }
  .ot-flag .ot-ic { background: #E8604A; color: #fff; }
  .ot-flag .ot-ic svg, .ot-ok .ot-ic svg { width: 10px; height: 10px; }
  .ot-turn { display: flex; align-items: center; gap: 8px; color: #A8A298; }
  .ot-turn::before, .ot-turn::after { content: ""; flex: 1; height: 1px; background: #E6E2DB; }
  .ot-turn span { font-size: 10.5px; font-weight: 600; color: #8A857C; }
  .ot-imp { border-radius: 12px; padding: 10px 12px; background: #1F6F5C; color: #fff; }
  .ot-imp .ot-lab { color: #BFE3D5; }
  .ot-imp b { display: block; margin-top: 3px; font-size: 13px; font-weight: 600; line-height: 1.3; }
  .ot-imp span.s { display: block; margin-top: 2px; font-size: 11px; color: #CFE9DF; }
  .ot-ok { display: flex; align-items: center; gap: 7px; font-size: 11.5px; font-weight: 600; color: #14503F; }
  .ot-ok .ot-ic { background: #D5ECE1; color: #1F6F5C; }

  /* 5 — knowledge base: four kinds of knowledge, one place */
  .ot-search { margin-top: 12px; display: flex; align-items: center; gap: 7px; border: 1px solid #E8E6E0; border-radius: 9px; padding: 7px 10px; background: #fff; font-size: 11.5px; color: #8A867E; }
  .ot-grid { margin-top: 10px; display: grid; grid-template-columns: 1fr 1fr; gap: 8px; flex: 1; min-height: 0; }
  .ot-kb { border-radius: 12px; padding: 9px 10px; background: var(--kb-bg); display: flex; flex-direction: column; gap: 7px; min-width: 0; }
  .ot-kb-h { display: flex; align-items: center; gap: 7px; font-size: 11.5px; font-weight: 700; color: var(--kb); }
  .ot-kb-h .ot-ic { background: #fff; color: var(--kb); }
  .ot-kb p { margin: 0; padding: 5px 8px; border-radius: 8px; background: rgba(255,255,255,0.8); font-size: 11.5px; font-weight: 500; line-height: 1.35; color: #2A2824; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 3; overflow: hidden; }
  .ot-grow { margin-left: auto; display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px 2px 6px; border-radius: 99px; background: #D5ECE1; color: #14503F; font-size: 10.5px; font-weight: 700; white-space: nowrap; }
  .ot-grow svg { width: 10px; height: 10px; }
  .ot-foot { margin-top: 9px; display: flex; align-items: center; gap: 7px; font-size: 11px; color: #5A5F6B; font-weight: 500; }
  .ot-foot .ot-ic { width: 18px; height: 18px; border-radius: 50%; background: #D5ECE1; color: #1F6F5C; }
  .ot-foot .ot-ic svg { width: 10px; height: 10px; }

  /* 6 — evaluation scorecard */
  .ot-test { margin-top: 12px; display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 12px; background: #FFF6F2; border: 1px solid #F6C3B5; }
  .ot-test .ot-ic { background: #E8604A; color: #fff; }
  .ot-test .ot-lab { color: #C2412B; display: block; }
  .ot-test b { display: block; font-size: 12.5px; font-weight: 600; line-height: 1.3; margin-top: 1px; }
  .ot-score { display: grid; gap: 6px; }
  .ot-res { display: grid; grid-template-columns: 96px minmax(0, 1fr) auto; align-items: center; gap: 10px; padding: 8px 10px; border-radius: 10px; background: #FBFAF8; font-size: 12px; font-weight: 600; }
  .ot-res .ot-lab { color: #8A857C; line-height: 1.3; }
  .ot-mark { display: inline-flex; align-items: center; gap: 4px; padding: 3px 8px; border-radius: 99px; font-size: 10.5px; font-weight: 700; }
  .ot-mark.Better { background: #D5ECE1; color: #14503F; }
  .ot-mark.Same { background: #ECEAE5; color: #3A3833; }
  .ot-mark.Worse { background: #FDECEC; color: #C0392B; }
  .ot-mark svg { width: 10px; height: 10px; }
  .ot-rel { display: grid; grid-template-columns: 1fr 1fr 1fr; position: relative; }
  .ot-rel::before { content: ""; position: absolute; left: 16%; right: 16%; top: 6px; height: 2px; background: linear-gradient(90deg, #E6E2DB, #1F6F5C 50%, #B0DCCB); }
  .ot-rel span { position: relative; display: flex; flex-direction: column; align-items: center; gap: 5px; font-size: 10.5px; font-weight: 600; color: #8A867E; text-align: center; line-height: 1.25; padding: 0 4px; }
  .ot-rel span::before { content: ""; width: 14px; height: 14px; border-radius: 50%; background: #E6E2DB; border: 3px solid #fff; box-sizing: border-box; }
  .ot-rel span.now { color: #14503F; }
  .ot-rel span.now::before { background: #1F6F5C; box-shadow: 0 0 0 3px #D5ECE1; }
  .ot-rel span.next::before { background: #fff; border: 2px solid #1F6F5C; }
  @media (max-width: 1000px) {
    .ot-node { font-size: 9.5px; padding: 0; letter-spacing: -0.01em; } .ot-map { column-gap: 6px; }
    .pt .pt-screen .st .st-list { align-content: start; }
    .pt .pt-screen .st-app { padding: 20px 16px; }
    .ot-grid { grid-template-columns: 1fr; }
    .ot-kb p { -webkit-line-clamp: unset; }
    .ot-search .ot-long { display: none; }
    .ot-res { grid-template-columns: minmax(0, 1fr) auto; row-gap: 3px; }
    .ot-res > .ot-lab { grid-column: 1 / -1; }
    .ot-res > .ot-t { -webkit-line-clamp: 2; }
    .ot-q > .ot-kchip { display: none; }
    .ot-q .ot-kchip.m { display: inline-flex; margin-top: 4px; }
    .ot-q .ot-t { -webkit-line-clamp: 2; }
    .ot-ok .ot-t { -webkit-line-clamp: 2; }
    .st-sub { white-space: normal; }
  }
`;

type P = { d: OfferingScreens };

/* Small line icons, drawn on a 16px grid. */
const PATHS = {
  bulb: "M6 13h4M6.5 15h3M8 1.5a4.5 4.5 0 0 0-2.5 8.2V11h5V9.7A4.5 4.5 0 0 0 8 1.5z",
  x: "M4.5 4.5l7 7M11.5 4.5l-7 7",
  check: "M3.5 8.5l3 3 6-7",
  up: "M8 13V3M4 7l4-4 4 4",
  eq: "M4 6h8M4 10h8",
  down: "M8 3v10M4 9l4 4 4-4",
  spark:
    "M8 2v3M8 11v3M2 8h3M11 8h3M4 4l1.8 1.8M10.2 10.2 12 12M12 4l-1.8 1.8M5.8 10.2 4 12",
  star: "M8 2l1.8 3.8 4.2.5-3.1 2.9.8 4.1L8 11.3 4.3 13.3l.8-4.1L2 6.3l4.2-.5z",
  flask: "M6 2h4M6.5 2v4.5L3 13a1 1 0 0 0 .9 1.5h8.2A1 1 0 0 0 13 13L9.5 6.5V2",
  search: "M7 11.5a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9zM10.5 10.5 14 14",
  scale: "M8 2v12M4 14h8M3 5h10M3 5l-1.5 4h3zM13 5l-1.5 4h3z",
  flow: "M3 4h4v3H3zM9 9h4v3H9zM5 7v3.5h4",
  user: "M8 8a2.8 2.8 0 1 0 0-5.6A2.8 2.8 0 0 0 8 8zM2.5 14c.6-2.6 2.8-4 5.5-4s4.9 1.4 5.5 4",
  bolt: "M9 1.5 3.5 9H8l-1 5.5L12.5 7H8z",
  plus: "M8 3v10M3 8h10",
} as const;

function Icon({ d }: { d: keyof typeof PATHS }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d={PATHS[d]} />
    </svg>
  );
}

const Body = ({ children, gap = 6 }: { children: ReactNode; gap?: number }) => (
  <div className="st-list" style={{ gap }}>
    {children}
  </div>
);

/* 1 — Customer Intelligence: what users need, which problems keep coming up, biggest opportunity */
export function NeedsTile({ d, user }: P & { user: string }) {
  const width = [100, 78, 60, 46, 34];
  const arrow = { Rising: "up", Steady: "eq", New: "plus" } as const;
  return (
    <Frame
      title={`What ${user.toLowerCase()}s need`}
      sub="Ranked by how often it comes up"
    >
      <div className="ot-legend" aria-hidden>
        <span>
          <i style={{ background: "#FBCDBF", borderRadius: 2 }} />
          Bar shows how often it comes up
        </span>
      </div>
      <Body gap={5}>
        {d.needs.map((x, i) => (
          <div key={x.text} className={`ot-need${i === 0 ? " top" : ""}`}>
            <i style={{ width: `${width[i]}%` }} aria-hidden />
            <span className="ot-t">{x.text}</span>
            <span className={`ot-trend ${x.trend}`}>
              <span className="ot-ic" style={{ width: 10, height: 10 }}>
                <Icon d={arrow[x.trend]} />
              </span>
              {x.trend}
            </span>
          </div>
        ))}
        <div className="ot-opp">
          <span className="ot-ic">
            <Icon d="bulb" />
          </span>
          <span>
            <span className="ot-lab">Biggest opportunity</span>
            <b>{d.opportunity}</b>
          </span>
        </div>
      </Body>
    </Frame>
  );
}

/* 2 — Agent Workflow Intelligence: where users and the agent get stuck, and how to make it easier */
export function FlowTile({ d, name }: P & { name: string }) {
  const n = d.flow.length;
  const si = d.flow.findIndex((x) => x.state === "stuck");
  const stuck = d.flow[si];
  const slow = d.flow.filter((x) => x.state === "slow" && x.note);
  return (
    <Frame title={name} sub="Every step mapped, the blocker found">
      <div className="ot-legend" aria-hidden>
        <span>
          <i style={{ background: "#9FCDBB" }} />
          Smooth
        </span>
        <span>
          <i style={{ background: "#E0A526" }} />
          Slow
        </span>
        <span>
          <i style={{ background: "#E8604A" }} />
          Stuck
        </span>
      </div>
      <div
        className="ot-map"
        style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}
      >
        {d.flow.map((x, i) => (
          <div key={x.name} className={`ot-node ${x.state}`}>
            <b>{i + 1}</b>
            {x.name}
          </div>
        ))}
      </div>
      <Body gap={12}>
        {stuck && (
          <div
            className="ot-zoom"
            style={{ ["--x" as string]: `${((si + 0.5) / n) * 100}%` }}
          >
            <div className="ot-zoom-r bad">
              <span className="ot-ic">
                <Icon d="x" />
              </span>
              <span>
                <span className="ot-lab">Stuck at step {si + 1}</span>
                {stuck.note}
              </span>
            </div>
            <div className="ot-zoom-r good">
              <span className="ot-ic">
                <Icon d="check" />
              </span>
              <span>
                <span className="ot-lab">Make it easier</span>
                {d.easier}
              </span>
            </div>
          </div>
        )}
        {slow.length > 0 && (
          <div className="ot-slow">
            <span className="ot-lab">Also slowing them down</span>
            {slow.slice(0, 2).map((x) => (
              <div key={x.name}>
                <i aria-hidden />
                <span className="ot-t ot-t1">
                  <b>{x.name}:</b> {x.note}
                </span>
              </div>
            ))}
          </div>
        )}
      </Body>
    </Frame>
  );
}

/* 3 — Agent Capability Intelligence: abilities, tools and integrations ranked by value, before they're built */
const KIND_ICON = {
  Integration: "flow",
  Ability: "spark",
  Behaviour: "user",
  Tool: "bolt",
} as const;

function Kind({ k, m }: { k: keyof typeof KIND_ICON; m?: boolean }) {
  return (
    <span className={`ot-kchip ${k}${m ? " m" : ""}`}>
      <span className="ot-ic" style={{ width: 11, height: 11 }}>
        <Icon d={KIND_ICON[k]} />
      </span>
      {k}
    </span>
  );
}

export function CapabilityTile({ d }: P) {
  const [first, ...rest] = d.capabilities;
  return (
    <Frame title="Build next" sub="Ranked by value to users, before you build">
      <Body gap={6}>
        <div className="ot-first">
          <div className="ot-first-h">
            <span className="ot-badge">
              <span className="ot-ic" style={{ width: 11, height: 11 }}>
                <Icon d="star" />
              </span>
              Build first
            </span>
            <Kind k={first.kind} />
          </div>
          <h4>{first.name}</h4>
          <p>Unlocks: {first.unlocks}</p>
          <div className="ot-whyf">Why first: {d.firstWhy}</div>
        </div>
        {rest.map((x, i) => (
          <div key={x.name} className="ot-q">
            <b>0{i + 2}</b>
            <span className="ot-mid">
              <span className="ot-t ot-t1">{x.name}</span>
              <span className="st-why ot-t ot-t1">Unlocks: {x.unlocks}</span>
              <Kind k={x.kind} m />
            </span>
            <Kind k={x.kind} />
            <span
              className={`ot-val${x.value === "Medium" ? " m" : ""}`}
              title={`${x.value} value`}
            >
              {[0, 1, 2].map((j) => (
                <i
                  key={j}
                  className={
                    j < (x.value === "High" ? 3 : 2) ? "on" : undefined
                  }
                />
              ))}
            </span>
          </div>
        ))}
      </Body>
    </Frame>
  );
}

/* 4 — Agent Behaviour Intelligence: why it succeeds or fails; every failure becomes a product improvement */
export function ReviewTile({ d, user }: P & { user: string }) {
  return (
    <Frame
      title="Why it succeeds or fails"
      sub="Every failure becomes a product improvement"
    >
      <Body gap={8}>
        <div className="ot-chat">
          <div className="ot-bub u">
            <div className="st-who">{user}</div>
            {d.review.user}
          </div>
          <div className="ot-bub a">
            <div className="st-who">Agent</div>
            {d.review.agent.map((p, i) =>
              typeof p === "string" ? (
                <span key={i}>{p}</span>
              ) : (
                <mark key={i}>{p.hl}</mark>
              ),
            )}
          </div>
          <span className="ot-flag">
            <span className="ot-ic">
              <Icon d="x" />
            </span>
            Fails: {d.review.flag}
          </span>
        </div>
        <div className="ot-turn" aria-hidden>
          <span>Becomes</span>
        </div>
        <div className="ot-imp">
          <span className="ot-lab">Product improvement</span>
          <b>{d.review.fix}</b>
          <span className="s">{d.review.pattern}</span>
        </div>
        <div className="ot-ok">
          <span className="ot-ic">
            <Icon d="check" />
          </span>
          <span className="ot-t ot-t1">Succeeds: {d.works}</span>
        </div>
      </Body>
    </Frame>
  );
}

/* 5 — Agent Product Knowledge Base: decisions, workflows, insights and learnings in one place */
const KB_GROUPS = [
  ["Decision", "Decisions", "#C2412B", "#FFF1EC", "scale"],
  ["Workflow", "Workflows", "#1F6F5C", "#EAF5F0", "flow"],
  ["Insight", "Customer insights", "#8A5A00", "#FFF6E3", "user"],
  ["Learning", "Agent learnings", "#6B4423", "#F5EEE6", "spark"],
] as const;

export function KnowledgeBaseTile({ d }: P) {
  return (
    <Frame
      title="Product knowledge base"
      sub="Everything behind your AI product, in one place"
    >
      <div className="ot-search" aria-hidden>
        <span style={{ width: 12, height: 12, display: "grid" }}>
          <Icon d="search" />
        </span>
        Search<span className="ot-long"> decisions, workflows, insights</span>…
        <span className="ot-grow">
          <Icon d="plus" />
          Grows every release
        </span>
      </div>
      <div className="ot-grid">
        {KB_GROUPS.map(([type, label, c, bg, icon]) => (
          <div
            key={type}
            className="ot-kb"
            style={{ ["--kb" as string]: c, ["--kb-bg" as string]: bg }}
          >
            <span className="ot-kb-h">
              <span className="ot-ic">
                <Icon d={icon} />
              </span>
              {label}
            </span>
            {d.kb
              .filter((x) => x.type === type)
              .map((x) => (
                <p key={x.text}>{x.text}</p>
              ))}
          </div>
        ))}
      </div>
    </Frame>
  );
}

/* 6 — Evaluation & Continuous Improvement: does each change work for users, goals and real outcomes */
const EVAL_LABEL = {
  "User need": "For users",
  "Product goal": "Product goal",
  "Real outcome": "Real world",
} as const;
const ORDER = Object.keys(EVAL_LABEL);
const RESULT_ICON = { Better: "up", Same: "eq", Worse: "down" } as const;

export function EvalTile({ d }: P) {
  return (
    <Frame
      title="Does it really work?"
      sub={`Scenario: ${d.evaluation.scenario}`}
    >
      <div className="ot-test">
        <span className="ot-ic">
          <Icon d="flask" />
        </span>
        <span style={{ minWidth: 0 }}>
          <span className="ot-lab">New version vs previous</span>
          <b className="ot-t">{d.loop.change}</b>
        </span>
      </div>
      <Body gap={10}>
        <div className="ot-score">
          {[...d.evaluation.rows]
            .sort((a, b) => ORDER.indexOf(a.against) - ORDER.indexOf(b.against))
            .map((x) => (
              <div key={x.name} className="ot-res">
                <span className="ot-lab">{EVAL_LABEL[x.against]}</span>
                <span className="ot-t ot-t1">{x.name}</span>
                <span className={`ot-mark ${x.result}`}>
                  <Icon d={RESULT_ICON[x.result]} />
                  {x.result}
                </span>
              </div>
            ))}
        </div>
        <div className="ot-rel" aria-hidden>
          <span>Last release</span>
          <span className="now">This release: shipped</span>
          <span className="next">
            Next: watching {d.loop.watching.toLowerCase()}
          </span>
        </div>
      </Body>
    </Frame>
  );
}
