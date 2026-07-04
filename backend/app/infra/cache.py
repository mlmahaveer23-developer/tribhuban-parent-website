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
# Lazily initialised on first access — NOT at module import time.
# This avoids blocking startup when REDIS_URL isn't yet available.
#
# Usage:
#   from app.infra.cache import get_redis_client
#   client = get_redis_client()
#   await client.set("key", "value")
def get_redis_client() -> RedisClient:
    """Return the shared Redis client, building it on first call."""
    return _build_redis_client()


# Backwards-compat alias so existing imports of `redis_client` still work
# without triggering a connection at import time.
class _LazyRedisClient:
    """Proxy that defers client construction until first attribute access."""
    def __getattr__(self, name: str):  # type: ignore[override]
        return getattr(_build_redis_client(), name)


redis_client: RedisClient = _LazyRedisClient()  # type: ignore[assignment]


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
