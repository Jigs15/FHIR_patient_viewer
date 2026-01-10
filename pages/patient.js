// pages/patient.js
import * as React from "react";
import { Box, Grid, Paper, Typography } from "@mui/material";
import DashboardLayout from "../components/DashboardLayout";
import KpiCard from "../components/KpiCard";
import { getDashboardData } from "../lib/getDashboardData";

export default function PatientDashboard() {
  const [data, setData] = React.useState(null);

  React.useEffect(() => {
    (async () => setData(await getDashboardData()))();
  }, []);

  return (
    <DashboardLayout
      title="Patient Dashboard"
      subtitle="Patient cohort view (real JSON + FHIR-style attributes)."
      leftTitle="Patient"
      leftSubtitle="Clinical Summary"
    >
      {!data ? (
        <Paper sx={{ p: 2, borderRadius: 4 }}>Loading…</Paper>
      ) : (
        <Box sx={{ display: "grid", gap: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <KpiCard label="Total Patients" value={data.kpis.patientCount} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <KpiCard label="Male Patients" value={data.kpis.maleCount} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <KpiCard label="Female Patients" value={data.kpis.femaleCount} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <KpiCard label="Encounters" value={data.clinical.encounters.length} />
            </Grid>
          </Grid>

          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 4,
              bgcolor: "rgba(255,255,255,0.92)",
              boxShadow: "0 10px 30px rgba(0,0,0,0.10)",
            }}
          >
            <Typography sx={{ fontWeight: 800 }}>Patient List (Preview)</Typography>
            <Typography variant="body2" sx={{ opacity: 0.7, mb: 1 }}>
              This page will later include filters, search, and patient detail drill-down
            </Typography>

            <Box sx={{ display: "grid", gap: 1 }}>
              {data.clinical.patients.slice(0, 10).map((p) => (
                <Paper key={p.patient_id} variant="outlined" sx={{ p: 1.25, borderRadius: 3 }}>
                  <Typography sx={{ fontWeight: 800 }}>
                    {p.first_name} {p.last_name} — ID: {p.patient_id}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    {p.gender} • Age {p.age} • {p.city}, {p.state}
                  </Typography>
                </Paper>
              ))}
            </Box>
          </Paper>
        </Box>
      )}
    </DashboardLayout>
  );
}
