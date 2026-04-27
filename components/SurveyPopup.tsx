"use client";

import { useEffect, useState, useCallback } from "react";

const STORAGE_KEY = "survey_shown_v2";
const OPTIONS = [
  "Compare AI agents",
  "Automate a workflow",
  "Explore what's possible",
  "Solve a specific task",
];

export default function SurveyPopup({ pageUrl }: { pageUrl: string }) {
  const [visible, setVisible] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const dismiss = useCallback(() => {
    setVisible(false);
    sessionStorage.setItem(STORAGE_KEY, "1");
  }, []);

  useEffect(() => {
    if (sessionStorage.getItem(STORAGE_KEY)) return;

    let triggered = false;

    const trigger = () => {
      if (triggered) return;
      triggered = true;
      setVisible(true);
    };

    // Timer: 5 seconds
    const timer = setTimeout(trigger, 5000);

    // Scroll: 25% of page height
    const onScroll = () => {
      const scrolled = window.scrollY + window.innerHeight;
      const total = document.documentElement.scrollHeight;
      if (scrolled / total >= 0.25) trigger();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // Dismiss on outside click
  useEffect(() => {
    if (!visible) return;
    const onPointerDown = (e: PointerEvent) => {
      const popup = document.getElementById("survey-popup");
      if (popup && !popup.contains(e.target as Node)) dismiss();
    };
    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, [visible, dismiss]);

  const handleOption = async (option: string) => {
    dismiss();
    setSubmitted(true);
    await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        option,
        page: pageUrl,
        timestamp: new Date().toISOString(),
      }),
    }).catch(() => {});
  };

  if (!visible) return null;

  return (
    <div
      id="survey-popup"
      role="dialog"
      aria-label="Quick survey"
      className="
        fixed z-50
        top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
        w-[90vw] max-w-2xl
        rounded-2xl border border-white/50
        bg-white/90 backdrop-blur-xl
        shadow-[0_8px_40px_rgba(0,0,0,0.14)]
        p-8
      "
      style={{ animation: "surveyFadeIn 0.25s ease both" }}
    >
      {/* Dismiss */}
      <button
        onClick={dismiss}
        aria-label="Close"
        className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-all cursor-pointer"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="1" y1="1" x2="13" y2="13" />
          <line x1="13" y1="1" x2="1" y2="13" />
        </svg>
      </button>

      {/* Title */}
      <p className="text-xl font-semibold uppercase tracking-widest text-[#6495ED] mb-1">
        Quick question
      </p>
      <h3 className="text-base font-semibold text-zinc-900 leading-snug mb-4">
        What are you mainly looking to do with an AI agent?
      </h3>

      {/* Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {OPTIONS.map((opt) => (
          <button
            key={opt}
            onClick={() => handleOption(opt)}
            className="
              w-full text-left text-sm font-medium text-zinc-700
              px-4 py-2.5 rounded-xl border border-zinc-200
              bg-white hover:bg-[#EEF3FD] hover:border-[#6495ED] hover:text-[#3a6fd8]
              transition-all duration-150 cursor-pointer
            "
          >
            {opt}
          </button>
        ))}
      </div>


      <style>{`
        @keyframes surveyFadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
