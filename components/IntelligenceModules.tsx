"use client";
import { useEffect, useRef } from "react";

/* ─────────────────────────────────────────────────────────────────────────────
   CSS — all component-specific styles, global body/html rules removed.
   CSS variables are kept on :root (they don't clash with the site's palette).
───────────────────────────────────────────────────────────────────────────── */
const CSS = `
:root {
  --v:       #7C3AED;
  --v-dim:   rgba(124,58,237,0.09);
  --p:       #EC4899;
  --text:    #111018;
  --sub:     #6B6880;
  --muted:   #B0AABF;
  --border:  rgba(0,0,0,0.07);
  --root-bg: #EAE5F8;
  --red:     #DC2626;
  --amber:   #D97706;
  --green:   #059669;
}

.im-section {
  font-family: var(--font-schibsted), system-ui, -apple-system, sans-serif;
  -webkit-font-smoothing: antialiased;
}

/* ── Scroll architecture ──────────────────────────────────────────── */
.scroll-root {
  height: 300vh;
  position: relative;
}
.card-stack {
  position: sticky;
  top: 0;
  height: 100vh;
  overflow: visible;
  background: transparent;
}

/* ── Card base ────────────────────────────────────────────────────── */
.card {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 24px 20px 4px;
  will-change: transform;
  transform-origin: top center;
}
/* Use IDs so badge sibling doesn't shift nth-child counts */
#c1 { transform: translateY(calc(100vh - 100px)); z-index: 2; }
#c3 { transform: translateY(100%); z-index: 3; }

/* ── Section label above card 1 ───────────────────────────────── */
.platform-badge-tagline {
  font-size: clamp(14px, 1.5vw, 22px);
  font-weight: 600;
  color: #3D2A6E;
  letter-spacing: -0.02em;
  line-height: 1.2;
  opacity: 0.75;
}

.card-inner {
  width: calc(100vw - 160px);
  max-width: 920px;
  height: min(80vh, 600px);
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid rgba(255,255,255,0.60);
  box-shadow: 0 8px 48px rgba(60,20,140,0.13), 0 1px 0 rgba(255,255,255,0.9) inset;
  display: grid;
  grid-template-columns: 34% 66%;
  overflow: hidden;
  position: relative;
}

/* Per-card gradient top accent */
#c0 .card-inner::before { content:''; position:absolute; top:0; left:0; right:0; height:3px; background:linear-gradient(90deg,#7C3AED,#EC4899,#F0617A); z-index:10; }
#c1 .card-inner::before { content:''; position:absolute; top:0; left:0; right:0; height:3px; background:linear-gradient(90deg,#7C3AED,#5E6CE8); z-index:10; }
#c2 .card-inner::before { content:''; position:absolute; top:0; left:0; right:0; height:3px; background:linear-gradient(90deg,#5E6CE8,#8E63D6,#C24D9E); z-index:10; }
#c3 .card-inner::before { content:''; position:absolute; top:0; left:0; right:0; height:3px; background:linear-gradient(90deg,#C2186A,#E8057A,#F0617A); z-index:10; }

/* Card-specific glass tint */
#c0 .card-inner { box-shadow: 0 8px 48px rgba(124,58,237,0.15), 0 1px 0 rgba(255,255,255,0.9) inset; border-color: rgba(124,58,237,0.30); }
#c1 .card-inner { box-shadow: 0 8px 48px rgba(94,108,232,0.15), 0 1px 0 rgba(255,255,255,0.9) inset; border-color: rgba(94,108,232,0.30); }
#c2 .card-inner { box-shadow: 0 8px 48px rgba(142,99,214,0.15), 0 1px 0 rgba(255,255,255,0.9) inset; }
#c3 .card-inner { box-shadow: 0 8px 48px rgba(194,24,106,0.15), 0 1px 0 rgba(255,255,255,0.9) inset; border-color: rgba(194,24,106,0.30); }

/* Corner brackets */
.c { position: absolute; width: 18px; height: 18px; z-index: 20; pointer-events: none; }
.c-tl { top: 0; left: 0; border-top: 2px solid rgba(124,58,237,0.30); border-left: 2px solid rgba(124,58,237,0.30); border-radius: 5px 0 0 0; }
.c-tr { top: 0; right: 0; border-top: 2px solid rgba(124,58,237,0.30); border-right: 2px solid rgba(124,58,237,0.30); border-radius: 0 5px 0 0; }
.c-bl { bottom: 0; left: 0; border-bottom: 2px solid rgba(124,58,237,0.30); border-left: 2px solid rgba(124,58,237,0.30); border-radius: 0 0 0 5px; }
.c-br { bottom: 0; right: 0; border-bottom: 2px solid rgba(124,58,237,0.30); border-right: 2px solid rgba(124,58,237,0.30); border-radius: 0 0 5px 0; }

/* ── Left column ──────────────────────────────────────────────────── */
.card-left { padding: 40px 36px; display: flex; flex-direction: column; justify-content: center; gap: 20px; border-right: 1px solid var(--border); }
.badge { display: inline-flex; align-items: center; gap: 7px; background: var(--v-dim); color: var(--v); font-size: 12px; font-weight: 700; letter-spacing: 0.04em; padding: 5px 12px; border-radius: 20px; width: fit-content; }
.badge svg { flex-shrink: 0; }
.badge-soon { background: rgba(0,0,0,0.05); color: var(--muted); margin-left: 6px; padding: 2px 8px; border-radius: 10px; font-size: 10px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; }
.card-headline { font-size: clamp(22px, 3vw, 32px); font-weight: 800; letter-spacing: -0.03em; line-height: 1.15; color: var(--text); text-wrap: balance; }
.card-body { font-size: 15px; line-height: 1.7; color: var(--sub); max-width: 380px; }

/* ── Right column ──────────────────────────────────────────────────── */
.card-right { background: #fff; display: flex; align-items: stretch; justify-content: stretch; padding: 0; position: relative; overflow: hidden; }
#c1 .card-right, #c2 .card-right, #c3 .card-right { background: #fff; }
#c1 .card-right > div, #c2 .card-right > div, #c3 .card-right > div { width: 100%; height: 100%; }

/* ── Scroll hint ──────────────────────────────────────────────────── */
.scroll-hint { position: absolute; bottom: 24px; left: 50%; transform: translateX(-50%); display: flex; flex-direction: column; align-items: center; gap: 6px; font-size: 11px; font-weight: 600; color: var(--muted); animation: im-bob 2s ease-in-out infinite; }
@keyframes im-bob { 0%,100%{transform:translateX(-50%) translateY(0)} 50%{transform:translateX(-50%) translateY(5px)} }

/* ── Ping ──────────────────────────────────────────────────────────── */
.live-dot { width: 6px; height: 6px; border-radius: 50%; background: #22C55E; box-shadow: 0 0 0 0 rgba(34,197,94,0.4); animation: im-ping 1.8s ease infinite; }
@keyframes im-ping { 0% { box-shadow: 0 0 0 0 rgba(34,197,94,0.4); } 70% { box-shadow: 0 0 0 6px rgba(34,197,94,0); } 100% { box-shadow: 0 0 0 0 rgba(34,197,94,0); } }

/* ── Card 1: competitive dashboard ───────────────────────────────── */
#c0 .card-inner { display:flex !important; flex-direction:column !important; padding:0; overflow:hidden; }
.c0-header { text-align:center; padding:22px 48px 16px; flex-shrink:0; }
.c0-badge { display:inline-flex; align-items:center; gap:6px; background:rgba(236,72,153,0.1); color:#EC4899; font-size:13px; font-weight:700; padding:5px 14px; border-radius:20px; margin-bottom:14px; }
.c0-headline { font-size:clamp(20px,2.8vw,36px); font-weight:800; letter-spacing:-0.03em; line-height:1.1; color:#000; text-wrap:balance; margin-bottom:10px; }
.c0-sub { font-size:16.5px; line-height:1.6; color:#000; max-width:680px; margin:0 auto; }
.c0-browser-wrap { flex:1; min-height:0; padding:0 28px 0; display:flex; align-items:flex-end; }
.c0-browser { width:100%; height:100%; border-radius:10px 10px 0 0; border:1px solid rgba(0,0,0,0.1); border-bottom:none; overflow:hidden; display:flex; flex-direction:column; box-shadow:0 -4px 32px rgba(60,20,140,0.08); }
.c0-chrome { padding:9px 14px; background:#F9F8FC; border-bottom:1px solid rgba(0,0,0,0.07); flex-shrink:0; display:flex; align-items:center; gap:6px; }
.c0-tl { width:11px; height:11px; border-radius:50%; flex-shrink:0; }
.c0-dash { flex:1; display:flex; overflow:hidden; min-height:0; }
.c0-nav { width:192px; flex-shrink:0; border-right:1px solid rgba(0,0,0,0.07); padding:12px 10px; display:flex; flex-direction:column; gap:1px; overflow-y:auto; background:#fff; }
.c0-nav-brand { display:flex; align-items:center; gap:9px; padding:2px 4px 12px; }
.c0-nav-icon { width:28px; height:28px; border-radius:7px; background:linear-gradient(135deg,#7C3AED,#EC4899); flex-shrink:0; }
.c0-nav-brandname { font-size:15px; font-weight:800; color:#111018; }
.c0-nav-brandname em { font-style:normal; color:#7C3AED; }
.c0-nav-sec { font-size:9px; font-weight:700; letter-spacing:0.12em; text-transform:uppercase; color:#B0AABF; padding:8px 6px 4px; }
.c0-nav-row { display:flex; align-items:center; justify-content:space-between; padding:6px 8px; border-radius:6px; font-size:12px; color:#6B6880; cursor:pointer; }
.c0-nav-row.on { background:rgba(124,58,237,0.08); color:#7C3AED; font-weight:700; }
.c0-nav-row.dim { color:#C4BDDB; }
.c0-nav-pill { background:#7C3AED; color:#fff; font-size:9.5px; font-weight:800; padding:1px 7px; border-radius:8px; }
.c0-nav-soon { font-size:8.5px; font-weight:700; background:rgba(0,0,0,0.05); color:#B0AABF; padding:1px 5px; border-radius:3px; }
.c0-main { flex:1; display:flex; flex-direction:column; overflow:hidden; min-height:0; background:#fff; }
.c0-topbar { padding:8px 14px; border-bottom:1px solid rgba(0,0,0,0.07); display:flex; align-items:center; gap:8px; flex-shrink:0; }
.c0-searchbox { flex:1; background:rgba(0,0,0,0.04); border:1px solid rgba(0,0,0,0.08); border-radius:6px; padding:5px 10px; font-size:11px; color:#B0AABF; display:flex; align-items:center; gap:6px; }
.c0-feed { flex:1; overflow-y:auto; }
.c0-r-sidebar { width:186px; flex-shrink:0; border-left:1px solid rgba(0,0,0,0.07); padding:12px; display:flex; flex-direction:column; gap:8px; overflow-y:auto; background:#fff; }

/* ── Card 2: product feature intelligence ────────────────────────── */
#c1 .card-inner { display:flex !important; flex-direction:column !important; padding:0; overflow:hidden; }
.c2-dash { flex:1; display:flex; flex-direction:column; overflow:hidden; position:relative; background:#fff; }
.c2-top { display:grid; grid-template-columns:1fr 1fr; border-bottom:1px solid rgba(0,0,0,0.07); flex-shrink:0; min-height:0; }
.c2-brands { padding:16px 22px; border-right:1px solid rgba(0,0,0,0.07); overflow:hidden; }
.c2-donut-area { padding:14px 20px; display:flex; flex-direction:column; align-items:center; justify-content:center; }
.c2-section-title { font-size:14px; font-weight:800; color:#111018; margin-bottom:12px; }
.c2-brand-row { display:flex; align-items:center; gap:9px; margin-bottom:8px; }
.c2-rank { width:19px; height:19px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:9.5px; font-weight:800; color:#fff; flex-shrink:0; }
.c2-bname-lbl { font-size:12.5px; color:#111018; width:82px; flex-shrink:0; }
.c2-bname-lbl.bld { font-weight:700; }
.c2-brand-track { flex:1; height:8px; background:rgba(0,0,0,0.05); border-radius:4px; overflow:hidden; }
.c2-brand-fill { height:100%; border-radius:4px; width:0; transition:width 0.9s cubic-bezier(0.22,1,0.36,1); }
.c2-mentions { font-size:10.5px; color:#B0AABF; width:84px; flex-shrink:0; }
.c2-legend { display:flex; flex-wrap:wrap; gap:6px 12px; justify-content:center; margin-top:10px; }
.c2-leg-item { display:flex; align-items:center; gap:5px; font-size:10px; color:#6B6880; }
.c2-leg-dot { width:7px; height:7px; border-radius:50%; flex-shrink:0; }
.c2-features { padding:12px 22px; overflow-y:auto; flex:1; }
.c2-feat-hdr { display:flex; align-items:center; gap:10px; margin-bottom:5px; }
.c2-feat-title { font-size:15px; font-weight:800; color:#111018; }
.c2-feat-hint { font-size:11px; color:#B0AABF; }
.c2-feat-name { font-size:12.5px; font-weight:700; color:#111018; margin-bottom:2px; }
.c2-feat-desc { font-size:11px; color:#B0AABF; line-height:1.5; margin-bottom:10px; }
.c2-bar-row { display:flex; align-items:center; gap:12px; padding:7px 0; border-bottom:1px solid rgba(0,0,0,0.05); cursor:pointer; }
.c2-bar-row:last-child { border-bottom:none; }
.c2-bar-row.lit { background:rgba(124,58,237,0.04); border-radius:6px; padding:7px 10px; margin:0 -10px; }
.c2-bn { font-size:12.5px; color:#111018; width:110px; flex-shrink:0; }
.c2-bn.bld { font-weight:700; }
.c2-btrack { flex:1; height:10px; background:rgba(0,0,0,0.05); border-radius:5px; overflow:hidden; }
.c2-bfill { height:100%; border-radius:5px; width:0; transition:width 0.9s cubic-bezier(0.22,1,0.36,1); }
.c2-bfill-g { background:linear-gradient(90deg,#22C55E,#16A34A); }
.c2-bfill-r { background:linear-gradient(90deg,#F87171,#EF4444); }
.c2-bscore { font-size:14px; font-weight:800; width:26px; text-align:right; flex-shrink:0; font-variant-numeric:tabular-nums; }
.c2-bscore.g { color:#16A34A; }
.c2-bscore.r { color:#EF4444; }
.c2-overlay { position:absolute; inset:0; background:rgba(200,195,220,0.38); opacity:0; pointer-events:none; transition:opacity 0.4s; z-index:9; border-radius:0 0 9px 0; }
.c2-overlay.show { opacity:1; }
.c2-panel { position:absolute; right:0; top:0; bottom:0; width:36%; background:#fff; border-left:1px solid rgba(0,0,0,0.09); transform:translateX(100%); transition:transform 0.45s cubic-bezier(0.22,1,0.36,1); padding:22px 24px; display:flex; flex-direction:column; gap:10px; z-index:10; box-shadow:-4px 0 28px rgba(0,0,0,0.09); }
.c2-panel.open { transform:translateX(0); }
.c2-panel-hdr { display:flex; align-items:flex-start; justify-content:space-between; gap:8px; }
.c2-panel-lbl { font-size:10px; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; color:#B0AABF; line-height:1.5; }
.c2-panel-x { width:24px; height:24px; border-radius:50%; background:rgba(0,0,0,0.07); border:none; display:flex; align-items:center; justify-content:center; font-size:13px; color:#6B6880; cursor:pointer; flex-shrink:0; font-family:inherit; line-height:1; }
.c2-big-score { font-size:60px; font-weight:800; letter-spacing:-0.04em; color:#16A34A; line-height:1; font-variant-numeric:tabular-nums; }
.c2-score-sub { font-size:13px; color:#6B6880; }
.c2-score-rank { font-size:13px; color:#6B6880; }
.c2-ev-label { font-size:9.5px; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; color:#B0AABF; }
.c2-ev-quote { border-left:3px solid #7C3AED; padding:12px 14px; background:rgba(124,58,237,0.04); border-radius:0 6px 6px 0; font-size:13px; line-height:1.65; color:#111018; }
.fake-cursor { position:absolute; pointer-events:none; z-index:30; opacity:0; filter:drop-shadow(0 1px 4px rgba(0,0,0,0.4)); }

/* Watchlist sidebar */
.cd-filter-btn { padding:5px 10px; border-radius:5px; border:1px solid rgba(0,0,0,0.1); background:#fff; font-size:11px; color:#6B6880; cursor:pointer; font-family:inherit; flex-shrink:0; }
.cd-add-btn { padding:5px 11px; border-radius:5px; background:#7C3AED; color:#fff; font-size:11px; font-weight:700; border:none; cursor:pointer; font-family:inherit; flex-shrink:0; }
.cd-stats { padding:8px 14px; border-bottom:1px solid rgba(0,0,0,0.07); display:flex; align-items:center; gap:18px; flex-shrink:0; }
.cd-stat-val { font-size:17px; font-weight:800; letter-spacing:-0.03em; color:#111018; font-variant-numeric:tabular-nums; }
.cd-stat-lbl { font-size:10px; color:#B0AABF; margin-top:1px; }
.cd-live-b { margin-left:auto; display:flex; align-items:center; gap:5px; background:rgba(34,197,94,0.1); color:#16A34A; font-size:10px; font-weight:700; padding:3px 9px; border-radius:10px; }
.cd-live-dot { width:5px; height:5px; border-radius:50%; background:#22C55E; }
.cd-pills { padding:6px 12px; border-bottom:1px solid rgba(0,0,0,0.07); display:flex; gap:5px; flex-wrap:wrap; flex-shrink:0; }
.cd-pill { padding:3px 9px; border-radius:4px; font-size:10.5px; font-weight:600; color:#6B6880; background:rgba(0,0,0,0.04); cursor:pointer; }
.cd-pill.on { background:rgba(124,58,237,0.09); color:#7C3AED; }
.cd-body { flex:1; display:flex; overflow:hidden; min-height:0; }
.cd-feed { flex:1; overflow-y:auto; }
.cd-entry { border-bottom:1px solid rgba(0,0,0,0.07); padding:10px 12px; position:relative; }
.cd-entry.new-entry { padding-left:15px; }
.cd-entry.new-entry::before { content:''; position:absolute; left:0; top:0; bottom:0; width:2.5px; background:#7C3AED; }
.cd-entry-top { display:flex; align-items:center; gap:5px; margin-bottom:5px; flex-wrap:wrap; }
.cd-bicon { width:19px; height:19px; border-radius:5px; display:flex; align-items:center; justify-content:center; font-size:9px; font-weight:900; color:#fff; flex-shrink:0; }
.cd-bname { font-size:11.5px; font-weight:700; color:#111018; }
.cd-new { font-size:8.5px; font-weight:800; background:rgba(124,58,237,0.1); color:#7C3AED; padding:1px 5px; border-radius:3px; letter-spacing:0.06em; text-transform:uppercase; }
.cd-uc { font-size:10px; color:#B0AABF; background:rgba(0,0,0,0.05); padding:2px 6px; border-radius:3px; }
.cd-time { font-size:10px; color:#B0AABF; margin-left:auto; }
.cd-impact-h { font-size:9px; font-weight:800; background:rgba(220,38,38,0.08); color:#DC2626; padding:2px 6px; border-radius:3px; text-transform:uppercase; }
.cd-impact-m { font-size:9px; font-weight:800; background:rgba(217,119,6,0.08); color:#D97706; padding:2px 6px; border-radius:3px; text-transform:uppercase; }
.cd-title { font-size:11.5px; font-weight:700; color:#111018; margin-bottom:3px; line-height:1.35; }
.cd-desc { font-size:10.5px; color:#6B6880; line-height:1.55; margin-bottom:7px; }
.cd-evidence { background:rgba(124,58,237,0.05); border-radius:5px; padding:7px 9px; }
.cd-ev-lbl { font-size:9px; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; color:#7C3AED; margin-bottom:5px; }
.cd-ev-quote { font-size:10.5px; color:#111018; line-height:1.6; }
.cd-ev-actions { margin-top:5px; display:flex; gap:10px; }
.cd-ev-act { font-size:10px; font-weight:600; color:#7C3AED; cursor:pointer; }
.cd-sidebar { width:172px; flex-shrink:0; border-left:1px solid rgba(0,0,0,0.07); padding:12px; display:flex; flex-direction:column; gap:8px; overflow-y:auto; }
.cd-wl-title { font-size:9px; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; color:#B0AABF; }
.cd-wl-item { display:flex; align-items:center; gap:6px; padding:5px 0; border-bottom:1px solid rgba(0,0,0,0.05); }
.cd-wl-icon { width:20px; height:20px; border-radius:6px; display:flex; align-items:center; justify-content:center; font-size:9px; font-weight:900; color:#fff; flex-shrink:0; }
.cd-wl-name { font-size:11px; font-weight:700; color:#111018; }
.cd-wl-domain { font-size:9.5px; color:#B0AABF; }
.cd-wl-count { margin-left:auto; font-size:11px; font-weight:800; color:#7C3AED; }
.cd-wl-add { font-size:11px; font-weight:600; color:#7C3AED; cursor:pointer; }
.cd-alerts-title { font-size:11px; font-weight:700; color:#111018; }
.cd-alert-row { display:flex; align-items:center; justify-content:space-between; font-size:10.5px; color:#6B6880; }
.cd-toggle { width:28px; height:16px; border-radius:8px; position:relative; flex-shrink:0; cursor:pointer; }
.cd-toggle.on { background:#7C3AED; }
.cd-toggle.off { background:#D1D5DB; }
.cd-toggle::after { content:''; position:absolute; width:12px; height:12px; border-radius:50%; background:#fff; top:2px; }
.cd-toggle.on::after { left:14px; }
.cd-toggle.off::after { left:2px; }

/* ── Card 3: comparison intelligence ─────────────────────────────── */
#c2 .card-inner { display:flex !important; flex-direction:column !important; padding:0; overflow:hidden; }
.c3-dash { flex:1; display:flex; flex-direction:column; overflow:hidden; background:#fff; }
.c3-filter { padding:11px 22px; border-bottom:1px solid rgba(0,0,0,0.07); display:flex; align-items:center; gap:14px; flex-shrink:0; }
.c3-cmp-lbl { font-size:14px; font-weight:700; color:#111018; flex-shrink:0; }
.c3-brand-pills { display:flex; gap:6px; }
.c3-bp { display:inline-flex; align-items:center; gap:6px; padding:5px 12px; border-radius:7px; border:1.5px solid transparent; font-size:13px; font-weight:600; }
.c3-bp.on { border-color:#4F6EF7; color:#4F6EF7; }
.c3-bp.off { color:#B0AABF; border-color:rgba(0,0,0,0.1); }
.c3-bp-dot { width:7px; height:7px; border-radius:50%; background:currentColor; flex-shrink:0; }
.c3-use-tabs { display:flex; gap:5px; margin-left:auto; }
.c3-ut { padding:5px 13px; border-radius:7px; font-size:13px; font-weight:600; cursor:pointer; }
.c3-ut.on { background:#4F6EF7; color:#fff; }
.c3-ut.off { color:#6B6880; }
.c3-info { padding:7px 22px; border-bottom:1px solid rgba(0,0,0,0.07); display:flex; align-items:center; justify-content:space-between; flex-shrink:0; }
.c3-active-brands { display:flex; align-items:center; gap:16px; }
.c3-ab { display:flex; align-items:center; gap:6px; font-size:13px; font-weight:700; color:#4F6EF7; }
.c3-ab-dot { width:9px; height:9px; border-radius:50%; background:#4F6EF7; }
.c3-meta { font-size:12px; color:#B0AABF; }
.c3-scores { flex:1; overflow:hidden; padding:10px 22px; display:flex; flex-direction:column; justify-content:space-between; }
.c3-scores-lbl { font-size:10px; font-weight:800; letter-spacing:0.12em; text-transform:uppercase; color:#B0AABF; margin-bottom:10px; }
.c3-feat-row { display:flex; align-items:flex-start; gap:18px; padding:9px 0; border-bottom:1px solid rgba(0,0,0,0.05); }
.c3-feat-row:last-of-type { border-bottom:none; }
.c3-feat-info { width:190px; flex-shrink:0; }
.c3-feat-name { font-size:13px; font-weight:700; color:#111018; line-height:1.3; margin-bottom:2px; }
.c3-feat-desc { font-size:11px; color:#B0AABF; line-height:1.4; }
.c3-feat-bars { flex:1; display:flex; flex-direction:column; gap:7px; }
.c3-bar-line { display:flex; align-items:center; gap:10px; }
.c3-bar-brand { font-size:12px; font-weight:700; color:#4F6EF7; width:54px; flex-shrink:0; }
.c3-bar-track { flex:1; height:8px; background:rgba(79,110,247,0.08); border-radius:4px; overflow:hidden; }
.c3-bar-fill { height:100%; border-radius:4px; background:#4F6EF7; width:0; transition:width 0.85s cubic-bezier(0.22,1,0.36,1); }
.c3-bar-score { font-size:14px; font-weight:800; color:#111018; width:24px; text-align:right; font-variant-numeric:tabular-nums; }
.c3-win { font-size:9px; font-weight:800; background:#ECEFFE; color:#4F6EF7; padding:2px 7px; border-radius:3px; text-transform:uppercase; letter-spacing:0.05em; white-space:nowrap; }
.c3-win-ph { width:46px; flex-shrink:0; }
.c3-bottom { display:grid; grid-template-columns:1fr 1fr; gap:0; border-top:1px solid rgba(0,0,0,0.07); flex-shrink:0; }
.c3-bc { padding:14px 20px; }
.c3-bc:first-child { border-right:1px solid rgba(0,0,0,0.07); }
.c3-bc-hdr { display:flex; align-items:center; justify-content:space-between; margin-bottom:10px; }
.c3-bc-brand { display:flex; align-items:center; gap:7px; font-size:14px; font-weight:800; color:#4F6EF7; }
.c3-bc-dot { width:9px; height:9px; border-radius:50%; background:#4F6EF7; }
.c3-bc-uc { font-size:11px; color:#B0AABF; }
.c3-pt { margin-bottom:7px; }
.c3-pt-title { font-size:12px; font-weight:700; color:#111018; margin-bottom:1px; }
.c3-pt-desc { font-size:11px; color:#6B6880; line-height:1.45; }
.c3-bf-lbl { font-size:10px; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; color:#B0AABF; margin-top:9px; margin-bottom:5px; }
.c3-bf-pills { display:flex; flex-wrap:wrap; gap:4px; }
.c3-bf-pill { font-size:11px; font-weight:600; padding:3px 9px; border-radius:5px; background:#ECEFFE; color:#4F6EF7; }

/* ── Mobile layout ─────────────────────────────────────────────────── */
@media (max-width: 768px) {
  .card { padding: 4px 10px; }

  /* Full-width card, stack text above iframe */
  .card-inner {
    width: calc(100vw - 24px) !important;
    max-width: 100% !important;
    height: min(88vh, 560px) !important;
    grid-template-columns: 1fr !important;
    grid-template-rows: auto 1fr !important;
    display: grid !important;
  }

  /* Text column: compact padding, no right border */
  .card-left {
    padding: 18px 18px 14px !important;
    border-right: none !important;
    border-bottom: 1px solid rgba(0,0,0,0.07) !important;
    gap: 9px !important;
    justify-content: center !important;
  }
  .card-headline { font-size: clamp(15px, 4.5vw, 19px) !important; }
  .card-body { font-size: 13px !important; line-height: 1.6 !important; max-width: 100% !important; }

  /* Iframe column: show it, fill remaining height */
  .card-right {
    display: flex !important;
    width: 100% !important;
    height: 100% !important;
    min-height: 0 !important;
  }
  .card-right iframe { width: 100% !important; height: 100% !important; border: none !important; }

  /* Card 0 (flex-column): compact its header, keep browser below */
  .c0-header {
    padding: 16px 18px 10px !important;
    text-align: left !important;
    flex-shrink: 0 !important;
  }
  .c0-headline { font-size: clamp(15px, 4.5vw, 19px) !important; }
  .c0-sub { font-size: 13px !important; line-height: 1.6 !important; }
  .c0-browser-wrap { padding: 0 10px 0 !important; }

  /* Platform badge repositioned for smaller screens */
  .platform-badge {
    left: 12px !important;
    top: calc(50% - 310px) !important;
  }

  /* Hide scroll hint — not enough room */
  .scroll-hint { display: none !important; }
}
`;

/* ─────────────────────────────────────────────────────────────────────────────
   Cards HTML — injected via dangerouslySetInnerHTML to preserve class names
   and avoid JSX attribute conversion on the large SVG/HTML structures.
───────────────────────────────────────────────────────────────────────────── */
const CARDS_HTML = `
<div class="card-stack" id="cardStack">


  <!-- CARD 1 · Competitive Intelligence -->
  <div class="card" id="c0">
    <div class="card-inner" style="display:grid !important;flex-direction:unset !important;grid-template-columns:38% 62%;padding:0 !important;">
      <span class="c c-tl"></span><span class="c c-tr"></span><span class="c c-bl"></span><span class="c c-br"></span>
      <div class="card-left">
        <div class="badge" style="background:rgba(236,72,153,0.10);color:#EC4899;">
          <svg width="17" height="17" viewBox="0 0 18 18" fill="none">
            <path d="M9 2L16 6L9 10L2 6Z" fill="#F9A8D4"/>
            <path d="M2 6L9 10L9 16L2 12Z" fill="#EC4899"/>
            <path d="M9 10L16 6L16 12L9 16Z" fill="#BE185D"/>
          </svg>
          1/3
        </div>
        <h2 class="card-headline">Never miss a competitor's move</h2>
        <p class="card-body">Sage continuously monitors top AI agent brands by use case and detects changes across competitor websites the moment they happen, alerting you the instant a rival ships or upgrades a product feature.</p>
        <span style="display:inline-flex;align-items:center;background:rgba(22,163,74,0.10);color:#16A34A;padding:5px 14px;border-radius:20px;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">Coming Soon</span>
      </div>
      <div class="card-right" style="background:#EDEAF8;display:flex;align-items:center;justify-content:center;padding:0;">
        <iframe
          src="/competitor-feed.html"
          style="width:100%;height:100%;border:none;"
          title="Sage AI Competitor Feed"
          loading="lazy"
        ></iframe>
      </div>
    </div>
  </div>

  <!-- CARD 2 · Product Feature Intelligence -->
  <div class="card" id="c1">
    <div class="card-inner" style="display:grid !important;flex-direction:unset !important;grid-template-columns:38% 62%;padding:0 !important;">
      <span class="c c-tl"></span><span class="c c-tr"></span><span class="c c-bl"></span><span class="c c-br"></span>
      <div class="card-left">
        <div class="badge" style="background:rgba(124,58,237,0.10);color:#7C3AED;">
          <svg width="17" height="17" viewBox="0 0 18 18" fill="none">
            <path d="M9 2L16 6L9 10L2 6Z" fill="#DDD6FE"/>
            <path d="M2 6L9 10L9 16L2 12Z" fill="#8B5CF6"/>
            <path d="M9 10L16 6L16 12L9 16Z" fill="#6D28D9"/>
          </svg>
          2/3
        </div>
        <h2 class="card-headline">Feature scores by use case, straight from what LLMs say</h2>
        <p class="card-body">Every product feature gets a score per use case, built from live queries across Claude and GPT. No analyst opinion. Click any score to read the exact quotes that produced it.</p>
        <a href="/sage" style="display:inline-flex;align-items:center;gap:6px;width:fit-content;background:linear-gradient(95deg,#7C3AED,#C2186A);color:#fff;font-weight:700;font-size:13px;padding:10px 22px;border-radius:9999px;text-decoration:none;box-shadow:0 4px 16px rgba(124,58,237,0.30);letter-spacing:0.01em;">Get started <span style="font-size:15px;">›</span></a>
      </div>
      <div class="card-right" style="background:#EDEAF8;display:flex;align-items:center;justify-content:center;padding:0;">
        <iframe
          data-src="/product-features.html"
          style="width:100%;height:100%;border:none;"
          title="Sage AI Product Features"
        ></iframe>
      </div>
    </div>
  </div>

  <!-- CARD 3 · Benchmark Intelligence -->
  <div class="card" id="c3">
    <div class="card-inner" style="grid-template-columns:38% 62%;">
      <span class="c c-tl"></span><span class="c c-tr"></span><span class="c c-bl"></span><span class="c c-br"></span>
      <div class="card-left">
        <div class="badge" style="background:rgba(249,115,22,0.10);color:#F97316;">
          <svg width="17" height="17" viewBox="0 0 18 18" fill="none">
            <path d="M9 2L16 6L9 10L2 6Z" fill="#FED7AA"/>
            <path d="M2 6L9 10L9 16L2 12Z" fill="#F97316"/>
            <path d="M9 10L16 6L16 12L9 16Z" fill="#C2410C"/>
          </svg>
          3/3
        </div>
        <h2 class="card-headline">Benchmark your position in the market</h2>
        <p class="card-body">Benchmark your brand against the competitive landscape, then get a prioritised roadmap of the features and use cases to improve over the next 3 months — so LLMs start surfacing you in the conversations where buyers are already asking.</p>
        <span style="display:inline-flex;align-items:center;background:rgba(22,163,74,0.10);color:#16A34A;padding:5px 14px;border-radius:20px;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">Coming Soon</span>
      </div>
      <div class="card-right" style="background:#F5F3FC;display:flex;align-items:center;justify-content:center;padding:0;">
        <iframe
          data-src="/scan-demo.html"
          style="width:100%;height:100%;border:none;"
          title="Sage AI Benchmark Demo"
        ></iframe>
      </div>
    </div>
  </div>

</div>
`;

export default function IntelligenceModules() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const root = rootRef.current!;
    if (!root) return;

    /* ── Helpers ─────────────────────────────────────────────────── */
    function clamp(v: number, lo: number, hi: number) {
      return Math.max(lo, Math.min(hi, v));
    }

    // Scroll position relative to the START of this section
    function relScroll() {
      const top = root.getBoundingClientRect().top + window.scrollY;
      return Math.max(0, window.scrollY - top);
    }

    /* ── Card elements ───────────────────────────────────────────── */
    const cards = [
      root.querySelector<HTMLElement>("#c0"),
      root.querySelector<HTMLElement>("#c1"),
      root.querySelector<HTMLElement>("#c3"),
    ] as HTMLElement[];

    /* ── Scroll-driven card animation ────────────────────────────── */
    const PEEK = 100; // px of card 2 visible below card 1 at rest

    function updateCards() {
      const VH = window.innerHeight;
      const s = relScroll();
      const s0 = clamp(s / VH, 0, 1);
      cards[0].style.transform = `scale(${1 - s0 * 0.04})`;
      // Fade card 0 out as card 1 fully slides in (s: 0.7VH → 1.0VH)
      cards[0].style.opacity = String(clamp(1 - (s - VH * 0.7) / (VH * 0.3), 0, 1));
      // Card 2: slides from (VH - PEEK) → 0 over first VH of scroll
      const t1 = clamp(1 - s / VH, 0, 1) * (VH - PEEK);
      const sc1 = 1 - clamp((s - VH) / VH, 0, 1) * 0.04;
      cards[1].style.transform = `translateY(${t1}px) scale(${sc1})`;
      // Fade card 1 out as card 2 fully slides in (s: 1.7VH → 2.0VH)
      cards[1].style.opacity = String(clamp(1 - (s - VH * 1.7) / (VH * 0.3), 0, 1));
      // Card 3 (benchmark): slides from 100% → 0 over second VH of scroll
      const slide2 = clamp(1 - (s - VH) / VH, 0, 1) * 100;
      cards[2].style.transform = `translateY(${slide2}%)`;
    }

    /* ── iframe animation control ────────────────────────────────── */
    // Cards 1 + 2 have data-src (not src) so they never preload.
    // On first visit: set src → iframe loads → window.load fires → auto-start runs.
    // On revisit:     location.reload() → fresh load → auto-start runs again.
    // No postMessage race conditions.
    const iframeEls = [
      root.querySelector<HTMLIFrameElement>("#c0 iframe"),
      root.querySelector<HTMLIFrameElement>("#c1 iframe"),
      root.querySelector<HTMLIFrameElement>("#c3 iframe"),
    ];
    const activated = new Set<number>();
    let prevCard = -1;

    function fireCard(i: number) {
      if (i === prevCard) return;
      prevCard = i;
      const f = iframeEls[i];
      if (!f) return;
      if (!activated.has(i)) {
        activated.add(i);
        const dataSrc = f.getAttribute("data-src");
        if (dataSrc) f.src = dataSrc; // cards 1+2: set src for the first time
        // card 0 already has src; its window.load auto-start fires naturally
      } else {
        // revisit — reload to restart the animation from scratch
        try { f.contentWindow?.location.reload(); } catch (_) {}
      }
    }

    // Activate card 0 when this section enters the viewport
    const io = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) fireCard(0); },
      { threshold: 0.1 }
    );
    io.observe(root);

    /* ── Scroll listeners ────────────────────────────────────────── */
    function onScroll() {
      updateCards();
      const s  = relScroll();
      const VH = window.innerHeight;
      // Fire when card is almost fully on screen (≥ 90 % slid in)
      fireCard(s > VH * 1.9 ? 2 : s > VH * 0.9 ? 1 : 0);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    updateCards(); // initialise immediately

    return () => {
      window.removeEventListener("scroll", onScroll);
      io.disconnect();
    };
  }, []);

  return (
    <section className="im-section" style={{ background: "transparent" }}>
      {/* eslint-disable-next-line react/no-danger */}
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div
        ref={rootRef}
        className="scroll-root"
        dangerouslySetInnerHTML={{ __html: CARDS_HTML }}
      />
    </section>
  );
}
