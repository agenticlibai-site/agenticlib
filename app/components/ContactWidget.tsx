"use client";
import { useState, type FormEvent } from "react";

type Status = "idle" | "sending" | "sent" | "error";

/** Floating chat-style "Contact us" button, bottom-right on every page. Sends to /api/contact. */
export default function ContactWidget() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, message, website, page: window.location.href }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Something went wrong. Please try again.");
      setStatus("sent");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  function reset() {
    setEmail(""); setMessage(""); setStatus("idle"); setError("");
  }

  const font = "var(--font-schibsted), system-ui, sans-serif";

  return (
    <div className="cw-root" style={{ position: "fixed", right: 20, bottom: 20, zIndex: 1000, fontFamily: font }}>
      <style>{`
        @keyframes cw-in { from { opacity: 0; transform: translateY(12px) scale(0.98); } to { opacity: 1; transform: none; } }
        .cw-panel { animation: cw-in 0.18s ease-out; }
        .cw-input { width: 100%; box-sizing: border-box; border: 1px solid rgba(0,0,0,0.12); border-radius: 12px; padding: 11px 13px; font: inherit; font-size: 14px; color: #000; background: #fff; outline: none; transition: border-color 0.15s, box-shadow 0.15s; }
        .cw-input:focus { border-color: #FF8A73; box-shadow: 0 0 0 3px rgba(255,138,115,0.2); }
        .cw-fab:hover { transform: translateY(-1px); box-shadow: 0 12px 28px rgba(232,96,74,0.38) !important; }
        @media (max-width: 480px) {
          .cw-root { right: 12px !important; bottom: 12px !important; }
          .cw-panel { width: calc(100vw - 24px) !important; }
        }
        @media (prefers-reduced-motion: reduce) { .cw-panel { animation: none; } }
      `}</style>

      {open && (
        <div
          className="cw-panel"
          role="dialog"
          aria-label="Contact us"
          style={{ position: "absolute", right: 0, bottom: 72, width: 360, maxHeight: "calc(100vh - 110px)", overflowY: "auto", background: "#fff", borderRadius: 20, border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 24px 60px rgba(0,0,0,0.16), 0 2px 8px rgba(0,0,0,0.06)" }}
        >
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "16px 18px", background: "#FBF8F3", borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
            <img src="/logo.png" alt="" style={{ height: 22, width: "auto" }} />
            <div style={{ flex: 1, fontSize: 15, fontWeight: 600, color: "#000" }}>Contact us</div>
            <button onClick={() => setOpen(false)} aria-label="Close" style={{ background: "none", border: "none", cursor: "pointer", padding: 6, borderRadius: 8, color: "#55524C", lineHeight: 0 }}>
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
            </button>
          </div>

          <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Greeting bubble */}
            <div style={{ alignSelf: "flex-start", maxWidth: "88%", background: "#F6F5F2", color: "#000", fontSize: 14, lineHeight: 1.5, padding: "10px 14px", borderRadius: "16px 16px 16px 4px" }}>
              Hi there 👋 Have a question about FeatureStream? Leave your email and we&apos;ll get back to you.
            </div>

            {status === "sent" ? (
              <>
                <div style={{ alignSelf: "flex-end", maxWidth: "88%", background: "#FF8A73", color: "#000", fontSize: 14, lineHeight: 1.5, padding: "10px 14px", borderRadius: "16px 16px 4px 16px", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                  {message}
                </div>
                <div style={{ alignSelf: "flex-start", maxWidth: "88%", background: "#F6F5F2", color: "#000", fontSize: 14, lineHeight: 1.5, padding: "10px 14px", borderRadius: "16px 16px 16px 4px" }}>
                  Thanks! We&apos;ve got your message and will reply to <strong>{email}</strong> soon.
                </div>
                <button onClick={reset} style={{ alignSelf: "flex-start", background: "none", border: "none", padding: 0, color: "#55524C", fontSize: 13, textDecoration: "underline", cursor: "pointer", fontFamily: font }}>
                  Send another message
                </button>
              </>
            ) : (
              <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <input
                  className="cw-input" type="email" required placeholder="Your email" autoComplete="email"
                  value={email} onChange={(e) => setEmail(e.target.value)} aria-label="Your email"
                />
                <textarea
                  className="cw-input" required rows={4} maxLength={5000} placeholder="How can we help?"
                  value={message} onChange={(e) => setMessage(e.target.value)} aria-label="Your enquiry"
                  style={{ resize: "vertical", minHeight: 96 }}
                />
                {/* Honeypot, hidden from people */}
                <input
                  type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" value={website}
                  onChange={(e) => setWebsite(e.target.value)} name="website"
                  style={{ position: "absolute", left: -9999, width: 1, height: 1, opacity: 0 }}
                />
                {status === "error" && <div style={{ fontSize: 13, color: "#C2412B" }}>{error}</div>}
                <button type="submit" className="btn-accent" disabled={status === "sending"} style={{ justifyContent: "center", borderRadius: 12, opacity: status === "sending" ? 0.7 : 1, cursor: status === "sending" ? "default" : "pointer" }}>
                  {status === "sending" ? "Sending…" : "Send message"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Launcher */}
      <button
        className="cw-fab"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close contact form" : "Contact us"}
        aria-expanded={open}
        style={{ display: "flex", alignItems: "center", gap: 8, height: 56, padding: open ? 0 : "0 20px 0 18px", width: open ? 56 : "auto", justifyContent: "center", borderRadius: 999, border: "none", cursor: "pointer", background: "#FF8A73", color: "#000", fontFamily: font, fontSize: 15, fontWeight: 500, boxShadow: "0 8px 22px rgba(232,96,74,0.32)", transition: "transform 0.15s, box-shadow 0.15s" }}
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
        ) : (
          <>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-4.5 4v-4h0A1.5 1.5 0 0 1 4 14.5z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /></svg>
            Contact us
          </>
        )}
      </button>
    </div>
  );
}
