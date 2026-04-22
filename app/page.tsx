"use client";
import Link from "next/link";
import { useState } from "react";
import { domains } from "@/data/agents";
import { useRouter, usePathname } from "next/navigation";
import posthog from "posthog-js";


export default function Home() {
  const [query, setQuery] = useState("");
  const [showPrivacy, setShowPrivacy] = useState(false);
const [showTerms, setShowTerms] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const handleSearch = () => {
    const q = query.toLowerCase().trim();

    const match = domains.find((d) =>
      d.name.toLowerCase().includes(q) ||
      d.slug.toLowerCase().includes(q)
    );

    posthog.capture("library_searched", {
      query: q,
      matched_domain: match?.slug ?? null,
    });

    if (match) {
      router.push(`/domains/${match.slug}`);
    } else {
      router.push("/domains");
    }
  };

  return (
    <div className="page-bg relative text-zinc-900 font-sans">

      {/* Background blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute -top-48 -left-48 w-[640px] h-[640px] rounded-full" style={{ background: "rgba(147,197,253,0.22)", filter: "blur(80px)" }} />
        <div className="absolute -top-32 -right-48 w-[560px] h-[560px] rounded-full" style={{ background: "rgba(167,139,250,0.20)", filter: "blur(80px)" }} />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full" style={{ background: "rgba(249,168,212,0.12)", filter: "blur(72px)" }} />
      </div>

      {/* NAVBAR */}
      <header className="fixed top-0 inset-x-0 z-[999] px-4 pt-3 pointer-events-auto">
        <div className="max-w-6xl mx-auto bg-white/70 backdrop-blur-md border border-white/20 shadow-sm rounded-xl px-6 py-3 flex items-center justify-between">

          {/* LOGO ✅ */}
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="AgenticLib logo" className="h-6 w-auto" />
            <span className="text-lg font-semibold tracking-tight">
              AgenticLib
            </span>
          </div>

<nav className="flex items-center gap-8">

  {/* AI Agent Library */}
  <button
    onClick={() => {
      if (pathname === "/") {
        document.getElementById("library")?.scrollIntoView({ behavior: "smooth" });
      } else {
        router.push("/#library");
      }
    }}
    className="transition px-3 py-1 rounded-full text-zinc-500 hover:text-black hover:bg-purple-100"
  >
    AI Agent Library
  </button>

  {/* AgenticLib Platform + Badge */}
<div className="flex items-center gap-[1px]">
  <button
onClick={() =>
  window.open(
    "https://chatgpt.com/g/g-69795c1eeb808191beea0005fdc16126-agenticlib-decision-engine",
    "_blank"
  )
}
    className={`transition px-3 py-1 rounded-full ${
      pathname === "/recommend"
        ? "bg-purple-100 text-black"
        : "text-zinc-500 hover:text-black hover:bg-pink-100"
    }`}
  >
    AgenticLib Platform
  </button>

  <span className="
    text-[11px] font-medium leading-none
    px-2.5 py-[2px]
    rounded-full
    bg-green-100
    text-green-700
    border border-green-200
    whitespace-nowrap
  ">
    Alpha v1.0
  </span>
</div>

  {/* Blog */}
  <button
    onClick={() => router.push("/blog")}
    className={`transition px-3 py-1 rounded-full ${
      pathname === "/blog"
        ? "bg-orange-100 text-black"
        : "text-zinc-500 hover:text-black hover:bg-orange-100"
    }`}
  >
    Blog
  </button>

  {/* Contact Us */}
  <button
    onClick={() => {
      if (pathname === "/") {
        document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
      } else {
        router.push("/#contact");
      }
    }}
    className="transition px-3 py-1 rounded-full text-zinc-500 hover:text-black hover:bg-zinc-100"
  >
    Contact Us
  </button>

</nav>

          <button
onClick={() => {
  posthog.capture("get_started_clicked", { location: "navbar" });
  window.open(
    "https://chatgpt.com/g/g-69795c1eeb808191beea0005fdc16126-ai-agent-decision-engine",
    "_blank"
  );
}}
            className="text-sm font-medium bg-zinc-900 text-white px-4 py-2 rounded-full"
          >
            Get started
          </button>
        </div>
      </header>

      <main className="pt-16 relative z-0">

        {/* HERO */}
        <section className="relative z-0 max-w-6xl mx-auto px-6 pt-28 pb-8 text-center">

          <div className="inline-flex items-center gap-2 bg-white/60 border text-zinc-600 text-xs px-3 py-1.5 rounded-full mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            250+ agents across 90+ Business Domains
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-semibold mb-5">
            Get the right <span className="gradient-text">AI agent</span> in seconds
          </h1>

          <p className="text-lg text-zinc-500 mb-12">
            Tell us your workflow or use case → we compare and recommend the best agents
          </p>

          <div className="flex flex-col items-center gap-4">
            <p className="text-xs uppercase text-zinc-400">
          
            </p>

            <div className="flex flex-col sm:flex-row gap-3">

              {/* 🔥 THIS BUTTON IS NOW FIXED */}
<a
  href="https://chatgpt.com/g/g-69795c1eeb808191beea0005fdc16126-agenticlib-decision-engine"
  target="_blank"
  rel="noopener noreferrer"
  className="btn-primary px-9 py-4 rounded-full text-white"
  onClick={() => posthog.capture("hero_cta_clicked", { location: "hero" })}
>
  Get personalised AI agent recommendations
</a>

              <a href="#demo" className="px-6 py-4 rounded-full border bg-white/50">
                Watch demo
              </a>

            </div>
          </div>

        </section>


        {/* LIBRARY */}
        <section id="library" className="pt-4 pb-16">
          <div className="max-w-[960px] mx-auto px-6">
            <div
              className="p-9"
              style={{
                background: "linear-gradient(135deg, #fafbff 0%, #f5f7ff 100%)",
                border: "1px solid #e2e8f0",
                borderRadius: "1.5rem",
                boxShadow: "0 4px 20px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)",
              }}
            >

              <h2 className="text-2xl font-semibold text-center mb-1 text-zinc-800">
                Explore AI Agent Library
              </h2>

              <p className="text-center text-zinc-500 text-sm mb-6">
                Browse 250+ agents across 90+ business domains
              </p>

              <div className="flex flex-col sm:flex-row gap-3 items-center">

                {/* Search — dominant, ~55% */}
                <input
                  type="text"
                  placeholder="Search business domains..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSearch();
                  }}
                  className="w-full sm:flex-[2] px-4 py-2.5 rounded-xl bg-white border border-blue-200 text-zinc-700 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                />

                {/* Dropdown — ~33% */}
                <div className="relative w-full sm:flex-[2]">
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        posthog.capture("domain_selected_from_dropdown", {
                          domain_slug: e.target.value,
                        });
                        router.push(`/domains/${e.target.value}`);
                      }
                    }}
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-blue-200 text-zinc-700 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    defaultValue=""
                  >
                    <option value="">Select Business Domain</option>

                    {domains.map((d) => (
                      <option key={d.slug} value={d.slug}>
                        {d.name}
                      </option>
                    ))}
                  </select>

                  <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-zinc-400 text-xs">
                    ▼
                  </div>
                </div>

                {/* Button — fixed, ~18% */}
                <button
                  onClick={() => {
                    posthog.capture("library_explore_clicked");
                    router.push("/domains");
                  }}
                  className="w-full sm:flex-1 px-6 py-2.5 rounded-xl text-white font-medium transition hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap"
                  style={{
                    background: "linear-gradient(135deg, #6c4cf1 0%, #4f7cf5 100%)",
                    boxShadow: "0 4px 14px rgba(108,76,241,0.25)",
                  }}
                >
                  Explore →
                </button>

              </div>
            </div>
          </div>
        </section>


        {/* DEMO */}
        <section id="demo" className="py-20 text-center">

          <h2 className="text-3xl font-semibold mb-3">
            See how it works
          </h2>

          <p className="text-zinc-500 mb-8">
            Watch how AgenticLib finds the best AI agent for your exact use case
          </p>

          <div className="max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-xl border">
            <iframe
              src="https://www.loom.com/embed/6abf23d5fb63444c907280e915098420"
              frameBorder="0"
              allowFullScreen
              className="w-full h-[400px] md:h-[500px]"
            />
          </div>

        </section>

      </main>

      <section id="contact" className="mt-20 mb-10 px-6">
  <div className="max-w-4xl mx-auto text-center">

    <h3 className="text-lg font-semibold text-gray-600 mb-6">
      Connect with AgenticLib
    </h3>

    <div className="flex flex-wrap justify-center gap-4">

      <a
        href="https://www.linkedin.com/company/108024233/"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-4 py-2 rounded-full border bg-white/60 hover:bg-white hover:shadow-md transition"
      >
        🔗 <span>LinkedIn</span>
      </a>

      <a
        href="mailto:agenticlib.ai@gmail.com"
        className="flex items-center gap-2 px-4 py-2 rounded-full border bg-white/60 hover:bg-white hover:shadow-md transition"
      >
        ✉️ <span>Email</span>
      </a>

      <a
        href="https://x.com/AgenticLibAI/status/1960527278087266557"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-4 py-2 rounded-full border bg-white/60 hover:bg-white hover:shadow-md transition"
      >
        𝕏 <span>X</span>
      </a>

      <a
        href="https://www.producthunt.com/p/self-promotion/agenticlib-simplifying-your-ai-agent-discovery-journey"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-4 py-2 rounded-full border bg-white/60 hover:bg-white hover:shadow-md transition"
      >
        🟠 <span>Product Hunt</span>
      </a>

      <a
        href="https://www.reddit.com/r/SideProject/comments/1m6bfy1/agenticlib_simplifying_your_ai_agent_discovery/"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-4 py-2 rounded-full border bg-white/60 hover:bg-white hover:shadow-md transition"
      >
        👽 <span>Reddit</span>
      </a>

    </div>
  </div>
</section>

{/* 🔥 BLACKBIRD GIANTS CLEAN STRIP */}
<section className="px-6 pb-12">

  <div className="max-w-4xl mx-auto text-center">

    {/* TEXT */}
    <p className="text-lg font-semibold text-zinc-800 mb-4">
      Selected for Blackbird (VC) Giants
    </p>

    {/* IMAGE (CLICKABLE) */}
    <a 
      href="https://www.blackbird.vc/giants" 
      target="_blank" 
      rel="noopener noreferrer"
    >
      <img
        src="/blackbird.png"
        alt="Blackbird Giants"
        className="w-full h-40 object-cover object-[center_30%] rounded-2xl shadow-md cursor-pointer hover:opacity-90 hover:-translate-y-0.5 transition"
      />
    </a>

  </div>

</section>

{/* 🔥 LEGAL SECTION */}
<section className="px-6 pb-10">

  <div className="max-w-4xl mx-auto text-center">

    {/* Buttons */}
    <div className="flex justify-center gap-4 mb-6">
      <button
        onClick={() => {
          setShowPrivacy(!showPrivacy);
          setShowTerms(false);
        }}
        className="px-4 py-2 border rounded-full hover:bg-gray-100"
      >
        Privacy Policy
      </button>

      <button
        onClick={() => {
          setShowTerms(!showTerms);
          setShowPrivacy(false);
        }}
        className="px-4 py-2 border rounded-full hover:bg-gray-100"
      >
        Terms & Conditions
      </button>
    </div>

{showPrivacy && (
  <div className="text-left max-w-3xl mx-auto space-y-4 text-sm leading-relaxed">

    <h2 className="text-xl font-semibold">Privacy Policy</h2>

    <p>
      Welcome to AgenticLib. Your privacy is important to us. This Privacy Policy explains how we collect, use, disclose, and protect your information when you visit our website: https://www.agenticlib.com/ (the “Site”) or use our services (collectively, the “Services”).
    </p>

    <p>
      By using our Services, you agree to the collection and use of information in accordance with this Policy.
    </p>

    <h3 className="font-semibold">1. Information We Collect</h3>
    <p>We may collect the following types of information:</p>

    <h4 className="font-medium">a. Personal Information</h4>
    <p>Information that can be used to identify you, such as:</p>
    <ul className="list-disc ml-5">
      <li>Name</li>
      <li>Email address</li>
      <li>Account login information</li>
      <li>Any information you provide when contacting us or creating an account</li>
    </ul>

    <h4 className="font-medium">b. Non-Personal Information</h4>
    <p>Information that does not personally identify you, including:</p>
    <ul className="list-disc ml-5">
      <li>Browser type, device, and operating system</li>
      <li>Pages visited and time spent on our Site</li>
      <li>IP address and general location data (country/city level)</li>
      <li>Cookies and usage data</li>
    </ul>

    <h3 className="font-semibold">2. How We Use Your Information</h3>
    <p>We use your information to:</p>
    <ul className="list-disc ml-5">
      <li>Provide, maintain, and improve our Services</li>
      <li>Communicate with you, including sending updates and responses</li>
      <li>Analyse usage trends to improve user experience</li>
      <li>Ensure compliance with legal obligations</li>
      <li>Prevent fraudulent or malicious activity</li>
    </ul>

    <h3 className="font-semibold">3. Cookies and Tracking Technologies</h3>
    <p>We use cookies and similar technologies to:</p>
    <ul className="list-disc ml-5">
      <li>Keep you signed in</li>
      <li>Remember your preferences</li>
      <li>Analyse site performance</li>
    </ul>
    <p>
      You can disable cookies through your browser settings, though some parts of the Site may not function properly if you do.
    </p>

    <h3 className="font-semibold">4. Data Sharing and Disclosure</h3>
    <p>We do not sell your personal data. We may share your data with:</p>
    <ul className="list-disc ml-5">
      <li>Service providers who assist in operating our website or business (e.g., hosting, analytics, customer support)</li>
      <li>Legal authorities, if required by law or to protect our rights</li>
    </ul>
    <p>All third parties are bound by confidentiality and data protection agreements.</p>

    <h3 className="font-semibold">5. Data Retention</h3>
    <p>
      We retain your information only for as long as necessary to fulfill the purposes outlined in this Policy, or as required by law.
    </p>

    <h3 className="font-semibold">6. Data Security</h3>
    <p>
      We implement reasonable administrative, technical, and physical measures to protect your data. However, no online platform is completely secure, and we cannot guarantee absolute security.
    </p>

    <h3 className="font-semibold">7. Your Rights</h3>
    <p>Depending on your location, you may have rights to:</p>
    <ul className="list-disc ml-5">
      <li>Access, correct, or delete your data</li>
      <li>Withdraw consent</li>
      <li>Request a copy of your data (data portability)</li>
      <li>File a complaint with a data protection authority</li>
    </ul>
    <p>
      You can contact us at agenticlib.ai@gmail.com to exercise these rights.
    </p>

    <h3 className="font-semibold">8. Third-Party Links</h3>
    <p>
      Our Site may contain links to external websites. We are not responsible for their privacy practices and encourage you to review their policies.
    </p>

    <h3 className="font-semibold">9. Changes to This Policy</h3>
    <p>
      We may update this Privacy Policy periodically. Changes will be posted on this page with an updated “Last Updated” date.
    </p>

    <h3 className="font-semibold">10. Contact Us</h3>
    <p>
      If you have questions or concerns about this Privacy Policy, please contact us at:
    </p>
    <p>
      📧 agenticlib.ai@gmail.com <br />
      🌐 https://www.agenticlib.com/
    </p>

  </div>
)}

{showTerms && (
  <div className="text-left max-w-3xl mx-auto space-y-4 text-sm leading-relaxed">

    <h2 className="text-xl font-semibold">Terms & Conditions</h2>

    <p>
      Welcome to AgenticLib. These Terms and Conditions (“Terms”) govern your use of our website: https://www.agenticlib.com (the “Site”), and any related products or services (collectively, the “Services”).
    </p>

    <p>
      By accessing or using AgenticLib, you agree to comply with and be bound by these Terms. If you do not agree, please do not use our Services.
    </p>

    <h3 className="font-semibold">1. Use of Our Services</h3>
    <p>
      You must use our Services only for lawful purposes and in accordance with these Terms.
    </p>
    <p>You agree not to:</p>
    <ul className="list-disc ml-5">
      <li>Violate any applicable laws or regulations</li>
      <li>Attempt to gain unauthorised access to our systems or data</li>
      <li>Use the Site to transmit spam, malware, or harmful content</li>
      <li>Copy, distribute, or reproduce content without permission</li>
    </ul>
    <p>
      We reserve the right to suspend or terminate your access to AgenticLib if you violate these Terms.
    </p>

    <h3 className="font-semibold">2. Intellectual Property</h3>
    <p>
      All content, design, features, and functionality on AgenticLib — including logos, text, graphics, software, and data — are the intellectual property of AgenticLib and are protected by copyright, trademark, and other applicable laws.
    </p>
    <p>
      You may not use, reproduce, or distribute any content from AgenticLib without prior written consent.
    </p>

    <h3 className="font-semibold">3. User Accounts</h3>
    <p>If you create an account with us:</p>
    <ul className="list-disc ml-5">
      <li>You are responsible for maintaining the confidentiality of your login credentials.</li>
      <li>You agree to provide accurate and complete information.</li>
      <li>You must immediately notify us of any unauthorised use of your account.</li>
    </ul>
    <p>
      We are not liable for any loss or damage arising from your failure to protect your account.
    </p>

    <h3 className="font-semibold">4. Third-Party Links</h3>
    <p>
      AgenticLib may contain links to third-party websites or services. We are not responsible for the content, privacy policies, or practices of those third parties. Accessing such links is at your own risk.
    </p>

    <h3 className="font-semibold">5. Disclaimers</h3>
    <p>
      AgenticLib provides information and listings “as is” and “as available.”
    </p>
    <p>We make no warranties or representations, express or implied, about:</p>
    <ul className="list-disc ml-5">
      <li>The accuracy or reliability of any content</li>
      <li>The completeness or suitability of data provided by AI tools or third parties</li>
      <li>The uninterrupted or error-free operation of the Site</li>
    </ul>
    <p>
      Use of AgenticLib is at your own discretion and risk.
    </p>

    <h3 className="font-semibold">6. Limitation of Liability</h3>
    <p>
      To the maximum extent permitted by law, AgenticLib and its affiliates shall not be liable for any indirect, incidental, or consequential damages arising from your use of the Site or Services, including but not limited to loss of data, profits, or business opportunities.
    </p>

    <h3 className="font-semibold">7. Indemnification</h3>
    <p>
      You agree to indemnify and hold harmless AgenticLib, its founders, employees, and affiliates from any claims, losses, or damages resulting from your breach of these Terms or misuse of the Services.
    </p>

    <h3 className="font-semibold">8. Changes to These Terms</h3>
    <p>
      We may update these Terms from time to time. Any changes will be posted on this page with the updated “Last Updated” date. Continued use of the Services after updates constitutes your acceptance of the revised Terms.
    </p>

    <h3 className="font-semibold">9. Governing Law</h3>
    <p>
      These Terms are governed by and construed in accordance with the laws of New South Wales, Australia, without regard to conflict of law principles.
    </p>

    <h3 className="font-semibold">10. Contact Us</h3>
    <p>
      If you have any questions about these Terms, please contact us at:
    </p>
    <p>
      📧 agenticlib.ai@gmail.com <br />
      🌐 https://www.agenticlib.com
    </p>

  </div>
)}

  </div>
</section>

<footer className="py-10 text-center text-sm text-zinc-400">
  © 2026 AgenticLib
</footer>

</div>
  );
}