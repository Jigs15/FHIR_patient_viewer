// pages/doctors.js
import * as React from "react";
import DashboardLayout from "../components/DashboardLayout";
import KpiCard from "../components/KpiCard";
import { getEncounters, getEncounterFilterOptions } from "../lib/dataService";

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

const DEFAULT_DEPTS = [
  "Cardiology",
  "Neurology",
  "Orthopedics",
  "Dermatology",
  "General Medicine",
  "Emergency",
  "Endocrinology",
  "Ophthalmology",
];

// Stable pseudo-random based on string (so duty doesn't flicker on re-renders)
function hash01(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967295;
}

function makeDoctors(count = 28, deptList = DEFAULT_DEPTS) {
  const first = ["Ajay","Anita","Kishore","Rajiv","Neha","Noah","Mia","Ethan","Ava","Omar","Sofia","Liam","Henry","Priya","Amir","Sara"];
  const last = ["Sharma","Patel","Verma","Nair","Kapoor","Walker","Chen","Lopez","Wright","Kim","Brown","Johnson","Garcia","Desai","Scott","Thompson"];

  const list = [];
  for (let i = 0; i < count; i++) {
    const name = `Dr. ${first[i % first.length]} ${last[(i * 3) % last.length]}`;
    const dept = deptList[i % deptList.length] || "General Medicine";
    const rating = (3.0 + (i % 16) * 0.1).toFixed(1);
    const id = `DOC-${String(i + 1).padStart(4, "0")}`;

    list.push({ id, name, dept, rating });
  }
  return list;
}

function Badge({ text, kind = "neutral" }) {
  const styles = {
    on: {
      background: "linear-gradient(90deg, rgba(46,230,166,0.35), rgba(46,230,166,0.18))",
      border: "1px solid rgba(46,230,166,0.45)",
      color: "rgba(255,255,255,0.92)",
    },
    off: {
      background: "rgba(255,255,255,0.06)",
      border: "1px solid rgba(255,255,255,0.14)",
      color: "rgba(255,255,255,0.70)",
    },
    neutral: {
      background: "rgba(0,0,0,0.18)",
      border: "1px solid rgba(255,255,255,0.10)",
      color: "rgba(255,255,255,0.75)",
    },
  };

  const s = styles[kind] || styles.neutral;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "6px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 900,
        ...s,
      }}
    >
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: 999,
          background: kind === "on" ? "var(--accent)" : "rgba(255,255,255,0.35)",
          boxShadow: kind === "on" ? "0 0 12px rgba(46,230,166,0.55)" : "none",
        }}
      />
      {text}
    </span>
  );
}

export default function DoctorsPage() {
  const [loading, setLoading] = React.useState(true);
  const [encounters, setEncounters] = React.useState([]);

  const [departmentOptions, setDepartmentOptions] = React.useState(["All", ...DEFAULT_DEPTS]);
  const [dept, setDept] = React.useState("All");

  // NEW: duty filter
  const [dutyFilter, setDutyFilter] = React.useState("All"); // All | On Duty | Available

  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const enc = await getEncounters();
        if (!alive) return;
        setEncounters(enc);

        const opts = getEncounterFilterOptions(enc);
        const d =
          Array.isArray(opts.departmentOptions) && opts.departmentOptions.length
            ? opts.departmentOptions
            : ["All", ...DEFAULT_DEPTS];

        setDepartmentOptions(d);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => (alive = false);
  }, []);

  React.useEffect(() => {
    if (!Array.isArray(departmentOptions) || !departmentOptions.length) return;
    if (!departmentOptions.includes(dept)) setDept("All");
  }, [departmentOptions, dept]);

  const deptListForDoctors = React.useMemo(() => {
    const d = (Array.isArray(departmentOptions) ? departmentOptions : []).filter((x) => x && x !== "All");
    return d.length ? d : DEFAULT_DEPTS;
  }, [departmentOptions]);

  // Generate doctors
  const doctorsBase = React.useMemo(() => makeDoctors(28, deptListForDoctors), [deptListForDoctors]);

  // Assign duty per doctor (stable)
  const doctorsWithDuty = React.useMemo(() => {
    return doctorsBase.map((d) => {
      // ~55% on duty (stable), but you can adjust threshold
      const r = hash01(`${d.id}-${d.dept}-${d.name}`);
      const onDuty = r < 0.55;
      return { ...d, onDuty };
    });
  }, [doctorsBase]);

  // Apply department filter
  const deptFiltered = React.useMemo(() => {
    if (dept === "All") return doctorsWithDuty;
    return doctorsWithDuty.filter((d) => d.dept === dept);
  }, [doctorsWithDuty, dept]);

  // Apply duty filter
  const filteredDoctors = React.useMemo(() => {
    if (dutyFilter === "All") return deptFiltered;
    if (dutyFilter === "On Duty") return deptFiltered.filter((d) => d.onDuty);
    return deptFiltered.filter((d) => !d.onDuty); // Available
  }, [deptFiltered, dutyFilter]);

  // KPIs based on deptFiltered (not dutyFiltered) so counts stay meaningful for chosen department
  const total = deptFiltered.length;
  const onDutyCount = deptFiltered.filter((d) => d.onDuty).length;
  const availableCount = total - onDutyCount;

  // Weekly workload derived from encounter distribution by department
  const workloadTop = React.useMemo(() => {
    const byDept = new Map();
    for (const e of encounters || []) {
      const k = e.department || "Unknown";
      byDept.set(k, (byDept.get(k) || 0) + 1);
    }

    // Focus on doctors that are on duty first (feels real)
    const focus = deptFiltered
      .slice()
      .sort((a, b) => Number(b.onDuty) - Number(a.onDuty)); // onDuty first

    const list = focus.map((d, idx) => {
      const base = byDept.get(d.dept) || 60;
      const dutyBoost = d.onDuty ? 1.15 : 0.75;
      const weekly = Math.max(6, Math.round((base / 5 + (idx % 6) * 7) * dutyBoost));
      return { ...d, weekly };
    });

    return list.sort((a, b) => b.weekly - a.weekly).slice(0, 8);
  }, [encounters, deptFiltered]);

  const weeklyAppointments = workloadTop.reduce((a, x) => a + x.weekly, 0);

  const selectStyle = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 12,
    background: "rgba(0,0,0,0.18)",
    border: "1px solid rgba(255,255,255,0.14)",
    color: "rgba(255,255,255,0.92)",
    outline: "none",
  };

  return (
    <DashboardLayout title="Doctors" subtitle="Coverage + weekly workload + department assignment">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 14 }}>
        <div style={{ gridColumn: "span 4" }}>
          <Panel title="Doctors Control" right={loading ? "Loading…" : `Showing ${deptFiltered.length} doctors`}>
            <div style={{ color: "rgba(255,255,255,0.68)", fontSize: 13, marginBottom: 10 }}>
              Filter doctors by department + duty status.
            </div>

            <div style={{ display: "grid", gap: 12 }}>
              <div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.60)", fontWeight: 800 }}>Department</div>
                <select value={dept} onChange={(e) => setDept(e.target.value)} style={selectStyle}>
                  {(Array.isArray(departmentOptions) ? departmentOptions : ["All"]).map((d) => (
                    <option key={d} value={d} style={{ color: "#111" }}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.60)", fontWeight: 800 }}>Duty</div>
                <select value={dutyFilter} onChange={(e) => setDutyFilter(e.target.value)} style={selectStyle}>
                  {["All", "On Duty", "Available"].map((x) => (
                    <option key={x} value={x} style={{ color: "#111" }}>
                      {x}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Badge text={`On Duty: ${onDutyCount}`} kind="on" />
              <Badge text={`Available: ${availableCount}`} kind="off" />
            </div>
          </Panel>
        </div>

        <div style={{ gridColumn: "span 8", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
          <KpiCard label="Total Doctors" value={total} />
          <KpiCard label="Available" value={availableCount} />
          <KpiCard label="On Duty" value={onDutyCount} />
          <KpiCard label="Appointments (Weekly)" value={weeklyAppointments} />
        </div>

        <div style={{ gridColumn: "span 6" }}>
          <Panel title="Workload (Weekly)" right="Top 8 (duty-weighted)">
            <div style={{ display: "grid", gap: 10 }}>
              {workloadTop.map((d) => (
                <div
                  key={d.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: 12,
                    borderRadius: 16,
                    background: "rgba(0,0,0,0.18)",
                    border: "1px solid rgba(255,255,255,0.10)",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                      <div style={{ fontWeight: 950 }}>{d.name}</div>
                      {d.onDuty ? <Badge text="On Duty" kind="on" /> : <Badge text="Available" kind="off" />}
                    </div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", marginTop: 4 }}>
                      Dept: {d.dept} • Rating: {d.rating}
                    </div>
                  </div>
                  <div style={{ fontWeight: 950, fontSize: 18 }}>{d.weekly}</div>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        <div style={{ gridColumn: "span 6" }}>
          <Panel title="Doctor List" right={`Showing: ${filteredDoctors.length}`}>
            <div style={{ maxHeight: 360, overflow: "auto", paddingRight: 6, display: "grid", gap: 10 }}>
              {filteredDoctors.map((d) => (
                <div
                  key={d.id}
                  style={{
                    padding: 12,
                    borderRadius: 16,
                    background: "rgba(0,0,0,0.18)",
                    border: "1px solid rgba(255,255,255,0.10)",
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                      <div style={{ fontWeight: 950 }}>{d.name}</div>
                      {d.onDuty ? <Badge text="On Duty" kind="on" /> : <Badge text="Available" kind="off" />}
                    </div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", marginTop: 4 }}>
                      Dept: {d.dept} • Rating: {d.rating}
                    </div>
                  </div>

                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", textAlign: "right" }}>
                    <div style={{ fontWeight: 900 }}>{d.id}</div>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </DashboardLayout>
  );
}
