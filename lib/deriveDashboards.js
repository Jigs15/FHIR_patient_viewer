// lib/deriveDashboards.js

const safeStr = (v) => (v == null ? "" : String(v));

export function uniqueSorted(arr) {
  const s = new Set((arr || []).map((x) => safeStr(x)).filter(Boolean));
  return Array.from(s).sort((a, b) => a.localeCompare(b));
}

export function defaultEncounterFilters() {
  return {
    department: "All",
    encounter_type: "All",
    year: "All",
    readmitted: "All",
  };
}

export function normalizePatient(p, idx) {
  const id =
    p?.patient_id ??
    p?.PatientID ??
    p?.id ??
    `PAT-${String(idx + 1).padStart(4, "0")}`;

  const first = p?.first_name ?? p?.firstName ?? p?.FirstName ?? "";
  const last = p?.last_name ?? p?.lastName ?? p?.LastName ?? "";

  // IMPORTANT: wrap the nullish chain before || (prevents “?? and || cannot be mixed”)
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
    p?.primary_condition_name ??
    p?.condition ??
    p?.Condition ??
    "Unspecified";

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
  const encounter_id = e?.encounter_id ?? e?.EncounterID ?? e?.id ?? `ENC-${String(idx + 1).padStart(5, "0")}`;
  const patient_id = e?.patient_id ?? e?.PatientID ?? e?.subject_id ?? "";
  const encounter_type = e?.encounter_type ?? e?.type ?? "Unknown";
  const department = e?.department ?? e?.service ?? "Unknown";
  const readmitted_30d_flag = Number(e?.readmitted_30d_flag ?? e?.readmit ?? 0);
  const total_cost_usd = Number(e?.total_cost_usd ?? e?.cost ?? 0);
  const dateStr = e?.encounter_date ?? e?.date ?? e?.start ?? "";
  const dateObj = dateStr ? new Date(dateStr) : null;

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

export function applyEncounterFilters(encounters, f) {
  const list = encounters || [];
  return list.filter((e) => {
    if (f.department !== "All" && e.department !== f.department) return false;
    if (f.encounter_type !== "All" && e.encounter_type !== f.encounter_type) return false;
    if (f.year !== "All") {
      const y = e.dateObj?.getFullYear?.();
      if (String(y) !== String(f.year)) return false;
    }
    if (f.readmitted !== "All") {
      const yes = e.readmitted_30d_flag === 1;
      if (f.readmitted === "Yes" && !yes) return false;
      if (f.readmitted === "No" && yes) return false;
    }
    return true;
  });
}

export function sumCost(encounters) {
  return (encounters || []).reduce((a, e) => a + (Number(e.total_cost_usd) || 0), 0);
}

export function countByMonth(encounters) {
  // returns [{name:"YYYY-MM", value:n}]
  const map = new Map();
  for (const e of encounters || []) {
    const d = e.dateObj;
    if (!d || Number.isNaN(d.getTime())) continue;
    const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    map.set(k, (map.get(k) || 0) + 1);
  }
  return Array.from(map.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([name, value]) => ({ name, value }));
}

export function chartCountsByKey(encounters, key, topN = 8) {
  const map = new Map();
  for (const e of encounters || []) {
    const k = safeStr(e[key] ?? "Unknown") || "Unknown";
    map.set(k, (map.get(k) || 0) + 1);
  }
  const rows = Array.from(map.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
  return rows.slice(0, topN);
}

export function recentEncounters(encounters, n = 6) {
  return (encounters || [])
    .slice()
    .sort((a, b) => {
      const ta = a.dateObj ? a.dateObj.getTime() : 0;
      const tb = b.dateObj ? b.dateObj.getTime() : 0;
      return tb - ta;
    })
    .slice(0, n);
}

/** Patient filters used by patient page */
export function applyPatientFilters(patients, f) {
  const q = (f.q || "").trim().toLowerCase();
  return (patients || []).filter((p) => {
    if (f.gender !== "All" && safeStr(p.gender) !== safeStr(f.gender)) return false;
    if (f.city !== "All" && safeStr(p.city) !== safeStr(f.city)) return false;
    if (f.condition !== "All" && safeStr(p.primary_condition_name) !== safeStr(f.condition)) return false;

    if (Number.isFinite(f.ageMin) && p.age != null && p.age < f.ageMin) return false;
    if (Number.isFinite(f.ageMax) && p.age != null && p.age > f.ageMax) return false;

    if (!q) return true;
    const blob = `${p.patient_id} ${p.full_name} ${p.city} ${p.primary_condition_name}`.toLowerCase();
    return blob.includes(q);
  });
}

export function buildPatientKpis(patientsFiltered) {
  const total = (patientsFiltered || []).length;
  const male = (patientsFiltered || []).filter((p) => String(p.gender).toLowerCase() === "male").length;
  const female = (patientsFiltered || []).filter((p) => String(p.gender).toLowerCase() === "female").length;
  return { total, male, female };
}
