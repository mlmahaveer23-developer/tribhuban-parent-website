"""
Solar savings estimation service.

Implements the pure ``estimate_solar`` function (§14.1) and the India tariff table.

Constants
---------
AREA_PER_KW      : sqm of roof area required per kW of installed capacity
                   (standard residential panel density, ~10 sqm/kW)
CO2_KG_PER_KWH   : India grid-average CO₂ intensity in kg per kWh
                   (CEA 2023 estimate ~0.82 kg/kWh)
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    pass

# ── Physical / domain constants ───────────────────────────────────────────────

AREA_PER_KW: float = 10.0       # sqm of roof area per kW of installed capacity
CO2_KG_PER_KWH: float = 0.82   # kg CO₂ per kWh (India grid average, CEA 2023)


# ── Tariff data model ─────────────────────────────────────────────────────────

@dataclass(frozen=True)
class TariffEntry:
    """
    Per-state, per-connection-type tariff configuration.

    Attributes
    ----------
    tariff_minor_per_kwh  : electricity tariff in Indian paise per kWh
                            (100 paise = ₹1; residential ~700–900 p/kWh)
    sun_hours_per_day     : average peak-sun-hours per day for the state
                            (range 4.5 – 6.5 h/day across India)
    performance_ratio     : system performance ratio accounting for losses
                            (inverter, wiring, temperature de-rating; ~0.75–0.80)
    cost_per_kw_minor     : installed cost per kW in Indian paise
                            (₹60,000–₹75,000/kW → 6,000,000–7,500,000 paise)
    """
    tariff_minor_per_kwh: float
    sun_hours_per_day: float
    performance_ratio: float
    cost_per_kw_minor: float


# ── India tariff table ────────────────────────────────────────────────────────
# Keyed: state (lowercase, underscore-separated) → connection_type → TariffEntry
#
# Tariff values source: CERC/SERC published schedules (FY 2023–24 approx.)
# Cost values: MNRE benchmark + market surveys Q1 2024
# Sun hours: NISE solar radiation data (annual average peak sun hours/day)
# Performance ratio: industry standard 0.75–0.80 for Indian conditions

INDIA_TARIFFS: dict[str, dict[str, TariffEntry]] = {
    "maharashtra": {
        "residential": TariffEntry(
            tariff_minor_per_kwh=850.0,
            sun_hours_per_day=5.0,
            performance_ratio=0.77,
            cost_per_kw_minor=6_500_000.0,
        ),
        "commercial": TariffEntry(
            tariff_minor_per_kwh=1000.0,
            sun_hours_per_day=5.0,
            performance_ratio=0.77,
            cost_per_kw_minor=6_500_000.0,
        ),
        "industrial": TariffEntry(
            tariff_minor_per_kwh=700.0,
            sun_hours_per_day=5.0,
            performance_ratio=0.77,
            cost_per_kw_minor=6_200_000.0,
        ),
    },
    "gujarat": {
        "residential": TariffEntry(
            tariff_minor_per_kwh=800.0,
            sun_hours_per_day=5.5,
            performance_ratio=0.78,
            cost_per_kw_minor=6_300_000.0,
        ),
        "commercial": TariffEntry(
            tariff_minor_per_kwh=950.0,
            sun_hours_per_day=5.5,
            performance_ratio=0.78,
            cost_per_kw_minor=6_300_000.0,
        ),
        "industrial": TariffEntry(
            tariff_minor_per_kwh=650.0,
            sun_hours_per_day=5.5,
            performance_ratio=0.78,
            cost_per_kw_minor=6_000_000.0,
        ),
    },
    "rajasthan": {
        "residential": TariffEntry(
            tariff_minor_per_kwh=750.0,
            sun_hours_per_day=6.0,
            performance_ratio=0.78,
            cost_per_kw_minor=6_200_000.0,
        ),
        "commercial": TariffEntry(
            tariff_minor_per_kwh=920.0,
            sun_hours_per_day=6.0,
            performance_ratio=0.78,
            cost_per_kw_minor=6_200_000.0,
        ),
        "industrial": TariffEntry(
            tariff_minor_per_kwh=620.0,
            sun_hours_per_day=6.0,
            performance_ratio=0.78,
            cost_per_kw_minor=5_900_000.0,
        ),
    },
    "karnataka": {
        "residential": TariffEntry(
            tariff_minor_per_kwh=870.0,
            sun_hours_per_day=5.2,
            performance_ratio=0.76,
            cost_per_kw_minor=6_500_000.0,
        ),
        "commercial": TariffEntry(
            tariff_minor_per_kwh=1050.0,
            sun_hours_per_day=5.2,
            performance_ratio=0.76,
            cost_per_kw_minor=6_500_000.0,
        ),
        "industrial": TariffEntry(
            tariff_minor_per_kwh=720.0,
            sun_hours_per_day=5.2,
            performance_ratio=0.76,
            cost_per_kw_minor=6_200_000.0,
        ),
    },
    "tamil_nadu": {
        "residential": TariffEntry(
            tariff_minor_per_kwh=830.0,
            sun_hours_per_day=5.3,
            performance_ratio=0.76,
            cost_per_kw_minor=6_400_000.0,
        ),
        "commercial": TariffEntry(
            tariff_minor_per_kwh=1000.0,
            sun_hours_per_day=5.3,
            performance_ratio=0.76,
            cost_per_kw_minor=6_400_000.0,
        ),
        "industrial": TariffEntry(
            tariff_minor_per_kwh=700.0,
            sun_hours_per_day=5.3,
            performance_ratio=0.76,
            cost_per_kw_minor=6_100_000.0,
        ),
    },
    "delhi": {
        "residential": TariffEntry(
            tariff_minor_per_kwh=900.0,
            sun_hours_per_day=4.8,
            performance_ratio=0.75,
            cost_per_kw_minor=6_800_000.0,
        ),
        "commercial": TariffEntry(
            tariff_minor_per_kwh=1100.0,
            sun_hours_per_day=4.8,
            performance_ratio=0.75,
            cost_per_kw_minor=6_800_000.0,
        ),
        "industrial": TariffEntry(
            tariff_minor_per_kwh=750.0,
            sun_hours_per_day=4.8,
            performance_ratio=0.75,
            cost_per_kw_minor=6_500_000.0,
        ),
    },
    "uttar_pradesh": {
        "residential": TariffEntry(
            tariff_minor_per_kwh=700.0,
            sun_hours_per_day=4.9,
            performance_ratio=0.75,
            cost_per_kw_minor=6_200_000.0,
        ),
        "commercial": TariffEntry(
            tariff_minor_per_kwh=900.0,
            sun_hours_per_day=4.9,
            performance_ratio=0.75,
            cost_per_kw_minor=6_200_000.0,
        ),
        "industrial": TariffEntry(
            tariff_minor_per_kwh=600.0,
            sun_hours_per_day=4.9,
            performance_ratio=0.75,
            cost_per_kw_minor=6_000_000.0,
        ),
    },
    "west_bengal": {
        "residential": TariffEntry(
            tariff_minor_per_kwh=750.0,
            sun_hours_per_day=4.6,
            performance_ratio=0.75,
            cost_per_kw_minor=6_300_000.0,
        ),
        "commercial": TariffEntry(
            tariff_minor_per_kwh=950.0,
            sun_hours_per_day=4.6,
            performance_ratio=0.75,
            cost_per_kw_minor=6_300_000.0,
        ),
        "industrial": TariffEntry(
            tariff_minor_per_kwh=640.0,
            sun_hours_per_day=4.6,
            performance_ratio=0.75,
            cost_per_kw_minor=6_100_000.0,
        ),
    },
    "andhra_pradesh": {
        "residential": TariffEntry(
            tariff_minor_per_kwh=820.0,
            sun_hours_per_day=5.4,
            performance_ratio=0.77,
            cost_per_kw_minor=6_400_000.0,
        ),
        "commercial": TariffEntry(
            tariff_minor_per_kwh=990.0,
            sun_hours_per_day=5.4,
            performance_ratio=0.77,
            cost_per_kw_minor=6_400_000.0,
        ),
        "industrial": TariffEntry(
            tariff_minor_per_kwh=680.0,
            sun_hours_per_day=5.4,
            performance_ratio=0.77,
            cost_per_kw_minor=6_100_000.0,
        ),
    },
    "telangana": {
        "residential": TariffEntry(
            tariff_minor_per_kwh=840.0,
            sun_hours_per_day=5.5,
            performance_ratio=0.77,
            cost_per_kw_minor=6_400_000.0,
        ),
        "commercial": TariffEntry(
            tariff_minor_per_kwh=1010.0,
            sun_hours_per_day=5.5,
            performance_ratio=0.77,
            cost_per_kw_minor=6_400_000.0,
        ),
        "industrial": TariffEntry(
            tariff_minor_per_kwh=700.0,
            sun_hours_per_day=5.5,
            performance_ratio=0.77,
            cost_per_kw_minor=6_100_000.0,
        ),
    },
}


# ── Helper ────────────────────────────────────────────────────────────────────

def _round_to_quarter_kw(value: float) -> float:
    """
    Round *value* (kW) to the nearest 0.25 kW increment.

    Implementation:  round(value / 0.25) * 0.25
    Minimum result:  0.25 kW (never returns zero or negative).
    """
    rounded = round(value / 0.25) * 0.25
    return max(rounded, 0.25)


# ── Core pure function ────────────────────────────────────────────────────────

def estimate_solar(
    req: "SolarEstimateRequest",  # noqa: F821 — forward ref resolved at runtime
    tariffs: dict[str, dict[str, TariffEntry]],
) -> "SolarEstimateResponse":  # noqa: F821
    """
    Compute a rooftop solar recommendation and savings estimate (§14.1).

    This function is **pure** — it performs no I/O, modifies no global state, and
    is fully deterministic: identical inputs always produce identical outputs.

    Parameters
    ----------
    req     : SolarEstimateRequest — validated request DTO (preconditions already
              enforced by the Pydantic model validator).
    tariffs : tariff table; production callers pass ``INDIA_TARIFFS``.

    Returns
    -------
    SolarEstimateResponse — all result fields plus the assumption set used.

    Preconditions (validated by Pydantic model, but documented here for purity):
    - Exactly one of req.monthly_bill_minor / req.monthly_units_kwh is provided and > 0.
    - req.state is a key in tariffs and req.connection_type is a key in tariffs[req.state].
    - req.roof_area_sqm, if provided, is > 0.

    Postconditions:
    - recommended_size_kw >= 0.25 kW (minimum after rounding).
    - payback_years > 0.
    - estimated_annual_savings_minor <= annual_consumption_kwh * tariff_minor_per_kwh.
    - If roof_area_sqm provided: size_kw <= roof_area_sqm / AREA_PER_KW + ε.
    """
    # Late import to avoid circular imports at module load time.
    from app.schemas.solar import SolarEstimateResponse, TariffAssumptions  # noqa: PLC0415

    # ── Step 1: Look up tariff ────────────────────────────────────────────────
    t: TariffEntry = tariffs[req.state][req.connection_type]

    # ── Step 2: Derive annual consumption ────────────────────────────────────
    if req.monthly_units_kwh is not None:
        annual_kwh: float = req.monthly_units_kwh * 12.0
    else:
        # monthly_bill_minor must be set (validated by model)
        annual_kwh = (req.monthly_bill_minor / t.tariff_minor_per_kwh) * 12.0  # type: ignore[operator]

    # ── Step 3: Size system, then cap by roof area ────────────────────────────
    ideal_kw: float = annual_kwh / (t.sun_hours_per_day * 365.0 * t.performance_ratio)

    if req.roof_area_sqm is not None:
        roof_cap_kw = req.roof_area_sqm / AREA_PER_KW
        ideal_kw = min(ideal_kw, roof_cap_kw)

    size_kw: float = _round_to_quarter_kw(ideal_kw)

    # ── Step 4: Compute generation, savings, payback, CO₂ ────────────────────
    gen_kwh: float = size_kw * t.sun_hours_per_day * 365.0 * t.performance_ratio
    offset_kwh: float = min(gen_kwh, annual_kwh)          # never over-credit
    savings_minor: float = offset_kwh * t.tariff_minor_per_kwh
    payback: float = (size_kw * t.cost_per_kw_minor) / max(savings_minor, 1.0)
    co2_tonnes: float = gen_kwh * CO2_KG_PER_KWH / 1000.0  # kg → tonnes

    # ── Step 5: Build and return response ────────────────────────────────────
    assumptions = TariffAssumptions(
        tariff_minor_per_kwh=t.tariff_minor_per_kwh,
        sun_hours_per_day=t.sun_hours_per_day,
        performance_ratio=t.performance_ratio,
        cost_per_kw_minor=t.cost_per_kw_minor,
    )

    return SolarEstimateResponse(
        recommendedSizeKw=size_kw,
        estimatedAnnualGenerationKwh=gen_kwh,
        estimatedAnnualSavingsMinor=savings_minor,
        currency=req.currency,
        paybackYears=payback,
        co2OffsetTonnesPerYear=co2_tonnes,
        assumptions=assumptions,
    )
