"""
Consultation repository — async SQLAlchemy 2.0.

ConsultationRepository — CRUD + lookup operations on the consultation table.

All read queries filter ``deleted_at IS NULL`` so soft-deleted rows are
never returned to callers.
"""
from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.booking import Consultation
from app.domain.identifiers import get_or_404


class ConsultationRepository:
    """Async SQLAlchemy repository for the ``consultation`` table."""

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def create(self, consultation: Consultation) -> Consultation:
        """Persist a new Consultation within the caller's transaction and return it.

        The caller is responsible for committing (or the session factory commits
        on context-manager exit).  This method flushes to populate server
        defaults (created_at, reference_code uniqueness etc.) but does NOT commit.
        """
        self._session.add(consultation)
        await self._session.flush()
        await self._session.refresh(consultation)
        return consultation

    async def find_by_reference_code(self, code: str) -> Consultation | None:
        """Return the active (non-deleted) consultation with *reference_code*, or ``None``."""
        stmt = (
            select(Consultation)
            .where(
                Consultation.reference_code == code,
                Consultation.deleted_at.is_(None),
            )
        )
        result = await self._session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_reference_code_or_404(self, code: str) -> Consultation:
        """Return the active consultation with *reference_code*, or raise HTTP 404.

        Raises:
            HTTPException(404): When no active (non-deleted) consultation with *code* exists.
        """
        return await get_or_404(
            lambda: self.find_by_reference_code(code),
            detail=f"Consultation with reference code '{code}' not found.",
        )
