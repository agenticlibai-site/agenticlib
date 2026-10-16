import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";
import DemoVideoRegister from "./DemoVideoRegister";

const TITLE = "Watch the demo video – FeatureStream";
const DESCRIPTION =
  "Watch a 2-minute walkthrough of FeatureStream, the product management OS that turns customer, market and usage signals into an evidence-backed product roadmap for AI agents.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/demo-video` },
  openGraph: {
    type: "website",
    siteName: "FeatureStream",
    title: TITLE,
    description: DESCRIPTION,
    url: `${SITE_URL}/demo-video`,
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "FeatureStream" }],
  },
};

export default function DemoVideoPage() {
  return (
    <main className="dvp-page">
      <style>{`
        .dvp-page {
          min-height: 100vh;
          background: #FBF8F3;
          font-family: var(--font-schibsted), system-ui, sans-serif;
          margin-top: -68px;
          padding: 180px 48px 96px;
        }
        .dvp-wrap {
          max-width: 1240px; margin: 0 auto;
          display: grid; grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr);
          gap: 72px; align-items: start;
        }
        .dvp-heading { font-size: 72px; line-height: 0.98; margin: 18px 0 0; text-wrap: balance; }
        .dvp-intro { margin-top: 28px; font-size: 19px; line-height: 1.6; color: #55524C; max-width: 470px; }
        .dvp-points { margin: 28px 0 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 12px; font-size: 16px; color: #000; }
        .dvp-points li { display: flex; gap: 12px; align-items: baseline; }
        .dvp-points li::before { content: ""; flex: none; width: 8px; height: 8px; border-radius: 50%; background: #FF8A73; transform: translateY(-2px); }
        .dvp-card {
          position: relative; background: #fff; border-radius: 24px; padding: 32px;
          border: 1px solid rgba(0,0,0,0.06);
          box-shadow: 0 24px 60px rgba(60,40,20,0.08), 0 2px 8px rgba(0,0,0,0.04);
        }
        .dvp-title { font-family: var(--font-instrument-serif), Georgia, serif; font-weight: 400; font-size: 40px; line-height: 1.05; letter-spacing: -0.01em; margin: 0; color: #000; }
        .dvp-sub { margin: 8px 0 0; font-size: 15px; line-height: 1.5; color: #55524C; }
        .dvp-media { margin-top: 22px; position: relative; border-radius: 14px; overflow: hidden; aspect-ratio: 16 / 9; background: #F6F5F2 center / cover no-repeat; box-shadow: inset 0 0 0 1px rgba(0,0,0,0.06); }
        .dvp-media video { display: block; width: 100%; height: 100%; background: #000; }
        .dvp-play { position: absolute; left: 0; right: 0; bottom: 9%; margin: 0 auto; width: 60px; height: 60px; border-radius: 50%; background: #FF8A73; color: #000; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 22px rgba(232,96,74,0.35); }
        .dvp-form { margin-top: 22px; display: flex; gap: 10px; }
        .dvp-input {
          flex: 1; min-width: 0; box-sizing: border-box; border: 1px solid rgba(0,0,0,0.16); border-radius: 12px;
          padding: 15px 16px; font: inherit; font-size: 15.5px; color: #000; background: #fff; outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .dvp-input::placeholder { color: #8A867F; }
        .dvp-input:focus { border-color: #FF8A73; box-shadow: 0 0 0 3px rgba(255,138,115,0.22); }
        .dvp-submit { justify-content: center; border-radius: 12px; padding: 15px 24px; font-size: 16px; white-space: nowrap; }
        .dvp-fine { margin: 14px 0 0; font-size: 13px; color: #8A867F; }
        .dvp-after { margin-top: 18px; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px; font-size: 15px; color: #55524C; }
        .dvp-after a { color: #000; text-decoration: underline; text-underline-offset: 3px; }
        @media (max-width: 900px) {
          .dvp-page { padding: 130px 16px 64px; }
          .dvp-wrap { grid-template-columns: 1fr; gap: 36px; }
          .dvp-heading { font-size: 48px; }
          .dvp-intro { font-size: 17px; margin-top: 20px; }
          .dvp-card { padding: 20px; border-radius: 20px; }
          .dvp-title { font-size: 32px; }
          .dvp-form { flex-direction: column; }
          .dvp-play { width: 52px; height: 52px; }
        }
      `}</style>

      <div className="dvp-wrap">
        <div>
          <div className="eyebrow" style={{ color: "#55524C" }}>Demo video</div>
          <h1 className="display dvp-heading">See how FeatureStream works</h1>
          <p className="dvp-intro">
            A 2-minute walkthrough of how FeatureStream turns customer, market and usage signals into an evidence-backed product roadmap for your AI agent.
          </p>
          <ul className="dvp-points">
            <li>Connect the tools your team already uses</li>
            <li>See requests and signals ranked by evidence</li>
            <li>Turn them into a roadmap you can defend</li>
          </ul>
        </div>
        <DemoVideoRegister />
      </div>
    </main>
  );
}
