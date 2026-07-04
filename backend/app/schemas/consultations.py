"""
Pydantic request / response schemas for the Consultation endpoints.

ConsultationCreateRequest  — body of POST /api/v1/consultations
ConsultationResponse       — returned on successful creation (HTTP 202)
ConsultationStatusResponse — returned by GET /api/v1/consultations/{referenceCode}
                             (NO PII — status only)

Validation rules (Req 7.2, 7.3, 7.4):
  - full_name: 1–100 chars
  - email: RFC 5322 format, ≤ 254 chars
  - phone: 7–15 digits (strip non-digit chars then check length)
  - preferred_date: future date, > today UTC, ≤ 365 days out
  - preferred_time_window: morning|afternoon|evening
  - interest_area: solar|products|future_tech|careers|support|other
"""
from __future__ import annotations

import re
from datetime import date, datetime, timezone, timedelta
from typing import Literal

from pydantic import AliasGenerator, BaseModel, ConfigDict, Field, field_validator, model_validator
from pydantic.alias_generators import to_camel

# ── Literal type aliases ───────────────────────────────────────────────────────

TimeWindow = Literal["morning", "afternoon", "evening"]

InterestArea = Literal[
    "solar",
    "products",
    "future_tech",
    "careers",
    "support",
    "other",
]

ConsultationStatus = Literal[
    "requested",
    "confirmed",
    "completed",
    "cancelled",
    "no_show",
]

# ── Email validation regex (reuse same pattern as leads schema) ───────────────
_EMAIL_RE: re.Pattern[str] = re.compile(
    r"^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+"
    r"@"
    r"[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?"
    r"(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*"
    r"\.[a-zA-Z]{2,}$"
)

# ── Date range constants ───────────────────────────────────────────────────────
_MAX_DAYS_AHEAD: int = 365


# ── Request schema ─────────────────────────────────────────────────────────────


class ConsultationCreateRequest(BaseModel):
    """Body for ``POST /api/v1/consultations``."""

    model_config = ConfigDict(
        populate_by_name=True,
        alias_generator=AliasGenerator(serialization_alias=to_camel),
    )

    full_name: str = Field(
        ...,
        min_length=1,
        max_length=100,
        alias="fullName",
        description="Visitor's full name.",
    )

    email: str = Field(
        ...,
        max_length=254,
        description="RFC 5322 email address.",
    )

    phone: str = Field(
        ...,
        min_length=7,
        max_length=15,
        description="Phone number — 7 to 15 digits (non-digit chars are stripped before counting).",
    )

    interest_area: InterestArea = Field(
        ...,
        alias="interestArea",
        description="Primary area of interest.",
    )

    location: str | None = Field(
        None,
        max_length=255,
        description="Optional preferred consultation location.",
    )

    preferred_date: str = Field(
        ...,
        alias="preferredDate",
        description="Preferred consultation date as an ISO 8601 date string (YYYY-MM-DD).",
    )

    preferred_time_window: TimeWindow = Field(
        ...,
        alias="preferredTimeWindow",
        description="Preferred time of day: morning, afternoon, or evening.",
    )

    message: str | None = Field(
        None,
        max_length=2000,
        description="Optional free-text message.",
    )

    context: dict | None = Field(
        None,
        description="Arbitrary JSON context (e.g. calculator results).",
    )

    utm: dict | None = Field(
        None,
        description="Marketing attribution data.",
    )

    consent_marketing: bool = Field(
        False,
        alias="consentMarketing",
        description="Whether the visitor consented to marketing use of their data.",
    )

    # ── Validators ─────────────────────────────────────────────────────────────

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        """Reject strings that don't match the basic RFC 5322 addr-spec pattern."""
        v = v.strip()
        if not v:
            raise ValueError("email must not be empty")
        if not _EMAIL_RE.match(v):
            raise ValueError("value is not a valid email address")
        return v

    @field_validator("phone")
    @classmethod
    def validate_phone_digits(cls, v: str) -> str:
        """Strip non-digit characters and verify the digit count is 7–15."""
        digits = re.sub(r"\D", "", v)
        if len(digits) < 7:
            raise ValueError("phone must contain at least 7 digits")
        if len(digits) > 15:
            raise ValueError("phone must contain at most 15 digits")
        return v  # preserve original value; digit count is validated

    @model_validator(mode="after")
    def validate_preferred_date(self) -> "ConsultationCreateRequest":
        """Ensure preferred_date is a valid future date within 365 days of today (UTC).

        Req 7.4: > today UTC and ≤ 365 days out.
        """
        try:
            parsed: date = date.fromisoformat(self.preferred_date)
        except (TypeError, ValueError) as exc:
            raise ValueError(
                "preferredDate must be a valid ISO 8601 date (YYYY-MM-DD)"
            ) from exc

        today: date = datetime.now(timezone.utc).date()
        max_date: date = today + timedelta(days=_MAX_DAYS_AHEAD)

        if parsed <= today:
            raise ValueError(
                "preferredDate must be a future date (later than today UTC)"
            )
        if parsed > max_date:
            raise ValueError(
                f"preferredDate must be within {_MAX_DAYS_AHEAD} days from today"
            )

        return self


# ── Response schemas ───────────────────────────────────────────────────────────


class ConsultationResponse(BaseModel):
    """Returned by ``POST /api/v1/consultations`` on success (HTTP 202)."""

    model_config = ConfigDict(
        populate_by_name=True,
        alias_generator=AliasGenerator(serialization_alias=to_camel),
    )

    id: str
    """UUID of the created consultation record."""

    reference_code: str = Field(
        ...,
        alias="referenceCode",
        description="Short human-readable reference code for the booking.",
    )

    status: ConsultationStatus
    """Current status of the consultation (always ``'requested'`` on creation)."""

    created_at: str = Field(
        ...,
        alias="createdAt",
        description="ISO 8601 UTC timestamp of creation.",
    )


class ConsultationStatusResponse(BaseModel):
    """Returned by ``GET /api/v1/consultations/{referenceCode}``.

    Contains NO PII — status only (Req 7.7, 7.8).
    """

    model_config = ConfigDict(
        populate_by_name=True,
        alias_generator=AliasGenerator(serialization_alias=to_camel),
    )

    reference_code: str = Field(
        ...,
        alias="referenceCode",
        description="The consultation reference code.",
    )

    status: ConsultationStatus
    """Current pipeline status of the consultation."""


# ── Rebuild models (required because of `from __future__ import annotations`) ──
ConsultationCreateRequest.model_rebuild()
ConsultationResponse.model_rebuild()
ConsultationStatusResponse.model_rebuild()
