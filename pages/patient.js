// pages/patient.js
import * as React from "react";
import DashboardLayout from "../components/DashboardLayout";
import KpiCard from "../components/KpiCard";
import { loadJson } from "../lib/loadJson";
import {
  normalizePatient,
  applyPatientFilters,
  uniqueSorted,
  buildPatientKpis,
} from "../lib/deriveDashboards";

// Simple deterministic “seed” from patient id (so each patient feels unique)
function hashSeed(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967295;
}

function clamp(x, min, max) {
  return Math.max(min, Math.min(max, x));
}

function usePatientVitals(selectedPatient) {
  const [v, setV] = React.useState(null);

  React.useEffect(() => {
    if (!selectedPatient) {
      setV(null);
      return;
    }

    const condition = (selectedPatient.primary_condition_name || "").toLowerCase();
    const s = hashSeed(selectedPatient.patient_id || selectedPatient.full_name || "p");

    let base = {
      hr: 72 + Math.round(s * 10),
      spo2: 97,
      temp: 98.4,
      sys: 120,
      dia: 78,
    };

    if (condition.includes("asthma") || condition.includes("copd") || condition.includes("pulmonary")) {
      base.spo2 = 94; base.hr += 6;
    }
    if (condition.includes("diabetes")) { base.hr += 4; base.sys += 8; }
    if (condition.includes("cardio") || condition.includes("hypertension")) { base.sys += 18; base.dia += 8; }
    if (condition.includes("infection") || condition.includes("fever")) { base.temp = 99.6; base.hr += 8; }

    const drift = (n, step) => n + (Math.random() - 0.5) * step;

    const computeNext = () => ({
      hr: clamp(drift(base.hr, 6), 50, 140),
      spo2: clamp(drift(base.spo2, 2), 88, 100),
      temp: clamp(drift(base.temp, 0.35), 97.0, 103.0),
      sys: clamp(drift(base.sys, 8), 90, 190),
      dia: clamp(drift(base.dia, 6), 50, 120),
    });

    // ✅ IMMEDIATE first reading (fixes "—" problem)
    setV(computeNext());

    const interval = setInterval(() => {
      setV(computeNext());

      base = {
        hr: clamp(base.hr + (Math.random() - 0.5) * 1.2, 55, 120),
        spo2: clamp(base.spo2 + (Math.random() - 0.5) * 0.4, 90, 99),
        temp: clamp(base.temp + (Math.random() - 0.5) * 0.06, 97.5, 100.5),
        sys: clamp(base.sys + (Math.random() - 0.5) * 1.4, 100, 160),
        dia: clamp(base.dia + (Math.random() - 0.5) * 1.1, 60, 100),
      };
    }, 8500);

    return () => clearInterval(interval);
  }, [selectedPatient?.patient_id]);

  return v;
}


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

export default function PatientPage() {
  const [loading, setLoading] = React.useState(true);
  const [patientsRaw, setPatientsRaw] = React.useState([]);

  const [filters, setFilters] = React.useState({
    q: "",
    gender: "All",
    city: "All",
    condition: "All",
    ageMin: 0,
    ageMax: 120,
  });

  const [selectedId, setSelectedId] = React.useState(null);

  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const p = await loadJson("/data/patients.json");
        if (!alive) return;
        setPatientsRaw(Array.isArray(p) ? p : []);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => (alive = false);
  }, []);

  const patients = React.useMemo(
    () => patientsRaw.map((p, i) => normalizePatient(p, i)),
    [patientsRaw]
  );

  const cityOptions = React.useMemo(
    () => ["All", ...uniqueSorted(patients.map((p) => p.city))],
    [patients]
  );
  const conditionOptions = React.useMemo(
    () => ["All", ...uniqueSorted(patients.map((p) => p.primary_condition_name))],
    [patients]
  );

  const filtered = React.useMemo(
    () => applyPatientFilters(patients, filters),
    [patients, filters]
  );

  // keep selection valid
  React.useEffect(() => {
    if (!filtered.length) {
      setSelectedId(null);
      return;
    }
    if (!selectedId) setSelectedId(filtered[0].patient_id);
    const exists = filtered.some((p) => p.patient_id === selectedId);
    if (!exists) setSelectedId(filtered[0].patient_id);
  }, [filtered, selectedId]);

  const selected = React.useMemo(
    () => filtered.find((p) => p.patient_id === selectedId) || null,
    [filtered, selectedId]
  );

  const vitals = usePatientVitals(selected);
  const kpis = React.useMemo(() => buildPatientKpis(filtered), [filtered]);

  const inputStyle = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 12,
    background: "rgba(0,0,0,0.18)",
    border: "1px solid rgba(255,255,255,0.14)",
    color: "rgba(255,255,255,0.90)",
    outline: "none",
  };

  return (
    <DashboardLayout
      title="Patient"
      subtitle="Clinical summary + patient-aware vitals simulation (FHIR Observation-style)"
    >
      <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 14 }}>
        <div style={{ gridColumn: "span 12" }}>
          <Panel title="Patient Filters" right={loading ? "Loading…" : `Matches: ${filtered.length}`}>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1.5fr", gap: 12 }}>
              <input
                style={inputStyle}
                placeholder="Search name / ID / city / condition"
                value={filters.q}
                onChange={(e) => setFilters((p) => ({ ...p, q: e.target.value }))}
              />
              <select
                style={inputStyle}
                value={filters.gender}
                onChange={(e) => setFilters((p) => ({ ...p, gender: e.target.value }))}
              >
                {["All", "Male", "Female", "Other", "Unknown"].map((g) => (
                  <option key={g} value={g} style={{ color: "#111" }}>
                    {g}
                  </option>
                ))}
              </select>
              <select
                style={inputStyle}
                value={filters.city}
                onChange={(e) => setFilters((p) => ({ ...p, city: e.target.value }))}
              >
                {cityOptions.map((c) => (
                  <option key={c} value={c} style={{ color: "#111" }}>
                    {c}
                  </option>
                ))}
              </select>
              <select
                style={inputStyle}
                value={filters.condition}
                onChange={(e) => setFilters((p) => ({ ...p, condition: e.target.value }))}
              >
                {conditionOptions.map((c) => (
                  <option key={c} value={c} style={{ color: "#111" }}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </Panel>
        </div>

        <div style={{ gridColumn: "span 5" }}>
          <Panel
            title="Live Vitals"
            right={selected ? `Preview: ${selected.full_name}` : "No patient selected"}
          >
            {!selected ? (
              <div style={{ color: "rgba(255,255,255,0.70)" }}>
                No matching patient. Adjust filters.
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
                <KpiCard label="HR (bpm)" value={vitals ? Math.round(vitals.hr) : "—"} />
                <KpiCard label="SpO₂ (%)" value={vitals ? Math.round(vitals.spo2) : "—"} />
                <KpiCard label="Temp (°F)" value={vitals ? vitals.temp.toFixed(1) : "—"} />
                <KpiCard
                  label="BP (mmHg)"
                  value={vitals ? `${Math.round(vitals.sys)}/${Math.round(vitals.dia)}` : "—"}
                />
                <div style={{ gridColumn: "span 2", color: "rgba(255,255,255,0.60)", fontSize: 12 }}>
                  Condition-aware baselines: <b>{selected.primary_condition_name}</b>
                </div>
              </div>
            )}
          </Panel>

          <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
            <KpiCard label="Matches" value={kpis.total} />
            <KpiCard label="Male" value={kpis.male} />
            <KpiCard label="Female" value={kpis.female} />
          </div>
        </div>

        <div style={{ gridColumn: "span 7" }}>
          <Panel title="Patient List (Top 5)" right="Click to preview vitals">
            <div style={{ display: "grid", gap: 10 }}>
              {filtered.slice(0, 5).map((p) => {
                const active = p.patient_id === selectedId;
                return (
                  <button
                    key={p.patient_id}
                    onClick={() => setSelectedId(p.patient_id)}
                    style={{
                      textAlign: "left",
                      padding: 12,
                      borderRadius: 16,
                      background: active
                        ? "linear-gradient(90deg, rgba(46,230,166,0.18), rgba(76,201,240,0.10))"
                        : "rgba(0,0,0,0.18)",
                      border: active
                        ? "1px solid rgba(46,230,166,0.35)"
                        : "1px solid rgba(255,255,255,0.10)",
                      color: "var(--text)",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ fontWeight: 950 }}>
                      {p.full_name} — <span style={{ color: "rgba(255,255,255,0.70)" }}>{p.patient_id}</span>
                    </div>
                    <div style={{ color: "rgba(255,255,255,0.70)", fontSize: 12, marginTop: 4 }}>
                      {p.gender} • {p.city} • {p.age ?? "—"} yrs • {p.primary_condition_name}
                    </div>
                  </button>
                );
              })}
            </div>
          </Panel>

          <div style={{ marginTop: 14 }}>
            <Panel title="Selected Patient Snapshot">
              {selected ? (
                <div style={{ color: "rgba(255,255,255,0.76)", lineHeight: 1.6 }}>
                  <b>Name:</b> {selected.full_name} • <b>ID:</b> {selected.patient_id} •{" "}
                  <b>City:</b> {selected.city} • <b>Condition:</b> {selected.primary_condition_name}
                  <br />
                  In a real ICU/ward system, vitals stream from bedside monitors and FHIR{" "}
                  <b>Observation</b> resources (this demo simulates it).
                </div>
              ) : (
                <div style={{ color: "rgba(255,255,255,0.70)" }}>No patient selected.</div>
              )}
            </Panel>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
