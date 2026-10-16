"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { companyEmailError } from "@/lib/companyEmail";

type Status = "idle" | "sending" | "error";

const VIDEO_SRC = "/featurestream-demo.mp4";
const POSTER_SRC = "/featurestream-demo-poster.jpg";
const UNLOCK_KEY = "fs-demo-video-email";

function readUnlocked(): string {
  try { return localStorage.getItem(UNLOCK_KEY) ?? ""; } catch { return ""; }
}

/**
 * "Watch the demo video" link. Opens a dialog that asks for a company email (posted to
 * /api/demo-video) before playing the video. Returning visitors on the same browser skip the email step.
 */
export default function DemoVideoGate() {
  const [open, setOpen] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const emailInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    if (!unlocked) emailInput.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, unlocked]);

  function openGate() {
    if (readUnlocked()) setUnlocked(true);
    setOpen(true);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const emailError = companyEmailError(email);
    if (emailError) { setError(emailError); setStatus("error"); return; }
    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/api/demo-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, website }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Something went wrong. Please try again.");
      try { localStorage.setItem(UNLOCK_KEY, email.trim().toLowerCase()); } catch {}
      setStatus("idle");
      setUnlocked(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  return (
    <>
      <style>{`
        @keyframes dv-fade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes dv-in { from { opacity: 0; transform: translateY(14px) scale(0.98); } to { opacity: 1; transform: none; } }
        .dv-link { display: inline-flex; align-items: center; gap: 8px; background: none; border: none; padding: 4px 2px; cursor: pointer; font: inherit; font-size: 15px; color: #000; }
        .dv-link span { text-decoration: underline; text-underline-offset: 3px; text-decoration-color: rgba(0,0,0,0.35); transition: text-decoration-color 0.15s; }
        .dv-link:hover span { text-decoration-color: #000; }
        .dv-overlay { position: fixed; inset: 0; z-index: 2147483000; background: rgba(20,14,10,0.5); backdrop-filter: blur(3px); display: flex; align-items: center; justify-content: center; padding: 16px; animation: dv-fade 0.15s ease-out; }
        .dv-card { position: relative; width: 100%; max-height: calc(100vh - 32px); overflow-y: auto; background: #fff; border-radius: 24px; box-shadow: 0 30px 80px rgba(0,0,0,0.25); text-align: left; animation: dv-in 0.2s ease-out; font-family: var(--font-schibsted), system-ui, sans-serif; }
        .dv-gate { max-width: 480px; padding: 36px 32px 32px; }
        .dv-player { max-width: 1040px; padding: 14px; background: #fff; }
        .dv-title { font-family: var(--font-instrument-serif), Georgia, serif; font-weight: 400; font-size: 38px; line-height: 1.05; letter-spacing: -0.01em; margin: 0; color: #000; }
        .dv-sub { margin: 10px 0 0; font-size: 15px; line-height: 1.5; color: #55524C; }
        .dv-thumb { margin-top: 20px; position: relative; border-radius: 14px; overflow: hidden; aspect-ratio: 16 / 9; background: #F6F5F2 center / cover no-repeat; box-shadow: inset 0 0 0 1px rgba(0,0,0,0.06); }
        .dv-play { position: absolute; z-index: 1; left: 0; right: 0; bottom: 9%; margin: 0 auto; width: 52px; height: 52px; border-radius: 50%; background: #FF8A73; color: #000; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 22px rgba(232,96,74,0.35); }
        .dv-form { margin-top: 20px; display: flex; flex-direction: column; gap: 10px; }
        .dv-input { width: 100%; box-sizing: border-box; border: 1px solid transparent; border-radius: 12px; background: #F8F7F3; padding: 16px 18px; font: inherit; font-size: 15.5px; color: #000; outline: none; transition: border-color 0.15s, box-shadow 0.15s, background 0.15s; }
        .dv-input::placeholder { color: #8A867F; }
        .dv-input:focus { background: #fff; border-color: #FF8A73; box-shadow: 0 0 0 3px rgba(255,138,115,0.22); }
        .dv-submit { justify-content: center; border-radius: 12px; padding: 16px 24px; font-size: 16px; }
        .dv-close { position: absolute; z-index: 2; top: 14px; right: 14px; background: rgba(255,255,255,0.9); border: none; cursor: pointer; padding: 8px; border-radius: 10px; color: #55524C; line-height: 0; }
        .dv-close:hover { background: #F6F5F2; }
        .dv-player .dv-close { top: -46px; right: 0; background: rgba(255,255,255,0.95); }
        .dv-player video { display: block; width: 100%; aspect-ratio: 16 / 9; border-radius: 12px; background: #000; }
        @media (max-width: 480px) { .dv-gate { padding: 30px 20px 24px; border-radius: 20px; } .dv-title { font-size: 32px; } .dv-player { padding: 8px; border-radius: 16px; } }
        @media (prefers-reduced-motion: reduce) { .dv-overlay, .dv-card { animation: none; } }
      `}</style>

      <button type="button" className="dv-link" onClick={openGate} aria-haspopup="dialog">
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true"><circle cx="10" cy="10" r="8.5" stroke="currentColor" strokeWidth="1.5" /><path d="M8.3 6.9v6.2l4.9-3.1z" fill="currentColor" /></svg>
        <span>Want to see how it works first? Watch the demo video.</span>
      </button>

      {open && createPortal(
        <div className="dv-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) setOpen(false); }}>
          {unlocked ? (
            <div className="dv-card dv-player" role="dialog" aria-modal="true" aria-label="FeatureStream demo video" style={{ overflow: "visible" }}>
              <button type="button" className="dv-close" onClick={() => setOpen(false)} aria-label="Close">
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
              </button>
              <video src={VIDEO_SRC} poster={POSTER_SRC} controls autoPlay playsInline preload="auto" />
            </div>
          ) : (
            <div className="dv-card dv-gate" role="dialog" aria-modal="true" aria-labelledby="dv-title">
              <button type="button" className="dv-close" onClick={() => setOpen(false)} aria-label="Close">
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
              </button>
              <h2 id="dv-title" className="dv-title">Watch the demo</h2>
              <p className="dv-sub">Enter your company email to watch a 2-minute walkthrough of FeatureStream.</p>
              <div className="dv-thumb" style={{ backgroundImage: `url(${POSTER_SRC})` }}>
                <span className="dv-play" aria-hidden="true">
                  <svg width="22" height="22" viewBox="0 0 20 20" fill="none"><path d="M7 5v10l8-5z" fill="currentColor" /></svg>
                </span>
              </div>
              <form className="dv-form" onSubmit={onSubmit}>
                <input
                  ref={emailInput} className="dv-input" type="email" required autoComplete="email" maxLength={254}
                  placeholder="Company email" aria-label="Company email"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                />
                {/* Honeypot, hidden from people */}
                <input
                  type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" name="website" value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  style={{ position: "absolute", left: -9999, width: 1, height: 1, opacity: 0 }}
                />
                {status === "error" && <div style={{ fontSize: 14, color: "#C2412B" }}>{error}</div>}
                <button type="submit" className="btn-accent dv-submit" disabled={status === "sending"} style={{ opacity: status === "sending" ? 0.7 : 1 }}>
                  {status === "sending" ? "Unlocking…" : "Watch the demo"}
                </button>
              </form>
            </div>
          )}
        </div>,
        document.body,
      )}
    </>
  );
}
