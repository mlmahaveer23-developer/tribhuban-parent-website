"""
Schemas package — re-exports all envelope types for convenient imports.
"""
from app.schemas.envelope import (
    ERROR_TYPE_URLS,
    DataResponse,
    ErrorDetail,
    ErrorResponse,
    FieldError,
    Meta,
    PaginatedMeta,
    PaginatedResponse,
    SuccessMeta,
    SuccessResponse,
    error_response,
    http_error,
    make_paginated_response,
    make_response,
    ok,
    paginated,
    success,
)

__all__ = [
    # Type URL map
    "ERROR_TYPE_URLS",
    # Meta models
    "Meta",
    "PaginatedMeta",
    "SuccessMeta",  # backward-compat alias for Meta
    # Success envelopes
    "DataResponse",     # canonical public name
    "SuccessResponse",  # alias kept for backward compatibility
    "PaginatedResponse",
    # Error models
    "FieldError",
    "ErrorDetail",
    "ErrorResponse",
    # Helper constructors
    "ok",               # canonical public name
    "success",          # alias kept for backward compatibility
    "paginated",
    "make_response",
    "make_paginated_response",
    "error_response",
    "http_error",
]
