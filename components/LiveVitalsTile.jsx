// components/LiveVitalsTile.jsx
import useLiveValues from "../hooks/useLiveValues";
import { nextValue } from "../lib/live";

export default function LiveVitalsTile() {
  const vitals = useLiveValues(
    {
      hr: 82,
      spo2: 97,
      temp: 98.6,
      sys: 124,
      dia: 78,
      rr: 16,
    },
    (prev) => ({
      hr: nextValue(prev.hr, { min: 50, max: 140, step: 2, driftTo: 82 }),
      spo2: nextValue(prev.spo2, { min: 88, max: 100, step: 0.6, driftTo: 97 }),
      temp: nextValue(prev.temp, { min: 97.0, max: 103.5, step: 0.15, driftTo: 98.6 }),
      sys: nextValue(prev.sys, { min: 90, max: 190, step: 2, driftTo: 124 }),
      dia: nextValue(prev.dia, { min: 50, max: 120, step: 2, driftTo: 78 }),
      rr: nextValue(prev.rr, { min: 10, max: 30, step: 1, driftTo: 16 }),
    }),
    2000
  );

  return (
    <div>
      <div>HR: {Math.round(vitals.hr)} bpm</div>
      <div>SpO₂: {vitals.spo2.toFixed(0)}%</div>
      <div>Temp: {vitals.temp.toFixed(1)} °F</div>
      <div>BP: {Math.round(vitals.sys)}/{Math.round(vitals.dia)} mmHg</div>
      <div>RR: {Math.round(vitals.rr)} /min</div>
    </div>
  );
}
