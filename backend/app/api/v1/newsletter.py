"""
Newsletter API router — subscribe, confirm, unsubscribe.

Endpoints
---------
POST /api/v1/newsletter/subscribe
    Create a pending subscriber and queue a confirmation email.
    Rate limited: 20 req/min per client IP.
    Cache-Control: no-store.

GET /api/v1/newsletter/confirm?token=<raw_token>
    Confirm a newsletter subscription via a single-use token.
    Returns 422 on invalid / expired / missing token.
    Cache-Control: no-store.

POST /api/v1/newsletter/unsubscribe
    Unsubscribe a pending or confirmed subscriber.
    Always returns 200 (idempotent — prevents email enumeration).
    Cache-Control: no-store.

Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7
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
from app.schemas.envelope import DataResponse, ok
from app.schemas.newsletter import (
    NewsletterConfirmResponse,
    NewsletterSubscribeRequest,
    NewsletterSubscribeResponse,
    NewsletterUnsubscribeRequest,
    NewsletterUnsubscribeResponse,
)
from app.services.newsletter import NewsletterService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/newsletter", tags=["newsletter"])

# ── Rate-limit constants ──────────────────────────────────────────────────────
_RATE_LIMIT = 20      # max requests per window
_RATE_WINDOW = 60     # seconds


# ── Helpers ───────────────────────────────────────────────────────────────────

def _get_client_ip(request: Request) -> str:
    """Resolve client IP from X-Forwarded-For or the direct connection."""
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

async def _newsletter_rate_limit(request: Request) -> None:
    """Enforce 20 req/min per client IP for newsletter write endpoints.

    Raises HTTP 429 on breach; fail-open on Redis errors (availability > strict
    enforcement during transient cache outages).
    """
    client_ip = _get_client_ip(request)
    now_ms = int(time.time() * 1000)
    window_ms = _RATE_WINDOW * 1000
    key = f"rl:newsletter:{client_ip}"

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
            "Rate-limit check failed for newsletter [ip=%s]: %s — allowing request",
            client_ip,
            exc,
        )
        # Fail open: a Redis outage must not block newsletter subscriptions.


# ── POST /api/v1/newsletter/subscribe ────────────────────────────────────────

@router.post(
    "/subscribe",
    response_model=DataResponse[NewsletterSubscribeResponse],
    status_code=status.HTTP_200_OK,
    summary="Subscribe to the newsletter",
    description=(
        "Submit an email address for a double opt-in newsletter subscription. "
        "A confirmation email is queued when a new pending record is created. "
        "Duplicate pending or confirmed addresses return a descriptive status "
        "without creating a second record (Req 9.3)."
    ),
    responses={
        200: {"description": "Subscription request received"},
        422: {"description": "Invalid email format"},
        429: {"description": "Rate limit exceeded"},
    },
)
async def subscribe(
    body: NewsletterSubscribeRequest,
    request: Request,
    session: Annotated[AsyncSession, Depends(get_db_session)],
    _rate_limit: Annotated[None, Depends(_newsletter_rate_limit)] = None,
) -> JSONResponse:
    """Create a pending subscriber and queue the confirmation email.

    Returns HTTP 200 in all non-error cases (new, already_pending, already_confirmed).
    """
    settings = get_settings()
    org_id = uuid.UUID(settings.default_org_id)
    consent_ip = _get_client_ip(request)
    request_id = _get_request_id(request)

    service = NewsletterService(session)
    result = await service.subscribe(
        email=body.email,
        source=body.source,
        org_id=org_id,
        consent_ip=consent_ip,
    )

    envelope = ok(result, request_id)
    return JSONResponse(
        content=envelope.model_dump(by_alias=True, mode="json"),
        status_code=status.HTTP_200_OK,
        headers={"Cache-Control": "no-store"},
    )


# ── GET /api/v1/newsletter/confirm ────────────────────────────────────────────

@router.get(
    "/confirm",
    response_model=DataResponse[NewsletterConfirmResponse],
    status_code=status.HTTP_200_OK,
    summary="Confirm newsletter subscription",
    description=(
        "Validate a single-use confirmation token and transition the subscriber "
        "to 'confirmed' status.  Returns 422 when the token is missing, invalid, "
        "already used, or expired (Req 9.5)."
    ),
    responses={
        200: {"description": "Subscription confirmed"},
        422: {"description": "Token invalid or expired"},
    },
)
async def confirm(
    request: Request,
    session: Annotated[AsyncSession, Depends(get_db_session)],
    token: Annotated[str, Query(description="Raw confirmation token from the email link")],
) -> JSONResponse:
    """Confirm a newsletter subscription using the token from the confirmation email."""
    request_id = _get_request_id(request)

    service = NewsletterService(session)
    try:
        result = await service.confirm(token=token)
    except ValueError as exc:
        # Req 9.5: invalid / expired / missing token → 422
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        ) from exc

    envelope = ok(result, request_id)
    return JSONResponse(
        content=envelope.model_dump(by_alias=True, mode="json"),
        status_code=status.HTTP_200_OK,
        headers={"Cache-Control": "no-store"},
    )


# ── POST /api/v1/newsletter/unsubscribe ──────────────────────────────────────

@router.post(
    "/unsubscribe",
    response_model=DataResponse[NewsletterUnsubscribeResponse],
    status_code=status.HTTP_200_OK,
    summary="Unsubscribe from the newsletter",
    description=(
        "Transition a pending or confirmed subscriber to 'unsubscribed'. "
        "Returns 200 even when no matching subscriber is found, preventing "
        "email enumeration (Req 9.6)."
    ),
    responses={
        200: {"description": "Successfully unsubscribed (or no record found)"},
    },
)
async def unsubscribe(
    body: NewsletterUnsubscribeRequest,
    request: Request,
    session: Annotated[AsyncSession, Depends(get_db_session)],
) -> JSONResponse:
    """Unsubscribe an email from the newsletter.

    Always returns HTTP 200 regardless of whether a subscriber record exists.
    """
    settings = get_settings()
    org_id = uuid.UUID(settings.default_org_id)
    request_id = _get_request_id(request)

    service = NewsletterService(session)
    result = await service.unsubscribe(email=body.email, org_id=org_id)

    envelope = ok(result, request_id)
    return JSONResponse(
        content=envelope.model_dump(by_alias=True, mode="json"),
        status_code=status.HTTP_200_OK,
        headers={"Cache-Control": "no-store"},
    )
