"""
Rate limiting infrastructure — Redis sorted-set sliding-window rate limiter.

Algorithm:
  Per endpoint + per client-IP sorted-set window.
  Each request timestamp (ms) is stored as both score and member.
  On each call:
    1. ZREMRANGEBYSCORE  — prune entries older than the window
    2. ZCARD             — count current entries
    3. ZADD              — record this request
    4. EXPIRE            — ensure key expires automatically

Write endpoints receive at most 20% of the read limit over the same window
(enforced by passing the appropriate ``limit`` to :class:`RateLimiter`).

Failure behaviour:
  Redis errors → log WARNING + allow the request (fail-open, not fail-closed).

Public API
----------
  RateLimitResult                — result dataclass
  RateLimiter                    — core sliding-window class
  RateLimitDependency            — callable that extracts IP and calls RateLimiter.check()
  get_rate_limiter(limit, window) — factory returning a FastAPI dependency
"""
from __future__ import annotations

import logging
import time
from dataclasses import dataclass
from functools import lru_cache
from typing import Callable

from fastapi import Depends, HTTPException, Request

from app.infra.cache import RedisClient, get_redis

logger = logging.getLogger(__name__)

# ── Result dataclass ──────────────────────────────────────────────────────────


@dataclass(frozen=True, slots=True)
class RateLimitResult:
    """Outcome of a rate-limit check."""

    allowed: bool
    remaining: int
    retry_after: int | None  # seconds; None when allowed


# ── Core limiter ──────────────────────────────────────────────────────────────


class RateLimiter:
    """Redis sorted-set sliding-window rate limiter.

    Parameters
    ----------
    redis:
        An active async Redis client.
    limit:
        Maximum number of requests allowed in ``window_seconds``.
    window_seconds:
        Duration of the sliding window (default 60 s).
    """

    def __init__(
        self,
        redis: RedisClient,
        limit: int,
        window_seconds: int = 60,
    ) -> None:
        self._redis = redis
        self._limit = limit
        self._window_seconds = window_seconds

    async def check(self, identifier: str, endpoint_key: str) -> RateLimitResult:
        """Check the sliding-window rate limit for *identifier* on *endpoint_key*.

        Parameters
        ----------
        identifier:
            Client identifier, typically the client IP address.
        endpoint_key:
            Short name for the endpoint being rate-limited (e.g. ``"leads"``).

        Returns
        -------
        RateLimitResult
            ``allowed=True`` if the request is within the limit, with remaining
            count.  ``allowed=False`` if the limit has been exceeded, with a
            ``retry_after`` value in seconds.

        Raises
        ------
        HTTPException(429):
            When the limit is exceeded (the caller should propagate this to the
            response; convenience callers may also use ``check_or_raise``).

        Notes
        -----
        On Redis failure the method logs a WARNING and returns ``allowed=True``
        (fail-open policy — availability > strict enforcement in case of
        transient cache outage).
        """
        redis_key = f"rl:{endpoint_key}:{identifier}"
        now_ms = int(time.time() * 1000)
        window_ms = self._window_seconds * 1000
        cutoff_ms = now_ms - window_ms

        try:
            async with self._redis.pipeline(transaction=True) as pipe:
                # 1. Remove expired entries
                pipe.zremrangebyscore(redis_key, 0, cutoff_ms)
                # 2. Count entries that remain (before adding this one)
                pipe.zcard(redis_key)
                # 3. Record this request (unique member = timestamp in ms)
                pipe.zadd(redis_key, {str(now_ms): now_ms})
                # 4. Ensure the key expires after the window passes
                pipe.expire(redis_key, self._window_seconds + 1)
                results = await pipe.execute()

            current_count: int = results[1]  # ZCARD result (before this request)

        except Exception as exc:
            logger.warning(
                "Rate limiter Redis error for key %r: %s — allowing request (fail-open)",
                redis_key,
                exc,
            )
            return RateLimitResult(allowed=True, remaining=self._limit, retry_after=None)

        if current_count >= self._limit:
            # Determine when the oldest entry in the current window expires.
            try:
                oldest_entries = await self._redis.zrange(
                    redis_key, 0, 0, withscores=True
                )
                if oldest_entries:
                    oldest_score_ms = int(oldest_entries[0][1])
                    retry_after = max(
                        1,
                        (oldest_score_ms + window_ms - now_ms + 999) // 1000,
                    )
                else:
                    retry_after = self._window_seconds
            except Exception as exc:
                logger.warning(
                    "Rate limiter failed to compute retry_after for key %r: %s",
                    redis_key,
                    exc,
                )
                retry_after = self._window_seconds

            return RateLimitResult(
                allowed=False,
                remaining=0,
                retry_after=int(retry_after),
            )

        remaining = max(0, self._limit - current_count - 1)
        return RateLimitResult(allowed=True, remaining=remaining, retry_after=None)

    async def check_or_raise(self, identifier: str, endpoint_key: str) -> RateLimitResult:
        """Call :meth:`check` and raise HTTP 429 on breach.

        This is the convenience variant intended for use in route handlers that
        want to raise directly.

        Raises
        ------
        HTTPException(429):
            If the rate limit is exceeded.  Includes a ``Retry-After`` header.
        """
        result = await self.check(identifier, endpoint_key)
        if not result.allowed:
            raise HTTPException(
                status_code=429,
                detail="Rate limit exceeded. Please try again later.",
                headers={"Retry-After": str(result.retry_after)},
            )
        return result


# ── Write-limit helper ────────────────────────────────────────────────────────


def write_limit(read_limit: int) -> int:
    """Return the write-endpoint limit (≤ 20% of the read limit, minimum 1).

    Per requirement 19.2: write endpoints get at most 20% of the read quota.
    """
    return max(1, read_limit // 5)


# ── FastAPI dependency factory ────────────────────────────────────────────────


class RateLimitDependency:
    """FastAPI dependency that enforces a rate limit on the calling endpoint.

    Extracts the client IP from ``X-Forwarded-For`` (first address, trusting
    a reverse-proxy setup) or falls back to ``request.client.host``.

    Usage::

        @router.post("/leads")
        async def create_lead(
            _: None = Depends(get_rate_limiter(limit=20)),
            ...
        ):
            ...
    """

    def __init__(self, limit: int, window_seconds: int = 60) -> None:
        self._limit = limit
        self._window_seconds = window_seconds

    async def __call__(
        self,
        request: Request,
        redis: RedisClient = Depends(get_redis),
    ) -> RateLimitResult:
        """Extract the client IP, run the check, and raise 429 on breach."""
        identifier = _extract_client_ip(request)
        endpoint_key = _endpoint_key_from_request(request)

        limiter = RateLimiter(
            redis=redis,
            limit=self._limit,
            window_seconds=self._window_seconds,
        )
        return await limiter.check_or_raise(identifier, endpoint_key)


def get_rate_limiter(
    limit: int,
    window_seconds: int = 60,
) -> RateLimitDependency:
    """Factory that returns a :class:`RateLimitDependency` FastAPI dependency.

    Parameters
    ----------
    limit:
        Maximum requests allowed per IP per ``window_seconds``.
    window_seconds:
        Sliding-window duration in seconds (default 60).

    Returns
    -------
    RateLimitDependency
        A callable that can be used directly with ``Depends()``.

    Example
    -------
    Read endpoints::

        @router.get("/articles")
        async def list_articles(_rl=Depends(get_rate_limiter(100, 60))):
            ...

    Write endpoints (≤ 20% of read)::

        from app.infra.ratelimit import get_rate_limiter, write_limit

        READ_LIMIT = 100
        @router.post("/leads")
        async def create_lead(_rl=Depends(get_rate_limiter(write_limit(READ_LIMIT), 60))):
            ...
    """
    return RateLimitDependency(limit=limit, window_seconds=window_seconds)


# ── IP extraction helpers ─────────────────────────────────────────────────────


def _extract_client_ip(request: Request) -> str:
    """Return the most-specific client IP from the request.

    Prefers the first address in the ``X-Forwarded-For`` header (set by a
    load-balancer / reverse proxy) and falls back to ``request.client.host``.
    Returns ``"unknown"`` if neither is available.
    """
    forwarded_for = request.headers.get("X-Forwarded-For")
    if forwarded_for:
        # "X-Forwarded-For: client, proxy1, proxy2" — take the first value.
        return forwarded_for.split(",")[0].strip()

    if request.client:
        return request.client.host

    return "unknown"


def _endpoint_key_from_request(request: Request) -> str:
    """Derive a short, stable key from the request path for use in the Redis key.

    Strips the ``/api/v1`` prefix and replaces path separators with dots so the
    key is clean (e.g. ``leads``, ``consultations``, ``solar.estimate``).
    """
    path = request.url.path
    # Strip version prefix
    for prefix in ("/api/v1/", "/api/v1", "/v1/", "/v1"):
        if path.startswith(prefix):
            path = path[len(prefix):]
            break
    # Replace slashes with dots, strip leading/trailing separators
    key = path.strip("/").replace("/", ".")
    return key or "root"


__all__ = [
    "RateLimitResult",
    "RateLimiter",
    "RateLimitDependency",
    "get_rate_limiter",
    "write_limit",
]
