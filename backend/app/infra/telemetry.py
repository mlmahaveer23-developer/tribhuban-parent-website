"""
Observability infrastructure — OpenTelemetry and Sentry setup.

Provides:
  configure_telemetry()   — call once at startup to wire OTel + Sentry
  get_tracer()            — returns the application-level tracer
  get_trace_id()          — returns the current OTel trace ID as a hex string

Instrumented layers (when OTEL_EXPORTER_OTLP_ENDPOINT is set):
  FastAPI router          — via FastAPIInstrumentor (auto-instruments all routes)
  SQLAlchemy              — via SQLAlchemyInstrumentor (captures all DB spans)
  Redis                   — via RedisInstrumentor (captures CACHE spans)
  httpx (outbound HTTP)   — via HTTPXClientInstrumentor (SES/S3/webhook calls)

Sentry integration (when SENTRY_DSN is set):
  - FastAPI + SQLAlchemy integrations
  - requestId is attached as a breadcrumb / Sentry tag on every event
  - Release tag: "{app_name}@{app_version}" for source-map correlation
  - PII is never sent (send_default_pii=False)
"""
from __future__ import annotations

import logging
from typing import Optional

from app.config import get_settings

logger = logging.getLogger(__name__)

# Module-level tracer placeholder so callers always get a valid object
# (the real tracer is installed by configure_telemetry at startup).
_tracer: Optional[object] = None  # noqa: UP007


def configure_telemetry() -> None:
    """
    Configure OpenTelemetry and Sentry at application startup.

    Safe to call in any environment — silently no-ops when DSNs / endpoints
    are absent (dev mode).  Designed to be called once during the lifespan
    startup phase, *after* configure_logging().
    """
    global _tracer  # noqa: PLW0603

    settings = get_settings()

    # ── Sentry ───────────────────────────────────────────────────────────────
    if settings.sentry_dsn:
        try:
            import sentry_sdk  # type: ignore[import-untyped]
            from sentry_sdk.integrations.fastapi import FastApiIntegration  # type: ignore[import-untyped]
            from sentry_sdk.integrations.httpx import HttpxIntegration  # type: ignore[import-untyped]
            from sentry_sdk.integrations.redis import RedisIntegration  # type: ignore[import-untyped]
            from sentry_sdk.integrations.sqlalchemy import SqlalchemyIntegration  # type: ignore[import-untyped]

            sentry_sdk.init(
                dsn=settings.sentry_dsn,
                environment=settings.environment,
                # Release tag surfaces in Sentry UI and is used for source-map
                # correlation, allowing stack traces to resolve to source lines.
                release=f"{settings.app_name}@{settings.app_version}",
                integrations=[
                    FastApiIntegration(),
                    SqlalchemyIntegration(),
                    RedisIntegration(),
                    HttpxIntegration(),
                ],
                # Sample 10 % of transactions in production; 100 % in non-prod
                # so performance regressions are visible in development/staging.
                traces_sample_rate=0.1 if settings.is_production() else 1.0,
                # Never send PII to Sentry (DPDP/GDPR compliance).
                send_default_pii=False,
                # Attach requestId as a tag on every Sentry event so it can be
                # correlated with the structured JSON log stream.  The actual
                # breadcrumb attachment happens in add_sentry_request_context().
                before_send=_sentry_before_send,
            )
            logger.info(
                "Sentry configured",
                extra={
                    "environment": settings.environment,
                    "release": f"{settings.app_name}@{settings.app_version}",
                },
            )
        except ImportError:
            logger.warning("sentry-sdk not installed; Sentry error tracking disabled")

    # ── OpenTelemetry ─────────────────────────────────────────────────────────
    if settings.otel_exporter_otlp_endpoint:
        try:
            from opentelemetry import trace  # type: ignore[import-untyped]
            from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import (  # type: ignore[import-untyped]
                OTLPSpanExporter,
            )
            from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor  # type: ignore[import-untyped]
            from opentelemetry.instrumentation.httpx import HTTPXClientInstrumentor  # type: ignore[import-untyped]
            from opentelemetry.instrumentation.redis import RedisInstrumentor  # type: ignore[import-untyped]
            from opentelemetry.instrumentation.sqlalchemy import (  # type: ignore[import-untyped]
                SQLAlchemyInstrumentor,
            )
            from opentelemetry.sdk.resources import Resource  # type: ignore[import-untyped]
            from opentelemetry.sdk.trace import TracerProvider  # type: ignore[import-untyped]
            from opentelemetry.sdk.trace.export import BatchSpanProcessor  # type: ignore[import-untyped]

            resource = Resource.create(
                {
                    "service.name": settings.app_name,
                    "service.version": settings.app_version,
                    "deployment.environment": settings.environment,
                }
            )
            provider = TracerProvider(resource=resource)
            provider.add_span_processor(
                BatchSpanProcessor(
                    OTLPSpanExporter(endpoint=settings.otel_exporter_otlp_endpoint)
                )
            )
            trace.set_tracer_provider(provider)

            # ── Instrument all layers ──────────────────────────────────────
            # FastAPI: instruments all routes automatically, adds trace-id to
            # response headers and request spans.
            FastAPIInstrumentor().instrument()

            # SQLAlchemy: captures db.system, db.statement spans for every
            # query at the repository layer.
            SQLAlchemyInstrumentor().instrument()

            # Redis: captures CACHE spans for every redis command (rate limiter,
            # idempotency handler, outbox relay lock).
            RedisInstrumentor().instrument()

            # httpx: captures outbound HTTP spans (SES email calls, S3 presign
            # validations, Cloudflare Turnstile verification, ISR revalidation).
            HTTPXClientInstrumentor().instrument()

            # Store the tracer for manual span creation in services.
            _tracer = trace.get_tracer(
                settings.app_name, schema_url="https://opentelemetry.io/schemas/1.11.0"
            )

            logger.info(
                "OpenTelemetry configured, exporting to: %s",
                settings.otel_exporter_otlp_endpoint,
            )
        except ImportError as exc:
            logger.warning(
                "OpenTelemetry packages not fully installed; tracing disabled: %s", exc
            )

    # Patch the JSON log formatter to inject OTel trace ID into every record.
    _patch_logging_with_trace_id()


# ── Sentry before_send hook ──────────────────────────────────────────────────


def _sentry_before_send(event: dict, hint: dict) -> dict:  # noqa: ARG001
    """
    Sentry before_send callback: strip any PII-bearing fields that may have
    leaked in and ensure the event is safe to transmit.

    Does NOT strip the request_id tag — that is deliberately included so events
    can be correlated with the structured log stream.
    """
    # Remove any user email/IP that Sentry may have auto-captured
    event.pop("user", None)
    return event


# ── requestId → Sentry breadcrumb ────────────────────────────────────────────


def add_sentry_request_context(request_id: str, path: str, method: str) -> None:
    """
    Attach the current requestId as a Sentry tag and breadcrumb.

    Call this from RequestIDMiddleware (or a Sentry-specific middleware)
    so every Sentry event captured within this request carries the requestId
    for log-stream correlation.

    Args:
        request_id: The UUIDv4 request ID from ``request.state.request_id``.
        path:       The URL path of the current request.
        method:     The HTTP method of the current request.
    """
    try:
        import sentry_sdk  # type: ignore[import-untyped]

        with sentry_sdk.configure_scope() as scope:  # type: ignore[attr-defined]
            scope.set_tag("request_id", request_id)
            scope.add_breadcrumb(
                {
                    "category": "http.request",
                    "message": f"{method} {path}",
                    "data": {"request_id": request_id},
                    "level": "info",
                }
            )
    except (ImportError, Exception):
        # Sentry is optional; never raise from this helper.
        pass


# ── OTel trace-ID helpers ────────────────────────────────────────────────────


def get_trace_id() -> str:
    """
    Return the current OpenTelemetry trace ID as a 32-character hex string.

    Returns an empty string when no active span exists (e.g. OTel not
    configured, or called outside a traced context).  Safe to call anywhere.
    """
    try:
        from opentelemetry import trace  # type: ignore[import-untyped]

        span = trace.get_current_span()
        ctx = span.get_span_context()
        if ctx and ctx.is_valid:
            return format(ctx.trace_id, "032x")
    except (ImportError, Exception):
        pass
    return ""


def get_span_id() -> str:
    """Return the current OTel span ID as a 16-character hex string."""
    try:
        from opentelemetry import trace  # type: ignore[import-untyped]

        span = trace.get_current_span()
        ctx = span.get_span_context()
        if ctx and ctx.is_valid:
            return format(ctx.span_id, "016x")
    except (ImportError, Exception):
        pass
    return ""


def get_tracer():  # type: ignore[return]
    """Return the application-level OTel tracer.

    Returns a no-op tracer when OTel is not configured, so callers never need
    to guard against None.
    """
    if _tracer is not None:
        return _tracer
    try:
        from opentelemetry import trace  # type: ignore[import-untyped]

        return trace.get_tracer(__name__)
    except ImportError:
        return _NoopTracer()


class _NoopTracer:
    """Fallback tracer when opentelemetry-api is not installed."""

    def start_as_current_span(self, name: str, **kwargs):  # noqa: ANN201, ANN001
        from contextlib import contextmanager

        @contextmanager
        def _noop():
            yield None

        return _noop()

    def start_span(self, name: str, **kwargs):  # noqa: ANN201, ANN001
        return _NoopSpan()


class _NoopSpan:
    """Fallback span when opentelemetry-api is not installed."""

    def __enter__(self):
        return self

    def __exit__(self, *args):
        pass

    def set_attribute(self, key: str, value: object) -> None:  # noqa: ARG002
        pass

    def record_exception(self, exc: Exception) -> None:  # noqa: ARG002
        pass

    def set_status(self, status: object) -> None:  # noqa: ARG002
        pass


# ── Logging patch — inject trace_id into every JSON log record ───────────────


def _patch_logging_with_trace_id() -> None:
    """
    Monkey-patch :class:`app.infra.logging_config.JsonFormatter` so that every
    structured JSON log line includes the current OTel ``trace_id`` and
    ``span_id``.

    This is called once after the OTel provider is set up.  If OTel is not
    configured, the fields are emitted as empty strings so the JSON schema
    remains consistent across environments.
    """
    try:
        from app.infra.logging_config import JsonFormatter

        original_format = JsonFormatter.format

        def _format_with_trace(self, record: object) -> str:  # type: ignore[override]
            import json  # noqa: PLC0415

            raw = original_format(self, record)
            try:
                payload = json.loads(raw)
            except (ValueError, TypeError):
                return raw

            payload["trace_id"] = get_trace_id()
            payload["span_id"] = get_span_id()

            try:
                return json.dumps(payload, ensure_ascii=False)
            except (TypeError, ValueError):
                return raw

        JsonFormatter.format = _format_with_trace  # type: ignore[method-assign]
        logger.debug("JSON log formatter patched with OTel trace_id / span_id injection")
    except (ImportError, AttributeError) as exc:
        logger.debug("Could not patch JSON formatter with trace IDs: %s", exc)
