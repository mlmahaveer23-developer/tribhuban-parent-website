"""
Domain model: NewsletterSubscriber.

Implements double opt-in flow: pending → confirmed (via token) → unsubscribed.
Status transitions are the record; no soft-delete column (the status IS the
state).  No version column — single-writer transitions only.
"""
from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import (
    DateTime,
    Index,
    String,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import INET, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.infra.db import Base


class NewsletterSubscriber(Base):
    """Double opt-in newsletter subscriber.

    §9.2 conventions: UUID PK, org_id, audit fields.
    No soft-delete — status transitions (pending/confirmed/unsubscribed)
    are the record, per design note.
    No version — no concurrent admin edits expected.
    """

    __tablename__ = "newsletter_subscriber"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    org_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)

    # ── Subscription ─────────────────────────────────────────────────────────
    email: Mapped[str] = mapped_column(String(254), nullable=False)
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, server_default="pending"
    )  # pending|confirmed|unsubscribed

    # ── Token / confirmation ─────────────────────────────────────────────────
    confirm_token: Mapped[str | None] = mapped_column(String(255), nullable=True)
    confirm_token_expires_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    confirmed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    unsubscribed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    # ── Consent ──────────────────────────────────────────────────────────────
    consent_ip: Mapped[str | None] = mapped_column(INET, nullable=True)
    source: Mapped[str | None] = mapped_column(String(50), nullable=True)

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

    # ── Constraints & indexes ────────────────────────────────────────────────
    __table_args__ = (
        # Req 9.7 / Req 22.4 — unique email per org
        UniqueConstraint("org_id", "email", name="uq_newsletter_subscriber_org_email"),
        Index("ix_newsletter_subscriber_org_id", "org_id"),
        Index("ix_newsletter_subscriber_email", "email"),
        Index("ix_newsletter_subscriber_status", "status"),
        Index("ix_newsletter_subscriber_confirm_token", "confirm_token"),
    )
