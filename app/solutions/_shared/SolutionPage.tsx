import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { SITE_URL } from "@/lib/site";
import type { Solution } from "./solutions";
import AgentLibrary from "./AgentLibrary";
import PillarTabs, { type Pillar } from "./PillarTabs";
import { USE_CASES } from "./useCases";
import { DOMAIN_COPY } from "./domainCopy";
import { WorkflowTile, RoadmapTile, BehaviourTile, EvaluationTile, ContextTile, KnowledgeTile, tileStyles } from "./SolutionTiles";

export function solutionMetadata(s: Solution): Metadata {
  const url = `${SITE_URL}/solutions/${s.slug}`;
  return {
    title: { absolute: s.metaTitle },
    description: s.metaDescription,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      siteName: "FeatureStream",
      title: s.metaTitle,
      description: s.metaDescription,
      url,
      images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "FeatureStream" }],
    },
    twitter: { card: "summary_large_image", title: s.metaTitle, description: s.metaDescription, images: ["/og-image.png"] },
  };
}

/* ── Pillars: titles shared, copy tailored per domain (domainCopy.ts) ── */

const TITLES = ["Agent workflow intelligence", "Agent capability roadmapping", "Agent behaviour intelligence", "Agent evaluation & improvement", "Customer context intelligence", "Agent product knowledge base"];

const pillars = (s: Solution): Pillar[] => {
  const c = DOMAIN_COPY[s.slug];
  const visuals = [<WorkflowTile key="w" t={s.tiles} c={c} />, <RoadmapTile key="r" t={s.tiles} c={c} />, <BehaviourTile key="b" t={s.tiles} c={c} />, <EvaluationTile key="e" t={s.tiles} />, <ContextTile key="c" t={s.tiles} c={c} />, <KnowledgeTile key="k" t={s.tiles} c={c} />];
  return TITLES.map((title, i) => ({ title, visual: visuals[i], body: c.pillars[i].body }));
};

const tintVars = (t: { a: string; b: string; border: string; accent: string }) =>
  ({ "--t-a": t.a, "--t-b": t.b, "--t-border": t.border, "--t-accent": t.accent }) as CSSProperties;

function SolutionsSection({ s }: { s: Solution }) {
  return (
    <section className="sol-sec" style={tintVars(DOMAIN_COPY[s.slug].tint)}>
      <div className="sol-wrap">
        <h2 className="sol-h2 display">
          <span style={{ color: "#E8604A" }}>Help your PMs build a better AI product.</span>
          <br />
          Know what to improve next.
        </h2>
        <p className="sol-lead">{DOMAIN_COPY[s.slug].lead}</p>
        <PillarTabs pillars={pillars(s)} />
      </div>
    </section>
  );
}

/* ── Page ── */

export default function SolutionPage({ s }: { s: Solution }) {
  return (
    <main className="sol-page">
      <style>{`
        .sol-page { font-family: var(--font-schibsted), system-ui, sans-serif; color: #000; background: #fff; }
        .sol-wrap { max-width: 1120px; margin: 0 auto; padding: 0 32px; }
        .sol-hero { background: #FBF8F3; margin-top: -68px; padding: 168px 0 88px; }
        .sol-top { display: grid; grid-template-columns: minmax(0, 1.35fr) minmax(0, 1fr); gap: 48px; align-items: end; }
        .sol-hero h1 { font-size: 64px; line-height: 1.02; margin: 0; text-wrap: balance; }
        .sol-hero-sub { margin: 0 0 8px; font-size: 19px; line-height: 1.5; color: #8A857C; text-wrap: pretty; }
        .sol-sec { padding: 88px 0; }
        .sol-sec-beige { background: #FBF8F3; }
        .sol-h2 { font-size: 52px; line-height: 1.05; margin: 0; max-width: 900px; text-wrap: balance; }
        .sol-lead { margin: 16px 0 0; font-size: 17px; line-height: 1.6; color: #55524C; max-width: 720px; text-wrap: pretty; }
        ${tileStyles}
        @media (max-width: 767px) {
          .sol-hero { margin-top: 0; padding: 52px 0 60px; }
        }
        @media (max-width: 640px) {
          .sol-wrap { padding: 0 16px; }
          .sol-top { grid-template-columns: minmax(0, 1fr); gap: 16px; }
          .sol-hero h1 { font-size: 38px; }
          .sol-hero-sub { font-size: 17px; }
          .sol-sec { padding: 64px 0; }
          .sol-h2 { font-size: 34px; }        }
      `}</style>

      {/* ── Hero ── */}
      <section className="sol-hero">
        <div className="sol-wrap">
          <div className="sol-top">
            <h1 className="display">Build the best {s.heroTerm} agents</h1>
            <p className="sol-hero-sub">Everything you need to improve your agent.</p>
          </div>
          <AgentLibrary cases={USE_CASES[s.slug]} label={s.navLabel} />
        </div>
      </section>

      {/* ── FeatureStream solutions ── */}
      <SolutionsSection s={s} />

    </main>
  );
}
