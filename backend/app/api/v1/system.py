"""
System endpoints — liveness and readiness probes.

GET /api/v1/health  — liveness:  process is alive (no dep checks)
GET /api/v1/ready   — readiness: all deps (DB + Redis) are reachable

Both endpoints return the standard SuccessResponse envelope:
    {"data": {...}, "meta": {"requestId": "...", "timestamp": "..."}}
"""
from __future__ import annotations

import logging

from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse

from app.config import get_settings
from app.schemas.envelope import SuccessResponse, make_response

logger = logging.getLogger(__name__)

router = APIRouter(tags=["system"])

_settings = get_settings()


@router.get(
    "/health",
    summary="Liveness check",
    response_description="Returns OK when the process is alive",
    response_model=SuccessResponse,
    responses={200: {"description": "Process is alive"}},
)
async def health(request: Request) -> JSONResponse:
    """
    Pure liveness probe — no dependency checks.
    Returns 200 immediately as long as the process is running.

    Response envelope::

        {
            "data": {"status": "ok", "version": "0.1.0"},
            "meta": {"requestId": "...", "timestamp": "..."}
        }
    """
    data = {"status": "ok", "version": _settings.app_version}
    body = make_response(data=data, request=request)
    return JSONResponse(content=body.model_dump(mode="json"), status_code=200)


@router.get(
    "/ready",
    summary="Readiness check",
    response_description="Returns ready when DB and Redis are reachable",
    response_model=SuccessResponse,
    responses={
        200: {"description": "All dependencies reachable"},
        503: {"description": "One or more dependencies unavailable"},
    },
)
async def ready(request: Request) -> JSONResponse:
    """
    Readiness probe — verifies DB (SELECT 1) and Redis (PING) connectivity.
    Returns HTTP 200 when all checks pass, HTTP 503 when any check fails.

    Response envelope (success)::

        {
            "data": {"status": "ready", "version": "0.1.0", "checks": {"db": "ok", "redis": "ok"}},
            "meta": {"requestId": "...", "timestamp": "..."}
        }

    Response envelope (degraded)::

        {
            "data": {"status": "degraded", "version": "0.1.0", "checks": {"db": "ok", "redis": "error"}},
            "meta": {"requestId": "...", "timestamp": "..."}
        }
    """
    checks: dict[str, str] = {}

    # ── DB check ──────────────────────────────────────────────────────────────
    try:
        from sqlalchemy import text  # noqa: PLC0415

        from app.infra.db import get_session_maker  # noqa: PLC0415

        async with get_session_maker()() as session:
            await session.execute(text("SELECT 1"))
        checks["db"] = "ok"
    except Exception as exc:
        logger.warning("Readiness DB check failed: %s", exc)
        checks["db"] = "error"

    # ── Redis check ───────────────────────────────────────────────────────────
    try:
        from app.infra.cache import get_redis_client  # noqa: PLC0415

        redis = get_redis_client()
        await redis.ping()
        checks["redis"] = "ok"
    except Exception as exc:
        logger.warning("Readiness Redis check failed: %s", exc)
        checks["redis"] = "error"

    all_ok = all(v == "ok" for v in checks.values())
    status_code = 200 if all_ok else 503
    data = {
        "status": "ready" if all_ok else "degraded",
        "checks": checks,
        "version": _settings.app_version,
    }
    body = make_response(data=data, request=request)
    return JSONResponse(content=body.model_dump(mode="json"), status_code=status_code)
