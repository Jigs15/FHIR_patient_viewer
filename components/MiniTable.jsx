// components/MiniTable.jsx
import * as React from "react";
import { Box, Typography } from "@mui/material";

export default function MiniTable({ rows = [], columns = [] }) {
  return (
    <Box>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: `repeat(${columns.length}, 1fr)`,
          gap: 1,
          pb: 1,
        }}
      >
        {columns.map((c) => (
          <Typography key={c} sx={{ fontSize: 12, fontWeight: 900, opacity: 0.65 }}>
            {c}
          </Typography>
        ))}
      </Box>

      <Box sx={{ display: "grid", gap: 1 }}>
        {rows.map((r, idx) => (
          <Box
            key={idx}
            sx={{
              display: "grid",
              gridTemplateColumns: `repeat(${columns.length}, 1fr)`,
              gap: 1,
              p: 1,
              borderRadius: 2.5,
              background: "#fff",
              border: "1px solid rgba(0,0,0,0.06)",
            }}
          >
            {r.map((cell, i) => (
              <Typography key={i} sx={{ fontSize: 12.5, fontWeight: 800 }}>
                {cell}
              </Typography>
            ))}
          </Box>
        ))}
      </Box>
    </Box>
  );
}
