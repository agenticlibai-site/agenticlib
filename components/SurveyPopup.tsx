"use client";

import { useEffect, useState, useCallback } from "react";

const STORAGE_KEY = "surveyPopupShown";
const OPTIONS = [
  "Compare AI agents",
  "Automate a workflow",
  "Explore what's possible",
  "Solve a specific task",
];

export default function SurveyPopup({ pageUrl }: { pageUrl: string }) {
  const [visible, setVisible] = useState(false);

  const dismiss = useCallback(() => {
    setVisible(false);
    localStorage.setItem(STORAGE_KEY, "1");
  }, []);

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY)) return;

    let triggered = false;

    const trigger = () => {
      if (triggered) return;
      triggered = true;
      clearTimeout(timer);
      window.removeEventListener("scroll", checkScroll);
      setVisible(true);
    };

    const checkScroll = () => {
      const scrolled = window.scrollY + window.innerHeight;
      const total = document.documentElement.scrollHeight;
      if (scrolled / total >= 0.25) trigger();
    };

    // Trigger after 6 seconds OR on 25% scroll — whichever comes first
    const timer = setTimeout(trigger, 6000);
    window.addEventListener("scroll", checkScroll, { passive: true });

    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", checkScroll);
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
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-[9998] bg-black/20" />

      {/* Popup — flex wrapper handles centering, no transforms needed */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none">
      <div
        id="survey-popup"
        role="dialog"
        aria-modal="true"
        aria-label="Quick survey"
        className="pointer-events-auto relative
                   w-[90vw] max-w-2xl
                   rounded-2xl border border-zinc-200
                   bg-white shadow-[0_8px_40px_rgba(0,0,0,0.18)]
                   p-8"
        style={{ animation: "surveyFadeIn 0.2s ease both" }}
      >
        {/* Close */}
        <button
          onClick={dismiss}
          aria-label="Close"
          className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full
                     text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-all cursor-pointer"
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
        <h3 className="text-base font-semibold text-zinc-900 leading-snug mb-5">
          What are you mainly looking to do with an AI agent?
        </h3>

        {/* Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {OPTIONS.map((opt) => (
            <button
              key={opt}
              onClick={() => handleOption(opt)}
              className="w-full text-left text-sm font-medium text-zinc-700
                         px-4 py-3 rounded-xl border border-zinc-200 bg-white
                         hover:bg-[#EEF3FD] hover:border-[#6495ED] hover:text-[#3a6fd8]
                         transition-all duration-150 cursor-pointer"
            >
              {opt}
            </button>
          ))}
        </div>

        <p className="mt-4 text-sm text-gray-400 text-center">
          Your response helps us improve our website experience.
        </p>
      </div>
      </div>

      <style>{`
        @keyframes surveyFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
