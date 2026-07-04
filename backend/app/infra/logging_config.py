"""
Structured JSON logging configuration.

All application loggers emit newline-delimited JSON records. This avoids
the `python-json-logger` dependency by providing a minimal custom
:class:`JsonFormatter`.

Every log record includes:
  timestamp   ISO 8601 UTC (e.g. "2024-01-15T10:30:45Z")
  level       Log level name ("INFO", "WARNING", "ERROR", …)
  logger      Logger name
  message     Formatted log message
  request_id  Attached via RequestIdFilter when available (empty string otherwise)

Error records additionally include:
  exc_info    Exception class + message (no stack trace in production)

Usage
-----
Call :func:`configure_logging` once during application startup *before* any
logging calls are made.  The function is idempotent — repeated calls are safe.
"""
from __future__ import annotations

import logging
import logging.config
import traceback
from datetime import UTC, datetime
from typing import Any

__all__ = ["configure_logging", "RequestIdFilter"]


def _utc_now_iso() -> str:
    return datetime.now(UTC).strftime("%Y-%m-%dT%H:%M:%SZ")


class JsonFormatter(logging.Formatter):
    """
    Formats every :class:`logging.LogRecord` as a single-line JSON object.

    Fields emitted:
      timestamp, level, logger, message
      request_id   — from LogRecord.request_id (injected by RequestIdFilter)
      exc_info     — exception class:message when an exception is attached

    The raw exception traceback is deliberately omitted from the JSON payload
    to avoid accidentally leaking internal details in production log streams.
    Sentry (configured separately) captures the full traceback.
    """

    # We import json lazily inside the module but keep a reference for speed.
    import json as _json

    def format(self, record: logging.LogRecord) -> str:
        import json  # noqa: PLC0415

        message = record.getMessage()

        payload: dict[str, Any] = {
            "timestamp": _utc_now_iso(),
            "level": record.levelname,
            "logger": record.name,
            "message": message,
            "request_id": getattr(record, "request_id", ""),
        }

        if record.exc_info:
            exc_type, exc_value, _ = record.exc_info
            if exc_type is not None and exc_value is not None:
                payload["exc_info"] = f"{exc_type.__name__}: {exc_value}"

        # Serialise to JSON; fall back to repr() for any non-serialisable value.
        try:
            return json.dumps(payload, ensure_ascii=False)
        except (TypeError, ValueError):
            payload["message"] = repr(message)
            return json.dumps(payload, ensure_ascii=False)


class RequestIdFilter(logging.Filter):
    """
    Injects ``request_id`` into every LogRecord that passes through this filter.

    Because FastAPI handlers run in async context, there is no thread-local
    request state available at the logging layer.  Handlers that have access to
    ``request.state.request_id`` should use a
    :class:`logging.LoggerAdapter` (see :func:`get_request_logger`) to attach
    the ID at the call site.

    This filter provides a safe default ("") for log records emitted *without*
    an explicit request_id so that the JSON schema is always consistent.
    """

    def filter(self, record: logging.LogRecord) -> bool:
        if not hasattr(record, "request_id"):
            record.request_id = ""  # type: ignore[attr-defined]
        return True


def configure_logging(level: str = "INFO") -> None:
    """
    Apply structured JSON logging to the root logger and key application loggers.

    Call this once at application startup.  All subsequent :mod:`logging` calls
    in the process will emit JSON.

    Args:
        level: Root log level string ("DEBUG", "INFO", "WARNING", "ERROR").
               Defaults to "INFO".
    """
    log_config: dict[str, Any] = {
        "version": 1,
        "disable_existing_loggers": False,
        "filters": {
            "request_id": {
                "()": "app.infra.logging_config.RequestIdFilter",
            },
        },
        "formatters": {
            "json": {
                "()": "app.infra.logging_config.JsonFormatter",
            },
        },
        "handlers": {
            "console": {
                "class": "logging.StreamHandler",
                "stream": "ext://sys.stdout",
                "formatter": "json",
                "filters": ["request_id"],
            },
        },
        "root": {
            "level": level,
            "handlers": ["console"],
        },
        "loggers": {
            # Silence overly verbose third-party loggers.
            "uvicorn.access": {"level": "WARNING", "propagate": True},
            "uvicorn.error": {"level": "INFO", "propagate": True},
            "sqlalchemy.engine": {"level": "WARNING", "propagate": True},
            "asyncio": {"level": "WARNING", "propagate": True},
            # Application namespaces — propagate to root so they use the JSON handler.
            "tribhuban": {"level": level, "propagate": True},
            "app": {"level": level, "propagate": True},
        },
    }

    logging.config.dictConfig(log_config)


def get_request_logger(
    name: str, request_id: str
) -> logging.LoggerAdapter:  # type: ignore[type-arg]
    """
    Return a :class:`logging.LoggerAdapter` that attaches *request_id* to
    every log record emitted through it.

    Usage in a FastAPI route handler::

        from app.infra.logging_config import get_request_logger

        async def create_lead(request: Request, ...):
            log = get_request_logger(__name__, request.state.request_id)
            log.info("Creating lead for source=%s", source)

    Args:
        name:       Logger name (typically ``__name__`` of the calling module).
        request_id: The UUID string from ``request.state.request_id``.

    Returns:
        A :class:`logging.LoggerAdapter` whose extra dict contains
        ``{"request_id": request_id}``.
    """
    base_logger = logging.getLogger(name)
    return logging.LoggerAdapter(base_logger, {"request_id": request_id})
