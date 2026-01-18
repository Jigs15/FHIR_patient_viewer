// components/TopTabs.jsx
import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/router";

const tabs = [
  { label: "Intro", href: "/intro" },
  { label: "Overview", href: "/" },
  { label: "Patient", href: "/patient" },
  { label: "Doctors", href: "/doctors" },
  { label: "Hospital", href: "/hospital" },
  { label: "Finance", href: "/finance" },
];

export default function TopTabs() {
  const router = useRouter();
  const path = router.pathname;

  return (
    <nav
      style={{
        display: "flex",
        gap: 8,
        padding: 8,
        borderRadius: 999,
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.10)",
      }}
    >
      {tabs.map((t) => {
        const active = path === t.href;
        return (
          <Link key={t.href} href={t.href}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "9px 14px",
                borderRadius: 999,
                fontSize: 13,
                fontWeight: 800,
                color: active ? "rgba(0,0,0,0.86)" : "rgba(255,255,255,0.78)",
                background: active
                  ? "linear-gradient(90deg, rgba(46,230,166,0.95), rgba(76,201,240,0.85))"
                  : "transparent",
                boxShadow: active ? "0 10px 22px rgba(0,0,0,0.25)" : "none",
                border: active ? "1px solid rgba(255,255,255,0.22)" : "1px solid transparent",
              }}
            >
              {t.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
