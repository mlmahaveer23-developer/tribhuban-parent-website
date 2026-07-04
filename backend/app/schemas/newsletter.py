"""
Pydantic request / response schemas for the Newsletter endpoints.

NewsletterSubscribeRequest   — body of POST /api/v1/newsletter/subscribe
NewsletterSubscribeResponse  — returned on subscribe (pending / already_*)
NewsletterConfirmResponse    — returned on GET /api/v1/newsletter/confirm
NewsletterUnsubscribeRequest — body of POST /api/v1/newsletter/unsubscribe
NewsletterUnsubscribeResponse — returned on unsubscribe
"""
from __future__ import annotations

import re

from pydantic import AliasGenerator, BaseModel, ConfigDict, Field, field_validator
from pydantic.alias_generators import to_camel

# ── Email validation regex (RFC 5322 addr-spec, matches leads.py pattern) ─────
_EMAIL_RE: re.Pattern[str] = re.compile(
    r"^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+"
    r"@"
    r"[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?"
    r"(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*"
    r"\.[a-zA-Z]{2,}$"
)


# ── Subscribe ─────────────────────────────────────────────────────────────────


class NewsletterSubscribeRequest(BaseModel):
    """Body for ``POST /api/v1/newsletter/subscribe``."""

    model_config = ConfigDict(
        populate_by_name=True,
        alias_generator=AliasGenerator(serialization_alias=to_camel),
    )

    email: str = Field(
        ...,
        max_length=254,
        description="RFC 5322 addr-spec email address (1–254 chars).",
    )
    source: str | None = Field(
        None,
        max_length=50,
        description="Optional subscription source hint (e.g. 'footer', 'home_cta').",
    )

    @field_validator("email")
    @classmethod
    def validate_email_format(cls, v: str) -> str:
        """Reject empty strings and strings that don't match RFC 5322 addr-spec."""
        v = v.strip()
        if not v:
            raise ValueError("email must not be empty")
        if not _EMAIL_RE.match(v):
            raise ValueError("value is not a valid email address")
        return v


class NewsletterSubscribeResponse(BaseModel):
    """Returned by the subscribe endpoint."""

    model_config = ConfigDict(
        populate_by_name=True,
        alias_generator=AliasGenerator(serialization_alias=to_camel),
    )

    message: str
    """Human-readable message, e.g. 'Confirmation email sent' or 'Already subscribed'."""

    status: str
    """One of: 'pending', 'already_confirmed', 'already_pending'."""


# ── Confirm ───────────────────────────────────────────────────────────────────


class NewsletterConfirmResponse(BaseModel):
    """Returned by the confirm endpoint on success."""

    model_config = ConfigDict(
        populate_by_name=True,
        alias_generator=AliasGenerator(serialization_alias=to_camel),
    )

    message: str
    status: str  # "confirmed"


# ── Unsubscribe ───────────────────────────────────────────────────────────────


class NewsletterUnsubscribeRequest(BaseModel):
    """Body for ``POST /api/v1/newsletter/unsubscribe``."""

    model_config = ConfigDict(
        populate_by_name=True,
        alias_generator=AliasGenerator(serialization_alias=to_camel),
    )

    email: str = Field(
        ...,
        max_length=254,
        description="Email address to unsubscribe.",
    )


class NewsletterUnsubscribeResponse(BaseModel):
    """Returned by the unsubscribe endpoint."""

    model_config = ConfigDict(
        populate_by_name=True,
        alias_generator=AliasGenerator(serialization_alias=to_camel),
    )

    message: str
    status: str  # "unsubscribed"


# ── Rebuild so Pydantic resolves forward-reference annotations ────────────────
NewsletterSubscribeRequest.model_rebuild()
NewsletterSubscribeResponse.model_rebuild()
NewsletterConfirmResponse.model_rebuild()
NewsletterUnsubscribeRequest.model_rebuild()
NewsletterUnsubscribeResponse.model_rebuild()
