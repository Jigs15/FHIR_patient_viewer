// lib/getDashboardData.js
import { loadClinicalData } from "./loadClinicalData";
import {
  deriveDoctors,
  deriveAppointments,
  deriveCharges,
  deriveMedicineStock,
  deriveTrends,
  deriveHospitalKPIs,
} from "./deriveDashboards";

export async function getDashboardData() {
  const clinical = await loadClinicalData();
  const { patients, encounters, medications } = clinical;

  const { doctors, doctorByPatient } = deriveDoctors(patients);
  const appointments = deriveAppointments(encounters, patients, doctorByPatient, doctors);
  const { charges, totalBillAmount } = deriveCharges(encounters, patients);
  const medicineStock = deriveMedicineStock(medications);
  const trends = deriveTrends(encounters);
  const kpis = deriveHospitalKPIs(clinical);

  return {
    clinical,         // raw (patients, encounters, etc.)
    kpis,             // counts
    doctors,          // doctor list
    appointments,     // doctor’s appointment table
    charges,          // chart
    totalBillAmount,  // KPI
    medicineStock,    // stock chart/table
    trends,           // line chart
  };
}
