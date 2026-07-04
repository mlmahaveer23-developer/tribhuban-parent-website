"""
FastAPI application entry point.
Registers middleware, exception handlers, and API routers.

Middleware order (outer → inner):
  1. RequestIDMiddleware           — generates / propagates X-Request-ID
  2. PiiRedactingLoggingMiddleware — structured JSON access log (PII redacted)
  3. CORSMiddleware                — cross-origin headers (innermost)

Exception handlers:
  - RequestValidationError → HTTP 422 with field-level ErrorResponse
  - ValueError             → HTTP 422 with ErrorResponse
  - HTTPException          → HTTP {status_code} with ErrorResponse
  - Exception              → HTTP 500 with ErrorResponse + logged traceback

Logging:
  Structured JSON via JsonFormatter (app.infra.logging_config).
  All log records include: timestamp, level, logger, message, request_id.
  No print() calls anywhere in the application.
"""
from __future__ import annotations

import logging
import uuid
from contextlib import asynccontextmanager
from typing import AsyncIterator

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.config import get_settings
from app.infra.logging_config import configure_logging
from app.infra.middleware import PiiRedactingLoggingMiddleware, RequestIDMiddleware
from app.infra.telemetry import configure_telemetry
from app.schemas.envelope import ErrorResponse, FieldError, http_error

# ── Logging bootstrap ─────────────────────────────────────────────────────────
# Must be called before any module-level `logging.getLogger(...)` usage so that
# the JSON formatter is in place from the very first log record.
configure_logging(level="INFO")

logger = logging.getLogger(__name__)


# ── Lifespan ──────────────────────────────────────────────────────────────────


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    """Application lifespan: startup + shutdown tasks."""
    settings = get_settings()

    # Validate that all required production secrets are present before accepting
    # traffic.  Raises RuntimeError in production if any are missing.
    settings.validate_production_secrets()

    # Configure observability (OTel + Sentry) after secrets validation so that
    # the DSN is confirmed present in production before wiring Sentry.
    # OTel also patches the JSON log formatter here to inject trace_id/span_id.
    configure_telemetry()

    logger.info(
        "Starting %s v%s in %s mode",
        settings.app_name,
        settings.app_version,
        settings.environment,
    )

    yield

    logger.info("Shutting down %s", settings.app_name)


# ── Application factory ───────────────────────────────────────────────────────


def create_app() -> FastAPI:
    """Application factory — creates and configures the FastAPI instance."""
    settings = get_settings()

    app = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        docs_url="/api/docs" if not settings.is_production() else None,
        redoc_url="/api/redoc" if not settings.is_production() else None,
        # OpenAPI spec at the versioned path so GET /api/v1/openapi.json serves
        # as the contract source of truth (Req 27.1).  Exposed in all
        # environments so CI can fetch it from a running test server.
        openapi_url="/api/v1/openapi.json",
        lifespan=lifespan,
    )

    # ── Middleware (registration order = outermost first) ─────────────────────
    #
    # FastAPI/Starlette wraps middleware in reverse registration order so the
    # LAST add_middleware call is the INNERMOST layer.  We want:
    #   [outermost] RequestID → PiiLogging → CORS [innermost]
    # so we register CORS first, then PiiLogging, then RequestID.

    # CORS — innermost; sees the real response before the outer layers.
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allowed_origins,
        allow_credentials=False,
        allow_methods=["GET", "POST", "OPTIONS"],
        allow_headers=["Content-Type", "Authorization", "Idempotency-Key", "X-Request-ID"],
        max_age=600,
    )

    # PII-redacting structured JSON access log (reads request_id already set).
    app.add_middleware(PiiRedactingLoggingMiddleware)

    # Request-ID — outermost; populates request.state.request_id for all layers.
    app.add_middleware(RequestIDMiddleware)

    # ── Exception handlers ────────────────────────────────────────────────────

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(
        request: Request, exc: RequestValidationError
    ) -> JSONResponse:
        """Map Pydantic/FastAPI RequestValidationError → HTTP 422 with field-level errors."""
        request_id: str = getattr(request.state, "request_id", None) or str(uuid.uuid4())

        field_errors: list[FieldError] = []
        for err in exc.errors():
            # loc is a tuple like ("body", "email") or ("query", "page_size")
            loc = err.get("loc", ())
            # Drop the leading segment ("body", "query", "path") to get the field path
            # expressed as dot-notation (e.g. "address.city").
            field_path = (
                ".".join(str(part) for part in loc[1:])
                if len(loc) > 1
                else ".".join(str(p) for p in loc)
            )
            field_errors.append(
                FieldError(
                    field=field_path,
                    message=err.get("msg", "Invalid value"),
                )
            )

        body: ErrorResponse = http_error(
            status=422,
            title="Validation Error",
            detail="One or more fields failed validation.",
            instance=request.url.path,
            request_id=request_id,
            fields=field_errors,
        )
        return JSONResponse(
            status_code=422,
            content=body.model_dump(mode="json"),
        )

    @app.exception_handler(ValueError)
    async def value_error_handler(
        request: Request, exc: ValueError
    ) -> JSONResponse:
        """Map ValueError → HTTP 422 with an RFC 7807 ErrorResponse.

        Raised by domain/service code when a business-rule validation fails
        (e.g. unsupported state, invalid date range) after the request has
        already passed Pydantic structural validation.
        """
        request_id: str = getattr(request.state, "request_id", None) or str(uuid.uuid4())
        detail = str(exc) if str(exc) else "Invalid value provided."

        body: ErrorResponse = http_error(
            status=422,
            title="Validation Error",
            detail=detail,
            instance=request.url.path,
            request_id=request_id,
        )
        return JSONResponse(
            status_code=422,
            content=body.model_dump(mode="json"),
        )

    @app.exception_handler(StarletteHTTPException)
    async def http_exception_handler(
        request: Request, exc: StarletteHTTPException
    ) -> JSONResponse:
        """Map HTTPException → RFC 7807 ErrorResponse at the given status code.

        Handles 404 (Not Found) and 405 (Method Not Allowed) in addition to
        any explicitly raised HTTPException.
        """
        request_id: str = getattr(request.state, "request_id", None) or str(uuid.uuid4())

        # Derive a human-friendly title from the status code.
        _titles: dict[int, str] = {
            400: "Bad Request",
            401: "Unauthorized",
            403: "Forbidden",
            404: "Not Found",
            405: "Method Not Allowed",
            409: "Conflict",
            410: "Gone",
            422: "Unprocessable Entity",
            429: "Too Many Requests",
            500: "Internal Server Error",
            503: "Service Unavailable",
        }
        title = _titles.get(exc.status_code, "HTTP Error")
        detail = exc.detail if isinstance(exc.detail, str) else str(exc.detail)

        body: ErrorResponse = http_error(
            status=exc.status_code,
            title=title,
            detail=detail,
            instance=request.url.path,
            request_id=request_id,
        )
        return JSONResponse(
            status_code=exc.status_code,
            content=body.model_dump(mode="json"),
        )

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(
        request: Request, exc: Exception
    ) -> JSONResponse:
        """Catch-all: log full traceback internally and return HTTP 500.

        The stack trace is NEVER included in the response body to prevent
        accidental information disclosure. It is logged at ERROR level with
        the requestId so it can be correlated in the log stream / Sentry.
        """
        request_id: str = getattr(request.state, "request_id", None) or str(uuid.uuid4())
        logger.error(
            "Unhandled exception on %s %s [requestId=%s]",
            request.method,
            request.url.path,
            request_id,
            exc_info=True,
            extra={"request_id": request_id},
        )
        body: ErrorResponse = http_error(
            status=500,
            title="Internal Server Error",
            detail="An unexpected error occurred. Please try again later.",
            instance=request.url.path,
            request_id=request_id,
        )
        return JSONResponse(
            status_code=500,
            content=body.model_dump(mode="json"),
        )

    # ── API routers ───────────────────────────────────────────────────────────
    from app.api.v1.system import router as system_router  # noqa: PLC0415
    from app.api.v1.solar import router as solar_router  # noqa: PLC0415
    from app.api.v1.leads import router as leads_router  # noqa: PLC0415
    from app.api.v1.consultations import router as consultations_router  # noqa: PLC0415
    from app.api.v1.newsletter import router as newsletter_router  # noqa: PLC0415
    from app.api.v1.content import router as content_router  # noqa: PLC0415
    from app.api.v1.careers import router as careers_router  # noqa: PLC0415
    from app.api.v1.admin import router as admin_router  # noqa: PLC0415
    from app.api.v1.revalidate import router as revalidate_router  # noqa: PLC0415

    app.include_router(system_router, prefix=settings.api_v1_prefix)
    app.include_router(solar_router, prefix=settings.api_v1_prefix)
    app.include_router(leads_router, prefix=settings.api_v1_prefix)
    app.include_router(consultations_router, prefix=settings.api_v1_prefix)
    app.include_router(newsletter_router, prefix=settings.api_v1_prefix)
    app.include_router(content_router, prefix=settings.api_v1_prefix)
    app.include_router(careers_router, prefix=settings.api_v1_prefix)
    # Admin routes (operator auth guard — returns 401 unless ADMIN_AUTH_ENABLED=true)
    app.include_router(admin_router, prefix=settings.api_v1_prefix)
    # ISR on-demand revalidation (internal, signed with X-Revalidate-Secret)
    app.include_router(revalidate_router, prefix=settings.api_v1_prefix)

    return app


app = create_app()
