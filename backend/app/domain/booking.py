"""
Domain model: Consultation.

A consultation is a booking request.  It is always linked to a lead row
(either an existing one matched by email or a newly created one).
"""
from __future__ import annotations

import uuid
from datetime import date, datetime
from typing import Any

from sqlalchemy import (
    Boolean,
    Date,
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


class Consultation(Base):
    """A consultation booking request.

    §9.2 conventions: UUID PK, org_id, audit fields, soft-delete, version.
    """

    __tablename__ = "consultation"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    org_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)

    # ── Link to lead ─────────────────────────────────────────────────────────
    lead_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("lead.id", ondelete="RESTRICT"),
        nullable=False,
    )

    # ── Contact details ──────────────────────────────────────────────────────
    full_name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(String(254), nullable=False)
    phone: Mapped[str] = mapped_column(String(30), nullable=False)
    interest_area: Mapped[str] = mapped_column(String(50), nullable=False)
    location: Mapped[str | None] = mapped_column(String(255), nullable=True)

    # ── Booking details ──────────────────────────────────────────────────────
    preferred_date: Mapped[date] = mapped_column(Date, nullable=False)
    preferred_time_window: Mapped[str] = mapped_column(
        String(20), nullable=False
    )  # morning|afternoon|evening
    message: Mapped[str | None] = mapped_column(Text, nullable=True)

    # ── Status & reference ───────────────────────────────────────────────────
    status: Mapped[str] = mapped_column(
        String(30), nullable=False, server_default="requested"
    )  # requested|confirmed|completed|cancelled|no_show
    reference_code: Mapped[str] = mapped_column(
        String(64), nullable=False, unique=True
    )
    context: Mapped[dict[str, Any] | None] = mapped_column(JSONB, nullable=True)

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
    lead: Mapped["Lead"] = relationship(  # type: ignore[name-defined]  # noqa: F821
        back_populates="consultations"
    )

    # ── Indexes ──────────────────────────────────────────────────────────────
    __table_args__ = (
        Index("ix_consultation_org_id", "org_id"),
        Index("ix_consultation_lead_id", "lead_id"),
        Index("ix_consultation_status", "status"),
        Index("ix_consultation_preferred_date", "preferred_date"),
        Index("ix_consultation_email", "email"),
        Index("ix_consultation_context_gin", "context", postgresql_using="gin"),
    )
