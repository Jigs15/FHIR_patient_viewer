// components/DashboardLayout.jsx
import * as React from "react";
import TopTabs from "./TopTabs";

export default function DashboardLayout({ title, subtitle, children }) {
  return (
    <div style={{ padding: 22, maxWidth: 1280, margin: "0 auto" }}>
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          padding: "14px 16px",
          borderRadius: 22,
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.10)",
          boxShadow: "0 18px 60px rgba(0,0,0,0.35)",
          backdropFilter: "blur(10px)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 320 }}>
          {/* Simple “AI Hospital” logo mark (no external image needed) */}
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              background:
                "radial-gradient(circle at 30% 30%, rgba(46,230,166,0.9), rgba(76,201,240,0.25) 55%, rgba(255,255,255,0.08))",
              border: "1px solid rgba(255,255,255,0.16)",
              boxShadow: "0 10px 26px rgba(0,0,0,0.35)",
              position: "relative",
            }}
            title="Hospital AI"
          >
            <div
              style={{
                position: "absolute",
                inset: 9,
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.26)",
              }}
            />
          </div>

          <div>
            <div style={{ fontWeight: 900, letterSpacing: 0.3, lineHeight: 1.1 }}>
              FHIR Patient Viewer
            </div>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>
              Interoperable Clinical + Ops Dashboard (Demo)
            </div>
          </div>
        </div>

        <TopTabs />
      </header>

      <div style={{ padding: "18px 6px 6px" }}>
        <div style={{ fontSize: 44, fontWeight: 950, letterSpacing: -0.6 }}>
          {title}
        </div>
        {subtitle ? (
          <div style={{ marginTop: 6, color: "var(--muted)", fontSize: 14 }}>
            {subtitle}
          </div>
        ) : null}
      </div>

      <main
        style={{
          marginTop: 14,
          borderRadius: "var(--radius-xl)",
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.10)",
          boxShadow: "var(--shadow)",
          padding: 18,
        }}
      >
        {children}
      </main>

      <div style={{ padding: "10px 6px", color: "rgba(255,255,255,0.50)", fontSize: 12 }}>
        Demo UI • FHIR-style JSON dataset • interactive filters • simulated live values
      </div>
    </div>
  );
}
