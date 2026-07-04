"use client";

import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import FeedbackBox from "@/components/FeedbackBox";
import posthog from "posthog-js";
import { trackEvent } from "@/lib/analytics";

// ── Helpers ──────────────────────────────────────────────────────────────────

type MDProps = { children?: ReactNode };

function splitIntoSections(markdown: string): { heading: string | null; content: string }[] {
  const parts = markdown.split(/^(?=## )/m);
  const sections: { heading: string | null; content: string }[] = [];

  for (const part of parts) {
    const match = part.match(/^## (.+?)\n([\s\S]*)/);
    if (match) {
      sections.push({ heading: match[1].trim(), content: match[2].trim() });
    } else if (part.trim()) {
      sections.push({ heading: null, content: part.trim() });
    }
  }
  return sections;
}

const mdComponents = {
  p: ({ children }: MDProps) => (
    <p className="text-black leading-relaxed mb-3 text-sm">{children}</p>
  ),
  h1: ({ children }: MDProps) => (
    <h1 className="text-xl font-semibold text-black mb-3">{children}</h1>
  ),
  h3: ({ children }: MDProps) => (
    <h3 className="text-base font-semibold text-black mb-2 mt-3">{children}</h3>
  ),
  ul: ({ children }: MDProps) => (
    <ul className="list-disc list-outside pl-5 space-y-1 mb-3 text-sm text-black">{children}</ul>
  ),
  ol: ({ children }: MDProps) => (
    <ol className="list-decimal list-outside pl-5 space-y-1 mb-3 text-sm text-black">{children}</ol>
  ),
  li: ({ children }: MDProps) => <li className="leading-relaxed">{children}</li>,
  strong: ({ children }: MDProps) => (
    <strong className="font-semibold text-black">{children}</strong>
  ),
  table: ({ children }: MDProps) => (
    <div className="w-full my-3 rounded-xl overflow-hidden border border-gray-200">
      <table className="w-full table-fixed text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }: MDProps) => <thead className="bg-gray-50">{children}</thead>,
  tbody: ({ children }: MDProps) => <tbody>{children}</tbody>,
  th: ({ children }: MDProps) => (
    <th className="p-2.5 text-left text-xs font-semibold text-black/60 uppercase tracking-wide break-words whitespace-normal border-b border-gray-200">
      {children}
    </th>
  ),
  tr: ({ children }: MDProps) => (
    <tr className="border-b border-gray-100 last:border-0 hover:bg-gray-50/60 transition-colors">
      {children}
    </tr>
  ),
  td: ({ children }: MDProps) => (
    <td className="p-2.5 text-black break-words whitespace-normal leading-relaxed align-top text-sm">
      {children}
    </td>
  ),
};

const mdComponentsDark = {
  ...mdComponents,
  p: ({ children }: MDProps) => (
    <p className="text-white/90 leading-relaxed mb-3 text-sm">{children}</p>
  ),
  h3: ({ children }: MDProps) => (
    <h3 className="text-base font-semibold text-white mb-2 mt-3">{children}</h3>
  ),
  ul: ({ children }: MDProps) => (
    <ul className="list-disc list-outside pl-5 space-y-1 mb-3 text-sm text-white/90">{children}</ul>
  ),
  ol: ({ children }: MDProps) => (
    <ol className="list-decimal list-outside pl-5 space-y-1 mb-3 text-sm text-white/90">{children}</ol>
  ),
  li: ({ children }: MDProps) => <li className="leading-relaxed text-white/90">{children}</li>,
  strong: ({ children }: MDProps) => (
    <strong className="font-semibold text-white">{children}</strong>
  ),
  table: ({ children }: MDProps) => (
    <div className="w-full my-3 rounded-xl overflow-hidden border border-white/20">
      <table className="w-full table-fixed text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }: MDProps) => <thead className="bg-white/10">{children}</thead>,
  th: ({ children }: MDProps) => (
    <th className="p-2.5 text-left text-xs font-semibold text-white/70 uppercase tracking-wide break-words whitespace-normal border-b border-white/20">
      {children}
    </th>
  ),
  tr: ({ children }: MDProps) => (
    <tr className="border-b border-white/10 last:border-0 hover:bg-white/10 transition-colors">
      {children}
    </tr>
  ),
  td: ({ children }: MDProps) => (
    <td className="p-2.5 text-white/90 break-words whitespace-normal leading-relaxed align-top text-sm">
      {children}
    </td>
  ),
};

// ── AI output renderer ───────────────────────────────────────────────────────

function AIOutput({ content }: { content: string }) {
  const sections = splitIntoSections(content);
  return (
    <div className="space-y-4 w-full">
      {sections.map((section, i) => {
        const isFinal = section.heading?.toLowerCase().includes("final");
        return (
          <div
            key={i}
            className={
              isFinal
                ? "bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl p-6 shadow-sm"
                : "bg-white/60 backdrop-blur-md border border-white/30 rounded-2xl p-6 shadow-sm"
            }
          >
            {section.heading && (
              <h2
                className={`text-lg font-semibold mb-4 ${
                  isFinal ? "text-white" : "text-black"
                }`}
              >
                {section.heading}
              </h2>
            )}
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={isFinal ? mdComponentsDark : mdComponents}
            >
              {section.content}
            </ReactMarkdown>
          </div>
        );
      })}
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function RecommendPage() {
  const [mounted, setMounted] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [loading, setLoading] = useState(false);

  // ✅ Hydration fix
  useEffect(() => {
    setMounted(true);
  }, []);

  // ✅ AUTO FOCUS (THIS WAS THE FIX)
  useEffect(() => {
    const el = document.getElementById("input-box") as HTMLTextAreaElement;

    if (el) {
      el.focus();
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, []);

  if (!mounted) return null;

const handleSubmit = async () => {
  console.log("🚀 HANDLE SUBMIT CALLED");

  if (!input.trim()) return;

  setLoading(true);

  const newMessages = [
    ...messages,
    { role: "user", content: input }
  ];

  setMessages(newMessages);

  trackEvent("recommendation_requested", {
    query: input,
    conversation_length: messages.length,
  });

  setInput("");

  try {
    const res = await fetch("/api/recommend", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        input,
        messages: newMessages
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      posthog.captureException(new Error("Recommendation API error: " + JSON.stringify(data)));
      setMessages([
        ...newMessages,
        { role: "assistant", content: "❌ Error: " + JSON.stringify(data) }
      ]);
      return;
    }

    setMessages([
      ...newMessages,
      { role: "assistant", content: data.output || "No output returned" }
    ]);

  } catch (err) {
    console.error("❌ FETCH ERROR:", err);
    posthog.captureException(err);

    setMessages([
      ...newMessages,
      { role: "assistant", content: "❌ Fetch failed" }
    ]);
  }

  setLoading(false);
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 flex flex-col items-center px-6">

      {/* Title */}
      <h1 className="text-4xl font-semibold mb-8 text-center text-black">
        Find the best AI agent for your use case
      </h1>

      {/* Input Card */}
      <div className="w-full max-w-2xl bg-white p-6 rounded-2xl shadow-lg border">

        <textarea
          id="input-box"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Describe your use case..."
          className="w-full h-32 p-4 rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none mb-4"
        />

        <button
          onClick={handleSubmit}
          disabled={!input.trim() || loading}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-medium hover:opacity-90 transition disabled:opacity-50"
        >
          {loading ? "Thinking..." : "Get Recommendations"}
        </button>

      </div>

      {/* Output */}
      {messages.length > 0 && (
        <div className="mt-10 w-full max-w-5xl px-2 pb-12 space-y-6">

          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "user" ? (
                <div className="bg-purple-100 text-black max-w-[70%] px-5 py-3 rounded-2xl shadow-sm">
                  <p className="text-xs font-semibold text-purple-600 mb-1 uppercase tracking-wide">You</p>
                  <p className="text-sm text-black leading-relaxed">{msg.content}</p>
                </div>
              ) : (
                <div className="w-full">
                  <p className="text-xs font-semibold text-purple-600 mb-3 uppercase tracking-wide">AgenticLib</p>
                  <AIOutput content={msg.content} />
                </div>
              )}
            </div>
          ))}

          <div className="bg-white/60 backdrop-blur-md border border-white/30 rounded-2xl p-6 shadow-sm">
            <FeedbackBox />
          </div>

        </div>
      )}

    </div>
  );
}
