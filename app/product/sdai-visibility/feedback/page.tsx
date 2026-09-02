"use client";

import { useState } from "react";

const PURPLE = "#7C3AED";
const PURPLE_DARK = "#5B21B6";
const BG = "#F5F3FF";

// ── Shared styles ─────────────────────────────────────────────────────────────
const qStyle: React.CSSProperties = {
  display: "flex",
  gap: 16,
  padding: "26px 32px",
  borderBottom: "1px solid rgba(0,0,0,0.07)",
};

const numStyle: React.CSSProperties = {
  width: 26,
  height: 26,
  borderRadius: "50%",
  background: "rgba(124,58,237,0.10)",
  color: PURPLE,
  fontSize: 13,
  fontWeight: 700,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  marginTop: 2,
};

const labelStyle: React.CSSProperties = {
  fontSize: 15,
  fontWeight: 700,
  color: "#000",
  lineHeight: 1.4,
  display: "block",
  letterSpacing: "-0.01em",
};

const taStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  fontSize: 14,
  border: "1.5px solid rgba(0,0,0,0.12)",
  borderRadius: 8,
  outline: "none",
  resize: "vertical" as const,
  fontFamily: "inherit",
  lineHeight: 1.55,
  color: "#111",
  background: "#FAF9FF",
  marginTop: 12,
  boxSizing: "border-box" as const,
};

const ynBtnStyle = (selected: boolean): React.CSSProperties => ({
  flex: 1,
  padding: "11px 0",
  borderRadius: 8,
  cursor: "pointer",
  border: `1.5px solid ${selected ? PURPLE : "rgba(0,0,0,0.12)"}`,
  background: selected ? "rgba(124,58,237,0.08)" : "#fff",
  color: selected ? PURPLE : "#666",
  fontWeight: 600,
  fontSize: 14,
  fontFamily: "inherit",
  transition: "all 0.15s",
});

const radioOptStyle = (selected: boolean): React.CSSProperties => ({
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: "10px 12px",
  border: `1.5px solid ${selected ? PURPLE : "rgba(0,0,0,0.12)"}`,
  borderRadius: 8,
  cursor: "pointer",
  background: selected ? "rgba(124,58,237,0.06)" : "transparent",
  transition: "border-color 0.15s, background 0.15s",
});

// ── Component ─────────────────────────────────────────────────────────────────
export default function SdaiFeedbackPage() {
  const [q1, setQ1] = useState("");
  const [q2, setQ2] = useState("");
  const [q2b, setQ2b] = useState("");
  const [q3, setQ3] = useState("");
  const [q4, setQ4] = useState("");
  const [q5, setQ5] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const showFollowup = q2 === "yes_acting" || q2 === "maybe";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!q1.trim() || !q2 || !q3.trim() || !q4 || !q5) {
      setError("Please answer all questions before submitting.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/sdai-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          q1_didnt_know: q1.trim(),
          q2_changed_plans: q2,
          q2b_what_specifically: showFollowup ? q2b.trim() : "",
          q3_whats_missing: q3.trim(),
          q4_followup_ok: q4,
          q5_want_monthly: q5,
          submittedAt: new Date().toISOString(),
        }),
      });
      if (!res.ok) throw new Error("Server error");
      setSubmitted(true);
    } catch {
      setError("Something went wrong — please try again.");
      setSubmitting(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: BG,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "60px 20px 80px",
      }}
    >
      <div style={{ width: "100%", maxWidth: 580 }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div
            style={{
              display: "inline-block",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase" as const,
              background: "rgba(124,58,237,0.10)",
              color: PURPLE,
              borderRadius: 999,
              padding: "4px 12px",
              marginBottom: 16,
            }}
          >
            AgenticLib · Report Feedback
          </div>
          <h1
            style={{
              fontSize: 26,
              fontWeight: 800,
              color: "#000",
              letterSpacing: "-0.02em",
              lineHeight: 1.2,
              margin: "0 0 8px",
            }}
          >
            Your take on the AI Video Creation report
          </h1>
          <p style={{ fontSize: 14, color: "#555", margin: 0, lineHeight: 1.55 }}>
            Five questions. Takes about 3 minutes. Answers go directly to the team.
          </p>
        </div>

        {/* Success */}
        {submitted ? (
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              boxShadow: "0 4px 24px rgba(0,0,0,0.09)",
              padding: "52px 40px",
              textAlign: "center" as const,
            }}
          >
            <div
              style={{
                width: 52,
                height: 52,
                background: "rgba(5,150,105,0.10)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
              }}
            >
              <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
                <path d="M6 13l5 5 9-10" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: "#000", letterSpacing: "-0.02em", marginBottom: 10 }}>
              Thank you, Anuj
            </h2>
            <p style={{ fontSize: 15, color: "#555", lineHeight: 1.6, margin: 0 }}>
              Your feedback is saved. We&apos;ll be in touch.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div
              style={{
                background: "#fff",
                borderRadius: 16,
                boxShadow: "0 4px 24px rgba(0,0,0,0.09)",
                overflow: "hidden",
              }}
            >

              {/* Q1 */}
              <div style={qStyle}>
                <div style={numStyle}>1</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <label htmlFor="q1" style={labelStyle}>
                    What&apos;s one specific thing in this report you didn&apos;t know before?
                  </label>
                  <textarea
                    id="q1"
                    value={q1}
                    onChange={(e) => setQ1(e.target.value)}
                    placeholder="Anything — a score, a finding, a pattern..."
                    rows={3}
                    style={taStyle}
                  />
                </div>
              </div>

              {/* Q2 */}
              <div style={qStyle}>
                <div style={numStyle}>2</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span style={labelStyle}>
                    Did anything in this report change what you&apos;re planning to build or fix?
                  </span>
                  <div style={{ display: "flex", flexDirection: "column" as const, gap: 8, marginTop: 12 }}>
                    {[
                      { val: "yes_acting", text: "Yes, I'm planning to act on something specific" },
                      { val: "maybe", text: "Maybe, still thinking about it" },
                      { val: "no_confirmed", text: "No, but it confirmed something I already suspected" },
                      { val: "no_nothing", text: "No, nothing changed" },
                    ].map((opt) => (
                      <label key={opt.val} style={radioOptStyle(q2 === opt.val)}>
                        <span
                          style={{
                            width: 18,
                            height: 18,
                            borderRadius: "50%",
                            flexShrink: 0,
                            border: `2px solid ${q2 === opt.val ? PURPLE : "rgba(0,0,0,0.20)"}`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "all 0.15s",
                            boxSizing: "border-box" as const,
                          }}
                        >
                          {q2 === opt.val && (
                            <span
                              style={{
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                background: PURPLE,
                              }}
                            />
                          )}
                        </span>
                        <input
                          type="radio"
                          name="q2"
                          value={opt.val}
                          checked={q2 === opt.val}
                          onChange={() => setQ2(opt.val)}
                          style={{ display: "none" }}
                        />
                        <span style={{ fontSize: 14, color: "#111", lineHeight: 1.4 }}>{opt.text}</span>
                      </label>
                    ))}
                  </div>

                  {/* Conditional follow-up */}
                  <div
                    style={{
                      marginTop: showFollowup ? 14 : 0,
                      maxHeight: showFollowup ? 180 : 0,
                      opacity: showFollowup ? 1 : 0,
                      overflow: "hidden",
                      transition: "max-height 0.25s ease, opacity 0.2s ease, margin-top 0.2s ease",
                    }}
                  >
                    <label
                      htmlFor="q2b"
                      style={{ fontSize: 13, fontWeight: 600, color: PURPLE, display: "block", marginBottom: 8 }}
                    >
                      What specifically?
                    </label>
                    <textarea
                      id="q2b"
                      value={q2b}
                      onChange={(e) => setQ2b(e.target.value)}
                      placeholder="What are you planning to do?"
                      rows={2}
                      style={{ ...taStyle, marginTop: 0 }}
                    />
                  </div>
                </div>
              </div>

              {/* Q3 */}
              <div style={qStyle}>
                <div style={numStyle}>3</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <label htmlFor="q3" style={labelStyle}>
                    What&apos;s missing that would make this more useful to you specifically?
                  </label>
                  <textarea
                    id="q3"
                    value={q3}
                    onChange={(e) => setQ3(e.target.value)}
                    placeholder="What would you want that isn't here?"
                    rows={3}
                    style={taStyle}
                  />
                </div>
              </div>

              {/* Q4 */}
              <div style={qStyle}>
                <div style={numStyle}>4</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span style={labelStyle}>
                    Can I follow up in 2–4 weeks to see if anything in here played out?
                  </span>
                  <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                    {(["Yes", "No"] as const).map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setQ4(v.toLowerCase())}
                        style={ynBtnStyle(q4 === v.toLowerCase())}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Q5 */}
              <div style={{ ...qStyle, borderBottom: "none" }}>
                <div style={numStyle}>5</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span style={labelStyle}>Would you want this report monthly?</span>
                  <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                    {(["Yes", "No"] as const).map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setQ5(v.toLowerCase())}
                        style={ynBtnStyle(q5 === v.toLowerCase())}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Error */}
              {error && (
                <p style={{ fontSize: 13, color: "#DC2626", padding: "0 32px 14px", margin: 0 }}>
                  {error}
                </p>
              )}

              {/* Submit row */}
              <div
                style={{
                  padding: "20px 32px 28px",
                  borderTop: "1px solid rgba(0,0,0,0.07)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  flexWrap: "wrap" as const,
                }}
              >
                <p style={{ fontSize: 12, color: "#aaa", margin: 0, lineHeight: 1.5, maxWidth: 280 }}>
                  Responses are visible only to the AgenticLib team.
                </p>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    background: PURPLE,
                    color: "#fff",
                    border: "none",
                    borderRadius: 9,
                    padding: "13px 28px",
                    fontSize: 15,
                    fontWeight: 700,
                    cursor: submitting ? "not-allowed" : "pointer",
                    boxShadow: `0 2px 0 ${PURPLE_DARK}`,
                    opacity: submitting ? 0.65 : 1,
                    fontFamily: "inherit",
                    letterSpacing: "0.01em",
                    transition: "opacity 0.15s",
                  }}
                >
                  {submitting ? "Saving…" : "Send feedback →"}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
