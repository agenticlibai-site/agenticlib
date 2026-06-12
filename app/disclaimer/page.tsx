import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Web Disclaimer - AgenticLib",
  description: "AgenticLib Web Disclaimer",
};

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-zinc-100 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-900 transition">
            &larr; Back to AgenticLib
          </Link>
          <span className="text-xs text-zinc-400">Last updated: June 2026</span>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-14 space-y-10 text-zinc-700 leading-relaxed">

        <div>
          <h1 className="text-3xl font-bold text-zinc-900 mb-3">Web Disclaimer</h1>
          <p className="text-sm text-zinc-500">Last updated: June 2026</p>
        </div>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-zinc-900 uppercase tracking-wide text-sm">No warranties</h2>
          <p className="font-medium text-zinc-800">
            ALL CONTENT, AGENT LISTINGS, RECOMMENDATIONS, AND RELATED INFORMATION ON THIS WEBSITE ARE PROVIDED
            FOR INFORMATIONAL PURPOSES ONLY. AGENTICLIB MAKES NO WARRANTIES, EXPRESS, IMPLIED, OR STATUTORY,
            REGARDING THE ACCURACY, COMPLETENESS, OR SUITABILITY OF ANY INFORMATION PUBLISHED ON THIS PLATFORM.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-zinc-900">Informational purposes only</h2>
          <p>
            The information contained on AgenticLib - including AI agent profiles, domain categorisations,
            capability comparisons, and recommendation outputs - represents AgenticLib&apos;s view as of the date
            it is published. Agent capabilities, pricing, availability, and integrations change frequently.
            Content on this platform should not be interpreted as a guarantee of any agent&apos;s performance,
            fitness for purpose, or commercial availability.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-zinc-900">Third-party agents &amp; services</h2>
          <p>
            AgenticLib does not own, operate, or endorse any of the AI agents listed on this platform. We do
            not control the services, pricing, data practices, or terms of any third-party agent provider.
            AgenticLib specifically disclaims any liability arising from your use of, or reliance on, any agent
            discovered or recommended through this platform. Any engagement with a third-party agent is solely
            at your own risk.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-zinc-900">Recommendation engine</h2>
          <p>
            AgenticLib&apos;s AI-powered recommendation engine generates suggestions based on user-provided inputs
            and our internal knowledge base. These outputs are automated and do not constitute professional,
            legal, technical, or business advice. Results may not be exhaustive, and AgenticLib does not
            guarantee that the most suitable agent for your use case will appear in any recommendation output.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-zinc-900">Changes to content</h2>
          <p>
            AgenticLib may at any time update, revise, add, or remove agent listings, domain categories,
            platform features, and any other content on this website. Where material changes are made, an
            updated publication date will be reflected on the relevant page. We recommend checking this
            platform periodically to stay informed of any updates.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-zinc-900">Limitation of liability</h2>
          <p className="font-medium text-zinc-800">
            TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, AGENTICLIB AND ITS AFFILIATES, OFFICERS,
            EMPLOYEES, AND AGENTS SHALL NOT BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, OR
            CONSEQUENTIAL DAMAGES ARISING OUT OF OR IN CONNECTION WITH YOUR USE OF THIS PLATFORM OR RELIANCE
            ON ANY CONTENT HEREIN.
          </p>
        </section>

      </div>

      {/* Footer */}
      <div className="border-t border-zinc-100 px-6 py-6">
        <div className="max-w-3xl mx-auto flex flex-wrap gap-x-6 gap-y-2 text-xs text-zinc-400">
          <Link href="/privacy" className="hover:text-zinc-700 transition">Privacy Policy</Link>
          <Link href="/terms"   className="hover:text-zinc-700 transition">Terms &amp; Conditions</Link>
          <Link href="/disclaimer" className="hover:text-zinc-700 transition">Web Disclaimer</Link>
        </div>
      </div>
    </div>
  );
}
