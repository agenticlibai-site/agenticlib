"use client";

import { useEffect, useState } from "react";
import { TAGS, type LibraryAsk, type UseCase } from "./useCases";

/* Hero UI screen for one business domain, as a clean app view.
   Left: the domain's use cases (searchable).
   Right: the selected use case's 7 features, each with a coloured tag.
   No "agent"/"parameter" wording in the UI. */

const DOT = [
  "#1F6F5C",
  "#E8604A",
  "#E0A526",
  "#C2412B",
  "#5E6B2E",
  "#FF8A73",
  "#8A5A2B",
  "#14503F",
];

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
  .al-feats { list-style: none; margin: 0; padding: 0; border: 1px solid #EFEDE8; border-radius: 12px; }
  .al-feat { display: flex; align-items: center; gap: 12px; padding: 9px 14px; border-top: 1px solid #F3F1EC; font-size: 13.5px; font-weight: 500; color: #16181D; }
  .al-feat:first-child { border-top: 0; }
  .al-feat small { font-family: var(--font-geist-mono), ui-monospace, monospace; font-size: 11.5px; color: #E8604A; width: 18px; flex: none; }
  .al-feat > span { flex: 1; min-width: 0; }
  .al-pill { flex: none; font-size: 11px; font-weight: 600; border-radius: 999px; padding: 2px 9px; white-space: nowrap; }
  .al-empty { padding: 16px 8px; font-size: 13px; color: #6B675F; }
  /* Ask AI: button on the side of one feature, cursor clicks it, answer drafts in a side panel */
  .al-main { position: relative; }
  .al-feat.ask { transition: background .3s; }
  .al-feat.ask.lit { background: #FFF6F2; }
  .al-feat > .al-askw { position: relative; flex: none; }
  .al-ask { font: inherit; font-size: 11px; font-weight: 600; display: inline-flex; align-items: center; gap: 4px; padding: 3px 9px; border-radius: 999px; border: 1px solid #F6C3B5; background: #fff; color: #C2412B; cursor: pointer; transition: transform .15s, background .2s; }
  .al-ask:hover, .al-feat.lit .al-ask { background: #FFE9E3; }
  .al-ask:focus-visible { outline: 2px solid #E8604A; outline-offset: 2px; }
  .al-ask.press { transform: scale(0.92); }
  .al-ask.still { cursor: default; }
  .al-ask span { font-size: 11px; line-height: 1; }
  .al-cur { position: absolute; left: 55%; top: 55%; pointer-events: none; opacity: 0; transform: translate(-110px, 26px); transition: transform .9s cubic-bezier(.4,0,.2,1), opacity .3s; }
  .al-cur.on { opacity: 1; transform: translate(0, 0); }
  .al-ai { position: absolute; z-index: 5; right: -4px; bottom: calc(100% + 12px); width: 280px; max-width: calc(100vw - 72px); padding: 10px 12px 12px; text-align: left; background: linear-gradient(165deg, #FFFFFF 0%, #FFF7F1 55%, #FFE8DE 100%); border: 1px solid #F6DDD3; border-radius: 12px; box-shadow: 0 14px 32px -14px rgba(90,50,30,0.35); opacity: 0; transform: translateY(6px) scale(0.98); transform-origin: 85% 100%; pointer-events: none; transition: opacity .25s, transform .25s; }
  .al-ai::after { content: ""; position: absolute; right: 30px; bottom: -6px; width: 10px; height: 10px; background: #FFE8DE; border-right: 1px solid #F6DDD3; border-bottom: 1px solid #F6DDD3; transform: rotate(45deg); }
  .al-ai.on { opacity: 1; transform: none; pointer-events: auto; }
  .al-ai-h { display: flex; align-items: center; gap: 5px; font-size: 12px; font-weight: 600; color: #C2412B; }
  .al-ai-h button { margin-left: auto; width: 20px; height: 20px; border-radius: 6px; border: 0; background: none; color: #8A867E; cursor: pointer; display: grid; place-items: center; }
  .al-ai-h button:hover { background: rgba(0,0,0,0.05); }
  .al-q { margin: 4px 0 0; font-size: 11.5px; line-height: 1.4; color: #6B675F; }
  .al-a { display: grid; font-size: 12.5px; line-height: 1.5; font-weight: 400; color: #16181D; margin: 6px 0 0; }
  .al-a > span { grid-area: 1 / 1; }
  .al-a-full { visibility: hidden; }
  .al-draft { color: #A19D95; font-style: italic; }
  .al-caret { display: inline-block; width: 1.5px; height: 1em; margin-left: 1px; vertical-align: -2px; background: #E8604A; animation: al-blink 1s steps(1) infinite; }
  @keyframes al-blink { 50% { opacity: 0; } }
  .al-verdict { display: inline-block; margin-top: 8px; font-size: 11px; font-weight: 600; border-radius: 999px; padding: 3px 10px; background: #D5ECE1; color: #14503F; opacity: 0; transition: opacity .3s; }
  .al-verdict.on { opacity: 1; }
  .al-sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
  @media (prefers-reduced-motion: reduce) { .al-cur { display: none; } .al-ai, .al-ask { transition: none; } .al-caret { animation: none; } }
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
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d={d} />
  </svg>
);
const RAIL = [
  "M2.5 2.5h4.5v4.5h-4.5zM9 2.5h4.5v4.5H9zM2.5 9h4.5v4.5h-4.5zM9 9h4.5v4.5H9z",
  "M7 11.5a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9zM10.5 10.5 14 14",
  "M2.5 13.5h11M4.5 11V7M8 11V4M11.5 11V8.5",
  "M3 4h10M3 8h10M3 12h6",
  "M8 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM8 1.5v2M8 12.5v2M1.5 8h2M12.5 8h2",
];

/* Ask AI timeline: cursor moves → presses → panel opens → answer types → holds → closes → repeats.
   Stops once the visitor touches the library; their own click replays it instantly. */
type Phase = "idle" | "move" | "press" | "open";

function useAskDemo(ask: LibraryAsk | undefined) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [typed, setTyped] = useState(0);
  const [auto, setAuto] = useState(true);
  const [run, setRun] = useState(0);
  const len = ask?.answer.length ?? 0;

  useEffect(() => {
    if (!ask) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ts: ReturnType<typeof setTimeout>[] = [];
    const at = (ms: number, f: () => void) => ts.push(setTimeout(f, ms));
    let iv: ReturnType<typeof setInterval> | undefined;
    const type = () => {
      if (still) return setTyped(len);
      iv = setInterval(() => setTyped((n) => (n >= len ? n : n + 2)), 22);
    };
    if (run > 0) {
      // visitor clicked Ask AI: open straight away
      at(0, () => {
        setTyped(0);
        setPhase("press");
      });
      at(160, () => setPhase("open"));
      at(700, type);
    } else if (auto && !still) {
      const cycle = () => {
        at(1400, () => {
          setTyped(0);
          setPhase("move");
        });
        at(2500, () => setPhase("press"));
        at(2750, () => setPhase("open"));
        at(3400, type);
        const end = 3400 + Math.ceil(len / 2) * 22 + 6000;
        at(end, () => {
          clearInterval(iv);
          setPhase("idle");
        });
        at(end + 400, cycle);
      };
      cycle();
    }
    return () => {
      ts.forEach(clearTimeout);
      clearInterval(iv);
    };
  }, [ask, auto, run, len]);

  return {
    phase,
    typed: Math.min(typed, len),
    open: () => {
      setAuto(false);
      setRun((r) => r + 1);
    },
    close: () => {
      setAuto(false);
      setRun(0);
      setPhase("idle");
    },
    stop: () => {
      if (auto) {
        setAuto(false);
        setPhase("idle");
      }
    },
  };
}

export default function AgentLibrary({
  cases,
  label,
  ask,
}: {
  cases: UseCase[];
  label: string;
  ask?: LibraryAsk;
}) {
  const [sel, setSel] = useState(0);
  const [q, setQ] = useState("");
  const demo = useAskDemo(ask);
  const n = cases.length;
  const c = cases[sel];
  const term = q.trim().toLowerCase();
  const match = (x: UseCase) =>
    !term ||
    [x.name, ...x.features.map(([f, t]) => `${f} ${TAGS[t].label}`)].some((t) =>
      t.toLowerCase().includes(term),
    );
  const pick = (i: number) => {
    demo.stop();
    setSel(((i % n) + n) % n);
  };
  const askHere = ask && ask.useCase === c.name ? ask : undefined;
  const shown = askHere && demo.phase === "open";
  const done = askHere && demo.typed >= askHere.answer.length;
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
            <input
              value={q}
              onChange={(e) => {
                demo.stop();
                setQ(e.target.value);
              }}
              placeholder="Search use cases"
              aria-label="Search use cases or features"
            />
          </label>
          <p className="al-sub">{n} use cases</p>
          <ul className="al-items">
            {visible.map(({ x, i }) => (
              <li key={x.name}>
                <button
                  type="button"
                  className="al-item"
                  aria-pressed={i === sel}
                  onClick={() => pick(i)}
                >
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
              <button
                type="button"
                aria-label="Previous use case"
                onClick={() => pick(sel - 1)}
              >
                <Ic d="M10 3.5 5.5 8l4.5 4.5" />
              </button>
              <button
                type="button"
                aria-label="Next use case"
                onClick={() => pick(sel + 1)}
              >
                <Ic d="M6 3.5 10.5 8 6 12.5" />
              </button>
            </div>
          </div>

          <div className="al-body" aria-live="polite">
            <h3 className="al-sec-h">
              Features <span>for {c.name.toLowerCase()}</span>
            </h3>
            <ol className="al-feats">
              {c.features.map(([f], k) => {
                const isAsk = askHere?.feature === f;
                return (
                  <li
                    key={f}
                    className={`al-feat${isAsk ? " ask" : ""}${isAsk && demo.phase !== "idle" ? " lit" : ""}`}
                  >
                    <small>{String(k + 1).padStart(2, "0")}</small>
                    <span>{f}</span>
                    <div className="al-askw">
                      {isAsk ? (
                        <button
                          type="button"
                          className={`al-ask${demo.phase === "press" ? " press" : ""}`}
                          onClick={demo.open}
                          aria-label={`Ask AI whether ${f} suits your agent`}
                        >
                          <span aria-hidden>✨</span> Ask AI
                        </button>
                      ) : (
                        <span className="al-ask still" aria-hidden>
                          <span>✨</span> Ask AI
                        </span>
                      )}
                      {isAsk && (
                        <svg
                          className={`al-cur${demo.phase === "move" || demo.phase === "press" ? " on" : ""}`}
                          width="18"
                          height="20"
                          viewBox="0 0 18 20"
                          aria-hidden
                        >
                          <path
                            d="M2 1.5v15l4-3.6 2.6 5.6 2.6-1.2-2.6-5.5H14z"
                            fill="#16181D"
                            stroke="#fff"
                            strokeWidth="1.3"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                      {isAsk && askHere && (
                        <div
                          className={`al-ai${shown ? " on" : ""}`}
                          role="region"
                          aria-label="Ask AI"
                          aria-hidden={!shown}
                        >
                          <div className="al-ai-h">
                            <span aria-hidden>✨</span>
                            Ask AI
                            <button
                              type="button"
                              aria-label="Close Ask AI"
                              onClick={demo.close}
                              tabIndex={shown ? 0 : -1}
                            >
                              <Ic d="M4 4l8 8M12 4l-8 8" />
                            </button>
                          </div>
                          <p className="al-q">
                            Would “{askHere.feature}” suit our agent?
                          </p>
                          <div className="al-a" aria-hidden>
                            {/* full answer reserves the space; typed text sits on top, so the box never grows */}
                            <span className="al-a-full">{askHere.answer}</span>
                            <span className="al-a-typed">
                              {demo.typed === 0 ? (
                                <span className="al-draft">Drafting…</span>
                              ) : (
                                askHere.answer.slice(0, demo.typed)
                              )}
                              {!done && <span className="al-caret" />}
                            </span>
                          </div>
                          <p className="al-sr">{askHere.answer}</p>
                          <span className={`al-verdict${done ? " on" : ""}`}>
                            {askHere.verdict}
                          </span>
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
