"use client";

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      data-no-print
      className="no-print"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        background: "#3B4DBE",
        color: "#fff",
        border: "none",
        borderRadius: 8,
        padding: "8px 16px",
        fontSize: 13,
        fontWeight: 600,
        cursor: "pointer",
        boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
        letterSpacing: "-0.01em",
      }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="6 9 6 2 18 2 18 9" />
        <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
        <rect x="6" y="14" width="12" height="8" />
      </svg>
      Save as PDF
    </button>
  );
}
