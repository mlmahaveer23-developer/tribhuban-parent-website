"""
Leads API router.

Endpoints
---------
POST /api/v1/leads    — create a lead from any source
POST /api/v1/contact  — convenience alias (forces source="contact")

Both endpoints:
  • Rate limiting: 20 req/min per client IP (Redis sliding window)
  • Idempotency-Key header: optional; if present must be 1–255 chars (else 400)
  • Turnstile: stub — accepts any token (real verification deferred to task 20)
  • consent_ip: resolved from X-Forwarded-For header or request.client.host
  • Response envelope: { data: LeadResponse, meta: { requestId, timestamp } }
  • Cache-Control: no-store on response

Requirements: 6.1, 6.2, 6.5, 6.6, 6.7, 6.8, 6.10, 17.5, 17.6, 19.3, 19.4,
              19.5, 19.6
"""
from __future__ import annotations

import logging
import time
from typing import Annotated

from fastapi import APIRouter, Depends, Header, HTTPException, Request, status
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.infra.db import get_db_session
from app.schemas.envelope import DataResponse, Meta, ok
from app.schemas.leads import LeadCreateRequest, LeadResponse
from app.services.leads import LeadService

logger = logging.getLogger(__name__)

router = APIRouter(tags=["leads"])

# ── Rate-limit constants ──────────────────────────────────────────────────────
_RATE_LIMIT = 20          # max requests
_RATE_WINDOW = 60         # seconds


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

async def _leads_rate_limit(request: Request) -> None:
    """Enforce 20 req/min per client IP.

    Raises HTTP 429 when the limit is exceeded; HTTP 503 when Redis is down.
    """
    client_ip = _get_client_ip(request)
    now_ms = int(time.time() * 1000)
    window_ms = _RATE_WINDOW * 1000
    key = f"rl:leads:{client_ip}"

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
            "Rate-limit check failed for leads [ip=%s]: %s — allowing request",
            client_ip,
            exc,
        )
        # Fail open: a Redis outage must not take down lead capture.
        # The risk of occasional bursts during a Redis outage is acceptable.


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


# ── Shared response builder ───────────────────────────────────────────────────

def _lead_json_response(
    lead_response: LeadResponse,
    request_id: str,
) -> JSONResponse:
    """Wrap *lead_response* in the standard success envelope and add no-store."""
    envelope = ok(lead_response, request_id)
    return JSONResponse(
        content=envelope.model_dump(by_alias=True, mode="json"),
        status_code=status.HTTP_201_CREATED,
        headers={"Cache-Control": "no-store"},
    )


# ── POST /api/v1/leads ────────────────────────────────────────────────────────

@router.post(
    "/leads",
    response_model=DataResponse[LeadResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Create a lead",
    description=(
        "Capture an inbound interest signal from any source. "
        "Returns a referenceCode, score, and quality band. "
        "Status is always 'new' on the public endpoint (Req 6.10)."
    ),
    responses={
        201: {"description": "Lead created successfully"},
        400: {"description": "Invalid Idempotency-Key header"},
        422: {"description": "Validation error"},
        429: {"description": "Rate limit exceeded"},
    },
)
async def create_lead(
    body: LeadCreateRequest,
    request: Request,
    session: Annotated[AsyncSession, Depends(get_db_session)],
    _rate_limit: Annotated[None, Depends(_leads_rate_limit)] = None,
    idempotency_key: Annotated[str | None, Depends(_validate_idempotency_key)] = None,
) -> JSONResponse:
    """Create a lead from any source.

    Honeypot or time-to-submit spam is silently accepted (HTTP 201) but stored
    with ``status="spam"`` internally — bots must not learn they were detected.
    """
    consent_ip = _get_client_ip(request)
    request_id = _get_request_id(request)

    service = LeadService(session)
    lead_response = await service.create_lead(body, consent_ip=consent_ip)

    return _lead_json_response(lead_response, request_id)


# ── POST /api/v1/contact ─────────────────────────────────────────────────────

@router.post(
    "/contact",
    response_model=DataResponse[LeadResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Submit a contact inquiry",
    description=(
        "Convenience alias for POST /api/v1/leads that forces source='contact'. "
        "Intended for the Contact page form (Req 8.2)."
    ),
    responses={
        201: {"description": "Contact inquiry created successfully"},
        400: {"description": "Invalid Idempotency-Key header"},
        422: {"description": "Validation error"},
        429: {"description": "Rate limit exceeded"},
    },
)
async def create_contact(
    body: LeadCreateRequest,
    request: Request,
    session: Annotated[AsyncSession, Depends(get_db_session)],
    _rate_limit: Annotated[None, Depends(_leads_rate_limit)] = None,
    idempotency_key: Annotated[str | None, Depends(_validate_idempotency_key)] = None,
) -> JSONResponse:
    """Submit a contact inquiry — identical to POST /api/v1/leads with source forced to 'contact'.

    Overrides the ``source`` field in *body* so callers submitting the Contact
    page form do not need to supply a source value.
    """
    consent_ip = _get_client_ip(request)
    request_id = _get_request_id(request)

    # Force source to "contact" regardless of what the client sent.
    # Pydantic models are immutable by default; use model_copy to override.
    body = body.model_copy(update={"source": "contact"})

    service = LeadService(session)
    lead_response = await service.create_lead(body, consent_ip=consent_ip)

    return _lead_json_response(lead_response, request_id)
