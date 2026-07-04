/**
 * solar.ts — typed API client for the solar savings estimate endpoint.
 *
 * Uses the NEXT_PUBLIC_API_URL env var (falls back to http://localhost:8000).
 * All response fields are camelCase, matching the backend alias_generator.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

// ── Request / Response types ──────────────────────────────────────────────────

export interface SolarEstimateRequest {
  /** Monthly electricity bill in minor currency units (paise). Mutually exclusive with monthlyUnitsKwh. */
  monthlyBillMinor?: number;
  /** Monthly consumption in kWh. Mutually exclusive with monthlyBillMinor. */
  monthlyUnitsKwh?: number;
  /** Indian state key (e.g. "maharashtra") */
  state: string;
  connectionType: 'residential' | 'commercial' | 'industrial';
  /** Optional roof area in sqm — used to cap system size */
  roofAreaSqm?: number;
  /** Currency code — defaults to "INR" */
  currency?: string;
}

export interface SolarAssumptions {
  /** Electricity tariff in Indian paise per kWh */
  tariffMinorPerKwh: number;
  /** Average peak-sun-hours per day for the state */
  sunHoursPerDay: number;
  /** System performance ratio (0–1) */
  performanceRatio: number;
  /** Installed cost per kW in Indian paise */
  costPerKwMinor: number;
}

export interface SolarEstimateResponse {
  /** Recommended system size in kW */
  recommendedSizeKw: number;
  /** Estimated annual generation in kWh */
  estimatedAnnualGenerationKwh: number;
  /** Estimated annual savings in minor currency units (paise for INR) */
  estimatedAnnualSavingsMinor: number;
  /** Currency code */
  currency: string;
  /** Simple payback period in years */
  paybackYears: number;
  /** Estimated CO₂ offset in tonnes per year */
  co2OffsetTonnesPerYear: number;
  /** Assumptions used for this estimate — disclosed to the user (Req 5.7) */
  assumptions: SolarAssumptions;
}

// ── API error ─────────────────────────────────────────────────────────────────

export class SolarApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly detail: string,
  ) {
    super(detail);
    this.name = 'SolarApiError';
  }
}

// ── fetchSolarEstimate ────────────────────────────────────────────────────────

/**
 * Call POST /api/v1/solar/estimate and return the authoritative server result.
 *
 * Throws SolarApiError on 4xx/5xx responses.
 * Throws a generic Error on network failure.
 */
export async function fetchSolarEstimate(
  req: SolarEstimateRequest,
): Promise<SolarEstimateResponse> {
  const response = await fetch(`${API_BASE}/api/v1/solar/estimate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
    // Results are user-specific/query-driven — do not cache
    cache: 'no-store',
  });

  if (!response.ok) {
    let detail = `Request failed with status ${response.status}`;
    try {
      const body = await response.json();
      // Backend returns RFC 7807 error envelope: { error: { detail, fields } }
      if (body?.error?.detail) detail = body.error.detail;
      else if (body?.detail) detail = body.detail;
    } catch {
      // ignore parse errors
    }
    throw new SolarApiError(response.status, detail);
  }

  // Backend wraps response in { data: ..., meta: ... } envelope
  const envelope = await response.json() as { data: SolarEstimateResponse };
  return envelope.data;
}
