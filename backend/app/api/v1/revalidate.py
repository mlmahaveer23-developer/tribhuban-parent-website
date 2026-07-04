"""
ISR on-demand revalidation endpoint.

``POST /api/v1/revalidate`` is an **internal endpoint** called by the outbox
relay worker (``backend/app/workers/outbox_relay.py``) when a content-change
event is published.  It forwards a revalidation signal to the Next.js frontend
so ISR pages are re-generated without waiting for their background TTL.

Security model
--------------
Requests must carry a shared secret in the ``X-Revalidate-Secret`` header that
matches ``settings.revalidate_secret``.  Mismatches are rejected with HTTP 403
so the endpoint cannot be abused by unauthenticated callers.

The actual forwarding call to Next.js is **fire-and-forget**: we dispatch it
as a background task so the relay is not blocked on network I/O to the frontend.

Requirements: 3.2, 22.8, 26.3
"""
from __future__ import annotations

import logging

import httpx
from fastapi import APIRouter, BackgroundTasks, Header, HTTPException
from pydantic import BaseModel

from app.config import Settings, get_settings

logger = logging.getLogger(__name__)

router = APIRouter(tags=["revalidation"])


# ── Request / response models ─────────────────────────────────────────────────


class RevalidatePayload(BaseModel):
    """Payload sent by the outbox relay to trigger ISR revalidation.

    Attributes
    ----------
    path:
        The Next.js route path to revalidate, e.g. ``/blog/my-article``.
        The frontend's revalidation handler uses this to call
        ``revalidatePath(path)`` or ``revalidateTag(tag)``.
    tag:
        Optional Next.js cache tag to revalidate (alternative to path).
    """

    path: str | None = None
    tag: str | None = None


class RevalidateResponse(BaseModel):
    status: str
    revalidated: bool


# ── Helper ────────────────────────────────────────────────────────────────────


async def _forward_to_nextjs(settings: Settings, payload: RevalidatePayload) -> None:
    """Fire-and-forget HTTP POST to the Next.js revalidation API route.

    Next.js exposes a custom route handler (e.g. ``/api/revalidate``) that
    calls ``revalidatePath``/``revalidateTag`` and validates the same shared
    secret.  If the forwarding call fails we log a warning but do not raise —
    the ISR TTL will eventually refresh the page regardless.
    """
    frontend_url = str(settings.frontend_url).rstrip("/")
    target = f"{frontend_url}/api/revalidate"

    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.post(
                target,
                json=payload.model_dump(exclude_none=True),
                headers={"X-Revalidate-Secret": settings.revalidate_secret},
            )
            if resp.is_success:
                logger.info(
                    "ISR revalidation forwarded to Next.js: path=%s tag=%s status=%s",
                    payload.path,
                    payload.tag,
                    resp.status_code,
                )
            else:
                logger.warning(
                    "ISR revalidation forwarding received non-2xx from Next.js: "
                    "path=%s tag=%s status=%s",
                    payload.path,
                    payload.tag,
                    resp.status_code,
                )
    except Exception as exc:  # noqa: BLE001
        # Non-fatal: Next.js may be temporarily unreachable; ISR TTL covers it.
        logger.warning(
            "ISR revalidation forwarding failed (non-fatal): path=%s tag=%s error=%s",
            payload.path,
            payload.tag,
            exc,
        )


# ── Endpoint ──────────────────────────────────────────────────────────────────


@router.post(
    "/revalidate",
    response_model=RevalidateResponse,
    summary="Trigger ISR on-demand revalidation",
    description=(
        "Internal endpoint called by the outbox relay after a content-change event. "
        "Requires a valid ``X-Revalidate-Secret`` header. "
        "Forwards the revalidation signal to the Next.js frontend as a background task."
    ),
    status_code=200,
)
async def revalidate_content(
    payload: RevalidatePayload,
    background_tasks: BackgroundTasks,
    x_revalidate_secret: str = Header(alias="X-Revalidate-Secret"),
) -> RevalidateResponse:
    """Trigger on-demand ISR revalidation.

    Validates the shared secret, then schedules a fire-and-forget HTTP call
    to the Next.js revalidation route.

    Args:
        payload:              JSON body with ``path`` and/or ``tag`` to revalidate.
        background_tasks:     FastAPI background task queue.
        x_revalidate_secret:  Shared secret from ``X-Revalidate-Secret`` header.

    Returns:
        ``{"status": "ok", "revalidated": True}`` on success.

    Raises:
        HTTPException(403): When the secret does not match.
    """
    settings = get_settings()

    if x_revalidate_secret != settings.revalidate_secret:
        raise HTTPException(
            status_code=403,
            detail="Invalid revalidation secret.",
        )

    # Fire-and-forget: schedule the forwarding call so this response is not
    # blocked on Next.js availability.
    background_tasks.add_task(_forward_to_nextjs, settings, payload)

    return RevalidateResponse(status="ok", revalidated=True)
