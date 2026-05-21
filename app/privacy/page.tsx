import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy - AgenticLib",
  description: "AgenticLib Privacy Policy",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-zinc-100 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-900 transition">
            ← Back to AgenticLib
          </Link>
          <span className="text-xs text-zinc-400">Last updated: January 2026</span>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-14 space-y-8 text-zinc-700 leading-relaxed">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 mb-3">Privacy Policy</h1>
          <p>
            Welcome to AgenticLib. Your privacy is important to us. This Privacy Policy explains how we collect,
            use, disclose, and protect your information when you visit our website:{" "}
            <a href="https://www.agenticlib.com/" className="text-violet-600 underline underline-offset-2">
              https://www.agenticlib.com/
            </a>{" "}
            (the "Site") or use our services (collectively, the "Services").
          </p>
          <p className="mt-3">
            By using our Services, you agree to the collection and use of information in accordance with this Policy.
          </p>
        </div>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-zinc-900">1. Information We Collect</h2>
          <p>We may collect the following types of information:</p>

          <h3 className="font-semibold text-zinc-800">a. Personal Information</h3>
          <p>Information that can be used to identify you, such as:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Name</li>
            <li>Email address</li>
            <li>Account login information</li>
            <li>Any information you provide when contacting us or creating an account</li>
          </ul>

          <h3 className="font-semibold text-zinc-800">b. Non-Personal Information</h3>
          <p>Information that does not personally identify you, including:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Browser type, device, and operating system</li>
            <li>Pages visited and time spent on our Site</li>
            <li>IP address and general location data (country/city level)</li>
            <li>Cookies and usage data</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-zinc-900">2. How We Use Your Information</h2>
          <p>We use your information to:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Provide, maintain, and improve our Services</li>
            <li>Communicate with you, including sending updates and responses</li>
            <li>Analyse usage trends to improve user experience</li>
            <li>Ensure compliance with legal obligations</li>
            <li>Prevent fraudulent or malicious activity</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-zinc-900">3. Cookies and Tracking Technologies</h2>
          <p>We use cookies and similar technologies to:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Keep you signed in</li>
            <li>Remember your preferences</li>
            <li>Analyse site performance</li>
          </ul>
          <p>
            You can disable cookies through your browser settings, though some parts of the Site may not
            function properly if you do.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-zinc-900">4. Data Sharing and Disclosure</h2>
          <p>We do not sell your personal data. We may share your data with:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              Service providers who assist in operating our website or business (e.g., hosting, analytics,
              customer support)
            </li>
            <li>Legal authorities, if required by law or to protect our rights</li>
          </ul>
          <p>All third parties are bound by confidentiality and data protection agreements.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-zinc-900">5. Data Retention</h2>
          <p>
            We retain your information only for as long as necessary to fulfill the purposes outlined in this
            Policy, or as required by law.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-zinc-900">6. Data Security</h2>
          <p>
            We implement reasonable administrative, technical, and physical measures to protect your data.
            However, no online platform is completely secure, and we cannot guarantee absolute security.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-zinc-900">7. Your Rights</h2>
          <p>Depending on your location, you may have rights to:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Access, correct, or delete your data</li>
            <li>Withdraw consent</li>
            <li>Request a copy of your data (data portability)</li>
            <li>File a complaint with a data protection authority</li>
          </ul>
          <p>
            You can contact us at{" "}
            <a href="mailto:agenticlib.ai@gmail.com" className="text-violet-600 underline underline-offset-2">
              agenticlib.ai@gmail.com
            </a>{" "}
            to exercise these rights.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-zinc-900">8. Third-Party Links</h2>
          <p>
            Our Site may contain links to external websites. We are not responsible for their privacy practices
            and encourage you to review their policies.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-zinc-900">9. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy periodically. Changes will be posted on this page with an updated
            "Last Updated" date.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-zinc-900">10. Contact Us</h2>
          <p>If you have questions or concerns about this Privacy Policy, please contact us at:</p>
          <p>
            📧{" "}
            <a href="mailto:agenticlib.ai@gmail.com" className="text-violet-600 underline underline-offset-2">
              agenticlib.ai@gmail.com
            </a>
            <br />
            🌐{" "}
            <a href="https://www.agenticlib.com/" className="text-violet-600 underline underline-offset-2">
              https://www.agenticlib.com/
            </a>
          </p>
        </section>
      </div>

      {/* Footer */}
      <div className="border-t border-zinc-100 px-6 py-6 text-center text-xs text-zinc-400">
        © 2026 AgenticLib ·{" "}
        <Link href="/terms" className="hover:text-zinc-600 transition">
          Terms &amp; Conditions
        </Link>
      </div>
    </div>
  );
}
