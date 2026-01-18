// pages/index.js
import * as React from "react";
import DashboardLayout from "../components/DashboardLayout";
import KpiCard from "../components/KpiCard";
import FilterBar from "../components/FilterBar";

import {
  getEncounters,
  getEncounterFilterOptions,
  defaultEncounterFilters,
  applyEncounterFilters,
  sumCost,
  countByMonth,
  chartCountsByKey,
  recentEncounters,
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

function Panel({ title, right, children }) {
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

export default function OverviewPage() {
  const [loading, setLoading] = React.useState(true);
  const [encounters, setEncounters] = React.useState([]);

  const [filters, setFilters] = React.useState(defaultEncounterFilters());

  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const enc = await getEncounters();
        if (!alive) return;
        setEncounters(enc);
      } catch (e) {
        console.error("Failed to load encounters:", e);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => (alive = false);
  }, []);

  const { departmentOptions, typeOptions, yearOptions } = React.useMemo(
    () => getEncounterFilterOptions(encounters),
    [encounters]
  );

  const encFiltered = React.useMemo(
    () => applyEncounterFilters(encounters, filters),
    [encounters, filters]
  );

  const totalCost = React.useMemo(() => sumCost(encFiltered), [encFiltered]);
  const trend = React.useMemo(() => countByMonth(encFiltered), [encFiltered]);
  const byDept = React.useMemo(() => chartCountsByKey(encFiltered, "department", 8), [encFiltered]);
  const recent = React.useMemo(() => recentEncounters(encFiltered, 6), [encFiltered]);

  const kpiEnc = encFiltered.length;
  const kpiDept = new Set(encFiltered.map((e) => e.department)).size;

  return (
    <DashboardLayout
      title="Overview"
      subtitle="Operations snapshot + encounter analytics (FHIR-style) • filters update charts instantly"
    >
      <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 14 }}>
        {/* KPIs */}
        <div style={{ gridColumn: "span 3" }}>
          <KpiCard label="Encounters (Filtered)" value={kpiEnc} />
        </div>
        <div style={{ gridColumn: "span 3" }}>
          <KpiCard label="Departments (Filtered)" value={kpiDept} />
        </div>
        <div style={{ gridColumn: "span 3" }}>
          <KpiCard
            label="Total Cost (Filtered)"
            value={Math.round(totalCost).toLocaleString()}
            suffix="$"
          />
        </div>
        <div style={{ gridColumn: "span 3" }}>
          <KpiCard label="Readmitted" value={filters.readmitted} />
        </div>

        {/* Filters */}
        <div style={{ gridColumn: "span 12" }}>
          <Panel title="Encounter Filters" right={loading ? "Loading…" : `Showing ${encFiltered.length} encounters`}>
            <FilterBar
              filters={filters}
              setFilters={setFilters}
              departmentOptions={departmentOptions}
              typeOptions={typeOptions}
              yearOptions={yearOptions}
            />
          </Panel>
        </div>

        {/* Charts */}
        <div style={{ gridColumn: "span 7" }}>
          <Panel title="Encounters Trend" right="Monthly">
            <div style={{ height: 290 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trend} margin={{ top: 10, right: 16, left: 8, bottom: 18 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.10)" />
                  <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.70)", fontSize: 12 }}>
                    <Label value="Month" position="insideBottom" offset={-8} fill="rgba(255,255,255,0.65)" />
                  </XAxis>
                  <YAxis tick={{ fill: "rgba(255,255,255,0.70)", fontSize: 12 }}>
                    <Label value="Encounters" angle={-90} position="insideLeft" fill="rgba(255,255,255,0.65)" />
                  </YAxis>
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="var(--accent2)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        </div>

        <div style={{ gridColumn: "span 5" }}>
          <Panel title="Encounters by Department" right="Top 8">
            <div style={{ height: 290 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byDept} margin={{ top: 10, right: 14, left: 8, bottom: 18 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.10)" />
                  <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.70)", fontSize: 12 }}>
                    <Label value="Department" position="insideBottom" offset={-8} fill="rgba(255,255,255,0.65)" />
                  </XAxis>
                  <YAxis tick={{ fill: "rgba(255,255,255,0.70)", fontSize: 12 }}>
                    <Label value="Count" angle={-90} position="insideLeft" fill="rgba(255,255,255,0.65)" />
                  </YAxis>
                  <Tooltip />
                  <Bar dataKey="value" fill="var(--accent)" radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        </div>

        {/* Recent */}
        <div style={{ gridColumn: "span 12" }}>
          <Panel title="Recent Encounters" right="Latest filtered records">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 10 }}>
              {recent.map((r) => (
                <div
                  key={r.encounter_id}
                  style={{
                    gridColumn: "span 6",
                    padding: 12,
                    borderRadius: 16,
                    background: "rgba(0,0,0,0.18)",
                    border: "1px solid rgba(255,255,255,0.10)",
                  }}
                >
                  <div style={{ fontWeight: 950 }}>{r.encounter_id}</div>
                  <div style={{ color: "rgba(255,255,255,0.70)", fontSize: 12, marginTop: 4 }}>
                    {r.department} • {r.encounter_type}
                  </div>
                  <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 12, marginTop: 4 }}>
                    {r.dateStr || "—"} • Cost: {Math.round(r.total_cost_usd).toLocaleString()}$
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
