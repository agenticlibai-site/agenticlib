// Shows instantly when navigating to /sage while the server fetches DB data.
// Mirrors the real SageCharts shell so the layout doesn't shift on hydration.

const SIDEBAR_W = 220;

function Shimmer({ w, h, radius = 6 }: { w: number | string; h: number; radius?: number }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: radius,
      background: "rgba(255,255,255,0.07)",
      animation: "sage-shimmer 1.4s ease-in-out infinite",
    }} />
  );
}

export default function SageLoading() {
  return (
    <>
      <style>{`
        @keyframes sage-shimmer {
          0%   { opacity: 0.5; }
          50%  { opacity: 1;   }
          100% { opacity: 0.5; }
        }
        @keyframes main-shimmer {
          0%   { opacity: 0.4; }
          50%  { opacity: 0.8; }
          100% { opacity: 0.4; }
        }
      `}</style>

      <div style={{
        display: "flex", height: "100vh", marginTop: "-68px", overflow: "hidden",
        fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
      }}>

        {/* ── Sidebar skeleton ─────────────────────────────────────── */}
        <aside style={{
          width: SIDEBAR_W, background: "#0F1117", flexShrink: 0,
          display: "flex", flexDirection: "column",
          borderRight: "1px solid rgba(255,255,255,0.04)",
        }}>
          {/* Brand row */}
          <div style={{
            height: 140, flexShrink: 0,
            display: "flex", alignItems: "flex-end", gap: 12,
            padding: "0 16px 16px",
            background: "rgba(91,60,200,0.14)",
          }}>
            <Shimmer w={40} h={40} radius={10} />
            <Shimmer w={80} h={18} radius={4} />
          </div>

          {/* Domain tabs */}
          <div style={{ padding: "16px 10px", display: "flex", flexDirection: "column", gap: 4 }}>
            {[1, 0.5, 0.5, 0.5].map((op, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "8px 10px", borderRadius: 8,
                background: i === 0 ? "rgba(124,58,237,0.18)" : "transparent",
              }}>
                <Shimmer w={16} h={16} radius={3} />
                <Shimmer w={i === 0 ? 90 : 70} h={12} radius={3} />
              </div>
            ))}
          </div>

          {/* Cluster list */}
          <div style={{ padding: "8px 10px", display: "flex", flexDirection: "column", gap: 3, marginTop: 4 }}>
            {[80, 110, 90, 100, 75].map((w, i) => (
              <div key={i} style={{ padding: "6px 10px" }}>
                <Shimmer w={w} h={10} radius={3} />
              </div>
            ))}
          </div>
        </aside>

        {/* ── Main content skeleton ────────────────────────────────── */}
        <main style={{
          flex: 1, background: "#F3F4F9", overflowY: "auto",
          padding: "22px 20px", paddingTop: 90,
          display: "flex", flexDirection: "column", gap: 20,
        }}>
          <style>{`
            .mskel { background: rgba(0,0,0,0.07); animation: main-shimmer 1.4s ease-in-out infinite; border-radius: 6px; }
          `}</style>

          {/* Header row */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
            <div className="mskel" style={{ width: 180, height: 22 }} />
            <div className="mskel" style={{ width: 80, height: 16, marginLeft: "auto" }} />
          </div>

          {/* Top summary cards */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ background: "#fff", borderRadius: 12, padding: "18px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", display: "flex", flexDirection: "column", gap: 10 }}>
                <div className="mskel" style={{ width: 100, height: 11 }} />
                <div className="mskel" style={{ width: 60, height: 28 }} />
                <div className="mskel" style={{ width: 130, height: 10 }} />
              </div>
            ))}
          </div>

          {/* Brand rows */}
          <div style={{ background: "#fff", borderRadius: 12, padding: "18px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", display: "flex", flexDirection: "column", gap: 14 }}>
            <div className="mskel" style={{ width: 140, height: 14 }} />
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div className="mskel" style={{ width: 20, height: 12, flexShrink: 0 }} />
                <div className="mskel" style={{ width: 110, height: 12, flexShrink: 0 }} />
                <div style={{ flex: 1 }} />
                <div className="mskel" style={{ width: `${55 + i * 7}%`, height: 6, borderRadius: 999 }} />
                <div className="mskel" style={{ width: 36, height: 20, borderRadius: 4, flexShrink: 0 }} />
              </div>
            ))}
          </div>

          {/* Feature scores table */}
          <div style={{ background: "#fff", borderRadius: 12, padding: "18px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", display: "flex", flexDirection: "column", gap: 12 }}>
            <div className="mskel" style={{ width: 160, height: 14 }} />
            {[1, 2, 3].map(i => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr", gap: 10 }}>
                {[1, 2, 3, 4, 5].map(j => (
                  <div key={j} className="mskel" style={{ height: 28, borderRadius: 4 }} />
                ))}
              </div>
            ))}
          </div>
        </main>
      </div>
    </>
  );
}
