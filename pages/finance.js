// pages/finance.js
import * as React from "react";
import DashboardLayout from "../components/DashboardLayout";
import KpiCard from "../components/KpiCard";

import {
  getEncounters,
  getEncounterFilterOptions,
  defaultEncounterFilters,
  applyEncounterFilters,
  sumCost,
  countByMonth,
  formatMoney,
} from "../lib/dataService";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Label,
} from "recharts";

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

export default function FinancePage() {
  const [loading, setLoading] = React.useState(true);
  const [encounters, setEncounters] = React.useState([]);
  const [filters, setFilters] = React.useState(defaultEncounterFilters());

  const [departmentOptions, setDepartmentOptions] = React.useState(["All"]);
  const [typeOptions, setTypeOptions] = React.useState(["All"]);
  const [yearOptions, setYearOptions] = React.useState(["All"]);

  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const enc = await getEncounters();
        if (!alive) return;
        setEncounters(enc);

        const opts = getEncounterFilterOptions(enc);
        setDepartmentOptions(Array.isArray(opts.departmentOptions) ? opts.departmentOptions : ["All"]);
        setTypeOptions(Array.isArray(opts.typeOptions) ? opts.typeOptions : ["All"]);
        setYearOptions(Array.isArray(opts.yearOptions) ? opts.yearOptions : ["All"]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => (alive = false);
  }, []);

  // keep filters valid if options change
  React.useEffect(() => {
    if (!departmentOptions.includes(filters.department)) setFilters((p) => ({ ...p, department: "All" }));
    if (!typeOptions.includes(filters.encounter_type)) setFilters((p) => ({ ...p, encounter_type: "All" }));
    if (!yearOptions.includes(filters.year)) setFilters((p) => ({ ...p, year: "All" }));
  }, [departmentOptions, typeOptions, yearOptions]); // eslint-disable-line

  const filtered = React.useMemo(() => applyEncounterFilters(encounters, filters), [encounters, filters]);
  const charges = React.useMemo(() => sumCost(filtered), [filtered]);
  const trend = React.useMemo(() => countByMonth(filtered), [filtered]);

  const revenueByType = React.useMemo(() => {
    const map = new Map();
    for (const e of filtered) {
      const t = e.encounter_type || "Unknown";
      map.set(t, (map.get(t) || 0) + (Number(e.total_cost_usd) || 0));
    }
    return Array.from(map.entries()).map(([name, value]) => ({ name, value: Math.round(value) }));
  }, [filtered]);

  const collections = Math.round(charges * 0.34);
  const pendingClaims = Math.round(charges * 0.085);
  const cashOnHand = 1250000;
  const arDays = 38;

  return (
    <DashboardLayout title="Finance" subtitle="Revenue + billing performance (filters update trends & breakdowns)">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 14 }}>
        <div style={{ gridColumn: "span 12" }}>
          <Panel title="Finance Filters" right={loading ? "Loading…" : `Encounters: ${filtered.length}`}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(160px, 1fr))", gap: 12 }}>
              <select
                value={filters.department}
                onChange={(e) => setFilters((p) => ({ ...p, department: e.target.value }))}
                style={{
                  padding: "10px 12px",
                  borderRadius: 12,
                  background: "rgba(0,0,0,0.18)",
                  border: "1px solid rgba(255,255,255,0.14)",
                  color: "rgba(255,255,255,0.92)",
                }}
              >
                {departmentOptions.map((d) => (
                  <option key={d} value={d} style={{ color: "#111" }}>{d}</option>
                ))}
              </select>

              <select
                value={filters.encounter_type}
                onChange={(e) => setFilters((p) => ({ ...p, encounter_type: e.target.value }))}
                style={{
                  padding: "10px 12px",
                  borderRadius: 12,
                  background: "rgba(0,0,0,0.18)",
                  border: "1px solid rgba(255,255,255,0.14)",
                  color: "rgba(255,255,255,0.92)",
                }}
              >
                {typeOptions.map((t) => (
                  <option key={t} value={t} style={{ color: "#111" }}>{t}</option>
                ))}
              </select>

              <select
                value={filters.year}
                onChange={(e) => setFilters((p) => ({ ...p, year: e.target.value }))}
                style={{
                  padding: "10px 12px",
                  borderRadius: 12,
                  background: "rgba(0,0,0,0.18)",
                  border: "1px solid rgba(255,255,255,0.14)",
                  color: "rgba(255,255,255,0.92)",
                }}
              >
                {yearOptions.map((y) => (
                  <option key={y} value={y} style={{ color: "#111" }}>{y}</option>
                ))}
              </select>

              <select
                value={filters.readmitted}
                onChange={(e) => setFilters((p) => ({ ...p, readmitted: e.target.value }))}
                style={{
                  padding: "10px 12px",
                  borderRadius: 12,
                  background: "rgba(0,0,0,0.18)",
                  border: "1px solid rgba(255,255,255,0.14)",
                  color: "rgba(255,255,255,0.92)",
                }}
              >
                {["All", "Yes", "No"].map((r) => (
                  <option key={r} value={r} style={{ color: "#111" }}>{r}</option>
                ))}
              </select>
            </div>
          </Panel>
        </div>

        <div style={{ gridColumn: "span 3" }}>
          <KpiCard label="Collections" value={formatMoney(collections)} suffix="$" />
        </div>
        <div style={{ gridColumn: "span 3" }}>
          <KpiCard label="Pending Claims" value={formatMoney(pendingClaims)} suffix="$" />
        </div>
        <div style={{ gridColumn: "span 3" }}>
          <KpiCard label="Cash on Hand" value={formatMoney(cashOnHand)} suffix="$" />
        </div>
        <div style={{ gridColumn: "span 3" }}>
          <KpiCard label="A/R Days" value={arDays} hint="Lower is better" />
        </div>

        <div style={{ gridColumn: "span 6" }}>
          <Panel title="Charges Trend (Monthly)">
            <div style={{ height: 290 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trend} margin={{ top: 10, right: 16, left: 8, bottom: 18 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.10)" />
                  <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.75)", fontSize: 12 }}>
                    <Label value="Month" position="insideBottom" offset={-8} fill="rgba(255,255,255,0.65)" />
                  </XAxis>
                  <YAxis tick={{ fill: "rgba(255,255,255,0.75)", fontSize: 12 }}>
                    <Label value="Encounters" angle={-90} position="insideLeft" fill="rgba(255,255,255,0.65)" />
                  </YAxis>
                  <Tooltip formatter={(v) => [v, "Encounters"]} />
                  <Line type="monotone" dataKey="value" stroke="var(--accent2)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        </div>

        <div style={{ gridColumn: "span 6" }}>
          <Panel title="Revenue by Channel" right="Sum of costs by encounter_type">
            <div style={{ height: 290 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueByType} margin={{ top: 10, right: 14, left: 8, bottom: 18 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.10)" />
                  <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.75)", fontSize: 12 }}>
                    <Label value="Channel" position="insideBottom" offset={-8} fill="rgba(255,255,255,0.65)" />
                  </XAxis>
                  <YAxis tick={{ fill: "rgba(255,255,255,0.75)", fontSize: 12 }}>
                    <Label value="Revenue ($)" angle={-90} position="insideLeft" fill="rgba(255,255,255,0.65)" />
                  </YAxis>
                  <Tooltip formatter={(v) => [`${formatMoney(v)} $`, "Revenue"]} />
                  <Bar dataKey="value" fill="var(--accent)" radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        </div>

        <div style={{ gridColumn: "span 12" }}>
          <Panel title="Total Charges (Filtered)" right="Sum of encounter costs">
            <div style={{ fontSize: 34, fontWeight: 950 }}>
              {formatMoney(charges)} <span style={{ fontSize: 16, color: "rgba(255,255,255,0.70)" }}>$</span>
            </div>
          </Panel>
        </div>
      </div>
    </DashboardLayout>
  );
}
