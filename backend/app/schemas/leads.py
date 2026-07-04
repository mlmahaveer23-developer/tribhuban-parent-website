"""
Pydantic request / response schemas for the Lead endpoints.

LeadCreateRequest  — body of POST /api/v1/leads and POST /api/v1/contact
LeadResponse       — returned by both endpoints after a successful write
UTMData            — nested UTM attribution payload
"""
from __future__ import annotations

import re
from datetime import datetime
from typing import Literal

# NOTE: model_rebuild() calls at the bottom of this module are required because
# ``from __future__ import annotations`` turns all annotations into strings,
# and Pydantic v2 needs an explicit rebuild when Literal type aliases are used
# as annotation values defined in the same module.

from pydantic import AliasGenerator, BaseModel, ConfigDict, Field, field_validator
from pydantic.alias_generators import to_camel

# ── Literal type aliases (mirrored from domain enums) ─────────────────────────

LeadSource = Literal[
    "contact",
    "calculator",
    "consultation",
    "product_interest",
    "newsletter",
    "career_interest",
]

InterestArea = Literal[
    "solar",
    "products",
    "future_tech",
    "careers",
    "support",
    "other",
]

LeadStatus = Literal[
    "new",
    "qualified",
    "contacted",
    "converted",
    "disqualified",
    "spam",
]

QualityBand = Literal["cold", "warm", "hot"]

# ── Email validation regex (basic RFC 5322 addr-spec) ─────────────────────────
# This is intentionally lenient — full RFC 5322 parsing is complex and the
# domain layer applies additional disposable-email checks.
_EMAIL_RE: re.Pattern[str] = re.compile(
    r"^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+"
    r"@"
    r"[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?"
    r"(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*"
    r"\.[a-zA-Z]{2,}$"
)


# ── Nested schemas ────────────────────────────────────────────────────────────


class UTMData(BaseModel):
    """Marketing attribution data attached to a form submission."""

    model_config = ConfigDict(
        populate_by_name=True,
        alias_generator=AliasGenerator(serialization_alias=to_camel),
    )

    source: str | None = None
    medium: str | None = None
    campaign: str | None = None
    term: str | None = None
    content: str | None = None
    referrer: str | None = None
    landing_page: str | None = Field(None, alias="landingPage")
    gclid: str | None = None
    fbclid: str | None = None


# ── Request schema ────────────────────────────────────────────────────────────


class LeadCreateRequest(BaseModel):
    """Body for ``POST /api/v1/leads`` and ``POST /api/v1/contact``."""

    model_config = ConfigDict(
        populate_by_name=True,
        alias_generator=AliasGenerator(serialization_alias=to_camel),
    )

    source: LeadSource

    full_name: str = Field(
        ...,
        min_length=1,
        max_length=255,
        alias="fullName",
        description="Visitor's full name.",
    )

    email: str = Field(
        ...,
        max_length=254,
        description="RFC 5322 email address.",
    )

    phone: str | None = Field(
        None,
        max_length=20,
        description="Optional phone number (any format).",
    )

    company: str | None = Field(
        None,
        max_length=255,
        description="Optional company or organisation name (B2B signal).",
    )

    message: str | None = Field(
        None,
        max_length=2000,
        description="Optional free-text message.",
    )

    interest_area: InterestArea = Field(
        ...,
        alias="interestArea",
        description="The visitor's primary area of interest.",
    )

    context: dict | None = Field(
        None,
        description="Arbitrary JSON context (e.g. calculator results, prefill data).",
    )

    utm: UTMData | None = Field(
        None,
        description="Marketing attribution data captured by the frontend.",
    )

    consent_marketing: bool = Field(
        False,
        alias="consentMarketing",
        description="Whether the visitor consented to marketing use of their data.",
    )

    # ── Honeypot field — must be empty for legitimate submissions ─────────────
    website: str | None = Field(
        None,
        description=(
            "Honeypot field — bots fill this in. "
            "A non-empty value indicates a spam submission."
        ),
    )

    # ── Time-to-submit heuristic ──────────────────────────────────────────────
    page_load_at: datetime | None = Field(
        None,
        alias="pageLoadAt",
        description=(
            "ISO 8601 UTC timestamp when the page/form was first loaded. "
            "Used with submitted_at to detect bot submissions (< 3 s → spam)."
        ),
    )

    submitted_at: datetime | None = Field(
        None,
        alias="submittedAt",
        description="ISO 8601 UTC timestamp of form submission (client-side clock).",
    )

    # ── Consent details (required when consentMarketing=True) ─────────────────
    consent_timestamp: str | None = Field(
        None,
        alias="consentTimestamp",
        description=(
            "ISO 8601 UTC timestamp of marketing consent grant. "
            "Required when consentMarketing=true."
        ),
    )

    consent_ip: str | None = Field(
        None,
        alias="consentIp",
        description=(
            "IP address at the time of consent. "
            "Populated server-side from X-Forwarded-For / client host. "
            "May be supplied by the client as a hint but is always overridden."
        ),
    )

    # ── Validators ────────────────────────────────────────────────────────────

    @field_validator("email")
    @classmethod
    def validate_email_format(cls, v: str) -> str:
        """Reject strings that don't match the basic RFC 5322 addr-spec pattern."""
        v = v.strip()
        if not v:
            raise ValueError("email must not be empty")
        if not _EMAIL_RE.match(v):
            raise ValueError("value is not a valid email address")
        return v


# ── Response schema ───────────────────────────────────────────────────────────


class LeadResponse(BaseModel):
    """Returned by lead-creation endpoints on success."""

    model_config = ConfigDict(
        populate_by_name=True,
        alias_generator=AliasGenerator(serialization_alias=to_camel),
    )

    id: str
    """UUID of the created lead record."""

    reference_code: str = Field(
        ...,
        alias="referenceCode",
        description="Short human-readable reference code for the submission.",
    )

    status: LeadStatus
    """Pipeline status of the lead (always ``'new'`` on creation via public API)."""

    score: int
    """Computed lead score in [0, 100]."""

    quality: QualityBand
    """Derived quality band: ``'hot'``, ``'warm'``, or ``'cold'``."""

    created_at: str = Field(
        ...,
        alias="createdAt",
        description="ISO 8601 UTC timestamp of creation.",
    )


# ── Rebuild models so Pydantic resolves all forward-reference annotations ─────
# Required because `from __future__ import annotations` defers annotation
# evaluation; Pydantic v2 needs model_rebuild() to resolve Literal aliases.
UTMData.model_rebuild()
LeadCreateRequest.model_rebuild()
LeadResponse.model_rebuild()
