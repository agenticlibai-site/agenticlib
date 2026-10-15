"use client";
import { useState, type FormEvent } from "react";

type Status = "idle" | "sending" | "sent" | "error";

const EMPTY = { name: "", company: "", email: "", phone: "", message: "" };

/** "Send us a message" card on /demo. Posts to /api/demo. */
export default function DemoForm() {
  const [fields, setFields] = useState(EMPTY);
  const [website, setWebsite] = useState(""); // honeypot
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  const set = (k: keyof typeof EMPTY) => (e: { target: { value: string } }) =>
    setFields((f) => ({ ...f, [k]: e.target.value }));

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/api/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...fields, website }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Something went wrong. Please try again.");
      setStatus("sent");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="dm-card">
        <h2 className="dm-title">Thanks, {fields.name.split(" ")[0]}!</h2>
        <p className="dm-sub" style={{ fontSize: 16, lineHeight: 1.6 }}>
          We&apos;ve got your demo request and will reach out to <strong style={{ color: "#000" }}>{fields.email}</strong> soon.
        </p>
        <button type="button" className="dm-link" onClick={() => { setFields(EMPTY); setStatus("idle"); }}>
          Send another request
        </button>
      </div>
    );
  }

  return (
    <form className="dm-card" onSubmit={onSubmit}>
      <h2 className="dm-title">Send us a message</h2>
      <p className="dm-sub">Required fields are marked below.</p>

      <div className="dm-grid">
        <Field label="Name" required>
          <input className="dm-input" required autoComplete="name" maxLength={200} value={fields.name} onChange={set("name")} />
        </Field>
        <Field label="Company name" required>
          <input className="dm-input" required autoComplete="organization" maxLength={200} value={fields.company} onChange={set("company")} />
        </Field>
        <Field label="Work email" required>
          <input className="dm-input" type="email" required autoComplete="email" maxLength={254} value={fields.email} onChange={set("email")} />
        </Field>
        <Field label="Phone">
          <input className="dm-input" type="tel" autoComplete="tel" maxLength={50} value={fields.phone} onChange={set("phone")} />
        </Field>
        <Field label="How can we help?" required full>
          <textarea
            className="dm-input" required rows={6} maxLength={5000} value={fields.message} onChange={set("message")}
            placeholder="Tell us about your AI agent, what you'd like to see in the demo, or the question on your mind."
            style={{ resize: "vertical", minHeight: 160 }}
          />
        </Field>
      </div>

      {/* Honeypot, hidden from people */}
      <input
        type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" name="website" value={website}
        onChange={(e) => setWebsite(e.target.value)}
        style={{ position: "absolute", left: -9999, width: 1, height: 1, opacity: 0 }}
      />

      {status === "error" && <div style={{ marginTop: 16, fontSize: 14, color: "#C2412B" }}>{error}</div>}

      <button type="submit" className="btn-accent dm-submit" disabled={status === "sending"} style={{ opacity: status === "sending" ? 0.7 : 1 }}>
        {status === "sending" ? "Sending…" : <>Send message <span aria-hidden="true">→</span></>}
      </button>
    </form>
  );
}

function Field({ label, required, full, children }: { label: string; required?: boolean; full?: boolean; children: React.ReactNode }) {
  return (
    <label className={full ? "dm-field dm-full" : "dm-field"}>
      <span className="dm-label">
        <span>{label}</span>
        <span className="dm-req">{required ? "Required" : "Optional"}</span>
      </span>
      {children}
    </label>
  );
}
