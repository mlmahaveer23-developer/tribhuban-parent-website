"""
Shared API response envelopes (§18 + Requirements 17.7, 18.2, 18.3).

Success (single object):
    {"data": {...}, "meta": {"requestId": "uuid", "timestamp": "ISO-8601 UTC"}}

Success (paginated list):
    {"data": [...], "meta": {"requestId": ..., "timestamp": ...,
                              "page": 1, "pageSize": 20, "total": 47, "totalPages": 3}}

Error (RFC 7807, wrapped):
    {
        "error": {
            "type": "https://tribhubanconcepts.com/errors/<slug>",
            "title": "Validation Error",
            "status": 422,
            "detail": "One or more fields failed validation.",
            "instance": "/api/v1/leads",
            "requestId": "uuid",
            "fields": [{"field": "email", "message": "Invalid email format"}]
        }
    }

Public API
----------
Models:
  DataResponse[T]    — single-resource success envelope (alias: SuccessResponse)
  PaginatedResponse[T] — paginated list success envelope
  ErrorResponse      — top-level RFC 7807 error wrapper
  ErrorDetail        — RFC 7807 Problem Details inner object
  FieldError         — field-level validation error

Helper functions:
  ok(data, request_id)              → DataResponse[T]
  paginated(data, request_id, ...)  → PaginatedResponse[T]
  make_response(data, request)      → DataResponse[T]
  make_paginated_response(...)      → PaginatedResponse[T]
  error_response(type_, ...)        → ErrorResponse
  http_error(status, ...)           → ErrorResponse
"""
from __future__ import annotations

import math
from datetime import UTC, datetime
from typing import TYPE_CHECKING, Any, Generic, TypeVar

from pydantic import BaseModel, ConfigDict

if TYPE_CHECKING:
    from fastapi import Request

T = TypeVar("T")

# ── Standard error-type URL map ───────────────────────────────────────────────

ERROR_TYPE_URLS: dict[int, str] = {
    400: "https://tribhubanconcepts.com/errors/bad-request",
    401: "https://tribhubanconcepts.com/errors/unauthorized",
    403: "https://tribhubanconcepts.com/errors/forbidden",
    404: "https://tribhubanconcepts.com/errors/not-found",
    409: "https://tribhubanconcepts.com/errors/conflict",
    422: "https://tribhubanconcepts.com/errors/validation-error",
    429: "https://tribhubanconcepts.com/errors/rate-limited",
    500: "https://tribhubanconcepts.com/errors/internal-error",
    503: "https://tribhubanconcepts.com/errors/service-unavailable",
}


def _default_error_type(status: int) -> str:
    """Return the canonical error-type URL for *status*."""
    return ERROR_TYPE_URLS.get(status, f"https://tribhubanconcepts.com/errors/http-{status}")


def _utc_now_iso() -> str:
    """Return the current UTC time as an ISO 8601 string with a 'Z' suffix."""
    return datetime.now(UTC).strftime("%Y-%m-%dT%H:%M:%SZ")


def _request_id_from(request: Any) -> str:
    """Extract ``request_id`` from a Starlette/FastAPI request's state, safely."""
    return getattr(getattr(request, "state", None), "request_id", "") or ""


# ── Meta models ───────────────────────────────────────────────────────────────


class Meta(BaseModel):
    """Metadata included in every success response."""

    model_config = ConfigDict(populate_by_name=True)

    requestId: str  # noqa: N815 — camelCase matches wire format
    timestamp: str  # ISO 8601 UTC


class PaginatedMeta(Meta):
    """Extended metadata for paginated list responses."""

    page: int
    pageSize: int  # noqa: N815
    total: int
    totalPages: int  # noqa: N815


# Backward-compat alias used by existing code
SuccessMeta = Meta


# ── Success response envelope models ─────────────────────────────────────────


class SuccessResponse(BaseModel, Generic[T]):
    """
    Standard single-resource success envelope.

    Wire format:
        {"data": {...}, "meta": {"requestId": "...", "timestamp": "..."}}
    """

    model_config = ConfigDict(populate_by_name=True)

    data: T
    meta: Meta


# Public API alias: DataResponse is the canonical name per task spec;
# SuccessResponse is kept as an alias for backward compatibility with existing code.
DataResponse = SuccessResponse


class PaginatedResponse(BaseModel, Generic[T]):
    """
    Standard paginated list success envelope.

    Wire format:
        {"data": [...], "meta": {"requestId": "...", "timestamp": "...",
                                  "page": 1, "pageSize": 20, "total": 47,
                                  "totalPages": 3}}
    """

    model_config = ConfigDict(populate_by_name=True)

    data: list[T]
    meta: PaginatedMeta


# ── Error models (RFC 7807 — wrapped in {"error": {...}}) ─────────────────────


class FieldError(BaseModel):
    """
    Field-level validation error detail (for HTTP 422 responses).

    Wire format:
        {"field": "email", "message": "value is not a valid email address"}
    """

    model_config = ConfigDict(populate_by_name=True)

    field: str
    message: str


class ErrorDetail(BaseModel):
    """
    RFC 7807 Problem Details object (the inner ``error`` body).

    Wire format:
        {
            "type": "https://tribhubanconcepts.com/errors/validation-error",
            "title": "Validation Error",
            "status": 422,
            "detail": "One or more fields failed validation.",
            "instance": "/api/v1/leads",
            "requestId": "uuid",
            "fields": [{"field": "email", "message": "..."}]
        }
    """

    model_config = ConfigDict(populate_by_name=True)

    type: str
    title: str
    status: int
    detail: str
    instance: str
    requestId: str  # noqa: N815
    fields: list[FieldError] = []


class ErrorResponse(BaseModel):
    """
    Top-level RFC 7807 error envelope.

    Wire format:
        {"error": { ... ErrorDetail fields ... }}
    """

    model_config = ConfigDict(populate_by_name=True)

    error: ErrorDetail


# ── Helper constructors ───────────────────────────────────────────────────────


def success(data: T, request_id: str) -> SuccessResponse[T]:
    """Build a single-resource success response from an explicit *request_id*."""
    return SuccessResponse(
        data=data,
        meta=Meta(requestId=request_id, timestamp=_utc_now_iso()),
    )


def ok(data: T, request_id: str) -> DataResponse[T]:
    """
    Build a single-resource success response from an explicit *request_id*.

    Canonical alias for :func:`success` — matches the public module API
    specified in the design (``envelope.ok()``).
    """
    return success(data=data, request_id=request_id)


def paginated(
    data: list[T],
    request_id: str,
    page: int,
    page_size: int,
    total: int,
) -> PaginatedResponse[T]:
    """Build a paginated list success response from an explicit *request_id*."""
    total_pages = max(1, math.ceil(total / page_size)) if page_size > 0 else 1
    return PaginatedResponse(
        data=data,
        meta=PaginatedMeta(
            requestId=request_id,
            timestamp=_utc_now_iso(),
            page=page,
            pageSize=page_size,
            total=total,
            totalPages=total_pages,
        ),
    )


def make_response(data: T, request: Any) -> SuccessResponse[T]:
    """
    Build a single-resource success response from a FastAPI/Starlette *request*.

    The ``requestId`` is read from ``request.state.request_id`` (set by
    :class:`RequestIDMiddleware`).  Falls back to an empty string if the
    middleware has not run (e.g. in unit tests).
    """
    return success(data=data, request_id=_request_id_from(request))


def make_paginated_response(
    data: list[T],
    total: int,
    page: int,
    page_size: int,
    request: Any,
) -> PaginatedResponse[T]:
    """
    Build a paginated list success response from a FastAPI/Starlette *request*.

    Args:
        data:       The current page's items.
        total:      Total number of items across all pages.
        page:       Current page number (1-indexed).
        page_size:  Number of items per page.
        request:    FastAPI/Starlette Request object (provides ``requestId``).
    """
    return paginated(
        data=data,
        request_id=_request_id_from(request),
        page=page,
        page_size=page_size,
        total=total,
    )


def error_response(
    type_: str,
    title: str,
    status: int,
    detail: str,
    instance: str,
    request_id: str,
    fields: list[FieldError] | None = None,
) -> ErrorResponse:
    """Build an RFC 7807 ``ErrorResponse`` with a custom type URL."""
    return ErrorResponse(
        error=ErrorDetail(
            type=type_,
            title=title,
            status=status,
            detail=detail,
            instance=instance,
            requestId=request_id,
            fields=fields or [],
        )
    )


def http_error(
    status: int,
    title: str,
    detail: str,
    instance: str,
    request_id: str,
    errors: list[FieldError] | None = None,
    fields: list[FieldError] | None = None,
) -> ErrorResponse:
    """
    Build an RFC 7807 ``ErrorResponse`` using the canonical type URL for *status*.

    Accepts ``fields`` (preferred, matches the wire format) or the legacy
    ``errors`` parameter for backward compatibility.
    """
    resolved_fields = fields if fields is not None else (errors or [])
    return error_response(
        type_=_default_error_type(status),
        title=title,
        status=status,
        detail=detail,
        instance=instance,
        request_id=request_id,
        fields=resolved_fields,
    )
