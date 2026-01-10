// pages/index.js
import * as React from "react";
import { Box, Grid, Paper, Typography, Stack, Divider } from "@mui/material";
import DashboardLayout from "../components/DashboardLayout";
import KpiCard from "../components/KpiCard";
import { getDashboardData } from "../lib/getDashboardData";

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
} from "recharts";

export default function OverviewPage() {
  const [data, setData] = React.useState(null);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    (async () => {
      try {
        const d = await getDashboardData();
        setData(d);
      } catch (e) {
        console.error(e);
        setError("Could not load dashboard data.");
      }
    })();
  }, []);

  return (
    <DashboardLayout
      title="Overview"
      subtitle="High-level hospital and cohort analytics (FHIR-backed + derived metrics)."
      leftTitle="Hospital"
      leftSubtitle="Management Dashboard"
    >
      {error ? (
        <Paper sx={{ p: 2, borderRadius: 4 }}>{error}</Paper>
      ) : !data ? (
        <Paper sx={{ p: 2, borderRadius: 4 }}>Loading…</Paper>
      ) : (
        <Box sx={{ display: "grid", gap: 2 }}>
          {/* KPIs */}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <KpiCard label="Total Patients" value={data.kpis.patientCount} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <KpiCard label="Total Doctors" value={data.kpis.doctorCount} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <KpiCard label="Total Bills" value={data.kpis.billCount} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <KpiCard
                label="Total Bill Amount"
                value={data.totalBillAmount.toFixed(2)}
                suffix="$"
              />
            </Grid>
          </Grid>

          {/* Charts row */}
          <Grid container spacing={2}>
            <Grid item xs={12} md={7}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 4,
                  bgcolor: "rgba(255,255,255,0.92)",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.10)",
                }}
              >
                <Typography sx={{ fontWeight: 800 }}>Discharge / Activity Trend</Typography>
                <Typography variant="body2" sx={{ opacity: 0.7, mb: 1 }}>
                  Derived monthly trend from encounters
                </Typography>
                <Box sx={{ height: 260 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.trends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="value" strokeWidth={3} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} md={5}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 4,
                  bgcolor: "rgba(255,255,255,0.92)",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.10)",
                }}
              >
                <Typography sx={{ fontWeight: 800 }}>Patient Charges Type</Typography>
                <Typography variant="body2" sx={{ opacity: 0.7, mb: 1 }}>
                  Derived billing buckets
                </Typography>
                <Box sx={{ height: 260 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.charges}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="type" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="amount" />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Grid>
          </Grid>

          {/* Appointments table preview */}
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 4,
              bgcolor: "rgba(255,255,255,0.92)",
              boxShadow: "0 10px 30px rgba(0,0,0,0.10)",
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography sx={{ fontWeight: 800 }}>Doctors Appointments</Typography>
                <Typography variant="body2" sx={{ opacity: 0.7 }}>
                  Recent appointments derived from encounters
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ opacity: 0.75, fontWeight: 700 }}>
                Showing {Math.min(8, data.appointments.length)} rows
              </Typography>
            </Stack>

            <Divider sx={{ my: 1.5 }} />

            <Box sx={{ display: "grid", gap: 1 }}>
              {data.appointments.slice(0, 8).map((r, i) => (
                <Paper
                  key={i}
                  variant="outlined"
                  sx={{ p: 1.25, borderRadius: 3, bgcolor: "rgba(255,255,255,0.75)" }}
                >
                  <Typography sx={{ fontWeight: 800 }}>
                    {r.doctor_name} — {r.patient_name}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    {r.reason} • {r.status} • Fee: ${r.doctors_fee}
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
