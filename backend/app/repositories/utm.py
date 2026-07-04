"""
UTM Attribution repository — async SQLAlchemy 2.0.

UTMRepository provides append-only creation of ``utm_attribution`` rows.
These records are immutable event-style entries; there is no update or
soft-delete operation.
"""
from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.lead import UTMAttribution


class UTMRepository:
    """Async SQLAlchemy repository for the ``utm_attribution`` table."""

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def create(self, utm: UTMAttribution) -> UTMAttribution:
        """Persist a new UTMAttribution record within the caller's transaction.

        The caller is responsible for committing.  This method flushes to
        populate server defaults (``created_at``) and refreshes the object.
        """
        self._session.add(utm)
        await self._session.flush()
        await self._session.refresh(utm)
        return utm
