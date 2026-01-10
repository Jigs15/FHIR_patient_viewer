// components/DashboardLayout.jsx
import * as React from "react";
import { AppBar, Toolbar, Box, Typography, Paper, Stack } from "@mui/material";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import TopTabs from "./TopTabs";

function DoctorIllustration() {
  // Simple inline SVG so you don't need extra images
  return (
    <Box
      aria-hidden
      sx={{
        width: "100%",
        maxWidth: 320,
        mx: "auto",
        opacity: 0.95,
      }}
    >
      <svg viewBox="0 0 520 420" width="100%" height="auto">
        <defs>
          <linearGradient id="g" x1="0" x2="1">
            <stop offset="0" stopColor="#7be0ff" stopOpacity="0.9" />
            <stop offset="1" stopColor="#9cf7d6" stopOpacity="0.9" />
          </linearGradient>
        </defs>
        <rect x="20" y="30" width="480" height="360" rx="28" fill="url(#g)" opacity="0.18" />
        <circle cx="260" cy="150" r="72" fill="#fff" opacity="0.85" />
        <rect x="175" y="220" width="170" height="150" rx="28" fill="#fff" opacity="0.8" />
        <rect x="230" y="240" width="60" height="88" rx="12" fill="#0b2f5f" opacity="0.85" />
        <rect x="208" y="260" width="20" height="20" rx="6" fill="#0b2f5f" opacity="0.85" />
        <rect x="292" y="260" width="20" height="20" rx="6" fill="#0b2f5f" opacity="0.85" />
      </svg>
    </Box>
  );
}

export default function DashboardLayout({
  title,
  subtitle,
  leftTitle = "Hospital",
  leftSubtitle = "Dashboard",
  children,
}) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "radial-gradient(1200px 600px at 20% 10%, rgba(58, 210, 255, 0.25), transparent 55%)," +
          "radial-gradient(900px 600px at 85% 25%, rgba(120, 255, 205, 0.18), transparent 55%)," +
          "linear-gradient(135deg, #062a57 0%, #0b3a7a 45%, #0f5aa8 100%)",
      }}
    >
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: "rgba(0,0,0,0.10)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(255,255,255,0.12)",
        }}
      >
        <Toolbar sx={{ minHeight: 76, gap: 2, justifyContent: "space-between" }}>
          <Stack direction="row" spacing={1.2} alignItems="center">
            <LocalHospitalIcon />
            <Box>
              <Typography sx={{ fontWeight: 800, lineHeight: 1.1 }}>
                FHIR Patient Viewer
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.85 }}>
                Health Informatics Portfolio
              </Typography>
            </Box>
          </Stack>

          <TopTabs />
        </Toolbar>
      </AppBar>

      <Box
        sx={{
          px: { xs: 2, md: 3 },
          py: { xs: 2, md: 3 },
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "360px 1fr" },
          gap: 2.5,
          alignItems: "start",
        }}
      >
        {/* LEFT HERO PANEL */}
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            borderRadius: 4,
            bgcolor: "rgba(255,255,255,0.12)",
            border: "1px solid rgba(255,255,255,0.14)",
            color: "white",
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>
            {leftTitle}
          </Typography>
          <Typography sx={{ opacity: 0.9, mb: 2 }}>
            {leftSubtitle}
          </Typography>

          <DoctorIllustration />

          <Paper
            elevation={0}
            sx={{
              mt: 2,
              p: 1.75,
              borderRadius: 3,
              bgcolor: "rgba(255,255,255,0.14)",
              border: "1px solid rgba(255,255,255,0.16)",
              color: "white",
            }}
          >
            <Typography sx={{ fontWeight: 700 }}>{title}</Typography>
            {subtitle ? (
              <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
                {subtitle}
              </Typography>
            ) : null}
          </Paper>
        </Paper>

        {/* MAIN CONTENT */}
        <Box sx={{ minWidth: 0 }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
