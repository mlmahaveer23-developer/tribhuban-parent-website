"""
Careers and Upload API router.

Endpoints
---------
GET  /api/v1/jobs                       — list open jobs (filters: department, location, type)
GET  /api/v1/jobs/{slug}                — job detail (open only; closed/unknown → 404)
POST /api/v1/uploads/presign            — get presigned S3 PUT URL (rate-limited, 20 req/min)
POST /api/v1/jobs/{slug}/applications   — submit application (rate-limited, 201 + referenceCode)

Requirements: 11.1, 11.3, 11.4, 12.1, 12.2, 12.3, 12.4, 12.5
"""
from __future__ import annotations

import logging
import time
import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.infra.db import get_db_session
from app.schemas.careers import (
    ApplicationCreateRequest,
    ApplicationResponse,
    JobDetail,
    JobSummary,
    PresignRequest,
    PresignResponse,
)
from app.schemas.envelope import DataResponse, ok
from app.services.careers import CareerService
from app.services.upload import UploadService

logger = logging.getLogger(__name__)

# ── Router ────────────────────────────────────────────────────────────────────

router = APIRouter(tags=["careers"])

# ── Rate-limit constants ──────────────────────────────────────────────────────
_WRITE_RATE_LIMIT: int = 20    # max write requests per minute (Req 12.1)
_RATE_WINDOW: int = 60         # sliding window in seconds


# ── Helpers ───────────────────────────────────────────────────────────────────

def _get_client_ip(request: Request) -> str:
    """Resolve the client IP from X-Forwarded-For or the direct connection."""
    forwarded_for = request.headers.get("X-Forwarded-For")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()
    if request.client:
        return request.client.host
    return "unknown"


def _get_request_id(request: Request) -> str:
    """Return the request-scoped ID set by RequestIDMiddleware."""
    return getattr(request.state, "request_id", "") or ""


# ── Rate-limit dependency ─────────────────────────────────────────────────────

async def _write_rate_limit(request: Request) -> None:
    """Enforce 20 req/min per client IP for write endpoints (Req 12.1)."""
    client_ip = _get_client_ip(request)
    now_ms = int(time.time() * 1000)
    window_ms = _RATE_WINDOW * 1000
    key = f"rl:careers_write:{client_ip}"

    try:
        from app.infra.cache import redis_client  # noqa: PLC0415

        async with redis_client.pipeline(transaction=True) as pipe:
            pipe.zremrangebyscore(key, 0, now_ms - window_ms)
            pipe.zcard(key)
            pipe.zadd(key, {str(now_ms): now_ms})
            pipe.expire(key, _RATE_WINDOW + 1)
            results = await pipe.execute()

        current_count: int = results[1]

        if current_count >= _WRITE_RATE_LIMIT:
            oldest = await redis_client.zrange(key, 0, 0, withscores=True)
            retry_after = _RATE_WINDOW
            if oldest:
                oldest_ts = int(oldest[0][1])
                retry_after = max(1, (oldest_ts + window_ms - now_ms) // 1000)
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many requests. Please slow down and try again.",
                headers={"Retry-After": str(retry_after)},
            )

    except HTTPException:
        raise
    except Exception as exc:
        logger.warning(
            "Rate-limit check failed for careers write [ip=%s]: %s — allowing request",
            client_ip,
            exc,
        )


# ── Known query params for GET /api/v1/jobs ──────────────────────────────────

_KNOWN_JOB_PARAMS: frozenset[str] = frozenset({"department", "location", "type"})


def _check_unknown_params(request: Request, known: frozenset[str]) -> None:
    """Raise HTTP 400 if any query param is not in *known* (Req 11.1)."""
    unknown = set(request.query_params.keys()) - known
    if unknown:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unknown query parameter(s): {', '.join(sorted(unknown))}.",
        )


# ── GET /api/v1/jobs ─────────────────────────────────────────────────────────

@router.get(
    "/jobs",
    response_model=DataResponse[list[JobSummary]],
    status_code=status.HTTP_200_OK,
    summary="List open jobs",
    description=(
        "Return all open job postings. Supports optional filters: "
        "department (slug), location (partial match), type (employment_type). "
        "Unknown query parameters return HTTP 400 (Req 11.1)."
    ),
    responses={
        200: {"description": "List of open jobs"},
        400: {"description": "Unknown query parameter"},
    },
)
async def list_jobs(
    request: Request,
    session: Annotated[AsyncSession, Depends(get_db_session)],
    department: str | None = Query(None, description="Filter by department slug"),
    location: str | None = Query(None, description="Filter by location (partial match)"),
    type: str | None = Query(None, description="Filter by employment type"),
) -> JSONResponse:
    """List open job postings with optional filters."""
    _check_unknown_params(request, _KNOWN_JOB_PARAMS)

    request_id = _get_request_id(request)
    service = CareerService(session)
    jobs = await service.list_jobs(
        department=department,
        location=location,
        employment_type=type,
    )

    envelope = ok(jobs, request_id)
    return JSONResponse(
        content=envelope.model_dump(by_alias=True, mode="json"),
        status_code=status.HTTP_200_OK,
        headers={"Cache-Control": "public, max-age=900"},
    )


# ── GET /api/v1/jobs/{slug} ───────────────────────────────────────────────────

@router.get(
    "/jobs/{slug}",
    response_model=DataResponse[JobDetail],
    status_code=status.HTTP_200_OK,
    summary="Get job detail",
    description=(
        "Return the full detail for an open job posting. "
        "Closed, filled, and unknown jobs return HTTP 404 (Req 11.1, 11.3)."
    ),
    responses={
        200: {"description": "Job detail returned"},
        404: {"description": "Job not found or no longer available"},
    },
)
async def get_job(
    slug: str,
    request: Request,
    session: Annotated[AsyncSession, Depends(get_db_session)],
) -> JSONResponse:
    """Return full job detail for an open posting."""
    request_id = _get_request_id(request)
    service = CareerService(session)
    job_detail = await service.get_job(slug)

    if job_detail is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Job '{slug}' was not found or is no longer available.",
        )

    envelope = ok(job_detail, request_id)
    return JSONResponse(
        content=envelope.model_dump(by_alias=True, mode="json"),
        status_code=status.HTTP_200_OK,
        headers={"Cache-Control": "public, max-age=900"},
    )


# ── POST /api/v1/uploads/presign ─────────────────────────────────────────────

@router.post(
    "/uploads/presign",
    response_model=DataResponse[PresignResponse],
    status_code=status.HTTP_200_OK,
    summary="Get presigned S3 upload URL",
    description=(
        "Return a presigned S3 PUT URL for a resume file upload. "
        "Allowed types: pdf, doc, docx. Max size: 5,242,880 bytes (5 MB). "
        "URL expires after 900 seconds (15 minutes). "
        "The key is stored in Redis with TTL 3600 s for later validation. "
        "Invalid type or size returns HTTP 422 (Req 12.1, 12.2, 12.3)."
    ),
    responses={
        200: {"description": "Presigned URL returned"},
        422: {"description": "Unsupported file type or size out of range"},
        429: {"description": "Rate limit exceeded"},
    },
)
async def presign_upload(
    body: PresignRequest,
    request: Request,
    _rate_limit: Annotated[None, Depends(_write_rate_limit)] = None,
) -> JSONResponse:
    """Generate a presigned S3 PUT URL for a resume file.

    Stores the object key in Redis (TTL 3600 s) so the application endpoint
    can verify the key originates from a recent presign (Req 12.4).

    Dev mode (no AWS credentials configured): returns a mock URL.
    """
    request_id = _get_request_id(request)
    settings = get_settings()
    org_id = uuid.UUID(settings.default_org_id)

    service = UploadService()
    presign_response = await service.create_presign(body, org_id=org_id)

    envelope = ok(presign_response, request_id)
    return JSONResponse(
        content=envelope.model_dump(by_alias=True, mode="json"),
        status_code=status.HTTP_200_OK,
        headers={"Cache-Control": "no-store"},
    )


# ── POST /api/v1/jobs/{slug}/applications ─────────────────────────────────────

@router.post(
    "/jobs/{slug}/applications",
    response_model=DataResponse[ApplicationResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Submit a job application",
    description=(
        "Submit an application for an open job posting. "
        "Returns HTTP 201 + a unique referenceCode. "
        "Emits ``career.application.submitted`` outbox event atomically. "
        "Closed or unknown jobs return HTTP 404 (Req 11.3, 11.4). "
        "Stale resume keys (> 3600 s since presign) return HTTP 422 (Req 12.4, 12.5)."
    ),
    responses={
        201: {"description": "Application submitted successfully"},
        404: {"description": "Job not found or no longer available"},
        422: {"description": "Resume key stale/invalid or validation error"},
        429: {"description": "Rate limit exceeded"},
    },
)
async def submit_application(
    slug: str,
    body: ApplicationCreateRequest,
    request: Request,
    session: Annotated[AsyncSession, Depends(get_db_session)],
    _rate_limit: Annotated[None, Depends(_write_rate_limit)] = None,
) -> JSONResponse:
    """Submit a job application.

    Verifies the job is open, validates the resume key against Redis, and
    persists the application + outbox event atomically.
    """
    request_id = _get_request_id(request)
    settings = get_settings()
    org_id = uuid.UUID(settings.default_org_id)

    service = CareerService(session)
    response = await service.create_application(
        job_slug=slug,
        request=body,
        org_id=org_id,
    )

    envelope = ok(response, request_id)
    return JSONResponse(
        content=envelope.model_dump(by_alias=True, mode="json"),
        status_code=status.HTTP_201_CREATED,
        headers={"Cache-Control": "no-store"},
    )
