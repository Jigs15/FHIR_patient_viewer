// pages/hospital.js
import * as React from "react";
import DashboardLayout from "../components/DashboardLayout";
import KpiCard from "../components/KpiCard";

function Panel({ title, children, right }) {
  return (
    <div
      style={{
        borderRadius: "var(--radius-xl)",
        background: "rgba(255,255,255,0.07)",
        border: "1px solid rgba(255,255,255,0.12)",
        padding: 16,
        boxShadow: "var(--shadow2)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <div style={{ fontWeight: 950 }}>{title}</div>
        {right ? <div style={{ color: "rgba(255,255,255,0.60)", fontSize: 12 }}>{right}</div> : null}
      </div>
      <div style={{ marginTop: 12 }}>{children}</div>
    </div>
  );
}

const UNITS = ["All", "ICU", "OT", "ER", "Pharmacy", "Lab", "Front Desk", "IT", "Admin", "Security"];

export default function HospitalPage() {
  const [unit, setUnit] = React.useState("All");

  // Baseline = entire hospital staffing (THIS is the "total" that cannot be exceeded)
  const baseline = React.useMemo(
    () => ({
      Nursing: 92,
      Physicians: 31,
      "Pharmacy Staff": 21,
      "OT Staff": 18,
      "ER Staff": 24,
      "Lab/Diagnostics": 24,
      Housekeeping: 31,
      "Front Desk": 15,
      IT: 12,
      Security: 15,
      Admin: 21,
    }),
    []
  );

  const hospitalTotal = React.useMemo(
    () => Object.values(baseline).reduce((a, n) => a + n, 0),
    [baseline]
  );

  // Unit weights (so "ICU" emphasizes ICU-related groups but still stays under total after normalization)
  const unitWeights = React.useMemo(
    () => ({
      All: {
        Nursing: 1,
        Physicians: 1,
        "Pharmacy Staff": 1,
        "OT Staff": 1,
        "ER Staff": 1,
        "Lab/Diagnostics": 1,
        Housekeeping: 1,
        "Front Desk": 1,
        IT: 1,
        Security: 1,
        Admin: 1,
      },
      ICU: {
        Nursing: 1.25,
        Physicians: 1.15,
        "Pharmacy Staff": 0.85,
        "OT Staff": 0.7,
        "ER Staff": 0.8,
        "Lab/Diagnostics": 1.05,
        Housekeeping: 0.9,
        "Front Desk": 0.65,
        IT: 1.0,
        Security: 0.9,
        Admin: 0.7,
      },
      OT: {
        Nursing: 1.05,
        Physicians: 1.15,
        "Pharmacy Staff": 0.95,
        "OT Staff": 1.45,
        "ER Staff": 0.7,
        "Lab/Diagnostics": 0.95,
        Housekeeping: 0.85,
        "Front Desk": 0.6,
        IT: 0.9,
        Security: 0.85,
        Admin: 0.7,
      },
      ER: {
        Nursing: 1.15,
        Physicians: 1.2,
        "Pharmacy Staff": 0.9,
        "OT Staff": 0.7,
        "ER Staff": 1.45,
        "Lab/Diagnostics": 1.05,
        Housekeeping: 0.95,
        "Front Desk": 0.7,
        IT: 0.95,
        Security: 1.05,
        Admin: 0.75,
      },
      Pharmacy: {
        Nursing: 0.75,
        Physicians: 0.7,
        "Pharmacy Staff": 1.6,
        "OT Staff": 0.6,
        "ER Staff": 0.6,
        "Lab/Diagnostics": 0.75,
        Housekeeping: 0.7,
        "Front Desk": 0.6,
        IT: 0.9,
        Security: 0.85,
        Admin: 0.8,
      },
      Lab: {
        Nursing: 0.8,
        Physicians: 0.8,
        "Pharmacy Staff": 0.8,
        "OT Staff": 0.65,
        "ER Staff": 0.7,
        "Lab/Diagnostics": 1.55,
        Housekeeping: 0.75,
        "Front Desk": 0.6,
        IT: 0.95,
        Security: 0.85,
        Admin: 0.8,
      },
      "Front Desk": {
        Nursing: 0.6,
        Physicians: 0.55,
        "Pharmacy Staff": 0.65,
        "OT Staff": 0.55,
        "ER Staff": 0.6,
        "Lab/Diagnostics": 0.6,
        Housekeeping: 0.75,
        "Front Desk": 1.7,
        IT: 0.85,
        Security: 0.9,
        Admin: 1.05,
      },
      IT: {
        Nursing: 0.65,
        Physicians: 0.6,
        "Pharmacy Staff": 0.65,
        "OT Staff": 0.6,
        "ER Staff": 0.6,
        "Lab/Diagnostics": 0.7,
        Housekeeping: 0.7,
        "Front Desk": 0.7,
        IT: 1.8,
        Security: 0.9,
        Admin: 0.95,
      },
      Admin: {
        Nursing: 0.7,
        Physicians: 0.65,
        "Pharmacy Staff": 0.7,
        "OT Staff": 0.6,
        "ER Staff": 0.65,
        "Lab/Diagnostics": 0.65,
        Housekeeping: 0.75,
        "Front Desk": 1.0,
        IT: 0.85,
        Security: 0.9,
        Admin: 1.75,
      },
      Security: {
        Nursing: 0.7,
        Physicians: 0.65,
        "Pharmacy Staff": 0.65,
        "OT Staff": 0.6,
        "ER Staff": 0.85,
        "Lab/Diagnostics": 0.65,
        Housekeeping: 0.75,
        "Front Desk": 0.8,
        IT: 0.85,
        Security: 1.8,
        Admin: 0.8,
      },
    }),
    []
  );

  function computeUnitStaff(unitKey) {
    const w = unitWeights[unitKey] || unitWeights.All;

    // First pass: multiply baseline by weights
    const raw = {};
    for (const [k, v] of Object.entries(baseline)) {
      raw[k] = Math.max(0, Math.round(v * (w[k] ?? 1)));
    }

    // If All: show exactly baseline (stable)
    if (unitKey === "All") return baseline;

    // Normalize so unit total NEVER exceeds hospital total
    const rawTotal = Object.values(raw).reduce((a, n) => a + n, 0);
    if (rawTotal <= hospitalTotal) return raw;

    const scale = hospitalTotal / rawTotal;
    const scaled = {};
    let scaledTotal = 0;

    for (const [k, v] of Object.entries(raw)) {
      const nv = Math.max(0, Math.floor(v * scale));
      scaled[k] = nv;
      scaledTotal += nv;
    }

    // distribute remainder (if any) without exceeding hospitalTotal
    let remaining = hospitalTotal - scaledTotal;
    const keys = Object.keys(scaled);
    let i = 0;
    while (remaining > 0 && i < keys.length * 3) {
      const kk = keys[i % keys.length];
      scaled[kk] += 1;
      remaining -= 1;
      i += 1;
    }

    return scaled;
  }

  const staff = React.useMemo(() => computeUnitStaff(unit), [unit, baseline, hospitalTotal, unitWeights]);

  const staffTotal = React.useMemo(() => Object.values(staff).reduce((a, n) => a + n, 0), [staff]);

  // “Slow-live ops” hospital-only signals (stable-ish)
  const rooms = 130;
  const beds = 260;
  const bedOcc = unit === "ICU" ? 82 : unit === "ER" ? 68 : unit === "OT" ? 74 : 74;

  const maintenance = unit === "IT" ? 5 : 8;
  const itIncidents = unit === "IT" ? 4 : 2;
  const supplyAlerts = unit === "OT" ? 5 : 3;
  const safetyEvents = unit === "ER" ? 2 : 1;

  return (
    <DashboardLayout
      title="Hospital"
      subtitle="Staffing + unit readiness (hospital-only view — stable staffing, slow-live operations)"
    >
      <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 14 }}>
        {/* left panel */}
        <div style={{ gridColumn: "span 4" }}>
          <Panel title="Unit Operations Panel" right="Hospital-only">
            <div style={{ color: "rgba(255,255,255,0.70)", fontSize: 13, marginBottom: 10 }}>
              Choose a unit to see staffing + readiness metrics.
            </div>

            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.60)", fontWeight: 800 }}>Unit</div>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 12,
                  background: "rgba(0,0,0,0.18)",
                  border: "1px solid rgba(255,255,255,0.14)",
                  color: "rgba(255,255,255,0.92)",
                }}
              >
                {UNITS.map((u) => (
                  <option key={u} value={u} style={{ color: "#111" }}>
                    {u}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ fontWeight: 950, marginBottom: 10 }}>
              Staffing Breakdown ({unit})
            </div>

            <div style={{ display: "grid", gap: 10 }}>
              {Object.entries(staff).map(([k, v]) => (
                <div
                  key={k}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px 12px",
                    borderRadius: 14,
                    background: "rgba(0,0,0,0.18)",
                    border: "1px solid rgba(255,255,255,0.10)",
                  }}
                >
                  <div style={{ fontWeight: 900 }}>{k}</div>
                  <div style={{ fontWeight: 950 }}>{v}</div>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        {/* KPIs */}
        <div style={{ gridColumn: "span 8", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
          <KpiCard label="Hospital Staff (Total)" value={hospitalTotal} hint="Constant baseline" />
          <KpiCard label="Staff (Unit)" value={staffTotal} hint="Never exceeds hospital total" />
          <KpiCard label="Rooms" value={rooms} />
          <KpiCard label="Beds" value={beds} />

          <KpiCard label="Bed Occupancy" value={bedOcc} suffix="%" hint="Slow-live" />
          <KpiCard label="Maintenance Tickets" value={maintenance} hint="Slow-live" />
          <KpiCard label="IT Incidents" value={itIncidents} hint="Slow-live" />
          <KpiCard label="Supply Alerts" value={supplyAlerts} hint="Slow-live" />

          <KpiCard label="Safety Events" value={safetyEvents} hint="Slow-live" />
          <KpiCard label="Selected Unit" value={unit} />
          <KpiCard label="Shift Coverage" value="Day/Night" />
          <KpiCard label="Status" value="Operational" />
        </div>

        <div style={{ gridColumn: "span 12" }}>
          <Panel title="Notes">
            <div style={{ color: "rgba(255,255,255,0.75)", lineHeight: 1.6 }}>
              This page intentionally shows <b>Hospital readiness only</b> (staffing, capacity, maintenance, IT, supplies).
              It does not show patient/encounter analytics to keep it realistic and role-based.
              <br />
              Staffing totals are stable; only operational signals drift slowly (like real dashboards).
            </div>
          </Panel>
        </div>
      </div>
    </DashboardLayout>
  );
}
