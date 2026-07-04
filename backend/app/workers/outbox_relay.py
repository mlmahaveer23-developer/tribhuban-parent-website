"""
Outbox relay worker — polls pending ``outbox_event`` rows and delivers them.

Algorithm (§14.6)
-----------------
1. SELECT pending rows ORDER BY occurred_at ASC LIMIT batch FOR UPDATE SKIP LOCKED.
2. For each event:
   a. Call deliver(event).
   b. On success  → mark published, increment published counter.
   c. On failure  → increment attempts; if attempts >= MAX_ATTEMPTS mark failed.
3. Return count of events published in this batch.

Delivery routing
----------------
newsletter.confirm_requested        → push JSON payload to Redis list "email:queue"
lead.created                        → log (future CRM integration)
consultation.requested              → log (future CRM integration)
career.application.submitted        → log (future CRM integration)
article.published / knowledge.published → fire ISR revalidation webhook
*                                   → mark published (no side-effect needed)

Concurrency safety
------------------
FOR UPDATE SKIP LOCKED ensures multiple workers can run in parallel without
double-processing the same row.
"""
from __future__ import annotations

import json
import logging
from datetime import datetime, timezone
from typing import Any

import httpx
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.domain.infra import OutboxEvent
from app.infra.cache import redis_client
from app.infra.db import AsyncSessionLocal

logger = logging.getLogger(__name__)

# Maximum delivery attempts before an event is marked failed.
MAX_ATTEMPTS: int = 5

# Redis list key for queued transactional emails.
EMAIL_QUEUE_KEY: str = "email:queue"

# Event types that trigger ISR revalidation.
_ISR_EVENT_TYPES: frozenset[str] = frozenset(
    {"article.published", "knowledge.published"}
)

# Event types that route to the email queue.
_EMAIL_EVENT_TYPES: frozenset[str] = frozenset({"newsletter.confirm_requested"})

# Event types that are logged for future CRM ingestion.
_CRM_EVENT_TYPES: frozenset[str] = frozenset(
    {"lead.created", "consultation.requested", "career.application.submitted"}
)


# ── Delivery helpers ─────────────────────────────────────────────────────────


async def _deliver_email_queue(event: OutboxEvent) -> None:
    """Push the event payload onto the Redis email queue."""
    payload_str = json.dumps(
        {
            "type": event.event_type,
            **event.payload,
        }
    )
    await redis_client.rpush(EMAIL_QUEUE_KEY, payload_str)
    logger.debug(
        "outbox_relay: queued email event event_type=%s id=%s",
        event.event_type,
        event.id,
    )


async def _deliver_isr_revalidation(event: OutboxEvent) -> None:
    """Call the ISR on-demand revalidation webhook on the frontend."""
    settings = get_settings()
    frontend_url = str(settings.frontend_url).rstrip("/")
    if not frontend_url:
        logger.warning(
            "outbox_relay: frontend_url not configured — skipping ISR revalidation "
            "for event_type=%s id=%s",
            event.event_type,
            event.id,
        )
        return

    revalidate_url = f"{frontend_url}/api/revalidate"
    payload: dict[str, Any] = {
        "secret": settings.revalidate_secret,
        "event_type": event.event_type,
        "aggregate_type": event.aggregate_type,
        "aggregate_id": str(event.aggregate_id),
        "payload": event.payload,
    }

    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.post(revalidate_url, json=payload)
        response.raise_for_status()

    logger.info(
        "outbox_relay: ISR revalidation triggered event_type=%s id=%s status=%s",
        event.event_type,
        event.id,
        response.status_code,
    )


async def _deliver(event: OutboxEvent) -> None:
    """Route an outbox event to the appropriate delivery mechanism.

    Raises an exception on failure so the caller can handle retry / fail logic.
    """
    if event.event_type in _EMAIL_EVENT_TYPES:
        await _deliver_email_queue(event)

    elif event.event_type in _CRM_EVENT_TYPES:
        # Future CRM integration seam — log for now.
        logger.info(
            "outbox_relay: CRM event event_type=%s aggregate_type=%s aggregate_id=%s",
            event.event_type,
            event.aggregate_type,
            event.aggregate_id,
        )

    elif event.event_type in _ISR_EVENT_TYPES:
        await _deliver_isr_revalidation(event)

    else:
        # All other event types — mark published without side-effects.
        logger.debug(
            "outbox_relay: no-op delivery event_type=%s id=%s",
            event.event_type,
            event.id,
        )


# ── Mark helpers (use raw UPDATE to avoid loading the full ORM object) ────────


async def _mark_published(session: AsyncSession, event_id: object) -> None:
    await session.execute(
        update(OutboxEvent)
        .where(OutboxEvent.id == event_id)
        .values(status="published", published_at=datetime.now(timezone.utc))
    )


async def _mark_failed(session: AsyncSession, event_id: object) -> None:
    await session.execute(
        update(OutboxEvent)
        .where(OutboxEvent.id == event_id)
        .values(status="failed")
    )


async def _increment_attempts(session: AsyncSession, event_id: object) -> None:
    await session.execute(
        update(OutboxEvent)
        .where(OutboxEvent.id == event_id)
        .values(attempts=OutboxEvent.attempts + 1)
    )


# ── Main worker function ─────────────────────────────────────────────────────


async def relay_outbox(batch: int = 100) -> int:
    """Poll pending outbox events, deliver them, mark published/failed.

    Returns count of events published in this batch.

    Uses FOR UPDATE SKIP LOCKED for safe horizontal scaling.
    Fires ISR revalidation webhook on content publish events.

    Args:
        batch: Maximum number of rows to process in one invocation.

    Returns:
        Number of events successfully published during this call.
    """
    published = 0

    async with AsyncSessionLocal() as session:
        async with session.begin():
            # ── 1. Lock and fetch pending rows ───────────────────────────────
            result = await session.execute(
                select(OutboxEvent)
                .where(OutboxEvent.status == "pending")
                .order_by(OutboxEvent.occurred_at.asc())
                .limit(batch)
                .with_for_update(skip_locked=True)
            )
            rows = result.scalars().all()

            if not rows:
                logger.debug("outbox_relay: no pending events in this batch")
                return 0

            logger.info("outbox_relay: processing %d pending event(s)", len(rows))

            # ── 2. Deliver each event ─────────────────────────────────────────
            for event in rows:
                try:
                    await _deliver(event)
                    await _mark_published(session, event.id)
                    published += 1
                    logger.debug(
                        "outbox_relay: published event_type=%s id=%s",
                        event.event_type,
                        event.id,
                    )

                except Exception as exc:  # noqa: BLE001
                    logger.warning(
                        "outbox_relay: delivery failed event_type=%s id=%s "
                        "attempts=%d error=%s",
                        event.event_type,
                        event.id,
                        event.attempts,
                        exc,
                    )
                    await _increment_attempts(session, event.id)
                    new_attempts = event.attempts + 1
                    if new_attempts >= MAX_ATTEMPTS:
                        await _mark_failed(session, event.id)
                        logger.error(
                            "outbox_relay: event permanently failed event_type=%s id=%s "
                            "after %d attempts",
                            event.event_type,
                            event.id,
                            new_attempts,
                        )

    logger.info("outbox_relay: batch complete published=%d", published)
    return published
