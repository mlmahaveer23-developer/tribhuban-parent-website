"""
Pydantic DTOs for the solar savings calculator endpoint.

Models
------
SolarEstimateRequest   — validated input (exactly one consumption field, state, connection type)
TariffAssumptions      — the assumption set echoed in each response
SolarEstimateResponse  — full result with camelCase aliases for JS/TS clients

Validation rules (Req 5.8)
--------------------------
- Exactly one of monthly_bill_minor / monthly_units_kwh must be provided and > 0.
- state must be present in the tariff table (checked at the router level so the
  tariff table is the single source of truth; a ValueError with a descriptive
  message is raised and mapped to HTTP 422 by the global exception handler).
- connection_type must be one of residential | commercial | industrial (enum).
- roof_area_sqm, if provided, must be > 0.
"""
from __future__ import annotations

from typing import Literal

from pydantic import AliasGenerator, BaseModel, ConfigDict, Field, model_validator
from pydantic.alias_generators import to_camel


# ── Assumptions (echoed in every response) ────────────────────────────────────

class TariffAssumptions(BaseModel):
    """The tariff entry used for the estimate, echoed in the response (Req 5.7)."""

    model_config = ConfigDict(
        populate_by_name=True,
        alias_generator=AliasGenerator(serialization_alias=to_camel),
    )

    tariff_minor_per_kwh: float = Field(
        description="Electricity tariff in Indian paise per kWh (100 p = ₹1)."
    )
    sun_hours_per_day: float = Field(
        description="Average peak-sun-hours per day for the state."
    )
    performance_ratio: float = Field(
        description="System performance ratio (0–1), accounting for losses."
    )
    cost_per_kw_minor: float = Field(
        description="Installed cost per kW in Indian paise."
    )


# ── Request ───────────────────────────────────────────────────────────────────

class SolarEstimateRequest(BaseModel):
    """
    Input for ``POST /api/v1/solar/estimate``.

    Exactly one of ``monthly_bill_minor`` or ``monthly_units_kwh`` must be
    provided and greater than zero.  Both present or neither present → HTTP 422.
    """

    model_config = ConfigDict(
        populate_by_name=True,
        alias_generator=AliasGenerator(serialization_alias=to_camel),
    )

    monthly_bill_minor: float | None = Field(
        default=None,
        description=(
            "Monthly electricity bill in Indian paise (INR minor units). "
            "Provide either this or monthly_units_kwh, not both."
        ),
    )
    monthly_units_kwh: float | None = Field(
        default=None,
        description=(
            "Monthly electricity consumption in kWh. "
            "Provide either this or monthly_bill_minor, not both."
        ),
    )
    state: str = Field(
        description=(
            "Indian state (lowercase, underscore-separated). "
            "Must be a key in the supported tariff table."
        ),
    )
    connection_type: Literal["residential", "commercial", "industrial"] = Field(
        description="Type of electricity connection."
    )
    roof_area_sqm: float | None = Field(
        default=None,
        description=(
            "Available roof area in square metres. "
            "When provided, caps the recommended system size. Must be > 0."
        ),
    )
    currency: str = Field(
        default="INR",
        description="Currency code for monetary outputs (default: INR).",
    )

    # ── Model-level validator ─────────────────────────────────────────────────

    @model_validator(mode="after")
    def exactly_one_input(self) -> "SolarEstimateRequest":
        """
        Enforce that exactly one of monthly_bill_minor / monthly_units_kwh is
        provided and positive (Req 5.8).

        Also validates roof_area_sqm > 0 when provided.
        """
        has_bill = self.monthly_bill_minor is not None
        has_units = self.monthly_units_kwh is not None

        # ── Mutual-exclusivity check ──────────────────────────────────────────
        if not has_bill and not has_units:
            raise ValueError(
                "Exactly one of monthly_bill_minor or monthly_units_kwh must be provided"
            )
        if has_bill and has_units:
            raise ValueError(
                "Exactly one of monthly_bill_minor or monthly_units_kwh must be provided"
            )

        # ── Positivity check ──────────────────────────────────────────────────
        if has_bill and self.monthly_bill_minor <= 0:  # type: ignore[operator]
            raise ValueError("Value must be greater than zero")
        if has_units and self.monthly_units_kwh <= 0:  # type: ignore[operator]
            raise ValueError("Value must be greater than zero")

        # ── Roof area check ───────────────────────────────────────────────────
        if self.roof_area_sqm is not None and self.roof_area_sqm <= 0:
            raise ValueError("roof_area_sqm must be greater than zero")

        return self


# ── Response ──────────────────────────────────────────────────────────────────

class SolarEstimateResponse(BaseModel):
    """
    Output of ``POST /api/v1/solar/estimate``.

    All monetary fields are in the ``currency`` field's minor units (paise for INR).
    camelCase aliases are used for JS/TS client compatibility; serialize with
    ``model_dump(by_alias=True)`` before returning from the endpoint.
    """

    model_config = ConfigDict(
        populate_by_name=True,
        alias_generator=AliasGenerator(serialization_alias=to_camel),
    )

    recommended_size_kw: float = Field(
        alias="recommendedSizeKw",
        description="Recommended system size in kW (rounded to nearest 0.25 kW).",
    )
    estimated_annual_generation_kwh: float = Field(
        alias="estimatedAnnualGenerationKwh",
        description="Estimated annual energy generation in kWh.",
    )
    estimated_annual_savings_minor: float = Field(
        alias="estimatedAnnualSavingsMinor",
        description=(
            "Estimated annual bill savings in minor currency units (paise for INR). "
            "Capped at annual consumption × tariff (never over-credits)."
        ),
    )
    currency: str = Field(
        description="Currency code for monetary fields (e.g. INR)."
    )
    payback_years: float = Field(
        alias="paybackYears",
        description="Simple payback period in years (installed cost ÷ annual savings).",
    )
    co2_offset_tonnes_per_year: float = Field(
        alias="co2OffsetTonnesPerYear",
        description="Estimated CO₂ offset in tonnes per year based on grid emission factor.",
    )
    assumptions: TariffAssumptions = Field(
        description="Assumption values used in this estimate, disclosed to the user (Req 5.7)."
    )
