"""
NewsletterSubscriber repository — async SQLAlchemy 2.0.

NewsletterRepository — CRUD + token-lookup operations on newsletter_subscriber.

All queries filter on status rather than deleted_at (newsletter_subscriber
has no deleted_at; status transitions are the record, per design §9).
"""
from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.newsletter import NewsletterSubscriber


class NewsletterRepository:
    """Async SQLAlchemy repository for the ``newsletter_subscriber`` table."""

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def find_by_email(
        self, email: str, org_id: uuid.UUID
    ) -> NewsletterSubscriber | None:
        """Return the subscriber matching *(email, org_id)*, or ``None``.

        Returns any status; callers decide how to handle pending / confirmed /
        unsubscribed distinctions.
        """
        stmt = (
            select(NewsletterSubscriber)
            .where(
                NewsletterSubscriber.email == email,
                NewsletterSubscriber.org_id == org_id,
            )
            .limit(1)
        )
        result = await self._session.execute(stmt)
        return result.scalar_one_or_none()

    async def create(
        self, subscriber: NewsletterSubscriber
    ) -> NewsletterSubscriber:
        """Persist a new NewsletterSubscriber within the caller's transaction.

        The caller is responsible for committing (or the session factory commits
        on context-manager exit).  This method flushes to populate DB defaults.
        """
        self._session.add(subscriber)
        await self._session.flush()
        await self._session.refresh(subscriber)
        return subscriber

    async def update_status(
        self,
        subscriber_id: uuid.UUID,
        status: str,
        **kwargs: object,
    ) -> NewsletterSubscriber:
        """Set *status* (and any extra keyword fields) on the given subscriber.

        Accepted extra kwargs: ``confirm_token``, ``confirm_token_expires_at``,
        ``confirmed_at``, ``unsubscribed_at``.

        Raises ``ValueError`` if no subscriber with *subscriber_id* is found.
        """
        values: dict[str, object] = {
            "status": status,
            "updated_at": datetime.now(timezone.utc),
        }
        values.update(kwargs)

        stmt = (
            update(NewsletterSubscriber)
            .where(NewsletterSubscriber.id == subscriber_id)
            .values(**values)
            .returning(NewsletterSubscriber)
        )
        result = await self._session.execute(stmt)
        row = result.scalar_one_or_none()
        if row is None:
            raise ValueError(
                f"NewsletterSubscriber {subscriber_id} not found."
            )
        return row

    async def find_by_confirm_token(
        self, token_hash: str
    ) -> NewsletterSubscriber | None:
        """Return the subscriber whose ``confirm_token`` matches *token_hash*.

        The ``confirm_token`` column stores the SHA-256 hex digest of the raw
        token; callers must hash the raw token before calling this method.

        Returns ``None`` when no subscriber matches.
        """
        stmt = (
            select(NewsletterSubscriber)
            .where(NewsletterSubscriber.confirm_token == token_hash)
            .limit(1)
        )
        result = await self._session.execute(stmt)
        return result.scalar_one_or_none()
