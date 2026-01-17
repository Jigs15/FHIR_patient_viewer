// components/LeftHeroPanel.jsx
import * as React from "react";
import { Paper, Typography, Box, Chip, Stack } from "@mui/material";

export default function LeftHeroPanel({
  title,
  subtitle,
  footerTitle,
  footerText,
  chips = [],
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 4,
        height: "100%",
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.10)",
        display: "flex",
        flexDirection: "column",
        gap: 1.5,
      }}
    >
      <Box>
        <Typography sx={{ color: "#fff", fontWeight: 900, fontSize: 28, lineHeight: 1.1 }}>
          {title}
        </Typography>
        <Typography sx={{ color: "rgba(255,255,255,0.75)", mt: 0.5, fontSize: 13 }}>
          {subtitle}
        </Typography>

        {chips?.length ? (
          <Stack direction="row" spacing={1} sx={{ mt: 1.2, flexWrap: "wrap" }}>
            {chips.map((c) => (
              <Chip
                key={c}
                label={c}
                size="small"
                sx={{
                  color: "#fff",
                  fontWeight: 900,
                  background: "rgba(255,255,255,0.10)",
                  border: "1px solid rgba(255,255,255,0.12)",
                }}
              />
            ))}
          </Stack>
        ) : null}
      </Box>

      {/* ✅ Less empty, more compact, looks premium */}
      <Box
        sx={{
          borderRadius: 4,
          height: 210, // ✅ reduced (was too tall)
          background:
            "radial-gradient(400px 250px at 30% 20%, rgba(255,255,255,0.18), rgba(255,255,255,0.06)), linear-gradient(180deg, rgba(255,255,255,0.04), rgba(0,0,0,0))",
          border: "1px solid rgba(255,255,255,0.10)",
          display: "grid",
          placeItems: "center",
          color: "rgba(255,255,255,0.85)",
          fontWeight: 900,
        }}
      >
        Live Dashboard
      </Box>

      <Box
        sx={{
          borderRadius: 3,
          p: 2,
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.10)",
          mt: "auto",
        }}
      >
        <Typography sx={{ color: "#fff", fontWeight: 900, fontSize: 14 }}>
          {footerTitle}
        </Typography>
        <Typography sx={{ color: "rgba(255,255,255,0.75)", fontSize: 12.5, mt: 0.5 }}>
          {footerText}
        </Typography>
      </Box>
    </Paper>
  );
}
