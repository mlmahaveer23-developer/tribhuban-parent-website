"""
Lead and UTMAttribution repositories — async SQLAlchemy 2.0.

LeadRepository   — CRUD + lookup operations on the lead table.
UTMRepository    — append-only creation of utm_attribution rows.

All read queries filter ``deleted_at IS NULL`` so soft-deleted rows are
never returned to callers.
"""
from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.identifiers import get_or_404
from app.domain.lead import Lead, UTMAttribution


# ── Lead Repository ───────────────────────────────────────────────────────────


class LeadRepository:
    """Async SQLAlchemy repository for the ``lead`` table."""

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def create(self, lead: Lead) -> Lead:
        """Persist a new Lead within the caller's transaction and return it.

        The caller is responsible for committing (or the session factory commits
        on context-manager exit).  This method does NOT flush or commit.
        """
        self._session.add(lead)
        await self._session.flush()  # populate server defaults (created_at etc.)
        await self._session.refresh(lead)
        return lead

    async def find_by_email(self, email: str, org_id: uuid.UUID) -> Lead | None:
        """Return the most recent active (non-deleted) lead for *email* + *org_id*.

        Returns ``None`` when no matching active lead exists.
        """
        stmt = (
            select(Lead)
            .where(
                Lead.email == email,
                Lead.org_id == org_id,
                Lead.deleted_at.is_(None),
            )
            .order_by(Lead.created_at.desc())
            .limit(1)
        )
        result = await self._session.execute(stmt)
        return result.scalar_one_or_none()

    async def update_status(self, lead_id: uuid.UUID, status: str) -> Lead:
        """Set ``status`` on the given lead and return the updated record.

        Raises ``ValueError`` if no active lead with *lead_id* is found.
        """
        stmt = (
            update(Lead)
            .where(Lead.id == lead_id, Lead.deleted_at.is_(None))
            .values(status=status, updated_at=datetime.now(timezone.utc))
            .returning(Lead)
        )
        result = await self._session.execute(stmt)
        row = result.scalar_one_or_none()
        if row is None:
            raise ValueError(f"Lead {lead_id} not found or has been deleted.")
        return row

    async def find_by_reference_code(self, code: str) -> Lead | None:
        """Return the active lead with the given *reference_code*, or ``None``."""
        stmt = (
            select(Lead)
            .where(Lead.reference_code == code, Lead.deleted_at.is_(None))
        )
        result = await self._session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_reference_code_or_404(self, code: str) -> Lead:
        """Return the active lead with *reference_code*, or raise HTTP 404.

        Raises:
            HTTPException(404): When no active (non-deleted) lead with *code* exists.
        """
        return await get_or_404(
            lambda: self.find_by_reference_code(code),
            detail=f"Lead with reference code '{code}' not found.",
        )
