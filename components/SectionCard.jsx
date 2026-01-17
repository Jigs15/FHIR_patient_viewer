// components/SectionCard.jsx
import * as React from "react";
import { Paper, Typography, Box } from "@mui/material";

export default function SectionCard({ title, subtitle, right, children }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 4,
        background: "#f4f6f8",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 2, mb: 1 }}>
        <Box>
          <Typography sx={{ fontWeight: 900, fontSize: 16 }}>{title}</Typography>
          {subtitle ? (
            <Typography sx={{ fontSize: 12.5, opacity: 0.7 }}>{subtitle}</Typography>
          ) : null}
        </Box>
        {right ? <Box>{right}</Box> : null}
      </Box>
      {children}
    </Paper>
  );
}
