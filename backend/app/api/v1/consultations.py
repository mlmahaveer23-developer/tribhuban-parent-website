"""
Consultations API router.

Endpoints
---------
POST /api/v1/consultations         — book a consultation (HTTP 202 Accepted)
GET  /api/v1/consultations/{referenceCode} — poll status, NO PII (HTTP 200)

Both endpoints:
  • Rate limiting: 20 req/min per client IP (Redis sliding window)
  • Idempotency-Key header: optional; if present must be 1–255 chars (else 400)
  • consent_ip: resolved from X-Forwarded-For or request.client.host
  • Cache-Control: no-store on responses

POST /api/v1/consultations:
  • Returns HTTP 202 Accepted + ConsultationResponse in success envelope
  • Rejects invalid inputs with HTTP 422 + field-level errors (Req 7.3, 7.4)

GET  /api/v1/consultations/{referenceCode}:
  • Returns HTTP 200 + ConsultationStatusResponse (no PII) (Req 7.7)
  • Returns HTTP 404 if reference code not found (Req 7.8)

Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8
"""
from __future__ import annotations

import logging
import time
from typing import Annotated

from fastapi import APIRouter, Depends, Header, HTTPException, Request, status
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.infra.db import get_db_session
from app.schemas.envelope import DataResponse, ok
from app.schemas.consultations import (
    ConsultationCreateRequest,
    ConsultationResponse,
    ConsultationStatusResponse,
)
from app.services.consultations import ConsultationService

logger = logging.getLogger(__name__)

router = APIRouter(tags=["consultations"])

# ── Rate-limit constants ──────────────────────────────────────────────────────
_RATE_LIMIT = 20      # max requests
_RATE_WINDOW = 60     # seconds


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

async def _consultations_rate_limit(request: Request) -> None:
    """Enforce 20 req/min per client IP.

    Raises HTTP 429 when the limit is exceeded; silently allows on Redis failure
    (fail-open — a Redis outage must not take down consultation booking).
    """
    client_ip = _get_client_ip(request)
    now_ms = int(time.time() * 1000)
    window_ms = _RATE_WINDOW * 1000
    key = f"rl:consultations:{client_ip}"

    try:
        from app.infra.cache import redis_client  # noqa: PLC0415

        async with redis_client.pipeline(transaction=True) as pipe:
            pipe.zremrangebyscore(key, 0, now_ms - window_ms)
            pipe.zcard(key)
            pipe.zadd(key, {str(now_ms): now_ms})
            pipe.expire(key, _RATE_WINDOW + 1)
            results = await pipe.execute()

        current_count: int = results[1]

        if current_count >= _RATE_LIMIT:
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
            "Rate-limit check failed for consultations [ip=%s]: %s — allowing request",
            client_ip,
            exc,
        )


# ── Idempotency-Key validation dependency ─────────────────────────────────────

async def _validate_idempotency_key(
    idempotency_key: Annotated[str | None, Header(alias="Idempotency-Key")] = None,
) -> str | None:
    """Validate the optional ``Idempotency-Key`` header.

    - Absent: allowed (returns None)
    - Present, 1–255 chars: allowed (returns the key)
    - Present, empty string: HTTP 400
    - Present, > 255 chars: HTTP 400
    """
    if idempotency_key is None:
        return None
    if len(idempotency_key) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Idempotency-Key must not be empty.",
        )
    if len(idempotency_key) > 255:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Idempotency-Key must not exceed 255 characters.",
        )
    return idempotency_key


# ── POST /api/v1/consultations ────────────────────────────────────────────────

@router.post(
    "/consultations",
    response_model=DataResponse[ConsultationResponse],
    status_code=status.HTTP_202_ACCEPTED,
    summary="Book a consultation",
    description=(
        "Submit a consultation booking request. "
        "Returns HTTP 202 Accepted with a unique referenceCode. "
        "The consultation is linked to an existing lead (matched by email) "
        "or a new lead is created automatically. "
        "An outbox event ``consultation.requested`` is emitted atomically."
    ),
    responses={
        202: {"description": "Consultation request accepted"},
        400: {"description": "Invalid Idempotency-Key header"},
        422: {"description": "Validation error (missing field, bad format, date out of range)"},
        429: {"description": "Rate limit exceeded"},
    },
)
async def create_consultation(
    body: ConsultationCreateRequest,
    request: Request,
    session: Annotated[AsyncSession, Depends(get_db_session)],
    _rate_limit: Annotated[None, Depends(_consultations_rate_limit)] = None,
    idempotency_key: Annotated[str | None, Depends(_validate_idempotency_key)] = None,
) -> JSONResponse:
    """Book a consultation.

    Field validation and date-range enforcement are handled by the Pydantic
    schema (:class:`ConsultationCreateRequest`); HTTP 422 is returned
    automatically for any violation.
    """
    consent_ip = _get_client_ip(request)
    request_id = _get_request_id(request)

    service = ConsultationService(session)
    consultation_response = await service.create_consultation(body, consent_ip=consent_ip)

    envelope = ok(consultation_response, request_id)
    return JSONResponse(
        content=envelope.model_dump(by_alias=True, mode="json"),
        status_code=status.HTTP_202_ACCEPTED,
        headers={"Cache-Control": "no-store"},
    )


# ── GET /api/v1/consultations/{referenceCode} ─────────────────────────────────

@router.get(
    "/consultations/{reference_code}",
    response_model=DataResponse[ConsultationStatusResponse],
    status_code=status.HTTP_200_OK,
    summary="Get consultation status",
    description=(
        "Return the current status of a consultation by its referenceCode. "
        "No personally identifiable information is included in the response (Req 7.7). "
        "Returns HTTP 404 when the referenceCode is unknown (Req 7.8)."
    ),
    responses={
        200: {"description": "Consultation status returned"},
        404: {"description": "Consultation not found"},
        429: {"description": "Rate limit exceeded"},
    },
)
async def get_consultation_status(
    reference_code: str,
    request: Request,
    session: Annotated[AsyncSession, Depends(get_db_session)],
    _rate_limit: Annotated[None, Depends(_consultations_rate_limit)] = None,
) -> JSONResponse:
    """Return consultation status (no PII) by reference code.

    Returns HTTP 404 when no matching record exists.
    """
    request_id = _get_request_id(request)

    service = ConsultationService(session)
    status_response = await service.get_consultation_status(reference_code)

    if status_response is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Consultation with referenceCode '{reference_code}' was not found.",
        )

    envelope = ok(status_response, request_id)
    return JSONResponse(
        content=envelope.model_dump(by_alias=True, mode="json"),
        status_code=status.HTTP_200_OK,
        headers={"Cache-Control": "no-store"},
    )
