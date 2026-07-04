"""
Domain models: Lead, UTMAttribution.

Lead is the central entity for every inbound interest signal captured by the
website (contact form, calculator, product interest, consultation, career
interest, newsletter).  UTMAttribution is an append-only marketing attribution
record linked to a lead.
"""
from __future__ import annotations

import uuid
from datetime import date, datetime
from typing import Any

from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import INET, JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.infra.db import Base


class UTMAttribution(Base):
    """Append-only marketing attribution record (first-touch / last-touch).

    Deliberately minimal audit fields: no soft-delete, no version column — it
    is an immutable event-style record created once and only last_seen_at is
    updated on re-encounter.
    """

    __tablename__ = "utm_attribution"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    org_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)

    utm_source: Mapped[str | None] = mapped_column(String(255), nullable=True)
    utm_medium: Mapped[str | None] = mapped_column(String(255), nullable=True)
    utm_campaign: Mapped[str | None] = mapped_column(String(255), nullable=True)
    utm_term: Mapped[str | None] = mapped_column(String(255), nullable=True)
    utm_content: Mapped[str | None] = mapped_column(String(255), nullable=True)

    referrer: Mapped[str | None] = mapped_column(Text, nullable=True)
    landing_page: Mapped[str | None] = mapped_column(Text, nullable=True)

    gclid: Mapped[str | None] = mapped_column(String(255), nullable=True)
    fbclid: Mapped[str | None] = mapped_column(String(255), nullable=True)

    first_seen_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )
    last_seen_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )
    session_id: Mapped[str | None] = mapped_column(String(255), nullable=True)

    # Minimal audit — creation timestamp only
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default="now()",
    )

    # ── Relationships ────────────────────────────────────────────────────────
    leads: Mapped[list["Lead"]] = relationship(back_populates="utm")

    # ── Indexes ──────────────────────────────────────────────────────────────
    __table_args__ = (
        Index("ix_utm_attribution_org_id", "org_id"),
        Index("ix_utm_attribution_session_id", "session_id"),
    )


class Lead(Base):
    """Every inbound interest signal from the website.

    §9.2 conventions: UUID PK, org_id, audit fields, soft-delete, version,
    optimistic concurrency.
    """

    __tablename__ = "lead"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    org_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)

    # ── Core fields ──────────────────────────────────────────────────────────
    source: Mapped[str] = mapped_column(
        String(50), nullable=False
    )  # contact|calculator|consultation|product_interest|newsletter|career_interest
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(254), nullable=False)
    phone: Mapped[str | None] = mapped_column(String(30), nullable=True)
    company: Mapped[str | None] = mapped_column(String(255), nullable=True)
    message: Mapped[str | None] = mapped_column(Text, nullable=True)
    interest_area: Mapped[str] = mapped_column(
        String(50), nullable=False
    )  # solar|products|future_tech|careers|support|other

    # ── Scoring / pipeline ───────────────────────────────────────────────────
    status: Mapped[str] = mapped_column(
        String(30), nullable=False, server_default="new"
    )  # new|qualified|contacted|converted|disqualified|spam
    score: Mapped[int] = mapped_column(Integer, nullable=False, server_default="0")
    quality: Mapped[str] = mapped_column(
        String(10), nullable=False, server_default="cold"
    )  # cold|warm|hot

    # ── Context / attribution ────────────────────────────────────────────────
    context: Mapped[dict[str, Any] | None] = mapped_column(JSONB, nullable=True)
    consent_marketing: Mapped[bool] = mapped_column(
        Boolean, nullable=False, server_default="false"
    )
    consent_timestamp: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    consent_ip: Mapped[str | None] = mapped_column(INET, nullable=True)

    utm_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("utm_attribution.id", ondelete="SET NULL"),
        nullable=True,
    )

    reference_code: Mapped[str] = mapped_column(
        String(64), nullable=False, unique=True
    )

    # ── §9.2 Audit fields ────────────────────────────────────────────────────
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default="now()"
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default="now()"
    )
    created_by: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), nullable=True
    )
    updated_by: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), nullable=True
    )

    # ── §9.2 Soft delete ─────────────────────────────────────────────────────
    deleted_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    # ── §9.2 Optimistic concurrency ──────────────────────────────────────────
    version: Mapped[int] = mapped_column(
        Integer, nullable=False, server_default="1"
    )

    # ── Relationships ────────────────────────────────────────────────────────
    utm: Mapped[UTMAttribution | None] = relationship(back_populates="leads")
    consultations: Mapped[list["Consultation"]] = relationship(  # type: ignore[name-defined]  # noqa: F821
        back_populates="lead"
    )

    # ── Indexes & constraints ────────────────────────────────────────────────
    __table_args__ = (
        Index("ix_lead_org_id", "org_id"),
        Index("ix_lead_email", "email"),
        Index("ix_lead_status", "status"),
        Index("ix_lead_source", "source"),
        Index("ix_lead_created_at", "created_at"),
        Index("ix_lead_score", "score"),
        Index("ix_lead_utm_id", "utm_id"),
        Index("ix_lead_context_gin", "context", postgresql_using="gin"),
    )
