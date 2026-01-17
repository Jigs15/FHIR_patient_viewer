// lib/live.js
export function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

// smooth drift + small randomness
export function nextValue(prev, { min, max, step = 1, driftTo }) {
  const noise = (Math.random() - 0.5) * step * 2;
  const drift = typeof driftTo === "number" ? (driftTo - prev) * 0.06 : 0;
  return clamp(prev + noise + drift, min, max);
}

// counters that move slowly and feel “ops-real”
export function nextCounter(prev, { min, max, upStep = 2, downChance = 0.06, downStep = 1, driftTo }) {
  const down = Math.random() < downChance;
  const delta = down ? -downStep : upStep * (0.4 + Math.random() * 0.8);
  const drift = typeof driftTo === "number" ? (driftTo - prev) * 0.03 : 0;
  return Math.round(clamp(prev + delta + drift, min, max));
}
