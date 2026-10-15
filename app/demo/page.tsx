import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";
import DemoForm from "./DemoForm";

const TITLE = "Book a demo – FeatureStream";
const DESCRIPTION =
  "If you are an AI agent builder or product owner within an AI agent company, request a demo of FeatureStream and we will reach out to you by email.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/demo` },
  openGraph: {
    type: "website",
    siteName: "FeatureStream",
    title: TITLE,
    description: DESCRIPTION,
    url: `${SITE_URL}/demo`,
    images: [{ url: "/recommendations-cover.png", width: 1200, height: 630, alt: "FeatureStream" }],
  },
};

export default function DemoPage() {
  return (
    <main className="dm-page">
      <style>{`
        .dm-page {
          min-height: 100vh;
          background: #FBF8F3;
          font-family: var(--font-schibsted), system-ui, sans-serif;
          margin-top: -68px;
          padding: 180px 48px 96px;
        }
        .dm-wrap {
          max-width: 1240px; margin: 0 auto;
          display: grid; grid-template-columns: minmax(0, 0.85fr) minmax(0, 1.15fr);
          gap: 72px; align-items: start;
        }
        .dm-heading { font-size: 76px; line-height: 0.98; margin: 18px 0 0; text-wrap: balance; }
        .dm-intro { margin-top: 28px; font-size: 19px; line-height: 1.6; color: #55524C; max-width: 470px; }
        .dm-card {
          position: relative; background: #fff; border-radius: 24px; padding: 44px 44px 48px;
          border: 1px solid rgba(0,0,0,0.06);
          box-shadow: 0 24px 60px rgba(60,40,20,0.08), 0 2px 8px rgba(0,0,0,0.04);
        }
        .dm-title { font-family: var(--font-instrument-serif), Georgia, serif; font-weight: 400; font-size: 40px; line-height: 1.05; letter-spacing: -0.01em; margin: 0; color: #000; }
        .dm-sub { margin: 8px 0 0; font-size: 14px; color: #55524C; }
        .dm-grid { margin-top: 32px; display: grid; grid-template-columns: 1fr 1fr; gap: 24px 22px; }
        .dm-field { display: flex; flex-direction: column; gap: 10px; min-width: 0; }
        .dm-full { grid-column: 1 / -1; }
        .dm-label { display: flex; justify-content: space-between; align-items: baseline; gap: 8px; font-size: 15px; font-weight: 600; color: #000; }
        .dm-req { font-size: 13px; font-weight: 400; color: #55524C; }
        .dm-input {
          width: 100%; box-sizing: border-box; border: 1px solid rgba(0,0,0,0.16); border-radius: 12px;
          padding: 14px 16px; font: inherit; font-size: 15px; color: #000; background: #fff; outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .dm-input::placeholder { color: #8A867F; }
        .dm-input:focus { border-color: #FF8A73; box-shadow: 0 0 0 3px rgba(255,138,115,0.22); }
        .dm-submit { margin-top: 32px; padding: 16px 26px; border-radius: 12px; font-size: 16px; }
        .dm-link { margin-top: 24px; background: none; border: none; padding: 0; color: #55524C; font: inherit; font-size: 14px; text-decoration: underline; cursor: pointer; }
        @media (max-width: 900px) {
          .dm-page { padding: 130px 16px 64px; }
          .dm-wrap { grid-template-columns: 1fr; gap: 36px; }
          .dm-heading { font-size: 48px; }
          .dm-intro { font-size: 17px; margin-top: 20px; }
          .dm-card { padding: 28px 20px 32px; border-radius: 20px; }
          .dm-title { font-size: 32px; }
          .dm-grid { grid-template-columns: 1fr; gap: 20px; }
          .dm-submit { width: 100%; justify-content: center; }
        }
      `}</style>

      <div className="dm-wrap">
        <div>
          <div className="eyebrow" style={{ color: "#55524C" }}>Book a demo</div>
          <h1 className="display dm-heading">Maintain and ship the best agentic products with FeatureStream</h1>
          <p className="dm-intro">
            If you are an AI agent builder or product owner within an AI agent company, request a demo and we will reach out to you by email.
          </p>
        </div>
        <DemoForm />
      </div>
    </main>
  );
}
