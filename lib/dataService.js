// lib/dataService.js
import { loadJson } from "./loadJson";

/** ---------- helpers ---------- */
const safeStr = (v) => (v == null ? "" : String(v));
const isArr = (x) => Array.isArray(x);

export function uniqueSorted(arr) {
  const s = new Set((arr || []).map((x) => safeStr(x)).filter(Boolean));
  return Array.from(s).sort((a, b) => a.localeCompare(b));
}

export function defaultEncounterFilters() {
  return { department: "All", encounter_type: "All", year: "All", readmitted: "All" };
}

export function formatMoney(n) {
  const num = Number(n) || 0;
  return num.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

/** Robust date parse */
function parseDateSafe(input) {
  const s = safeStr(input).trim();
  if (!s) return null;

  // numeric epoch
  if (/^\d+$/.test(s)) {
    const n = Number(s);
    if (Number.isFinite(n)) {
      const d = new Date(n);
      if (!Number.isNaN(d.getTime())) return d;
    }
  }

  // native
  const d1 = new Date(s);
  if (!Number.isNaN(d1.getTime())) return d1;

  // YYYY-MM or YYYY-MM-DD or YYYY/MM/DD
  const m = s.match(/^(\d{4})[-/](\d{2})(?:[-/](\d{2}))?/);
  if (m) {
    const y = Number(m[1]);
    const mo = Number(m[2]);
    const day = Number(m[3] || "01");
    const d2 = new Date(Date.UTC(y, mo - 1, day));
    if (!Number.isNaN(d2.getTime())) return d2;
  }

  return null;
}

/** ---------- normalizers ---------- */
export function normalizePatient(p, idx) {
  const id = p?.patient_id ?? p?.PatientID ?? p?.id ?? `PAT-${String(idx + 1).padStart(4, "0")}`;
  const first = p?.first_name ?? p?.firstName ?? p?.FirstName ?? "";
  const last = p?.last_name ?? p?.lastName ?? p?.LastName ?? "";

  const full =
    (p?.full_name ??
      p?.fullName ??
      p?.FullName ??
      p?.name ??
      `${safeStr(first)} ${safeStr(last)}`.trim()) || "Unknown";

  const gender = p?.gender ?? p?.Gender ?? "Unknown";
  const city = p?.city ?? p?.City ?? p?.location ?? p?.Location ?? "Unknown";
  const age = Number(p?.age ?? p?.Age ?? "");
  const primary_condition_name =
    p?.primary_condition_name ?? p?.condition ?? p?.Condition ?? "Unspecified";

  return {
    ...p,
    patient_id: safeStr(id),
    full_name: full,
    gender: safeStr(gender),
    city: safeStr(city),
    age: Number.isFinite(age) ? age : null,
    primary_condition_name: safeStr(primary_condition_name),
  };
}

export function normalizeEncounter(e, idx) {
  const encounter_id =
    e?.encounter_id ??
    e?.EncounterID ??
    e?.id ??
    `ENC-${String(idx + 1).padStart(5, "0")}`;

  const patient_id = e?.patient_id ?? e?.PatientID ?? e?.subject_id ?? "";
  const encounter_type = e?.encounter_type ?? e?.type ?? e?.EncounterType ?? "Unknown";
  const department = e?.department ?? e?.service ?? e?.Department ?? "Unknown";

  const readmitted_30d_flag = Number(e?.readmitted_30d_flag ?? e?.readmit ?? e?.Readmitted ?? 0);
  const total_cost_usd = Number(e?.total_cost_usd ?? e?.cost ?? e?.TotalCost ?? 0);

  const dateStr =
    e?.encounter_date ??
    e?.EncounterDate ??
    e?.date ??
    e?.Date ??
    e?.start ??
    e?.Start ??
    e?.start_date ??
    e?.StartDate ??
    e?.admit_date ??
    e?.AdmitDate ??
    "";

  const dateObj = parseDateSafe(dateStr);

  return {
    ...e,
    encounter_id: safeStr(encounter_id),
    patient_id: safeStr(patient_id),
    encounter_type: safeStr(encounter_type),
    department: safeStr(department),
    readmitted_30d_flag: Number.isFinite(readmitted_30d_flag) ? readmitted_30d_flag : 0,
    total_cost_usd: Number.isFinite(total_cost_usd) ? total_cost_usd : 0,
    dateStr: safeStr(dateStr),
    dateObj,
  };
}

/** ---------- in-memory cache (Phase 2 friendly) ---------- */
let _encCache = null;
let _patCache = null;

export async function getEncounters({ force = false } = {}) {
  if (_encCache && !force) return _encCache;
  const raw = await loadJson("/data/encounters.json");
  const arr = isArr(raw) ? raw : [];
  _encCache = arr.map((e, i) => normalizeEncounter(e, i));
  return _encCache;
}

export async function getPatients({ force = false } = {}) {
  if (_patCache && !force) return _patCache;
  const raw = await loadJson("/data/patients.json");
  const arr = isArr(raw) ? raw : [];
  _patCache = arr.map((p, i) => normalizePatient(p, i));
  return _patCache;
}

/** ---------- options (ALWAYS arrays) ---------- */
export function getEncounterFilterOptions(encounters = []) {
  const safe = isArr(encounters) ? encounters : [];

  const departments = uniqueSorted(safe.map((e) => e.department).filter(Boolean));
  const types = uniqueSorted(safe.map((e) => e.encounter_type).filter(Boolean));

  const years = uniqueSorted(
    safe
      .map((e) => e.dateObj?.getUTCFullYear?.() ?? e.dateObj?.getFullYear?.())
      .filter(Boolean)
      .map(String)
  );

  const departmentOptions = ["All", ...(departments.length ? departments : ["Unknown"])];
  const typeOptions = ["All", ...(types.length ? types : ["Unknown"])];
  const yearOptions = ["All", ...(years.length ? years : ["Unknown"])];

  return {
    departmentOptions,
    typeOptions,
    yearOptions,
    readmitOptions: ["All", "Yes", "No"],
  };
}

/** ---------- filters ---------- */
export function applyEncounterFilters(encounters = [], f = defaultEncounterFilters()) {
  const list = isArr(encounters) ? encounters : [];
  const filters = f || defaultEncounterFilters();

  return list.filter((e) => {
    if (filters.department !== "All" && e.department !== filters.department) return false;
    if (filters.encounter_type !== "All" && e.encounter_type !== filters.encounter_type) return false;

    if (filters.year !== "All") {
      const y = e.dateObj?.getUTCFullYear?.() ?? e.dateObj?.getFullYear?.();
      if (String(y) !== String(filters.year)) return false;
    }

    if (filters.readmitted !== "All") {
      const yes = e.readmitted_30d_flag === 1;
      if (filters.readmitted === "Yes" && !yes) return false;
      if (filters.readmitted === "No" && yes) return false;
    }

    return true;
  });
}

export function sumCost(encounters = []) {
  const list = isArr(encounters) ? encounters : [];
  return list.reduce((a, e) => a + (Number(e.total_cost_usd) || 0), 0);
}

/** Trend: [{ name:"YYYY-MM", value:n }]
 *  If no valid dates, return [] (pages show empty-state gracefully)
 */
export function countByMonth(encounters = []) {
  const list = isArr(encounters) ? encounters : [];
  const map = new Map();

  for (const e of list) {
    if (e.dateObj && !Number.isNaN(e.dateObj.getTime())) {
      const y = e.dateObj.getUTCFullYear();
      const m = String(e.dateObj.getUTCMonth() + 1).padStart(2, "0");
      const key = `${y}-${m}`;
      map.set(key, (map.get(key) || 0) + 1);
      continue;
    }

    const s = safeStr(e.dateStr);
    const mm = s.match(/^(\d{4})[-/](\d{2})/);
    if (mm) {
      const key = `${mm[1]}-${mm[2]}`;
      map.set(key, (map.get(key) || 0) + 1);
    }
  }

  const rows = Array.from(map.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([name, value]) => ({ name, value }));

  return rows;
}

export function chartCountsByKey(encounters = [], key = "department", topN = 8) {
  const list = isArr(encounters) ? encounters : [];
  const map = new Map();

  for (const e of list) {
    const k = safeStr(e[key] ?? "Unknown") || "Unknown";
    map.set(k, (map.get(k) || 0) + 1);
  }

  return Array.from(map.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, topN);
}

export function recentEncounters(encounters = [], n = 6) {
  const list = isArr(encounters) ? encounters : [];
  return list
    .slice()
    .sort((a, b) => {
      const ta = a.dateObj ? a.dateObj.getTime() : 0;
      const tb = b.dateObj ? b.dateObj.getTime() : 0;
      return tb - ta;
    })
    .slice(0, n);
}
