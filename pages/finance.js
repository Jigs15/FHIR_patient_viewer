// pages/finance.js
import * as React from "react";
import { Box, Grid, Paper, Typography } from "@mui/material";
import DashboardLayout from "../components/DashboardLayout";
import KpiCard from "../components/KpiCard";
import { getDashboardData } from "../lib/getDashboardData";

export default function FinanceDashboard() {
  const [data, setData] = React.useState(null);

  React.useEffect(() => {
    (async () => setData(await getDashboardData()))();
  }, []);

  return (
    <DashboardLayout
      title="Finance Dashboard"
      subtitle="Revenue, billing buckets and inventory/medicine stock (derived)."
      leftTitle="Finance"
      leftSubtitle="Revenue & Inventory"
    >
      {!data ? (
        <Paper sx={{ p: 2, borderRadius: 4 }}>Loading…</Paper>
      ) : (
        <Box sx={{ display: "grid", gap: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <KpiCard label="Total Bill Amount" value={data.totalBillAmount.toFixed(2)} suffix="$" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <KpiCard label="Medicine Items" value={data.medicineStock.length} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <KpiCard label="Stock Qty" value={data.kpis.stockQty} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <KpiCard label="Sales Qty" value={data.kpis.medSaleQty} />
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
            <Typography sx={{ fontWeight: 800 }}>Medicine Stock (Top 10)</Typography>
            <Box sx={{ display: "grid", gap: 1, mt: 1 }}>
              {data.medicineStock.slice(0, 10).map((m) => (
                <Paper key={m.name} variant="outlined" sx={{ p: 1.25, borderRadius: 3 }}>
                  <Typography sx={{ fontWeight: 900 }}>
                    {m.name} ({m.unit})
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Sale Qty: {m.saleQty} • Stock Qty: {m.stockQty}
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
