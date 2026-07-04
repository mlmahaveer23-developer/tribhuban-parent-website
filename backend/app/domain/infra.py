"""
Domain models for infrastructure / integration entities:
  OutboxEvent — transactional outbox for reliable event emission
  Redirect    — legacy/edited-URL redirect map
  AdminUser   — dormant operator auth (present but only used by admin API)
"""
from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any

from sqlalchemy import (
    Boolean,
    DateTime,
    Index,
    Integer,
    SmallInteger,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.infra.db import Base


class OutboxEvent(Base):
    """Transactional outbox record for reliable domain event emission.

    Immutable append-only log — no soft-delete, no version column.
    Workers poll pending rows and publish them; status transitions:
      pending → published (success) | failed (> max_attempts).
    """

    __tablename__ = "outbox_event"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    org_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)

    aggregate_type: Mapped[str] = mapped_column(String(100), nullable=False)
    aggregate_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    event_type: Mapped[str] = mapped_column(String(100), nullable=False)
    payload: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False)

    occurred_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default="now()"
    )
    published_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    attempts: Mapped[int] = mapped_column(Integer, nullable=False, server_default="0")
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, server_default="pending"
    )  # pending|published|failed

    __table_args__ = (
        Index("ix_outbox_event_org_id", "org_id"),
        Index("ix_outbox_event_status_occurred_at", "status", "occurred_at"),
        Index("ix_outbox_event_aggregate_id", "aggregate_id"),
        Index("ix_outbox_event_event_type", "event_type"),
    )


class Redirect(Base):
    """Legacy / edited-URL redirect map.

    Used by Edge middleware to perform 301/302 redirects without a code deploy.
    from_path is UNIQUE — each source path has at most one redirect target.
    """

    __tablename__ = "redirect"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    org_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)

    from_path: Mapped[str] = mapped_column(Text, nullable=False, unique=True)
    to_path: Mapped[str] = mapped_column(Text, nullable=False)
    status_code: Mapped[int] = mapped_column(
        SmallInteger, nullable=False, server_default="301"
    )  # 301 | 302

    # §9.2 Audit
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default="now()"
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default="now()"
    )
    created_by: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), nullable=True)
    updated_by: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), nullable=True)
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    version: Mapped[int] = mapped_column(Integer, nullable=False, server_default="1")

    __table_args__ = (
        Index("ix_redirect_org_id", "org_id"),
        # from_path already has a UNIQUE constraint which creates an implicit index.
        # Add an explicit named index so it matches the task spec wording.
        Index("ix_redirect_from_path", "from_path", unique=True),
    )


class AdminUser(Base):
    """Dormant operator / content-author account.

    Present in the schema so the admin API can use it immediately once
    ADMIN_AUTH_ENABLED=true.  NOT used for public visitor login.
    """

    __tablename__ = "admin_user"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    org_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)

    email: Mapped[str] = mapped_column(String(254), nullable=False, unique=True)
    role: Mapped[str] = mapped_column(
        String(50), nullable=False, server_default="editor"
    )  # editor|admin|super_admin
    password_hash: Mapped[str | None] = mapped_column(String(255), nullable=True)
    disabled: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default="false")

    # §9.2 Audit
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default="now()"
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default="now()"
    )
    created_by: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), nullable=True)
    updated_by: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), nullable=True)
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    version: Mapped[int] = mapped_column(Integer, nullable=False, server_default="1")

    __table_args__ = (
        Index("ix_admin_user_org_id", "org_id"),
    )
