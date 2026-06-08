"use client";
import Link from "next/link";
import { useRef } from "react";

export default function ResearchPage() {
  const videoPlayedRef = useRef(false);

  const handleVideoPlay = () => {
    if (videoPlayedRef.current) return;
    videoPlayedRef.current = true;
    fetch("/api/notify-play", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source: "Research & Compare Page" }),
    }).catch(() => {});
  };

  return (
    <main className="min-h-screen relative overflow-hidden" style={{ background: "linear-gradient(180deg, #F5F3FF 0%, #FFFFFF 100%)" }}>

      {/* Decorative blurred circles */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div style={{
          position: "absolute",
          top: "-80px",
          right: "-120px",
          width: "600px",
          height: "600px",
          borderRadius: "50%",
          background: "rgba(91,91,214,0.08)",
          filter: "blur(80px)",
        }} />
        <div style={{
          position: "absolute",
          bottom: "-100px",
          left: "-100px",
          width: "400px",
          height: "400px",
          borderRadius: "50%",
          background: "rgba(91,91,214,0.08)",
          filter: "blur(70px)",
        }} />
      </div>

      {/* Nav */}
      <nav className="relative z-10 px-6 py-5 flex items-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold transition-colors hover:bg-[#f5f3ff]"
          style={{ textDecoration: "none", background: "white", borderRadius: 8, padding: "8px 16px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", color: "#5B5BD6" }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 4L6 8l4 4" stroke="#5B5BD6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Home
        </Link>
      </nav>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 pb-20 pt-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 text-zinc-900" style={{ letterSpacing: "-0.02em" }}>
            Research &amp; Compare
          </h1>
          <p className="text-base text-zinc-500 mx-auto" style={{ maxWidth: 480 }}>
            Compare, research, and decide — all in one place.
          </p>
        </div>

        <div className="rounded-2xl overflow-hidden bg-white" style={{ boxShadow: "0 4px 6px rgba(0,0,0,0.04), 0 20px 60px rgba(91,91,214,0.10), 0 0 0 1px rgba(91,91,214,0.08)" }}>
          <video
            src="/C&R Video.mp4"
            controls
            poster="/research-cover.png"
            className="w-full block"
            onPlay={handleVideoPlay}
          />
        </div>
      </div>
    </main>
  );
}
