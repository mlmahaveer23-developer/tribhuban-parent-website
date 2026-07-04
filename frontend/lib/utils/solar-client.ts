/**
 * solar-client.ts
 *
 * Client-side tariff snapshot + optimistic solar estimate.
 *
 * This mirrors the backend INDIA_TARIFFS table and the §14.1 algorithm exactly
 * so the UI can show an instant preview. The server result is always authoritative.
 *
 * Constants
 * ---------
 * AREA_PER_KW     — sqm of roof area per kW installed (10 sqm/kW)
 * CO2_KG_PER_KWH  — India grid CO₂ intensity kg/kWh (CEA 2023, 0.82)
 */

import type { SolarEstimateRequest, SolarEstimateResponse } from '@/lib/api/solar';

// ── Physical / domain constants ───────────────────────────────────────────────

export const AREA_PER_KW = 10.0;       // sqm of roof area per kW installed
export const CO2_KG_PER_KWH = 0.82;   // kg CO₂ per kWh — India grid average, CEA 2023

// ── Tariff data model ─────────────────────────────────────────────────────────

export interface TariffEntry {
  /** Electricity tariff in Indian paise per kWh (100 paise = ₹1) */
  tariffMinorPerKwh: number;
  /** Average peak-sun-hours per day for the state */
  sunHoursPerDay: number;
  /** System performance ratio (0–1), accounting for losses */
  performanceRatio: number;
  /** Installed cost per kW in Indian paise */
  costPerKwMinor: number;
}

export type ConnectionType = 'residential' | 'commercial' | 'industrial';
export type TariffTable = Record<string, Record<ConnectionType, TariffEntry>>;

// ── India tariff snapshot ─────────────────────────────────────────────────────
// Mirrors backend INDIA_TARIFFS in backend/app/services/solar.py exactly.
// Source: CERC/SERC schedules FY 2023–24, MNRE benchmark, NISE solar data.

export const INDIA_TARIFFS: TariffTable = {
  maharashtra: {
    residential:  { tariffMinorPerKwh: 850,  sunHoursPerDay: 5.0, performanceRatio: 0.77, costPerKwMinor: 6_500_000 },
    commercial:   { tariffMinorPerKwh: 1000, sunHoursPerDay: 5.0, performanceRatio: 0.77, costPerKwMinor: 6_500_000 },
    industrial:   { tariffMinorPerKwh: 700,  sunHoursPerDay: 5.0, performanceRatio: 0.77, costPerKwMinor: 6_200_000 },
  },
  gujarat: {
    residential:  { tariffMinorPerKwh: 800,  sunHoursPerDay: 5.5, performanceRatio: 0.78, costPerKwMinor: 6_300_000 },
    commercial:   { tariffMinorPerKwh: 950,  sunHoursPerDay: 5.5, performanceRatio: 0.78, costPerKwMinor: 6_300_000 },
    industrial:   { tariffMinorPerKwh: 650,  sunHoursPerDay: 5.5, performanceRatio: 0.78, costPerKwMinor: 6_000_000 },
  },
  rajasthan: {
    residential:  { tariffMinorPerKwh: 750,  sunHoursPerDay: 6.0, performanceRatio: 0.78, costPerKwMinor: 6_200_000 },
    commercial:   { tariffMinorPerKwh: 920,  sunHoursPerDay: 6.0, performanceRatio: 0.78, costPerKwMinor: 6_200_000 },
    industrial:   { tariffMinorPerKwh: 620,  sunHoursPerDay: 6.0, performanceRatio: 0.78, costPerKwMinor: 5_900_000 },
  },
  karnataka: {
    residential:  { tariffMinorPerKwh: 870,  sunHoursPerDay: 5.2, performanceRatio: 0.76, costPerKwMinor: 6_500_000 },
    commercial:   { tariffMinorPerKwh: 1050, sunHoursPerDay: 5.2, performanceRatio: 0.76, costPerKwMinor: 6_500_000 },
    industrial:   { tariffMinorPerKwh: 720,  sunHoursPerDay: 5.2, performanceRatio: 0.76, costPerKwMinor: 6_200_000 },
  },
  tamil_nadu: {
    residential:  { tariffMinorPerKwh: 830,  sunHoursPerDay: 5.3, performanceRatio: 0.76, costPerKwMinor: 6_400_000 },
    commercial:   { tariffMinorPerKwh: 1000, sunHoursPerDay: 5.3, performanceRatio: 0.76, costPerKwMinor: 6_400_000 },
    industrial:   { tariffMinorPerKwh: 700,  sunHoursPerDay: 5.3, performanceRatio: 0.76, costPerKwMinor: 6_100_000 },
  },
  delhi: {
    residential:  { tariffMinorPerKwh: 900,  sunHoursPerDay: 4.8, performanceRatio: 0.75, costPerKwMinor: 6_800_000 },
    commercial:   { tariffMinorPerKwh: 1100, sunHoursPerDay: 4.8, performanceRatio: 0.75, costPerKwMinor: 6_800_000 },
    industrial:   { tariffMinorPerKwh: 750,  sunHoursPerDay: 4.8, performanceRatio: 0.75, costPerKwMinor: 6_500_000 },
  },
  uttar_pradesh: {
    residential:  { tariffMinorPerKwh: 700,  sunHoursPerDay: 4.9, performanceRatio: 0.75, costPerKwMinor: 6_200_000 },
    commercial:   { tariffMinorPerKwh: 900,  sunHoursPerDay: 4.9, performanceRatio: 0.75, costPerKwMinor: 6_200_000 },
    industrial:   { tariffMinorPerKwh: 600,  sunHoursPerDay: 4.9, performanceRatio: 0.75, costPerKwMinor: 6_000_000 },
  },
  west_bengal: {
    residential:  { tariffMinorPerKwh: 750,  sunHoursPerDay: 4.6, performanceRatio: 0.75, costPerKwMinor: 6_300_000 },
    commercial:   { tariffMinorPerKwh: 950,  sunHoursPerDay: 4.6, performanceRatio: 0.75, costPerKwMinor: 6_300_000 },
    industrial:   { tariffMinorPerKwh: 640,  sunHoursPerDay: 4.6, performanceRatio: 0.75, costPerKwMinor: 6_100_000 },
  },
  andhra_pradesh: {
    residential:  { tariffMinorPerKwh: 820,  sunHoursPerDay: 5.4, performanceRatio: 0.77, costPerKwMinor: 6_400_000 },
    commercial:   { tariffMinorPerKwh: 990,  sunHoursPerDay: 5.4, performanceRatio: 0.77, costPerKwMinor: 6_400_000 },
    industrial:   { tariffMinorPerKwh: 680,  sunHoursPerDay: 5.4, performanceRatio: 0.77, costPerKwMinor: 6_100_000 },
  },
  telangana: {
    residential:  { tariffMinorPerKwh: 840,  sunHoursPerDay: 5.5, performanceRatio: 0.77, costPerKwMinor: 6_400_000 },
    commercial:   { tariffMinorPerKwh: 1010, sunHoursPerDay: 5.5, performanceRatio: 0.77, costPerKwMinor: 6_400_000 },
    industrial:   { tariffMinorPerKwh: 700,  sunHoursPerDay: 5.5, performanceRatio: 0.77, costPerKwMinor: 6_100_000 },
  },
};

// ── Helper ────────────────────────────────────────────────────────────────────

/** Round value (kW) to the nearest 0.25 kW; minimum 0.25 kW. */
function roundToQuarterKw(value: number): number {
  const rounded = Math.round(value / 0.25) * 0.25;
  return Math.max(rounded, 0.25);
}

// ── Optimistic estimate ───────────────────────────────────────────────────────

/**
 * Run the §14.1 algorithm client-side against the local tariff snapshot.
 *
 * Produces an instant preview result. The server result via POST /api/v1/solar/estimate
 * is always authoritative and replaces this value once the fetch completes.
 *
 * Returns null if the state/connection type is not found in the local snapshot
 * (defensive — should not happen given validated inputs).
 */
export function estimateSolarOptimistic(
  req: SolarEstimateRequest,
): SolarEstimateResponse | null {
  const stateKey = req.state.toLowerCase();
  const connType = req.connectionType as ConnectionType;
  const stateTable = INDIA_TARIFFS[stateKey];
  if (!stateTable) return null;
  const t = stateTable[connType];
  if (!t) return null;

  // ── Step 1: Derive annual consumption ────────────────────────────────────
  let annualKwh: number;
  if (req.monthlyUnitsKwh !== undefined && req.monthlyUnitsKwh > 0) {
    annualKwh = req.monthlyUnitsKwh * 12;
  } else if (req.monthlyBillMinor !== undefined && req.monthlyBillMinor > 0) {
    annualKwh = (req.monthlyBillMinor / t.tariffMinorPerKwh) * 12;
  } else {
    return null;
  }

  // ── Step 2: Size system, then cap by roof area ────────────────────────────
  let idealKw = annualKwh / (t.sunHoursPerDay * 365 * t.performanceRatio);

  if (req.roofAreaSqm !== undefined && req.roofAreaSqm > 0) {
    const roofCapKw = req.roofAreaSqm / AREA_PER_KW;
    idealKw = Math.min(idealKw, roofCapKw);
  }

  const sizeKw = roundToQuarterKw(idealKw);

  // ── Step 3: Compute generation, savings, payback, CO₂ ────────────────────
  const genKwh = sizeKw * t.sunHoursPerDay * 365 * t.performanceRatio;
  const offsetKwh = Math.min(genKwh, annualKwh);   // never over-credit
  const savingsMinor = offsetKwh * t.tariffMinorPerKwh;
  const payback = (sizeKw * t.costPerKwMinor) / Math.max(savingsMinor, 1);
  const co2Tonnes = (genKwh * CO2_KG_PER_KWH) / 1000;

  return {
    recommendedSizeKw: sizeKw,
    estimatedAnnualGenerationKwh: genKwh,
    estimatedAnnualSavingsMinor: savingsMinor,
    currency: req.currency ?? 'INR',
    paybackYears: payback,
    co2OffsetTonnesPerYear: co2Tonnes,
    assumptions: {
      tariffMinorPerKwh: t.tariffMinorPerKwh,
      sunHoursPerDay: t.sunHoursPerDay,
      performanceRatio: t.performanceRatio,
      costPerKwMinor: t.costPerKwMinor,
    },
  };
}
