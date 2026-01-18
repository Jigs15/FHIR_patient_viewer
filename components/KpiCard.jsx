// components/KpiCard.jsx
import * as React from "react";

export default function KpiCard({ label, value, suffix, hint }) {
  return (
    <div
      style={{
        padding: 14,
        borderRadius: "var(--radius-lg)",
        background: "linear-gradient(180deg, rgba(255,255,255,0.10), rgba(255,255,255,0.06))",
        border: "1px solid rgba(255,255,255,0.14)",
        boxShadow: "var(--shadow2)",
        minHeight: 86,
      }}
    >
      <div style={{ color: "rgba(255,255,255,0.70)", fontSize: 12, fontWeight: 800 }}>
        {label}
      </div>
      <div style={{ marginTop: 6, display: "flex", alignItems: "baseline", gap: 6 }}>
        <div style={{ fontSize: 30, fontWeight: 950, letterSpacing: -0.4 }}>
          {value}
        </div>
        {suffix ? (
          <div style={{ color: "rgba(255,255,255,0.70)", fontWeight: 800 }}>{suffix}</div>
        ) : null}
      </div>
      {hint ? (
        <div style={{ marginTop: 6, fontSize: 12, color: "rgba(255,255,255,0.55)" }}>
          {hint}
        </div>
      ) : null}
    </div>
  );
}
