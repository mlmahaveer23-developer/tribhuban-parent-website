"""
Newsletter service — double opt-in subscription management.

Module layout
-------------
NewsletterService      — stateful service that wires repository + outbox

Flow: subscribe
  1. Validate email format (already done by Pydantic schema — service skips
     re-validation but keeps a guard for programmatic callers).
  2. Look up subscriber by (org_id, email).
  3. If confirmed  → return "already_confirmed" (Req 9.3).
  4. If pending    → return "already_pending"   (Req 9.3).
  5. Create subscriber with status="pending".
  6. Generate raw token: secrets.token_urlsafe(32).
  7. Hash token:   hashlib.sha256(raw.encode()).hexdigest()  (stored in DB).
  8. Set confirm_token_expires_at = now + 72 h.
  9. Write outbox event "newsletter.confirm_requested" in same transaction.
  10. Return success (Req 9.1).

Flow: confirm
  1. Hash the provided raw token.
  2. Look up subscriber by hashed token.
  3. Not found or expired → raise ValueError (Req 9.5).
  4. Already confirmed   → return success (idempotent).
  5. Transition to confirmed, clear token fields, set confirmed_at.

Flow: unsubscribe
  1. Find subscriber by (email, org_id) with status pending|confirmed.
  2. If found   → transition to unsubscribed, set unsubscribed_at.
  3. If not found → return success anyway (Req 9.6).

Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7
"""
from __future__ import annotations

import hashlib
import re
import secrets
import uuid
from datetime import datetime, timedelta, timezone

from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.domain.newsletter import NewsletterSubscriber
from app.infra.outbox import write_outbox_event
from app.repositories.newsletter import NewsletterRepository
from app.schemas.newsletter import (
    NewsletterConfirmResponse,
    NewsletterSubscribeResponse,
    NewsletterUnsubscribeResponse,
)

# ── Email validation regex (mirrors schemas/newsletter.py) ───────────────────
_EMAIL_RE: re.Pattern[str] = re.compile(
    r"^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+"
    r"@"
    r"[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?"
    r"(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*"
    r"\.[a-zA-Z]{2,}$"
)

# ── Token configuration ───────────────────────────────────────────────────────
_TOKEN_TTL_HOURS: int = 72  # default; overridden by settings.newsletter_confirmation_ttl_hours


def _hash_token(raw_token: str) -> str:
    """Return the SHA-256 hex digest of *raw_token* for safe storage."""
    return hashlib.sha256(raw_token.encode()).hexdigest()


def _generate_token() -> tuple[str, str]:
    """Return ``(raw_token, hashed_token)``.

    The raw token is returned only once so it can be embedded in the
    confirmation email URL.  Only the hash is persisted in the DB.
    """
    raw = secrets.token_urlsafe(32)   # 43-char URL-safe Base64
    return raw, _hash_token(raw)


class NewsletterService:
    """Orchestrates newsletter subscription lifecycle.

    Usage::

        service = NewsletterService(session)
        response = await service.subscribe(email="user@example.com",
                                           source="footer",
                                           org_id=org_uuid,
                                           consent_ip="1.2.3.4")
    """

    def __init__(self, session: AsyncSession) -> None:
        self._session = session
        self._repo = NewsletterRepository(session)

    # ── subscribe ─────────────────────────────────────────────────────────────

    async def subscribe(
        self,
        email: str,
        source: str | None,
        org_id: uuid.UUID,
        consent_ip: str | None,
    ) -> NewsletterSubscribeResponse:
        """Subscribe an email address to the newsletter (double opt-in).

        Args:
            email:      RFC 5322 email address (already validated by the schema
                        layer; service validates again for programmatic safety).
            source:     Optional subscription source tag (≤ 50 chars).
            org_id:     Organisation UUID for multi-tenant partitioning.
            consent_ip: IP address of the subscriber at time of signup.

        Returns:
            NewsletterSubscribeResponse with status:
            - ``"pending"``           — newly created, confirmation email queued.
            - ``"already_confirmed"`` — already confirmed; no duplicate created.
            - ``"already_pending"``   — already pending; no duplicate created.

        Raises:
            ValueError: If *email* fails basic format validation.
        """
        settings = get_settings()
        ttl_hours: int = settings.newsletter_confirmation_ttl_hours or _TOKEN_TTL_HOURS
        now = datetime.now(timezone.utc)

        # Guard: re-validate email for programmatic callers
        email = email.strip()
        if not email or not _EMAIL_RE.match(email):
            raise ValueError("value is not a valid email address")

        # ── 1. Deduplication check (Req 9.3) ─────────────────────────────────
        existing = await self._repo.find_by_email(email, org_id)

        if existing is not None:
            if existing.status == "confirmed":
                return NewsletterSubscribeResponse(
                    message="Already subscribed",
                    status="already_confirmed",
                )
            if existing.status == "pending":
                return NewsletterSubscribeResponse(
                    message="Confirmation email already sent. Please check your inbox.",
                    status="already_pending",
                )
            # status == "unsubscribed" → allow re-subscription (fall through to create)
            # We create a new record because the old one is a tombstone.
            # The UNIQUE constraint (org_id, email) means we need to update
            # the existing row rather than insert a new one.
            raw_token, hashed_token = _generate_token()
            expires_at = now + timedelta(hours=ttl_hours)

            async with self._session.begin():
                await self._repo.update_status(
                    existing.id,
                    status="pending",
                    source=source,
                    consent_ip=consent_ip,
                    confirm_token=hashed_token,
                    confirm_token_expires_at=expires_at,
                    confirmed_at=None,
                    unsubscribed_at=None,
                    updated_at=now,
                )

                await write_outbox_event(
                    self._session,
                    aggregate_type="NewsletterSubscriber",
                    aggregate_id=existing.id,
                    event_type="newsletter.confirm_requested",
                    payload={
                        "subscriberId": str(existing.id),
                        "orgId": str(org_id),
                        "email": email,
                        "rawToken": raw_token,
                        "expiresAt": expires_at.isoformat(),
                        "occurredAt": now.isoformat(),
                    },
                    org_id=org_id,
                )

            return NewsletterSubscribeResponse(
                message="Confirmation email sent",
                status="pending",
            )

        # ── 2. Generate confirmation token (Req 9.1) ──────────────────────────
        raw_token, hashed_token = _generate_token()
        expires_at = now + timedelta(hours=ttl_hours)

        # ── 3. Create subscriber + outbox event in one transaction (Req 9.2) ──
        async with self._session.begin():
            subscriber = NewsletterSubscriber(
                id=uuid.uuid4(),
                org_id=org_id,
                email=email,
                status="pending",
                source=source,
                consent_ip=consent_ip,
                confirm_token=hashed_token,
                confirm_token_expires_at=expires_at,
                created_at=now,
                updated_at=now,
            )
            subscriber = await self._repo.create(subscriber)

            await write_outbox_event(
                self._session,
                aggregate_type="NewsletterSubscriber",
                aggregate_id=subscriber.id,
                event_type="newsletter.confirm_requested",
                payload={
                    "subscriberId": str(subscriber.id),
                    "orgId": str(org_id),
                    "email": email,
                    "rawToken": raw_token,
                    "expiresAt": expires_at.isoformat(),
                    "occurredAt": now.isoformat(),
                },
                org_id=org_id,
            )

        return NewsletterSubscribeResponse(
            message="Confirmation email sent",
            status="pending",
        )

    # ── confirm ───────────────────────────────────────────────────────────────

    async def confirm(self, token: str) -> NewsletterConfirmResponse:
        """Confirm a newsletter subscription via the token from the confirmation email.

        Args:
            token: The raw URL-safe token from the confirmation link query param.

        Returns:
            NewsletterConfirmResponse with status ``"confirmed"``.

        Raises:
            ValueError: If the token is missing, does not match any subscriber,
                        has already been used, or has expired (Req 9.5).
        """
        if not token:
            raise ValueError("Token is invalid or expired")

        token_hash = _hash_token(token)
        now = datetime.now(timezone.utc)

        # ── Look up by hashed token ───────────────────────────────────────────
        subscriber = await self._repo.find_by_confirm_token(token_hash)

        if subscriber is None:
            raise ValueError("Token is invalid or expired")

        # ── Check expiry (Req 9.5) ────────────────────────────────────────────
        if subscriber.confirm_token_expires_at is not None:
            expires_at = subscriber.confirm_token_expires_at
            # Ensure timezone-aware comparison
            if expires_at.tzinfo is None:
                expires_at = expires_at.replace(tzinfo=timezone.utc)
            if now > expires_at:
                raise ValueError("Token is invalid or expired")

        # ── Idempotency: already confirmed → return success ───────────────────
        if subscriber.status == "confirmed":
            return NewsletterConfirmResponse(
                message="Email address confirmed",
                status="confirmed",
            )

        # ── Transition to confirmed ───────────────────────────────────────────
        async with self._session.begin():
            await self._repo.update_status(
                subscriber.id,
                status="confirmed",
                confirm_token=None,
                confirm_token_expires_at=None,
                confirmed_at=now,
                updated_at=now,
            )

        return NewsletterConfirmResponse(
            message="Email address confirmed",
            status="confirmed",
        )

    # ── unsubscribe ───────────────────────────────────────────────────────────

    async def unsubscribe(
        self,
        email: str,
        org_id: uuid.UUID,
    ) -> NewsletterUnsubscribeResponse:
        """Unsubscribe an email address from the newsletter.

        Per Req 9.6 this is always successful — if the subscriber does not
        exist we return success anyway (idempotent, prevents email enumeration).

        Args:
            email:  The email address to unsubscribe.
            org_id: Organisation UUID for multi-tenant partitioning.

        Returns:
            NewsletterUnsubscribeResponse with status ``"unsubscribed"``.
        """
        now = datetime.now(timezone.utc)

        subscriber = await self._repo.find_by_email(email, org_id)

        if subscriber is not None and subscriber.status in ("pending", "confirmed"):
            async with self._session.begin():
                await self._repo.update_status(
                    subscriber.id,
                    status="unsubscribed",
                    unsubscribed_at=now,
                    updated_at=now,
                )

        # Return success regardless of whether subscriber existed (Req 9.6)
        return NewsletterUnsubscribeResponse(
            message="Successfully unsubscribed",
            status="unsubscribed",
        )
