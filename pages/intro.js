// pages/intro.js
import * as React from "react";
import DashboardLayout from "../components/DashboardLayout";

function Card({ title, children }) {
  return (
    <div
      style={{
        borderRadius: "var(--radius-xl)",
        background: "rgba(255,255,255,0.07)",
        border: "1px solid rgba(255,255,255,0.12)",
        padding: 18,
        boxShadow: "var(--shadow2)",
      }}
    >
      <div style={{ fontWeight: 950, fontSize: 16 }}>{title}</div>
      <div style={{ marginTop: 8, color: "rgba(255,255,255,0.72)", lineHeight: 1.55 }}>
        {children}
      </div>
    </div>
  );
}

export default function Intro() {
  return (
    <DashboardLayout
      title="Intro"
      subtitle="What this project is • why FHIR matters • how this dashboard works"
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(12, 1fr)",
          gap: 14,
        }}
      >
        <div style={{ gridColumn: "span 7" }}>
          <Card title="What is FHIR?">
            <b>FHIR</b> = <b>Fast Healthcare Interoperability Resources</b>.
            It’s a standard way to structure and exchange healthcare data (Patient,
            Encounter, Observation, Medication, etc.) so different systems can share data reliably.
            <br />
            <br />
            This project uses <b>FHIR-style JSON</b> + derived analytics to simulate how a hospital command-center
            could monitor operations and clinical signals in one place.
          </Card>
        </div>

        <div style={{ gridColumn: "span 5" }}>
          <Card title="What makes it “advanced”?">
            • Interactive filters across modules<br />
            • Realistic “live” simulation (slow-changing ops vs faster vitals)<br />
            • Clear separation: hospital-only view vs patient/encounter analytics<br />
            • Consistent UI system + premium theme + responsive layout
          </Card>
        </div>

        <div style={{ gridColumn: "span 6" }}>
          <Card title="Data Model (FHIR-style)">
            <b>Patient</b> → demographics + condition label<br />
            <b>Encounter</b> → visit type, department, cost, readmission flag<br />
            <b>Observation</b> → vitals like HR, BP, SpO₂ (simulated here)
          </Card>
        </div>

        <div style={{ gridColumn: "span 6" }}>
          <Card title="How “Live” works here">
            In real hospitals, monitors and EHR events stream continuously.
            In this demo:
            <br />
            • <b>Vitals</b> refresh faster (patient-aware ranges) <br />
            • <b>Ops & finance</b> drift slowly (more realistic)
          </Card>
        </div>

        <div style={{ gridColumn: "span 12" }}>
          <div
            style={{
              padding: 18,
              borderRadius: "var(--radius-xl)",
              background:
                "linear-gradient(90deg, rgba(46,230,166,0.14), rgba(76,201,240,0.10))",
              border: "1px solid rgba(255,255,255,0.12)",
            }}
          >
            <div style={{ fontWeight: 950, fontSize: 16 }}>How to demo this project</div>
            <div style={{ marginTop: 8, color: "rgba(255,255,255,0.72)", lineHeight: 1.6 }}>
              1) Start at <b>Overview</b> to show ops KPIs + encounter trends + recent activity.<br />
              2) Open <b>Patient</b> to pick a patient and show condition-aware vitals simulation.<br />
              3) Open <b>Doctors</b> for department assignment + weekly workload snapshot.<br />
              4) Open <b>Hospital</b> for staffing + unit readiness (hospital-only).<br />
              5) Open <b>Finance</b> for revenue/charges by channel.
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
