// components/TopTabs.jsx
import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Tabs, Tab, Box } from "@mui/material";

const tabs = [
  { label: "Overview", href: "/" },
  { label: "Patient", href: "/patient" },
  { label: "Doctors", href: "/doctors" },
  { label: "Hospital", href: "/hospital" },
  { label: "Finance", href: "/finance" },
];

export default function TopTabs() {
  const router = useRouter();

  const current = React.useMemo(() => {
    const hit = tabs.find((t) => t.href === router.pathname);
    return hit?.href ?? "/";
  }, [router.pathname]);

  return (
    <Box
      sx={{
        px: 2,
        py: 1.25,
        borderRadius: 999,
        bgcolor: "rgba(255,255,255,0.14)",
        backdropFilter: "blur(10px)",
      }}
    >
      <Tabs
        value={current}
        textColor="inherit"
        indicatorColor="secondary"
        TabIndicatorProps={{ style: { height: 3, borderRadius: 999 } }}
        sx={{
          minHeight: "auto",
          "& .MuiTab-root": {
            minHeight: "auto",
            textTransform: "none",
            fontWeight: 600,
            px: 2,
            py: 0.75,
            borderRadius: 999,
          },
          "& .MuiTab-root.Mui-selected": {
            bgcolor: "rgba(255,255,255,0.18)",
          },
        }}
      >
        {tabs.map((t) => (
          <Tab
            key={t.href}
            value={t.href}
            label={t.label}
            component={Link}
            href={t.href}
          />
        ))}
      </Tabs>
    </Box>
  );
}
