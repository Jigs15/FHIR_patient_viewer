// components/FilterBar.jsx
import * as React from "react";

export default function FilterBar({
  filters,
  setFilters,
  departmentOptions = [],
  typeOptions = [],
  yearOptions = [],
  readmitOptions = ["All", "Yes", "No"],
}) {
  const safe = (arr) => (Array.isArray(arr) ? arr : []);

  const fieldStyle = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 12,
    background: "rgba(0,0,0,0.18)",
    border: "1px solid rgba(255,255,255,0.14)",
    color: "rgba(255,255,255,0.90)",
    outline: "none",
  };

  const labelStyle = { fontSize: 12, color: "rgba(255,255,255,0.60)", fontWeight: 800 };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, minmax(160px, 1fr))",
        gap: 12,
        alignItems: "end",
      }}
    >
      <div>
        <div style={labelStyle}>Department</div>
        <select
          style={fieldStyle}
          value={filters.department}
          onChange={(e) => setFilters((p) => ({ ...p, department: e.target.value }))}
        >
          {safe(departmentOptions).map((d) => (
            <option key={d} value={d} style={{ color: "#111" }}>
              {d}
            </option>
          ))}
        </select>
      </div>

      <div>
        <div style={labelStyle}>Encounter Type</div>
        <select
          style={fieldStyle}
          value={filters.encounter_type}
          onChange={(e) => setFilters((p) => ({ ...p, encounter_type: e.target.value }))}
        >
          {safe(typeOptions).map((t) => (
            <option key={t} value={t} style={{ color: "#111" }}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <div>
        <div style={labelStyle}>Year</div>
        <select
          style={fieldStyle}
          value={filters.year}
          onChange={(e) => setFilters((p) => ({ ...p, year: e.target.value }))}
        >
          {safe(yearOptions).map((y) => (
            <option key={y} value={y} style={{ color: "#111" }}>
              {y}
            </option>
          ))}
        </select>
      </div>

      <div>
        <div style={labelStyle}>Readmitted</div>
        <select
          style={fieldStyle}
          value={filters.readmitted}
          onChange={(e) => setFilters((p) => ({ ...p, readmitted: e.target.value }))}
        >
          {safe(readmitOptions).map((r) => (
            <option key={r} value={r} style={{ color: "#111" }}>
              {r}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
