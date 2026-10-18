"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { companyEmailError } from "@/lib/companyEmail";

type Status = "idle" | "sending" | "sent" | "error";

/**
 * "Join waitlist" button. Clicking it opens a dialog asking for company email, company name
 * and business domain, which posts to /api/waitlist.
 */
export default function WaitlistForm({ buttonStyle }: { buttonStyle?: React.CSSProperties }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [domain, setDomain] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const firstInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    firstInput.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const emailError = companyEmailError(email);
    if (emailError) { setError(emailError); setStatus("error"); return; }
    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, company, domain, website }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Something went wrong. Please try again.");
      setStatus("sent");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  return (
    <>
      <style>{`
        @keyframes wl-fade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes wl-in { from { opacity: 0; transform: translateY(14px) scale(0.98); } to { opacity: 1; transform: none; } }
        .wl-overlay { position: fixed; inset: 0; z-index: 2147483000; background: rgba(20,14,10,0.42); backdrop-filter: blur(3px); display: flex; align-items: center; justify-content: center; padding: 16px; animation: wl-fade 0.15s ease-out; }
        .wl-card { position: relative; width: 100%; max-width: 480px; max-height: calc(100vh - 32px); overflow-y: auto; background: #fff; border-radius: 24px; padding: 36px 32px 32px; box-shadow: 0 30px 80px rgba(0,0,0,0.22); text-align: left; animation: wl-in 0.2s ease-out; font-family: var(--font-schibsted), system-ui, sans-serif; }
        .wl-title { font-family: var(--font-instrument-serif), Georgia, serif; font-weight: 400; font-size: 38px; line-height: 1.05; letter-spacing: -0.01em; margin: 0; color: #000; }
        .wl-sub { margin: 10px 0 0; font-size: 15px; line-height: 1.5; color: #55524C; }
        .wl-form { margin-top: 24px; display: flex; flex-direction: column; gap: 10px; }
        .wl-input {
          width: 100%; box-sizing: border-box; border: 1px solid transparent; border-radius: 12px;
          background: #F8F7F3; padding: 16px 18px; font: inherit; font-size: 15.5px; color: #000; outline: none;
          transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
        }
        .wl-input::placeholder { color: #8A867F; }
        .wl-input:focus { background: #fff; border-color: #FF8A73; box-shadow: 0 0 0 3px rgba(255,138,115,0.22); }
        .wl-submit { margin-top: 6px; justify-content: center; border-radius: 12px; padding: 16px 24px; font-size: 16px; }
        .wl-close { position: absolute; top: 14px; right: 14px; background: none; border: none; cursor: pointer; padding: 8px; border-radius: 10px; color: #55524C; line-height: 0; }
        .wl-close:hover { background: rgba(0,0,0,0.05); }
        @media (max-width: 480px) { .wl-card { padding: 30px 20px 24px; border-radius: 20px; } .wl-title { font-size: 32px; } }
        @media (prefers-reduced-motion: reduce) { .wl-overlay, .wl-card { animation: none; } }
      `}</style>

      <button type="button" className="btn-accent" style={buttonStyle} onClick={() => setOpen(true)} aria-haspopup="dialog">
        Join waitlist
      </button>

      {open && createPortal(
        <div className="wl-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) setOpen(false); }}>
          <div className="wl-card" role="dialog" aria-modal="true" aria-labelledby="wl-title">
            <button type="button" className="wl-close" onClick={() => setOpen(false)} aria-label="Close">
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
            </button>

            {status === "sent" ? (
              <>
                <span className="icon-dot" style={{ width: 44, height: 44 }}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4.5 10.5l3.5 3.5 7.5-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </span>
                <h2 id="wl-title" className="wl-title" style={{ marginTop: 18 }}>You&apos;re on the waitlist!</h2>
                <p className="wl-sub">We&apos;ll be in touch at <strong style={{ color: "#000" }}>{email}</strong>.</p>
                <button type="button" className="btn-accent wl-submit" style={{ width: "100%", marginTop: 24 }} onClick={() => setOpen(false)}>
                  Done
                </button>
              </>
            ) : (
              <>
                <h2 id="wl-title" className="wl-title">Join the waitlist</h2>
                <p className="wl-sub">Get early access to FeatureStream for your AI agent company.</p>
                <form className="wl-form" onSubmit={onSubmit}>
                  <input
                    ref={firstInput} className="wl-input" type="email" required autoComplete="email" maxLength={254}
                    placeholder="Company email (you@company.com)" aria-label="Company email"
                    value={email} onChange={(e) => setEmail(e.target.value)}
                  />
                  <input
                    className="wl-input" required autoComplete="organization" maxLength={200}
                    placeholder="Company name" aria-label="Company name"
                    value={company} onChange={(e) => setCompany(e.target.value)}
                  />
                  <input
                    className="wl-input" required autoComplete="off" maxLength={200}
                    placeholder="Business domain (e.g. Legal, Healthcare)" aria-label="Business domain"
                    value={domain} onChange={(e) => setDomain(e.target.value)}
                  />
                  {/* Honeypot, hidden from people */}
                  <input
                    type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" name="website" value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    style={{ position: "absolute", left: -9999, width: 1, height: 1, opacity: 0 }}
                  />
                  {status === "error" && <div style={{ fontSize: 14, color: "#C2412B" }}>{error}</div>}
                  <button type="submit" className="btn-accent wl-submit" disabled={status === "sending"} style={{ opacity: status === "sending" ? 0.7 : 1 }}>
                    {status === "sending" ? "Joining…" : "Join waitlist"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
