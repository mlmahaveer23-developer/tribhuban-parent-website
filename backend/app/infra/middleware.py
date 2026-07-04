"""
HTTP middleware for the FastAPI application.

RequestIDMiddleware — attaches a UUID v4 request-ID to every request/response.
PiiRedactingLoggingMiddleware — structured JSON access-log with PII redaction.

Logged access-log fields:
  event        "http_request"
  method       HTTP verb
  path         URL path (no query string)
  status_code  HTTP status code
  duration_ms  Round-trip duration in milliseconds (2 decimal places)
  request_id   Value from request.state.request_id
  user_agent   User-Agent header (safe, not PII)
  client_ip    Partially redacted client IP

PII fields redacted from query params and request body:
  name, full_name, email, phone, password, ip → "[REDACTED]"

Logging level policy:
  INFO   for 2xx / 3xx
  WARN   for 4xx
  ERROR  for 5xx
"""
from __future__ import annotations

import ipaddress
import json
import logging
import re
import time
import uuid
from typing import Any

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response
from starlette.types import ASGIApp

# ── Logger ────────────────────────────────────────────────────────────────────

logger = logging.getLogger("tribhuban.access")

# ── PII field patterns ────────────────────────────────────────────────────────

# Keys that must never appear verbatim in log output.
_PII_FIELDS: frozenset[str] = frozenset(
    {
        "email",
        "phone",
        "name",
        "full_name",
        "fullname",
        "ip",
        "password",
        "token",
        "consent_ip",
        "first_name",
        "last_name",
        "mobile",
        "address",
    }
)

# Compiled case-insensitive regex for fast key matching.
_PII_KEY_RE: re.Pattern[str] = re.compile(
    r"^(" + "|".join(re.escape(f) for f in _PII_FIELDS) + r")$",
    re.IGNORECASE,
)

_REDACTED = "[REDACTED]"


def _redact_dict(obj: Any) -> Any:
    """Recursively walk *obj* and replace PII field values with _REDACTED."""
    if isinstance(obj, dict):
        return {
            k: _REDACTED if _PII_KEY_RE.match(str(k)) else _redact_dict(v)
            for k, v in obj.items()
        }
    if isinstance(obj, list):
        return [_redact_dict(item) for item in obj]
    return obj


def _redact_ip(ip_str: str) -> str:
    """
    Partially redact an IP address:
    - IPv4: replace last octet with 0   (e.g. 1.2.3.4  → 1.2.3.0)
    - IPv6: replace last 64 bits with :: (e.g. 2001:db8::1 → 2001:db8::/64)
    - Unrecognised / empty string: return _REDACTED
    """
    if not ip_str:
        return _REDACTED
    try:
        addr = ipaddress.ip_address(ip_str)
        if isinstance(addr, ipaddress.IPv4Address):
            parts = ip_str.split(".")
            parts[-1] = "0"
            return ".".join(parts)
        # IPv6 — zero the last 64 bits
        packed = int(addr)
        redacted = packed & (0xFFFFFFFFFFFFFFFF << 64)
        return str(ipaddress.IPv6Address(redacted))
    except ValueError:
        return _REDACTED


# ── Middleware classes ────────────────────────────────────────────────────────


class RequestIDMiddleware(BaseHTTPMiddleware):
    """
    Reads *X-Request-ID* from the incoming request headers or generates a
    new UUID v4.  Attaches the value to ``request.state.request_id`` and
    echoes it back in the ``X-Request-ID`` response header.

    Also attaches the requestId as a Sentry tag and breadcrumb so that every
    Sentry event captured during this request can be correlated with the
    structured JSON access log.
    """

    def __init__(self, app: ASGIApp) -> None:
        super().__init__(app)

    async def dispatch(self, request: Request, call_next: Any) -> Response:  # noqa: ANN401
        request_id: str = request.headers.get("X-Request-ID") or str(uuid.uuid4())
        request.state.request_id = request_id

        # Attach requestId to Sentry scope so every event in this request
        # carries the correlation ID (safe import: Sentry is optional).
        try:
            from app.infra.telemetry import add_sentry_request_context  # noqa: PLC0415

            add_sentry_request_context(
                request_id=request_id,
                path=request.url.path,
                method=request.method,
            )
        except Exception:  # noqa: BLE001
            pass  # Never raise from middleware due to observability wiring

        response: Response = await call_next(request)
        response.headers["X-Request-ID"] = request_id
        return response


class PiiRedactingLoggingMiddleware(BaseHTTPMiddleware):
    """
    Emits a structured JSON access-log line for every HTTP request.

    Logged fields (all safe, no raw PII):
      - event         "http_request"
      - method        HTTP verb
      - path          URL path (query string excluded)
      - status_code   HTTP status code
      - duration_ms   Round-trip duration in milliseconds (2 decimal places)
      - request_id    Value from request.state.request_id
      - user_agent    User-Agent header (truncated to 256 chars)
      - client_ip     Partially redacted client IP

    Logging level:
      - INFO   for 2xx / 3xx responses
      - WARN   for 4xx responses
      - ERROR  for 5xx responses

    The remote IP is partially redacted before logging.
    Request body is *never* logged.
    """

    def __init__(self, app: ASGIApp) -> None:
        super().__init__(app)

    async def dispatch(self, request: Request, call_next: Any) -> Response:  # noqa: ANN401
        start_ns = time.perf_counter_ns()

        try:
            response: Response = await call_next(request)
        except Exception:  # noqa: BLE001
            # If call_next raises (unhandled exception propagated through the
            # inner middleware chain), synthesise a 500 response so that the
            # access log entry is still emitted.  The actual exception handling
            # (RFC 7807 response, logging) is done by the FastAPI exception
            # handler registered in main.py — that handler runs *before* the
            # exception reaches this middleware layer.  We only land here if
            # the exception somehow escapes the handler (e.g. during testing
            # with raise_server_exceptions=True or direct ASGI transport).
            duration_ms = (time.perf_counter_ns() - start_ns) / 1_000_000
            request_id = getattr(request.state, "request_id", _REDACTED)
            log_record: dict[str, Any] = {
                "event": "http_request",
                "method": request.method,
                "path": request.url.path,
                "status_code": 500,
                "duration_ms": round(duration_ms, 2),
                "request_id": request_id,
                "user_agent": request.headers.get("user-agent", "")[:256],
                "client_ip": _redact_ip(request.client.host if request.client else ""),
            }
            logger.error(json.dumps(_redact_dict(log_record)))
            raise  # re-raise so Starlette's error middleware handles it

        duration_ms = (time.perf_counter_ns() - start_ns) / 1_000_000

        request_id: str = getattr(request.state, "request_id", _REDACTED)

        # Partially redact the client IP.
        client_ip: str = ""
        if request.client:
            client_ip = _redact_ip(request.client.host or "")

        # User-Agent is safe to log but truncate to prevent log injection.
        user_agent = request.headers.get("user-agent", "")[:256]

        log_record = {
            "event": "http_request",
            "method": request.method,
            "path": request.url.path,
            "status_code": response.status_code,
            "duration_ms": round(duration_ms, 2),
            "request_id": request_id,
            "user_agent": user_agent,
            "client_ip": client_ip,
        }

        # Recursively scrub any PII that might have leaked into the record
        # (defensive pass — the fields above are already safe).
        clean_record = _redact_dict(log_record)

        if response.status_code >= 500:
            level = logging.ERROR
        elif response.status_code >= 400:
            level = logging.WARNING
        else:
            level = logging.INFO

        logger.log(level, json.dumps(clean_record))

        return response
