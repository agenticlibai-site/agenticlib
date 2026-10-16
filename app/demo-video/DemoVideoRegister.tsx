"use client";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { companyEmailError } from "@/lib/companyEmail";

type Status = "idle" | "sending" | "error";

const VIDEO_SRC = "/featurestream-demo.mp4";
const POSTER_SRC = "/featurestream-demo-poster.jpg";

/**
 * Register-and-watch card on /demo-video. A company email (posted to /api/demo-video) unlocks the
 * video in place. Every visit asks for the email again, so each viewing is registered.
 */
export default function DemoVideoRegister() {
  const [unlocked, setUnlocked] = useState(false);
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

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
      setStatus("idle");
      setUnlocked(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  if (unlocked) {
    return (
      <div className="dvp-card">
        <h2 className="dvp-title">FeatureStream in 2 minutes</h2>
        <div className="dvp-media">
          <video src={VIDEO_SRC} poster={POSTER_SRC} controls autoPlay playsInline preload="metadata" />
        </div>
        <div className="dvp-after">
          <span>Like what you see?</span>
          <Link href="/demo">Book a live demo with the team →</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="dvp-card">
      <h2 className="dvp-title">Register to watch</h2>
      <p className="dvp-sub">Enter your company email to unlock the video.</p>
      <div className="dvp-media" style={{ backgroundImage: `url(${POSTER_SRC})` }}>
        <span className="dvp-play" aria-hidden="true">
          <svg width="24" height="24" viewBox="0 0 20 20" fill="none"><path d="M7 5v10l8-5z" fill="currentColor" /></svg>
        </span>
      </div>
      <form className="dvp-form" onSubmit={onSubmit}>
        <input
          className="dvp-input" type="email" required autoComplete="email" maxLength={254}
          placeholder="Company email" aria-label="Company email"
          value={email} onChange={(e) => setEmail(e.target.value)}
        />
        {/* Honeypot, hidden from people */}
        <input
          type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" name="website" value={website}
          onChange={(e) => setWebsite(e.target.value)}
          style={{ position: "absolute", left: -9999, width: 1, height: 1, opacity: 0 }}
        />
        <button type="submit" className="btn-accent dvp-submit" disabled={status === "sending"} style={{ opacity: status === "sending" ? 0.7 : 1 }}>
          {status === "sending" ? "Unlocking…" : "Watch the demo"}
        </button>
      </form>
      {status === "error"
        ? <div style={{ marginTop: 12, fontSize: 14, color: "#C2412B" }}>{error}</div>
        : <p className="dvp-fine">Company emails only. Personal emails like Gmail or Outlook aren&apos;t accepted.</p>}
    </div>
  );
}
