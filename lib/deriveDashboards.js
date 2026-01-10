// lib/deriveDashboards.js
import { hashString, mulberry32, pick, intInRange, numInRange } from "./seededRandom";

const DEPARTMENTS = [
  "General", "ICU", "Private", "Surgery", "Cardiology", "Neurology", "Orthopedics", "Dermatology",
];

const SPECIALIZATIONS = [
  "General Physician", "Cardiologist", "Neurologist", "Orthopedic", "Dermatologist", "Radiologist",
];

const MED_UNITS = ["tablet", "capsule", "ml", "vial"];

function monthLabel(dateStr) {
  // dateStr like 2024-01-31 or 2024-01-31T...
  const d = new Date(dateStr);
  const m = d.toLocaleString("en-US", { month: "short" });
  return `${m}-${String(d.getFullYear()).slice(-2)}`;
}

export function deriveDoctors(patients) {
  // Create 8 doctors deterministically (matches your reference UI count style)
  const baseSeed = hashString("doctors_seed_v1");
  const rand = mulberry32(baseSeed);

  const docs = Array.from({ length: 8 }).map((_, i) => {
    const r = mulberry32(hashString(`doc_${i}_${baseSeed}`));
    const first = pick(r, ["Ajay", "Anita", "Rahul", "Kishore", "Sneha", "Rajiv", "Deepak", "Vikram"]);
    const last = pick(r, ["Nair", "Patel", "Sharma", "Verma", "Reddy", "Saxena", "Khanna", "Kumar"]);
    const specialization = pick(r, SPECIALIZATIONS);

    return {
      doctor_id: `D-${100 + i}`,
      doctor_name: `Dr. ${first} ${last}`,
      specialization,
      department: pick(r, DEPARTMENTS),
      salary: intInRange(r, 90000, 180000),
      commission_rate: numInRange(r, 0.05, 0.15, 2),
      status: pick(r, ["Available", "Occupied"]),
      rating: numInRange(r, 3.5, 5.0, 1),
    };
  });

  // Assign a “primary doctor” to each patient deterministically by patient_id
  const doctorByPatient = new Map();
  patients.forEach((p) => {
    const r = mulberry32(hashString(`assign_${p.patient_id}`));
    const doc = docs[intInRange(r, 0, docs.length - 1)];
    doctorByPatient.set(p.patient_id, doc.doctor_id);
  });

  return { doctors: docs, doctorByPatient };
}

export function deriveAppointments(encounters, patients, doctorByPatient, doctors) {
  // Convert encounters -> appointment-like rows
  const doctorMap = new Map(doctors.map((d) => [d.doctor_id, d]));
  const patientMap = new Map(patients.map((p) => [p.patient_id, p]));

  // Keep it light: take up to 80
  const rows = encounters.slice(0, 80).map((e, idx) => {
    const pid = e.patient_id;
    const docId = doctorByPatient.get(pid);
    const doc = doctorMap.get(docId);
    const p = patientMap.get(pid);

    const r = mulberry32(hashString(`appt_${pid}_${e.encounter_id ?? idx}`));
    const reason = pick(r, ["Followup", "Chest Pain", "Heart Checkup", "Skin Check", "Lab Review", "Consultation"]);
    const suggest = pick(r, ["prescribed medication", "ECG performed", "tests ordered", "admission advised", "follow-up"]);

    return {
      doctor_name: doc?.doctor_name ?? "Dr. Assigned",
      patient_name: p ? `${p.first_name} ${p.last_name}` : `Patient ${pid}`,
      reason,
      suggest,
      status: pick(r, ["Completed", "Pending"]),
      encounter_date: e.encounter_date ?? e.date ?? "2024-01-01",
      doctors_fee: numInRange(r, 60, 250, 0),
    };
  });

  return rows;
}

export function deriveCharges(encounters, patients) {
  // Build “Patient Charges type” chart like your screenshots
  // Create deterministic amount per encounter and bucket it.
  const buckets = new Map([
    ["Surgery", 0],
    ["Room", 0],
    ["Test", 0],
    ["Medicine", 0],
    ["Fees", 0],
    ["Other", 0],
    ["Discount", 0],
  ]);

  encounters.forEach((e, idx) => {
    const pid = e.patient_id;
    const r = mulberry32(hashString(`charge_${pid}_${e.encounter_id ?? idx}`));

    // base encounter cost
    const base = numInRange(r, 120, 2500, 2);

    // assign bucket by encounter_type if present; else random
    const type = (e.encounter_type || "").toLowerCase();
    let bucket = "Other";
    if (type.includes("surg")) bucket = "Surgery";
    else if (type.includes("inpatient")) bucket = "Room";
    else if (type.includes("outpatient")) bucket = "Fees";
    else bucket = pick(r, ["Test", "Medicine", "Fees", "Other"]);

    buckets.set(bucket, buckets.get(bucket) + base);

    // small med add-on
    buckets.set("Medicine", buckets.get("Medicine") + numInRange(r, 5, 40, 2));

    // occasional discount
    if (r() < 0.08) buckets.set("Discount", buckets.get("Discount") + numInRange(r, 10, 120, 2));
  });

  // Return chart array
  const out = Array.from(buckets.entries()).map(([type, amount]) => ({
    type,
    amount: Number(amount.toFixed(2)),
  }));

  // Total bill amount
  const total = out.reduce((s, x) => s + x.amount, 0);

  return { charges: out, totalBillAmount: Number(total.toFixed(2)) };
}

export function deriveMedicineStock(medications) {
  // Medicine stock table/chart
  const medMap = new Map();

  medications.forEach((m, idx) => {
    const name = (m.medication_name || m.name || "Medication").trim();
    const r = mulberry32(hashString(`med_${name}_${idx}`));

    const saleQty = intInRange(r, 5, 120);
    const stockQty = intInRange(r, saleQty + 20, saleQty + 450);

    if (!medMap.has(name)) {
      medMap.set(name, {
        name,
        unit: pick(r, MED_UNITS),
        saleQty,
        stockQty,
      });
    } else {
      const existing = medMap.get(name);
      existing.saleQty += saleQty;
      existing.stockQty += intInRange(r, 10, 40);
    }
  });

  return Array.from(medMap.values())
    .sort((a, b) => b.saleQty - a.saleQty)
    .slice(0, 12);
}

export function deriveTrends(encounters) {
  // Monthly medicine sale & discharge trend (simple)
  const monthly = new Map();

  encounters.forEach((e, idx) => {
    const d = e.encounter_date ?? e.date ?? "2024-01-01";
    const key = monthLabel(d);
    const r = mulberry32(hashString(`trend_${key}_${idx}`));
    const qty = intInRange(r, 20, 160);
    monthly.set(key, (monthly.get(key) || 0) + qty);
  });

  const series = Array.from(monthly.entries())
    .map(([month, value]) => ({ month, value }))
    .sort((a, b) => a.month.localeCompare(b.month));

  return series.slice(-6); // last 6 months style
}

export function deriveHospitalKPIs({ patients, encounters, medications }) {
  // Similar KPIs to your reference screenshots
  const { doctors } = deriveDoctors(patients); // stable seed anyway
  const doctorCount = doctors.length;

  return {
    patientCount: patients.length,
    doctorCount,
    staffCount: 20,         // static but realistic
    billCount: encounters.length,
    medSaleQty: medications.length,
    roomCount: 13,
    stockQty: 15,
    femaleCount: patients.filter((p) => (p.gender || "").toLowerCase().startsWith("f")).length,
    maleCount: patients.filter((p) => (p.gender || "").toLowerCase().startsWith("m")).length,
  };
}
