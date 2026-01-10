// pages/doctors.js
import * as React from "react";
import { Box, Grid, Paper, Typography } from "@mui/material";
import DashboardLayout from "../components/DashboardLayout";
import KpiCard from "../components/KpiCard";
import { getDashboardData } from "../lib/getDashboardData";

export default function DoctorsDashboard() {
  const [data, setData] = React.useState(null);

  React.useEffect(() => {
    (async () => setData(await getDashboardData()))();
  }, []);

  return (
    <DashboardLayout
      title="Doctors Dashboard"
      subtitle="Doctor profiles, availability and appointment workload (derived)."
      leftTitle="Doctors"
      leftSubtitle="Performance"
    >
      {!data ? (
        <Paper sx={{ p: 2, borderRadius: 4 }}>Loading…</Paper>
      ) : (
        <Box sx={{ display: "grid", gap: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <KpiCard label="Total Doctors" value={data.doctors.length} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <KpiCard
                label="Available"
                value={data.doctors.filter((d) => d.status === "Available").length}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <KpiCard
                label="Occupied"
                value={data.doctors.filter((d) => d.status === "Occupied").length}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <KpiCard label="Appointments" value={data.appointments.length} />
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
            <Typography sx={{ fontWeight: 800 }}>Doctor List</Typography>
            <Box sx={{ display: "grid", gap: 1, mt: 1 }}>
              {data.doctors.map((d) => (
                <Paper key={d.doctor_id} variant="outlined" sx={{ p: 1.25, borderRadius: 3 }}>
                  <Typography sx={{ fontWeight: 900 }}>
                    {d.doctor_name} — {d.specialization}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Dept: {d.department} • Status: {d.status} • Rating: {d.rating}
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
