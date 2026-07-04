"""
Transactional outbox infrastructure — write domain events within the caller's
DB transaction.

Public API
----------
write_outbox_event(session, *, aggregate_type, aggregate_id, event_type,
                   payload, org_id) -> OutboxEvent

    Insert a single ``outbox_event`` row in the supplied session.  The caller
    MUST ensure the session is part of an active transaction and commits (or
    delegates committing to the session-factory context manager).  This
    function never commits or rolls back on its own.

The relay worker that polls ``pending`` rows and publishes them is in
``app/workers/outbox_relay.py`` (task 9.2).
"""
from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.infra import OutboxEvent

__all__ = ["write_outbox_event"]


async def write_outbox_event(
    session: AsyncSession,
    *,
    aggregate_type: str,
    aggregate_id: uuid.UUID,
    event_type: str,
    payload: dict,
    org_id: uuid.UUID,
) -> OutboxEvent:
    """Insert an ``outbox_event`` row within the caller's DB transaction.

    Args:
        session:        The active SQLAlchemy async session (must be inside a
                        transaction — ``async with session.begin()`` or the
                        session-factory's auto-commit context).
        aggregate_type: Domain aggregate class name, e.g. ``"Lead"``.
        aggregate_id:   Primary key UUID of the aggregate being mutated.
        event_type:     Dot-notation event name, e.g. ``"lead.created"``.
        payload:        Arbitrary JSON-serialisable dict that downstream
                        consumers will receive.
        org_id:         Organisation UUID for multi-tenant partitioning.

    Returns:
        The newly created :class:`OutboxEvent` ORM instance (in ``pending``
        status).  It has been added to *session* but NOT committed.
    """
    event = OutboxEvent(
        id=uuid.uuid4(),
        org_id=org_id,
        aggregate_type=aggregate_type,
        aggregate_id=aggregate_id,
        event_type=event_type,
        payload=payload,
        occurred_at=datetime.now(timezone.utc),
        status="pending",
        attempts=0,
    )
    session.add(event)
    return event
