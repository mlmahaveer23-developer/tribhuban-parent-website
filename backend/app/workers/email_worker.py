"""
Email worker — dequeues transactional emails from Redis and sends them via SES.

Queue contract
--------------
Redis list key : "email:queue"
Dead-letter key: "email:dlq"

Each item is a JSON string with at minimum:
  {
    "type"     : "newsletter.confirm_requested",
    "email"    : "subscriber@example.com",
    "rawToken" : "<plain-text confirmation token>",
    "expiresAt": "<ISO-8601 UTC timestamp>",
    "_retries" : 0          # injected/managed by this worker
  }

Retry policy
------------
- Max retries : MAX_RETRIES = 3
- Backoff     : exponential — 2^attempt seconds (1s, 2s, 4s), capped at 30 s.
- After MAX_RETRIES failures the item is RPUSH-ed to "email:dlq" for manual
  inspection.

Email templates
---------------
newsletter.confirm_requested:
    Subject : "Confirm your Tribhuban Concepts newsletter subscription"
    Body    : HTML confirmation link using settings.frontend_url + rawToken

Return value
------------
Returns the count of emails successfully sent in this invocation.
"""
from __future__ import annotations

import asyncio
import json
import logging

from app.config import get_settings
from app.infra.cache import redis_client
from app.infra.email import send_email

logger = logging.getLogger(__name__)

# ── Constants ────────────────────────────────────────────────────────────────

EMAIL_QUEUE_KEY: str = "email:queue"
EMAIL_DLQ_KEY: str = "email:dlq"

# Maximum send attempts before dead-lettering.
MAX_RETRIES: int = 3


# ── Email template builders ──────────────────────────────────────────────────


def _build_newsletter_confirm_email(
    frontend_url: str,
    raw_token: str,
) -> tuple[str, str, str]:
    """Return (subject, html_body, text_body) for newsletter confirmation."""
    confirm_url = f"{frontend_url.rstrip('/')}/newsletter/confirm?token={raw_token}"

    subject = "Confirm your Tribhuban Concepts newsletter subscription"

    html_body = f"""\
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>{subject}</title></head>
<body style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
  <h1 style="color:#B87333">Confirm your subscription</h1>
  <p>Click below to confirm your Tribhuban Concepts newsletter subscription:</p>
  <p>
    <a href="{confirm_url}"
       style="display:inline-block;padding:12px 24px;background:#B87333;
              color:#fff;text-decoration:none;border-radius:6px;font-weight:bold">
      Confirm subscription
    </a>
  </p>
  <p>This link expires in 72 hours.</p>
  <p style="color:#8C7B66;font-size:0.875rem">
    If you did not sign up for this newsletter, you can safely ignore this email.
  </p>
</body>
</html>"""

    text_body = (
        f"Confirm your Tribhuban Concepts newsletter subscription\n\n"
        f"Click the link below to confirm:\n{confirm_url}\n\n"
        f"This link expires in 72 hours.\n\n"
        f"If you did not sign up, you can safely ignore this email."
    )

    return subject, html_body, text_body


# ── Delivery dispatch ────────────────────────────────────────────────────────


async def _send_one(item: dict) -> bool:
    """Dispatch a single queued email item.

    Returns True on successful delivery, False on failure.
    """
    settings = get_settings()
    event_type: str = item.get("type", "")

    if event_type == "newsletter.confirm_requested":
        email: str = item.get("email", "")
        raw_token: str = item.get("rawToken", "")
        if not email or not raw_token:
            logger.error(
                "email_worker: malformed newsletter.confirm_requested item — "
                "missing email or rawToken: %s",
                item,
            )
            # Treat as a permanent failure — dead-letter immediately.
            return False

        subject, html_body, text_body = _build_newsletter_confirm_email(
            str(settings.frontend_url), raw_token
        )
        return await send_email(email, subject, html_body, text_body)

    else:
        # Unknown email type — log and treat as sent (no action needed).
        logger.warning(
            "email_worker: unknown email type=%r — skipping", event_type
        )
        return True


# ── Main worker function ─────────────────────────────────────────────────────


async def send_pending_emails() -> int:
    """Dequeue emails from Redis list "email:queue" and send via AWS SES.

    Retries with exponential backoff (max 3 retries).
    Dead-letters to "email:dlq" after max retries.
    Returns count of emails sent.

    This function processes the queue until it is empty (LPOP returns None).
    Each email gets up to MAX_RETRIES send attempts with exponential back-off
    before being pushed to the dead-letter queue.
    """
    sent = 0

    while True:
        # Dequeue one item (non-blocking).
        raw = await redis_client.lpop(EMAIL_QUEUE_KEY)
        if raw is None:
            # Queue is empty — we're done.
            break

        # ── Parse ─────────────────────────────────────────────────────────────
        try:
            item: dict = json.loads(raw)
        except (json.JSONDecodeError, ValueError) as exc:
            logger.error(
                "email_worker: failed to parse queue item error=%s raw=%r",
                exc,
                raw,
            )
            # Push malformed item to DLQ and continue.
            await redis_client.rpush(EMAIL_DLQ_KEY, raw)
            continue

        retries: int = item.get("_retries", 0)

        # ── Send with retry ───────────────────────────────────────────────────
        success = False
        last_error: Exception | None = None

        for attempt in range(retries, MAX_RETRIES):
            try:
                success = await _send_one(item)
                if success:
                    break
                # _send_one returned False without raising — treat as failure.
                raise RuntimeError("send_email returned False")

            except Exception as exc:  # noqa: BLE001
                last_error = exc
                next_attempt = attempt + 1
                if next_attempt < MAX_RETRIES:
                    backoff = min(2 ** attempt, 30)
                    logger.warning(
                        "email_worker: send failed attempt=%d/%d backoff=%ds "
                        "type=%r error=%s",
                        next_attempt,
                        MAX_RETRIES,
                        backoff,
                        item.get("type"),
                        exc,
                    )
                    await asyncio.sleep(backoff)
                else:
                    logger.error(
                        "email_worker: send failed permanently attempt=%d/%d "
                        "type=%r error=%s",
                        next_attempt,
                        MAX_RETRIES,
                        item.get("type"),
                        exc,
                    )

        if success:
            sent += 1
            logger.info(
                "email_worker: sent type=%r to=%s",
                item.get("type"),
                item.get("email"),
            )
        else:
            # Dead-letter: store item with updated retry count for manual triage.
            item["_retries"] = MAX_RETRIES
            if last_error is not None:
                item["_last_error"] = str(last_error)
            dlq_payload = json.dumps(item)
            await redis_client.rpush(EMAIL_DLQ_KEY, dlq_payload)
            logger.error(
                "email_worker: dead-lettered type=%r to=%s",
                item.get("type"),
                item.get("email"),
            )

    logger.info("email_worker: batch complete sent=%d", sent)
    return sent
