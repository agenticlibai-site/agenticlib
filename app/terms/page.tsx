import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions - AgenticLib",
  description: "AgenticLib Terms and Conditions",
};

export default function TermsPage() {
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
          <h1 className="text-3xl font-bold text-zinc-900 mb-3">Terms &amp; Conditions</h1>
          <p>
            Welcome to AgenticLib. These Terms and Conditions ("Terms") govern your use of our website:{" "}
            <a href="https://www.agenticlib.com" className="text-violet-600 underline underline-offset-2">
              https://www.agenticlib.com
            </a>{" "}
            (the "Site"), and any related products or services (collectively, the "Services").
          </p>
          <p className="mt-3">
            By accessing or using AgenticLib, you agree to comply with and be bound by these Terms. If you do
            not agree, please do not use our Services.
          </p>
        </div>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-zinc-900">1. Use of Our Services</h2>
          <p>You must use our Services only for lawful purposes and in accordance with these Terms.</p>
          <p>You agree not to:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Violate any applicable laws or regulations</li>
            <li>Attempt to gain unauthorised access to our systems or data</li>
            <li>Use the Site to transmit spam, malware, or harmful content</li>
            <li>Copy, distribute, or reproduce content without permission</li>
          </ul>
          <p>
            We reserve the right to suspend or terminate your access to AgenticLib if you violate these Terms.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-zinc-900">2. Intellectual Property</h2>
          <p>
            All content, design, features, and functionality on AgenticLib — including logos, text, graphics,
            software, and data — are the intellectual property of AgenticLib and are protected by copyright,
            trademark, and other applicable laws.
          </p>
          <p>
            You may not use, reproduce, or distribute any content from AgenticLib without prior written consent.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-zinc-900">3. User Accounts</h2>
          <p>If you create an account with us:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>You are responsible for maintaining the confidentiality of your login credentials.</li>
            <li>You agree to provide accurate and complete information.</li>
            <li>You must immediately notify us of any unauthorised use of your account.</li>
          </ul>
          <p>We are not liable for any loss or damage arising from your failure to protect your account.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-zinc-900">4. Third-Party Links</h2>
          <p>
            AgenticLib may contain links to third-party websites or services. We are not responsible for the
            content, privacy policies, or practices of those third parties. Accessing such links is at your own
            risk.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-zinc-900">5. Disclaimers</h2>
          <p>AgenticLib provides information and listings "as is" and "as available."</p>
          <p>We make no warranties or representations, express or implied, about:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>The accuracy or reliability of any content</li>
            <li>The completeness or suitability of data provided by AI tools or third parties</li>
            <li>The uninterrupted or error-free operation of the Site</li>
          </ul>
          <p>Use of AgenticLib is at your own discretion and risk.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-zinc-900">6. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, AgenticLib and its affiliates shall not be liable for any
            indirect, incidental, or consequential damages arising from your use of the Site or Services,
            including but not limited to loss of data, profits, or business opportunities.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-zinc-900">7. Indemnification</h2>
          <p>
            You agree to indemnify and hold harmless AgenticLib, its founders, employees, and affiliates from
            any claims, losses, or damages resulting from your breach of these Terms or misuse of the Services.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-zinc-900">8. Changes to These Terms</h2>
          <p>
            We may update these Terms from time to time. Any changes will be posted on this page with the
            updated "Last Updated" date. Continued use of the Services after updates constitutes your acceptance
            of the revised Terms.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-zinc-900">9. Governing Law</h2>
          <p>
            These Terms are governed by and construed in accordance with the laws of New South Wales, Australia,
            without regard to conflict of law principles.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-zinc-900">10. Contact Us</h2>
          <p>If you have any questions about these Terms, please contact us at:</p>
          <p>
            📧{" "}
            <a href="mailto:agenticlib.ai@gmail.com" className="text-violet-600 underline underline-offset-2">
              agenticlib.ai@gmail.com
            </a>
            <br />
            🌐{" "}
            <a href="https://www.agenticlib.com" className="text-violet-600 underline underline-offset-2">
              https://www.agenticlib.com
            </a>
          </p>
        </section>
      </div>

      {/* Footer */}
      <div className="border-t border-zinc-100 px-6 py-6 text-center text-xs text-zinc-400">
        © 2026 AgenticLib ·{" "}
        <Link href="/privacy" className="hover:text-zinc-600 transition">
          Privacy Policy
        </Link>
      </div>
    </div>
  );
}
