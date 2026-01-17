// lib/livePresets.js
import { nextCounter, nextValue } from "./live";

export const LIVE_INTERVALS = {
  OPS: 15000,      // 15s (OPD/ER/Admits)
  REVENUE: 30000,  // 30s (revenue)
  VITALS: 2000,    // 2s (HR/BP/SpO2)
};

export function evolveOps(prev) {
  return {
    opdToday: nextCounter(prev.opdToday, { min: 80, max: 320, upStep: 8, downChance: 0.22, downStep: 4 }),
    ipAdmitsToday: nextCounter(prev.ipAdmitsToday, { min: 3, max: 45, upStep: 2, downChance: 0.18, downStep: 1 }),
    otSurgeriesToday: nextCounter(prev.otSurgeriesToday, { min: 0, max: 20, upStep: 1, downChance: 0.25, downStep: 1 }),
    erLastHour: nextCounter(prev.erLastHour, { min: 0, max: 35, upStep: 2, downChance: 0.30, downStep: 2 }),
    bedOccPct: nextCounter(prev.bedOccPct, { min: 50, max: 97, upStep: 1, downChance: 0.40, downStep: 1 }),
  };
}

export function evolveRevenue(prev) {
  return {
    revenueToday: nextCounter(prev.revenueToday, { min: 120000, max: 1200000, upStep: 45000, downChance: 0.14, downStep: 25000 }),
  };
}

export function evolveVitals(prev) {
  return {
    hr: nextValue(prev.hr, { min: 55, max: 135, step: 2, driftTo: 82 }),
    spo2: nextValue(prev.spo2, { min: 90, max: 100, step: 0.5, driftTo: 97 }),
    temp: nextValue(prev.temp, { min: 97.0, max: 103.5, step: 0.15, driftTo: 98.6 }),
    sys: nextValue(prev.sys, { min: 90, max: 185, step: 2, driftTo: 124 }),
    dia: nextValue(prev.dia, { min: 55, max: 115, step: 2, driftTo: 78 }),
    rr: nextValue(prev.rr, { min: 10, max: 26, step: 1, driftTo: 16 }),
  };
}
