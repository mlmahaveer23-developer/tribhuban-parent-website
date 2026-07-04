"""
Career service — job listing, job detail, and application creation.

CareerService.list_jobs(dept, location, type):
  Return list of open job summaries.

CareerService.get_job(slug):
  Return JobDetail or None (None → caller raises 404).

CareerService.create_application(job_slug, request, org_id, session):
  1. Verify job exists and is open → HTTP 404 if closed/filled/unknown
  2. If resume_key is provided, verify the key was from a presign issued
     within the last 3600 s (Redis lookup) → HTTP 422 if stale/invalid (Req 12.4)
  3. Persist JobApplication + emit ``career.application.submitted`` outbox event
     in ONE database transaction (Req 11.4)
  4. Return ApplicationResponse

Requirements: 11.1, 11.3, 11.4, 12.4
"""
from __future__ import annotations

import logging
import uuid
from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.domain.careers import JobApplication
from app.domain.identifiers import generate_reference_code
from app.infra.outbox import write_outbox_event
from app.repositories.careers import JobApplicationRepository, JobRepository
from app.schemas.careers import (
    ApplicationCreateRequest,
    ApplicationResponse,
    DepartmentRef,
    JobDetail,
    JobSummary,
)

logger = logging.getLogger(__name__)


# ── ORM → DTO converters ──────────────────────────────────────────────────────


def _department_ref(job) -> DepartmentRef:
    """Build a :class:`DepartmentRef` from a Job ORM instance."""
    dept = job.department
    if dept is None:
        return DepartmentRef(id="", name="", slug="")
    return DepartmentRef(
        id=str(dept.id),
        name=dept.name,
        slug=dept.slug,
    )


def _job_to_summary(job) -> JobSummary:
    """Convert a Job ORM instance to a :class:`JobSummary`."""
    return JobSummary(
        id=str(job.id),
        slug=job.slug,
        title=job.title,
        department=_department_ref(job),
        location=job.location,
        location_type=job.location_type,
        employment_type=job.employment_type,
        posted_at=(
            job.posted_at.strftime("%Y-%m-%dT%H:%M:%SZ") if job.posted_at else None
        ),
        status=job.status,
    )


def _job_to_detail(job) -> JobDetail:
    """Convert a Job ORM instance to a :class:`JobDetail`."""
    return JobDetail(
        id=str(job.id),
        slug=job.slug,
        title=job.title,
        department=_department_ref(job),
        location=job.location,
        location_type=job.location_type,
        employment_type=job.employment_type,
        posted_at=(
            job.posted_at.strftime("%Y-%m-%dT%H:%M:%SZ") if job.posted_at else None
        ),
        status=job.status,
        description=job.description,
        responsibilities=job.responsibilities,
        requirements=job.requirements,
        benefits=job.benefits,
        salary_min_minor=job.salary_min_minor,
        salary_max_minor=job.salary_max_minor,
        currency=job.currency or "INR",
    )


# ── CareerService ─────────────────────────────────────────────────────────────


class CareerService:
    """Orchestrates job listing, detail retrieval, and application creation.

    Usage::

        service = CareerService(session)
        jobs = await service.list_jobs(department="engineering")
        detail = await service.get_job("senior-python-engineer")
        response = await service.create_application(slug, request, org_id)
    """

    def __init__(self, session: AsyncSession) -> None:
        self._session = session
        self._job_repo = JobRepository(session)
        self._application_repo = JobApplicationRepository(session)

    async def list_jobs(
        self,
        department: str | None = None,
        location: str | None = None,
        employment_type: str | None = None,
    ) -> list[JobSummary]:
        """Return open job summaries, optionally filtered.

        Only ``status='open'`` jobs with ``deleted_at IS NULL`` are returned
        (Req 11.1).

        Args:
            department:      Filter by department slug.
            location:        Filter by location (partial match).
            employment_type: Filter by employment type.

        Returns:
            List of :class:`JobSummary` DTOs.
        """
        jobs = await self._job_repo.list_jobs(
            department=department,
            location=location,
            employment_type=employment_type,
        )
        return [_job_to_summary(job) for job in jobs]

    async def get_job(self, slug: str) -> JobDetail | None:
        """Return the full detail for an open job, or ``None``.

        Closed and filled jobs return ``None`` → the caller should raise 404.

        Args:
            slug: The URL slug of the job posting.

        Returns:
            :class:`JobDetail` if the job is open, otherwise ``None``.
        """
        job = await self._job_repo.get_by_slug(slug)
        if job is None:
            return None
        return _job_to_detail(job)

    async def create_application(
        self,
        job_slug: str,
        request: ApplicationCreateRequest,
        org_id: uuid.UUID,
    ) -> ApplicationResponse:
        """Persist a job application + outbox event in a single transaction.

        Business rules (Req 11.1, 11.4, 12.4):
          1. Job must be open → HTTP 404 if closed/filled/unknown
          2. If resume_key provided, it must originate from a presign issued
             within the last 3600 s (Redis check) → HTTP 422 if stale/invalid
          3. JobApplication + outbox event written in ONE transaction

        Args:
            job_slug: The slug of the target job.
            request:  Validated :class:`ApplicationCreateRequest` from the router.
            org_id:   Organisation UUID (single-tenant MVP default).

        Returns:
            :class:`ApplicationResponse` with id, referenceCode, status, createdAt.

        Raises:
            HTTPException(404): When the job is not open or does not exist.
            HTTPException(422): When the resume key fails Redis validation.
        """
        # ── 1. Verify job is open ─────────────────────────────────────────────
        job = await self._job_repo.get_by_slug(job_slug)
        if job is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="This position was not found or is no longer accepting applications.",
            )

        # ── 2. Verify resume key freshness (Req 12.4) ─────────────────────────
        if request.resume_key is not None:
            from app.services.upload import UploadService  # noqa: PLC0415

            key_is_valid = await UploadService.verify_presign_key(request.resume_key)
            if not key_is_valid:
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail=(
                        "The resume could not be validated. "
                        "Please re-upload your resume and try again."
                    ),
                )

        # ── 3. Persist application + outbox event in ONE transaction ──────────
        now = datetime.now(timezone.utc)
        reference_code = generate_reference_code()

        async with self._session.begin():
            application = JobApplication(
                id=uuid.uuid4(),
                org_id=org_id,
                job_id=job.id,
                full_name=request.full_name,
                email=request.email,
                phone=request.phone,
                resume_key=request.resume_key,
                cover_note=request.cover_note,
                linkedin_url=request.linkedin_url,
                portfolio_url=request.portfolio_url,
                status="received",
                reference_code=reference_code,
                consent=request.consent,
                context=None,
                created_at=now,
                updated_at=now,
            )
            application = await self._application_repo.create(application)

            # Outbox event (Req 11.4)
            await write_outbox_event(
                self._session,
                aggregate_type="JobApplication",
                aggregate_id=application.id,
                event_type="career.application.submitted",
                payload={
                    "applicationId": str(application.id),
                    "jobId": str(job.id),
                    "jobSlug": job.slug,
                    "referenceCode": application.reference_code,
                    "applicantEmail": application.email,
                    "occurredAt": now.isoformat(),
                },
                org_id=org_id,
            )

        return ApplicationResponse(
            id=str(application.id),
            reference_code=application.reference_code,
            status=application.status,
            created_at=application.created_at.strftime("%Y-%m-%dT%H:%M:%SZ"),
        )
