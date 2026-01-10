// lib/seededRandom.js

// Simple string hash -> 32-bit int
export function hashString(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// Deterministic PRNG: mulberry32
export function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Helpers
export function pick(rand, arr) {
  return arr[Math.floor(rand() * arr.length)];
}

export function intInRange(rand, min, max) {
  return Math.floor(rand() * (max - min + 1)) + min;
}

export function numInRange(rand, min, max, decimals = 2) {
  const v = rand() * (max - min) + min;
  return Number(v.toFixed(decimals));
}
