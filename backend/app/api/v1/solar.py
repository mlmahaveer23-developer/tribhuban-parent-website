"""
Solar API router — POST /api/v1/solar/estimate

Implements Req 5.1, 5.2, 5.6, 5.7, 5.8, 5.10, 5.11.

Rate limiting  : 20 req/min per IP (uses RateLimiter from infra/ratelimit.py when
                 fully implemented; currently uses a lightweight FastAPI dependency
                 that calls check_rate_limit directly and can be swapped for the
                 full RateLimiter in task 5.1 without changing this router).

Validation     : SolarEstimateRequest (Pydantic model) — see app/schemas/solar.py.

Computation    : estimate_solar(req, INDIA_TARIFFS) — pure function in app/services/solar.py.

Response       : SolarEstimateResponse serialised with by_alias=True → camelCase JSON.

Error handling :
  - state not in tariff table → HTTP 422 + field detail (ValueError caught by global handler)
  - dependency unavailable    → HTTP 503 (not 500)
  - all other unexpected errors → HTTP 500 via global exception handler in main.py

Response time  : ≤ 3 s (pure CPU computation — no I/O).
"""
from __future__ import annotations

import logging
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import JSONResponse

from app.schemas.solar import SolarEstimateRequest, SolarEstimateResponse
from app.services.solar import INDIA_TARIFFS, estimate_solar

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/solar", tags=["solar"])


# ── Rate-limit dependency ─────────────────────────────────────────────────────

async def _solar_rate_limit(request: Request) -> None:
    """
    Enforce 20 req/min per client IP for the solar estimate endpoint.

    Implements a Redis sorted-set sliding-window counter (per-IP, 60 s window,
    limit 20).  When task 5.1 delivers the full ``RateLimiter`` class this
    dependency can be replaced — the function signature is identical from the
    router's perspective.

    Raises HTTP 503 when Redis is unavailable (dependency failure, not a
    client error) so the caller can distinguish "service down" from "too many
    requests" (HTTP 429).
    """
    import time  # noqa: PLC0415 — local import, this is a tiny utility

    from app.infra.cache import redis_client  # noqa: PLC0415

    # Determine client identifier: prefer X-Forwarded-For (behind a proxy/CDN),
    # fall back to the direct connection IP.
    forwarded_for = request.headers.get("X-Forwarded-For")
    if forwarded_for:
        client_ip = forwarded_for.split(",")[0].strip()
    else:
        client_ip = request.client.host if request.client else "unknown"

    limit = 20
    window_seconds = 60
    key = f"rl:solar:estimate:{client_ip}"
    now_ms = int(time.time() * 1000)
    window_ms = window_seconds * 1000

    try:
        async with redis_client.pipeline(transaction=True) as pipe:
            # Remove entries outside the sliding window
            pipe.zremrangebyscore(key, 0, now_ms - window_ms)
            # Count remaining entries in window (before adding this request)
            pipe.zcard(key)
            # Record this request
            pipe.zadd(key, {str(now_ms): now_ms})
            # Expire the key after the window
            pipe.expire(key, window_seconds + 1)
            results = await pipe.execute()

        current_count: int = results[1]

        if current_count >= limit:
            # Compute Retry-After from the oldest entry in the window
            oldest = await redis_client.zrange(key, 0, 0, withscores=True)
            retry_after = window_seconds
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
        # Redis is unreachable.  Per Req 5.11, return 503 when a dependency
        # required to serve the estimate is unavailable.
        logger.error(
            "Rate-limit check failed for solar/estimate [ip=%s]: %s",
            client_ip,
            exc,
            exc_info=True,
        )
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Service temporarily unavailable. Please try again later.",
        ) from exc


# ── Endpoint ──────────────────────────────────────────────────────────────────

@router.post(
    "/estimate",
    response_model=SolarEstimateResponse,
    status_code=status.HTTP_200_OK,
    summary="Compute rooftop solar savings estimate",
    description=(
        "Returns a recommended system size, annual generation, annual savings, "
        "payback period, CO₂ offset, and the assumption set used. "
        "Provide exactly one of `monthly_bill_minor` or `monthly_units_kwh`. "
        "State must be a supported Indian state."
    ),
    responses={
        200: {"description": "Successful estimate"},
        422: {"description": "Validation error — invalid inputs"},
        429: {"description": "Rate limit exceeded"},
        503: {"description": "Service unavailable — dependency failure"},
    },
)
async def solar_estimate(
    req: SolarEstimateRequest,
    request: Request,
    _rate_limit: Annotated[None, Depends(_solar_rate_limit)] = None,
) -> JSONResponse:
    """
    Authoritative server-side solar savings computation (§14.1, Req 5.2).

    1. Validates inputs via SolarEstimateRequest (Pydantic — HTTP 422 on failure).
    2. Verifies state is in the tariff table — raises ValueError → HTTP 422.
    3. Calls the pure ``estimate_solar`` function — no I/O, ≤ 3 s (Req 5.10).
    4. Returns SolarEstimateResponse serialised as camelCase JSON (Req 5.7).
    """
    # ── Validate state against tariff table (Req 5.8) ────────────────────────
    state_key = req.state.lower().strip()
    if state_key not in INDIA_TARIFFS:
        raise ValueError(f"State not supported: {req.state}")

    # Normalise the state key so the service layer always receives a known key.
    # We use object mutation here only because SolarEstimateRequest is a Pydantic
    # model whose fields are assignable; the service function is still pure.
    object.__setattr__(req, "state", state_key)

    # Verify connection_type is in the state's table (defensive; Pydantic Literal
    # already constrains values, but the tariff table could theoretically differ).
    if req.connection_type not in INDIA_TARIFFS[state_key]:
        raise ValueError(
            f"Connection type '{req.connection_type}' is not supported for state '{req.state}'."
        )

    # ── Compute estimate (pure function — no I/O) ─────────────────────────────
    result: SolarEstimateResponse = estimate_solar(req, INDIA_TARIFFS)

    # ── Serialise with camelCase aliases ──────────────────────────────────────
    return JSONResponse(
        content=result.model_dump(by_alias=True, mode="json"),
        status_code=status.HTTP_200_OK,
    )
