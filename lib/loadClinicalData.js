// lib/loadClinicalData.js

let _cache = null;

async function fetchJson(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load ${path}`);
  return res.json();
}

export async function loadClinicalData() {
  if (_cache) return _cache;

  // IMPORTANT: these paths match your current app :contentReference[oaicite:2]{index=2}
  const [patients, encounters, conditions, medications, observations, imagingStudies] =
    await Promise.all([
      fetchJson("/data/patients.json"),
      fetchJson("/data/encounters.json"),
      fetchJson("/data/conditions.json"),
      fetchJson("/data/medications.json"),
      fetchJson("/data/observations.json"),
      fetchJson("/data/imaging_studies.json"),
    ]);

  _cache = {
    patients,
    encounters,
    conditions,
    medications,
    observations,
    imagingStudies,
  };

  return _cache;
}
