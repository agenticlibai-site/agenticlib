"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";

type Status = "idle" | "sending" | "sent" | "error";
type Msg = { role: "user" | "assistant"; content: string };

const GREETING: Msg = {
  role: "assistant",
  content: "Hi there 👋 I'm the FeatureStream assistant. Ask me anything about FeatureStream, or tap Contact us to reach the team.",
};
const SUGGESTIONS = ["What does FeatureStream do?", "Which tools does it connect to?", "How do I get early access?"];
const CONTACT_TOKEN = "[[contact]]";

/** Strips the bot's contact token (including a half-streamed one) and reports whether it was present. */
function parseReply(text: string): { text: string; contact: boolean } {
  const contact = text.includes(CONTACT_TOKEN);
  const clean = text.split(CONTACT_TOKEN).join("").replace(/\[\[?[a-z]*\]?$/, "").trim();
  return { text: clean, contact };
}

/** Floating chatbot, bottom-right on every page. Answers via /api/chat; "Contact us" sends to /api/contact. */
export default function ContactWidget() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"chat" | "contact">("chat");

  // Chat
  const [messages, setMessages] = useState<Msg[]>([GREETING]);
  const [draft, setDraft] = useState("");
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Contact
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, mode, status, open]);

  async function ask(question: string) {
    const q = question.trim();
    if (!q || thinking) return;
    const history: Msg[] = [...messages, { role: "user", content: q }];
    setMessages([...history, { role: "assistant", content: "" }]);
    setDraft("");
    setThinking(true);
    const setReply = (content: string) =>
      setMessages((m) => [...m.slice(0, -1), { role: "assistant", content }]);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history.filter((m) => m !== GREETING) }),
      });
      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Sorry, something went wrong.");
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let reply = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        reply += decoder.decode(value, { stream: true });
        setReply(reply);
      }
    } catch (err) {
      setReply(`${err instanceof Error ? err.message : "Sorry, something went wrong."}\n${CONTACT_TOKEN}`);
    } finally {
      setThinking(false);
    }
  }

  async function onContactSubmit(e: FormEvent) {
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

  function openContact() {
    if (status === "sent") { setMessage(""); setStatus("idle"); }
    setMode("contact");
  }

  const font = "var(--font-schibsted), system-ui, sans-serif";

  return (
    <div className="cw-root" style={{ position: "fixed", right: 20, bottom: 20, zIndex: 1000, fontFamily: font }}>
      <style>{`
        @keyframes cw-in { from { opacity: 0; transform: translateY(12px) scale(0.98); } to { opacity: 1; transform: none; } }
        @keyframes cw-dot { 0%, 80%, 100% { opacity: 0.25; } 40% { opacity: 1; } }
        .cw-panel { animation: cw-in 0.18s ease-out; display: flex; flex-direction: column; position: absolute; right: 0; bottom: 72px; width: 380px; height: min(580px, calc(100vh - 110px)); background: #fff; border-radius: 20px; border: 1px solid rgba(0,0,0,0.06); box-shadow: 0 24px 60px rgba(0,0,0,0.16), 0 2px 8px rgba(0,0,0,0.06); overflow: hidden; }
        .cw-input { width: 100%; box-sizing: border-box; border: 1px solid rgba(0,0,0,0.12); border-radius: 12px; padding: 11px 13px; font: inherit; font-size: 14px; color: #000; background: #fff; outline: none; transition: border-color 0.15s, box-shadow 0.15s; }
        .cw-input:focus { border-color: #FF8A73; box-shadow: 0 0 0 3px rgba(255,138,115,0.2); }
        .cw-fab:hover { transform: translateY(-1px); box-shadow: 0 12px 28px rgba(232,96,74,0.38) !important; }
        .cw-bot, .cw-me { max-width: 86%; font-size: 14px; line-height: 1.5; padding: 10px 14px; white-space: pre-wrap; word-break: break-word; color: #000; }
        .cw-bot { align-self: flex-start; background: #F6F5F2; border-radius: 16px 16px 16px 4px; }
        .cw-me { align-self: flex-end; background: #FF8A73; border-radius: 16px 16px 4px 16px; }
        .cw-chip { background: #fff; border: 1px solid rgba(255,138,115,0.55); color: #000; border-radius: 999px; padding: 7px 12px; font: inherit; font-size: 13px; cursor: pointer; text-align: left; transition: background 0.15s; }
        .cw-chip:hover { background: #FFF1EC; }
        .cw-contact-btn { display: inline-flex; align-items: center; gap: 6px; background: #FFF1EC; border: 1px solid rgba(255,138,115,0.6); color: #000; border-radius: 999px; padding: 6px 12px; font: inherit; font-size: 13px; font-weight: 500; cursor: pointer; }
        .cw-contact-btn:hover { background: #FFE4DB; }
        .cw-typing span { display: inline-block; width: 6px; height: 6px; margin-right: 4px; border-radius: 50%; background: #8A867F; animation: cw-dot 1.2s infinite; }
        .cw-typing span:nth-child(2) { animation-delay: 0.15s; } .cw-typing span:nth-child(3) { animation-delay: 0.3s; }
        .cw-send { flex: none; width: 42px; height: 42px; border-radius: 12px; border: none; background: #FF8A73; color: #000; cursor: pointer; display: flex; align-items: center; justify-content: center; }
        .cw-send:disabled { opacity: 0.45; cursor: default; }
        .cw-link { align-self: flex-start; background: none; border: none; padding: 0; color: #55524C; font: inherit; font-size: 13px; text-decoration: underline; cursor: pointer; }
        @media (max-width: 480px) {
          .cw-root { right: 12px !important; bottom: 12px !important; }
          /* Fits between the navbar and the launcher, using the visible height (dvh) so iOS toolbars don't cover it */
          .cw-panel { width: calc(100vw - 24px); bottom: 64px; height: calc(100vh - 160px); height: calc(100dvh - 160px); }
          /* Icon-only launcher on phones so it doesn't cover page buttons */
          .cw-fab { width: 52px !important; height: 52px !important; padding: 0 !important; }
          .cw-fab-label { display: none; }
          .cw-logo { display: none; }
        }
        @media (prefers-reduced-motion: reduce) { .cw-panel { animation: none; } .cw-typing span { animation: none; opacity: 0.6; } }
      `}</style>

      {open && (
        <div className="cw-panel" role="dialog" aria-label="FeatureStream assistant">
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 14px 14px 18px", background: "#FBF8F3", borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
            <img className="cw-logo" src="/logo.png" alt="" style={{ height: 22, width: "auto" }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: "#000", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>FeatureStream assistant</div>
              <div style={{ fontSize: 12, color: "#8A867F" }}>Answers instantly · AI</div>
            </div>
            {mode === "chat" && (
              <button type="button" className="cw-contact-btn" onClick={openContact}>Contact us</button>
            )}
            <button onClick={() => setOpen(false)} aria-label="Close" style={{ background: "none", border: "none", cursor: "pointer", padding: 6, borderRadius: 8, color: "#55524C", lineHeight: 0 }}>
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
            </button>
          </div>

          {/* Body */}
          <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: 18, display: "flex", flexDirection: "column", gap: 12 }}>
            {mode === "chat" ? (
              <>
                {messages.map((m, i) => {
                  if (m.role === "user") return <div key={i} className="cw-me">{m.content}</div>;
                  const { text, contact } = parseReply(m.content);
                  const last = i === messages.length - 1;
                  return (
                    <div key={i} style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-start" }}>
                      {text ? (
                        <div className="cw-bot">{text}</div>
                      ) : (
                        <div className="cw-bot cw-typing" aria-label="Typing"><span /><span /><span /></div>
                      )}
                      {contact && !(last && thinking) && (
                        <button type="button" className="cw-contact-btn" onClick={openContact}>
                          <svg width="14" height="14" viewBox="0 0 20 20" fill="none"><path d="M3 5.5h14v9H3zM3 6l7 5 7-5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /></svg>
                          Contact the team
                        </button>
                      )}
                    </div>
                  );
                })}
                {messages.length === 1 && (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 8, marginTop: 2 }}>
                    {SUGGESTIONS.map((s) => (
                      <button key={s} type="button" className="cw-chip" onClick={() => ask(s)}>{s}</button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="cw-bot">
                  Happy to connect you with the team. Type your email and what you&apos;d like from FeatureStream, and we&apos;ll get back to you.
                </div>
                {status === "sent" ? (
                  <>
                    <div className="cw-me">{message}</div>
                    <div className="cw-bot">Thanks! We&apos;ve got your message and will reply to <strong>{email}</strong> soon.</div>
                    <button type="button" className="cw-link" onClick={() => setMode("chat")}>Back to chat</button>
                  </>
                ) : (
                  <form onSubmit={onContactSubmit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <input
                      className="cw-input" type="email" required placeholder="Your email" autoComplete="email" maxLength={254}
                      value={email} onChange={(e) => setEmail(e.target.value)} aria-label="Your email" autoFocus
                    />
                    <textarea
                      className="cw-input" required rows={4} maxLength={5000} placeholder="What would you like from FeatureStream?"
                      value={message} onChange={(e) => setMessage(e.target.value)} aria-label="What would you like from FeatureStream?"
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
                    <button type="button" className="cw-link" onClick={() => setMode("chat")}>Back to chat</button>
                  </form>
                )}
              </>
            )}
          </div>

          {/* Composer */}
          {mode === "chat" && (
            <form
              onSubmit={(e) => { e.preventDefault(); ask(draft); }}
              style={{ display: "flex", gap: 8, padding: 12, borderTop: "1px solid rgba(0,0,0,0.06)", background: "#fff" }}
            >
              <input
                className="cw-input" placeholder="Ask a question…" maxLength={1000} aria-label="Ask a question"
                value={draft} onChange={(e) => setDraft(e.target.value)}
              />
              <button type="submit" className="cw-send" disabled={!draft.trim() || thinking} aria-label="Send">
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M10 16V4M5 9l5-5 5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
            </form>
          )}
        </div>
      )}

      {/* Launcher */}
      <button
        className="cw-fab"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close chat" : "Chat with us"}
        aria-expanded={open}
        style={{ display: "flex", alignItems: "center", gap: 8, height: 56, padding: open ? 0 : "0 20px 0 18px", width: open ? 56 : "auto", justifyContent: "center", borderRadius: 999, border: "none", cursor: "pointer", background: "#FF8A73", color: "#000", fontFamily: font, fontSize: 15, fontWeight: 500, boxShadow: "0 8px 22px rgba(232,96,74,0.32)", transition: "transform 0.15s, box-shadow 0.15s" }}
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
        ) : (
          <>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-4.5 4v-4h0A1.5 1.5 0 0 1 4 14.5z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /></svg>
            <span className="cw-fab-label">Chat with us</span>
          </>
        )}
      </button>
    </div>
  );
}
