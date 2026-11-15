import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SITE_URL } from "@/lib/site";

const TITLE = "Security and privacy";
const DESCRIPTION =
  "How FeatureStream protects your customer requests, lost deals and support tickets: encryption, a private database for every customer, access control and human approval.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/security` },
  openGraph: {
    type: "website",
    siteName: "FeatureStream",
    title: `${TITLE} – FeatureStream`,
    description: DESCRIPTION,
    url: `${SITE_URL}/security`,
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "FeatureStream" }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${TITLE} – FeatureStream`,
    description: DESCRIPTION,
    images: ["/og-image.png"],
  },
};

const ic = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

const PROTECTIONS: { icon: ReactNode; title: string; body: string }[] = [
  {
    icon: (
      <svg {...ic}>
        <rect x="5" y="11" width="14" height="9" rx="2" />
        <path d="M8 11V8a4 4 0 018 0v3" />
      </svg>
    ),
    title: "Data protection",
    body: "Data is encrypted in transit and at rest.",
  },
  {
    icon: (
      <svg {...ic}>
        <ellipse cx="12" cy="6" rx="7" ry="3" />
        <path d="M5 6v12c0 1.7 3.1 3 7 3s7-1.3 7-3V6" />
        <path d="M5 12c0 1.7 3.1 3 7 3s7-1.3 7-3" />
      </svg>
    ),
    title: "Your own database",
    body: "Each customer’s data is kept in its own separate database, in the region you choose, so no other team can see it.",
  },
  {
    icon: (
      <svg {...ic}>
        <path d="M12 3v3M12 18v3M3 12h3M18 12h3" />
        <rect x="7" y="7" width="10" height="10" rx="2" />
        <path d="M10 12h4" />
      </svg>
    ),
    title: "AI model handling",
    body: "Your data is sent to AI providers only to produce your results, under commercial terms that don’t allow it to be used for training.",
  },
  {
    icon: (
      <svg {...ic}>
        <circle cx="10" cy="8" r="3.5" />
        <path d="M3.5 20c.8-3.5 3.4-5.5 6.5-5.5 1.2 0 2.3.3 3.2.8" />
        <rect x="15" y="15" width="6" height="5" rx="1" />
        <path d="M16.5 15v-1.2a1.5 1.5 0 013 0V15" />
      </svg>
    ),
    title: "Access control",
    body: "Sign-in with multi-factor authentication, single sign-on through your own identity provider, and role-based permissions.",
  },
  {
    icon: (
      <svg {...ic}>
        <rect x="4" y="4" width="16" height="7" rx="2" />
        <rect x="4" y="13" width="16" height="7" rx="2" />
        <path d="M8 7.5h.01M8 16.5h.01" />
      </svg>
    ),
    title: "Infrastructure",
    body: "Runs on established cloud providers with access logging. Credentials are stored as managed secrets, never in code.",
  },
  {
    icon: (
      <svg {...ic}>
        <path d="M12 3l7 3v5c0 4.5-3 8.2-7 10-4-1.8-7-5.5-7-10V6z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
    title: "Compliance",
    body: "SOC 2 is on our roadmap, and we’ll go through your data-handling policies with you before you connect anything.",
  },
];

export default function SecurityPage() {
  return (
    <main className="sec-page">
      <style>{`
        .sec-page { font-family: var(--font-schibsted), system-ui, sans-serif; color: #000; background: #fff; }
        .sec-wrap { max-width: 1120px; margin: 0 auto; padding: 0 32px; }
        .sec-hero { margin-top: -68px; padding: 200px 0 96px; text-align: center; background: linear-gradient(180deg, #FFB4A3 0%, #FFD3C8 40%, #FFF1EC 75%, #FFFFFF 100%); }
        .sec-hero h1 { margin: 18px auto 0; font-size: 68px; line-height: 1.02; color: #E8604A; max-width: 820px; text-wrap: balance; }
        .sec-sec { padding: 32px 0 96px; }
        .sec-h2 { margin: 0; font-size: 48px; line-height: 1.05; text-wrap: balance; }
        .sec-grid { margin-top: 44px; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 0 48px; }
        .sec-item { border-top: 1px solid #E6E2DB; padding: 28px 0 32px; }
        .sec-item h3 { display: flex; align-items: center; gap: 10px; margin: 0; font-size: 18px; font-weight: 600; color: #22201C; }
        .sec-item h3 svg { color: #E8604A; flex-shrink: 0; }
        .sec-item p { margin: 12px 0 0; font-size: 16px; line-height: 1.6; color: #55524C; text-wrap: pretty; }
        @media (max-width: 1000px) { .sec-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
        @media (max-width: 767px) { .sec-hero { margin-top: 0; padding: 80px 0 64px; } }
        @media (max-width: 640px) {
          .sec-wrap { padding: 0 16px; }
          .sec-hero h1 { font-size: 40px; }
          .sec-sec { padding: 16px 0 64px; }
          .sec-h2 { font-size: 32px; }
          .sec-grid { grid-template-columns: minmax(0, 1fr); }
          .sec-item { padding: 22px 0 24px; }
        }
      `}</style>

      <section className="sec-hero">
        <div className="sec-wrap">
          <span className="eyebrow" style={{ color: "#55524C" }}>
            Security
          </span>
          <h1 className="display">Security and privacy, built in.</h1>
        </div>
      </section>

      <section className="sec-sec">
        <div className="sec-wrap">
          <h2 className="sec-h2 display">How FeatureStream protects your data.</h2>
          <div className="sec-grid">
            {PROTECTIONS.map((p) => (
              <div key={p.title} className="sec-item">
                <h3>
                  {p.icon}
                  {p.title}
                </h3>
                <p>{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
