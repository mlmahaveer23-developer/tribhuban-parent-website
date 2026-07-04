"""
Career repositories — async SQLAlchemy 2.0.

JobRepository          — read operations on job/department tables.
JobApplicationRepository — create applications.

All read queries filter ``deleted_at IS NULL`` and ``status = 'open'`` for
public endpoints so closed/filled jobs are never returned to callers.
"""
from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.domain.careers import Department, Job, JobApplication
from app.domain.identifiers import get_or_404


class JobRepository:
    """Async SQLAlchemy repository for the ``job`` table."""

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def list_jobs(
        self,
        department: str | None = None,
        location: str | None = None,
        employment_type: str | None = None,
    ) -> list[Job]:
        """Return all open, non-deleted jobs, optionally filtered.

        Args:
            department:       Filter by department slug (case-insensitive).
            location:         Filter by location string (case-insensitive contains).
            employment_type:  Filter by employment_type (e.g. "full_time").

        Returns:
            List of matching :class:`Job` ORM instances with ``department``
            relationship eagerly loaded.
        """
        stmt = (
            select(Job)
            .options(joinedload(Job.department))
            .where(
                Job.status == "open",
                Job.deleted_at.is_(None),
            )
            .order_by(Job.posted_at.desc().nullslast(), Job.created_at.desc())
        )

        if department is not None:
            stmt = stmt.join(Job.department).where(
                Department.slug == department.lower()
            )

        if location is not None:
            stmt = stmt.where(Job.location.ilike(f"%{location}%"))

        if employment_type is not None:
            stmt = stmt.where(Job.employment_type == employment_type.lower())

        result = await self._session.execute(stmt)
        return list(result.scalars().unique().all())

    async def get_by_slug(self, slug: str) -> Job | None:
        """Return an open, non-deleted job by slug, or ``None``.

        Closed and filled jobs return ``None`` so the caller returns HTTP 404.

        Args:
            slug: The URL slug of the job posting.

        Returns:
            :class:`Job` with department eagerly loaded, or ``None`` if not
            found, deleted, or not ``open``.
        """
        stmt = (
            select(Job)
            .options(joinedload(Job.department))
            .where(
                Job.slug == slug,
                Job.status == "open",
                Job.deleted_at.is_(None),
            )
        )
        result = await self._session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_slug_or_404(self, slug: str) -> Job:
        """Return an open, non-deleted job by slug, or raise HTTP 404.

        Raises:
            HTTPException(404): When no open, non-deleted job with *slug* exists.
        """
        return await get_or_404(
            lambda: self.get_by_slug(slug),
            detail=f"Job '{slug}' not found or is no longer open.",
        )


class JobApplicationRepository:
    """Async SQLAlchemy repository for the ``job_application`` table."""

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def create(self, application: JobApplication) -> JobApplication:
        """Persist a new JobApplication within the caller's transaction and return it.

        The caller is responsible for committing.  This method flushes to
        populate server defaults and refresh the ORM instance.
        """
        self._session.add(application)
        await self._session.flush()
        await self._session.refresh(application)
        return application
