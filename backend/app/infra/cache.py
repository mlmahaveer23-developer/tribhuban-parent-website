"""
Cache infrastructure — Redis async client.

Exports:
  redis_client        — module-level shared async Redis client instance
  get_redis           — FastAPI dependency (async generator)
  RedisClient         — type alias for redis.asyncio.Redis
  ping                — health-check helper

A single connection pool is created at module import time (via a module-level
singleton).  The pool size is read from settings.redis_max_connections.
"""
from __future__ import annotations

from collections.abc import AsyncIterator
from functools import lru_cache
from typing import TypeAlias

import redis.asyncio as aioredis

from app.config import get_settings

# ── Type alias ───────────────────────────────────────────────────────────────

RedisClient: TypeAlias = aioredis.Redis  # type: ignore[type-arg]


# ── Pool / client factory ────────────────────────────────────────────────────


@lru_cache(maxsize=1)
def _build_redis_client() -> RedisClient:
    """Build (once) and cache an async Redis client backed by a connection pool."""
    settings = get_settings()
    connection_pool = aioredis.ConnectionPool.from_url(
        settings.redis_url,
        max_connections=settings.redis_max_connections,
        encoding="utf-8",
        decode_responses=True,
    )
    return aioredis.Redis(connection_pool=connection_pool)


# ── Module-level client instance ─────────────────────────────────────────────
# ``redis_client`` is a lazily-initialised singleton.  It is *not* created at
# module import time to avoid connecting before settings are loaded; the first
# call to any public function will build it.  Callers that need the raw client
# outside a FastAPI dependency can access it via this name.
#
# Usage:
#   from app.infra.cache import redis_client
#   await redis_client.set("key", "value")
#
# Note: in practice, prefer ``Depends(get_redis)`` in FastAPI route handlers
# to ensure testability and proper lifecycle management.
redis_client: RedisClient = _build_redis_client()  # type: ignore[assignment]


# ── FastAPI dependency ───────────────────────────────────────────────────────


async def get_redis() -> AsyncIterator[RedisClient]:
    """Yield the shared async Redis client.

    This is an async generator so it can be used as a FastAPI dependency
    (``Depends(get_redis)``).  The client is *not* closed between requests —
    it is a long-lived pool.
    """
    yield _build_redis_client()


async def ping() -> bool:
    """Check Redis connectivity.

    Returns True if Redis responds to PING, False otherwise.
    Used by the ``/api/v1/ready`` health endpoint to verify cache availability.
    """
    try:
        client = _build_redis_client()
        return await client.ping()
    except Exception:
        return False


__all__ = [
    "RedisClient",
    "redis_client",
    "get_redis",
    "ping",
]
