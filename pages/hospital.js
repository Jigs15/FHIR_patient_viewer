// pages/hospital.js
import * as React from "react";
import { Box, Grid, Paper, Typography } from "@mui/material";
import DashboardLayout from "../components/DashboardLayout";
import KpiCard from "../components/KpiCard";
import { getDashboardData } from "../lib/getDashboardData";

export default function HospitalDashboard() {
  const [data, setData] = React.useState(null);

  React.useEffect(() => {
    (async () => setData(await getDashboardData()))();
  }, []);

  return (
    <DashboardLayout
      title="Hospital Dashboard"
      subtitle="Operations view: rooms, staff, encounter workload (derived)."
      leftTitle="Hospital"
      leftSubtitle="Operations"
    >
      {!data ? (
        <Paper sx={{ p: 2, borderRadius: 4 }}>Loading…</Paper>
      ) : (
        <Box sx={{ display: "grid", gap: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <KpiCard label="Staff" value={data.kpis.staffCount} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <KpiCard label="Rooms" value={data.kpis.roomCount} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <KpiCard label="Encounters" value={data.clinical.encounters.length} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <KpiCard label="Patients" value={data.kpis.patientCount} />
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
            <Typography sx={{ fontWeight: 800 }}>Next enhancement</Typography>
            <Typography variant="body2" sx={{ opacity: 0.75, mt: 1 }}>
              Here we will add:
              • Department occupancy
              • Bed utilization
              • Admission / discharge breakdown
              • Top diagnoses by department
            </Typography>
          </Paper>
        </Box>
      )}
    </DashboardLayout>
  );
}
