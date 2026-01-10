// components/KpiCard.jsx
import * as React from "react";
import { Paper, Typography, Box } from "@mui/material";

export default function KpiCard({ label, value, suffix, sublabel }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 4,
        bgcolor: "rgba(255,255,255,0.92)",
        border: "1px solid rgba(20,60,120,0.08)",
        boxShadow: "0 10px 30px rgba(0,0,0,0.10)",
      }}
    >
      <Typography variant="body2" sx={{ opacity: 0.75, fontWeight: 600 }}>
        {label}
      </Typography>

      <Box sx={{ display: "flex", alignItems: "baseline", gap: 1, mt: 0.5 }}>
        <Typography variant="h4" sx={{ fontWeight: 900, lineHeight: 1.1 }}>
          {value}
        </Typography>
        {suffix ? (
          <Typography sx={{ fontWeight: 700, opacity: 0.75 }}>
            {suffix}
          </Typography>
        ) : null}
      </Box>

      {sublabel ? (
        <Typography variant="caption" sx={{ opacity: 0.7 }}>
          {sublabel}
        </Typography>
      ) : null}
    </Paper>
  );
}
