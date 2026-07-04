"""
Idempotency infrastructure — Redis-backed deduplication for write operations.

Algorithm (§14.5):
  - key=None → op() runs normally, no deduplication.
  - Duplicate key within TTL → returns cached result (no second insert).
  - Concurrent identical key → wait 100 ms, retry get, return cached or raise HTTP 409.
  - op failure → nothing cached; next retry can proceed.

Redis key namespacing:
  Cache: "idem:{key}"
  Lock:  "idem:lock:{key}"

Public API
----------
  handle_idempotent_write(key, op, redis, ttl) — core dedup logic
  get_idempotency_key(header)                   — FastAPI dependency for header validation
"""
from __future__ import annotations

import asyncio
import logging
from collections.abc import Awaitable, Callable
from typing import TypeVar

import orjson
from fastapi import Header, HTTPException

from app.config import get_settings
from app.infra.cache import RedisClient

logger = logging.getLogger(__name__)

T = TypeVar("T")

# ── Key prefixes ──────────────────────────────────────────────────────────────
_IDEM_PREFIX = "idem:"
_LOCK_PREFIX = "idem:lock:"

# ── Lock constants ────────────────────────────────────────────────────────────
_LOCK_TTL_SECONDS = 30          # prevent deadlock if the process dies mid-op
_LOCK_WAIT_MS = 100             # how long to wait before the single retry (ms)


# ── Core handler ─────────────────────────────────────────────────────────────


async def handle_idempotent_write(
    key: str | None,
    op: Callable[[], Awaitable[T]],
    redis: RedisClient,
    ttl: int | None = None,
) -> T:
    """Execute a write at most once per idempotency key within TTL.

    Parameters
    ----------
    key:
        Idempotency key from the request header.  ``None`` means no
        deduplication — ``op`` always runs.
    op:
        Async callable that performs the actual database write.  It must
        be free of side-effects beyond a single DB transaction (insert +
        outbox event) and must be serialisable to JSON via ``orjson``.
    redis:
        An active async Redis client.
    ttl:
        Cache TTL in seconds.  Defaults to ``settings.idempotency_ttl_seconds``
        (24 hours / 86 400 s).

    Raises
    ------
    HTTPException(409):
        A concurrent request is already processing the same key.
    HTTPException(503):
        Redis is unavailable (fail-closed: safer than risking duplicate writes).
    """
    if key is None:
        return await op()

    settings = get_settings()
    effective_ttl: int = ttl if ttl is not None else settings.idempotency_ttl_seconds

    cache_key = f"{_IDEM_PREFIX}{key}"
    lock_key = f"{_LOCK_PREFIX}{key}"

    # ── 1. Fast path: cached result already present ───────────────────────
    try:
        cached = await redis.get(cache_key)
    except Exception as exc:
        logger.warning("Redis unavailable during idempotency cache read: %s", exc)
        raise HTTPException(
            status_code=503,
            detail="Service temporarily unavailable — please retry.",
        ) from exc

    if cached is not None:
        return orjson.loads(cached)  # type: ignore[return-value]

    # ── 2. Acquire distributed lock ───────────────────────────────────────
    try:
        acquired = await redis.set(lock_key, "1", nx=True, ex=_LOCK_TTL_SECONDS)
    except Exception as exc:
        logger.warning("Redis unavailable during idempotency lock acquisition: %s", exc)
        raise HTTPException(
            status_code=503,
            detail="Service temporarily unavailable — please retry.",
        ) from exc

    if not acquired:
        # Another request is already processing this key.  Wait briefly and
        # check once more — a fast op may have finished by now.
        await asyncio.sleep(_LOCK_WAIT_MS / 1000)
        try:
            cached = await redis.get(cache_key)
        except Exception as exc:
            logger.warning("Redis unavailable during idempotency retry read: %s", exc)
            raise HTTPException(
                status_code=503,
                detail="Service temporarily unavailable — please retry.",
            ) from exc

        if cached is not None:
            return orjson.loads(cached)  # type: ignore[return-value]

        raise HTTPException(
            status_code=409,
            detail="A request with this Idempotency-Key is already being processed.",
        )

    # ── 3. Lock acquired — run the operation ─────────────────────────────
    try:
        result: T = await op()

        # Cache result for TTL so duplicate requests can short-circuit.
        try:
            serialised = orjson.dumps(result)
            await redis.setex(cache_key, effective_ttl, serialised)
        except Exception as exc:
            # Failed to cache, but the write already committed.  Log and
            # continue — a duplicate request will simply re-run (acceptable
            # edge case vs. returning a 500 for an already-successful write).
            logger.warning(
                "Failed to cache idempotency result for key %r: %s", key, exc
            )

        return result

    finally:
        # Always release the lock, whether op succeeded or raised.
        try:
            await redis.delete(lock_key)
        except Exception as exc:
            # Non-fatal: lock TTL (30 s) will expire it automatically.
            logger.warning("Failed to release idempotency lock for key %r: %s", key, exc)


# ── FastAPI header dependency ─────────────────────────────────────────────────


def get_idempotency_key(
    idempotency_key: str | None = Header(None, alias="Idempotency-Key"),
) -> str | None:
    """Validate and return the ``Idempotency-Key`` request header.

    Rules (Requirements 18.7, 18.9):
    - Absent header  → ``None``  (idempotency is optional for callers)
    - Empty string   → HTTP 400
    - > 255 chars    → HTTP 400

    Returns
    -------
    str | None
        The validated key, or ``None`` if the header was not present.

    Raises
    ------
    HTTPException(400):
        When the key is present but invalid (empty or too long).
    """
    if idempotency_key is None:
        return None

    if idempotency_key == "":
        raise HTTPException(
            status_code=400,
            detail="Idempotency-Key must not be empty.",
        )

    if len(idempotency_key) > 255:
        raise HTTPException(
            status_code=400,
            detail="Idempotency-Key must not exceed 255 characters.",
        )

    return idempotency_key


__all__ = [
    "handle_idempotent_write",
    "get_idempotency_key",
]
