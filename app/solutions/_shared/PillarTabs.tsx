"use client";

import { useState, type ReactNode } from "react";

export type Pillar = {
  title: string;
  tagline: string;
  body: string;
  visual: ReactNode;
};

/* Accordion list on the left (active item expands, progress bar auto-advances),
   matching screen in a tinted panel on the right. */

const DURATION = 7; // seconds per pillar

const styles = `
  .pt { margin-top: 56px; display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.05fr); gap: 72px; align-items: start; }
  .pt-list { list-style: none; margin: 0; padding: 0; }
  .pt-item { border-bottom: 1px solid #E6E2DB; position: relative; }
  .pt-btn { all: unset; box-sizing: border-box; display: block; width: 100%; cursor: pointer; padding: 22px 0; }
  .pt-btn:focus-visible { outline: 2px solid #E8604A; outline-offset: 4px; border-radius: 4px; }
  .pt-title { display: block; font-size: 24px; line-height: 1.25; letter-spacing: -0.01em; color: #B9B4AB; transition: color .2s; }
  .pt-item:hover .pt-title { color: #8A857C; }
  .pt-num { display: block; margin-bottom: 6px; font-size: 13px; font-weight: 600; letter-spacing: 0.02em; color: #C9C3B9; transition: color .2s; }
  .pt-item.on .pt-num { color: #E8604A; }
  .pt-item.on .pt-title { color: #22201C; }
  .pt-body { display: grid; grid-template-rows: 0fr; transition: grid-template-rows .35s ease; }
  .pt-item.on .pt-body { grid-template-rows: 1fr; }
  .pt-body > .pt-desc { display: block; overflow: hidden; margin: 0; font-size: 17px; line-height: 1.55; color: #8A857C; max-width: 520px; text-wrap: pretty; }
  .pt-item.on .pt-body > .pt-desc { padding-top: 8px; }
  .pt-tag { display: block; margin-bottom: 6px; font-weight: 600; color: #22201C; }
  .pt-bar { position: absolute; left: 0; bottom: -1px; height: 2px; width: 0; background: #E8604A; }
  .pt-item.on .pt-bar { animation: pt-fill ${DURATION}s linear forwards; }
  .pt:hover .pt-item.on .pt-bar { animation-play-state: paused; }
  @keyframes pt-fill { from { width: 0; } to { width: 100%; } }
  .pt-panel { border-radius: 28px; padding: 56px 48px; min-height: 460px; display: grid; place-items: center;
    background: #F9DCC8 url("/other%20ui%20screens%20bg.png") center / cover no-repeat; }
  .pt-screen { width: 100%; max-width: 440px; display: grid; }
  .pt-screen > * { grid-area: 1 / 1; }
  .pt-screen > .off { visibility: hidden; }
  @media (min-width: 1001px) { .pt-side { padding: 32px; align-self: center; } .pt-side .pt-screen { max-width: 448px; } .pt-screen .st { aspect-ratio: 1 / 1; } }
  .pt-screen .st { display: flex; }
  .pt-screen .st-app { flex: 1; display: flex; flex-direction: column; }
  .pt-screen .st-list, .pt-screen .st-steps { flex: 1; align-content: space-between; }
  .pt-screen .st { margin: 0; background: #fff; border-color: rgba(0,0,0,0.05); border-radius: 20px; box-shadow: 0 24px 50px -28px rgba(60,30,10,0.35); }
  .pt-screen .st-app { padding: 24px; }
  .pt-screen .st-row { box-shadow: none; background: #FBFAF8; }
  .pt-screen .st-row.sel { background: #fff; }
  .pt-screen .st-row.hot { background: #FFF6F2; }
  .pt-inline { display: none; }
  @media (prefers-reduced-motion: reduce) { .pt-item.on .pt-bar { animation: none; width: 100%; } .pt-body { transition: none; } }
  @media (max-width: 1000px) {
    .pt { grid-template-columns: minmax(0, 1fr); gap: 36px; }
    .pt-panel { min-height: 0; padding: 20px 12px; border-radius: 22px; }
    .pt-inline .pt-screen > .off { display: none !important; }
    .pt-side { display: none; }
    .pt-inline { display: grid; margin-bottom: 22px; }
    .pt-title { font-size: 21px; }
    .pt-body > .pt-desc { font-size: 16px; }
  }
`;

/* All screens share one grid cell, so each takes the height of the tallest. */
function Screens({ pillars, active }: { pillars: Pillar[]; active: number }) {
  return (
    <div className="pt-screen">
      {pillars.map((p, i) => (
        <div
          key={p.title}
          className={i === active ? undefined : "off"}
          style={{ display: "grid" }}
        >
          {p.visual}
        </div>
      ))}
    </div>
  );
}

export default function PillarTabs({ pillars }: { pillars: Pillar[] }) {
  const [active, setActive] = useState(0);
  const next = () => setActive((i) => (i + 1) % pillars.length);

  return (
    <div className="pt">
      <style>{styles}</style>
      <ul className="pt-list">
        {pillars.map((p, i) => (
          <li key={p.title} className={`pt-item${i === active ? " on" : ""}`}>
            <button
              type="button"
              className="pt-btn"
              aria-expanded={i === active}
              onClick={() => setActive(i)}
            >
              <span className="pt-num">Offering #{i + 1}</span>
              <span className="pt-title">{p.title}</span>
              <span className="pt-body">
                <span className="pt-desc">
                  <strong className="pt-tag">{p.tagline}</strong>
                  {p.body}
                </span>
              </span>
            </button>
            {i === active && (
              <div className="pt-panel pt-inline">
                <Screens pillars={pillars} active={active} />
              </div>
            )}
            {i === active && (
              <span
                key={active}
                className="pt-bar"
                onAnimationEnd={next}
                aria-hidden
              />
            )}
          </li>
        ))}
      </ul>
      <div className="pt-panel pt-side">
        <Screens pillars={pillars} active={active} />
      </div>
    </div>
  );
}
