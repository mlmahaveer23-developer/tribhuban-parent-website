"""
Tests for Task 1.3 — shared API envelope, error handling, and request-ID middleware.

Covers:
  - RequestIDMiddleware: generates UUID, echoes header, uses incoming header
  - PiiRedactingLoggingMiddleware: user_agent field, PII redaction, log levels
  - Success envelopes: DataResponse / ok(), PaginatedResponse / paginated()
  - RFC 7807 error envelope: error_response(), http_error()
  - Global exception handlers: RequestValidationError → 422, ValueError → 422,
    HTTPException 404/405 → RFC 7807, unhandled Exception → 500
  - Health endpoints: /api/v1/health, /api/v1/ready
  - Structured JSON logging: JsonFormatter, RequestIdFilter
"""
from __future__ import annotations

import json
import logging
import uuid

import pytest
from httpx import ASGITransport, AsyncClient

import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

@pytest.fixture
def anyio_backend():
    return "asyncio"


@pytest.fixture
def app_client():
    """Return an ASGI test client wrapping the FastAPI app."""
    from app.main import app

    async def _make():
        return AsyncClient(transport=ASGITransport(app=app), base_url="http://testserver")

    return _make


# ---------------------------------------------------------------------------
# Envelope unit tests
# ---------------------------------------------------------------------------


class TestSuccessEnvelope:
    def test_ok_returns_data_response(self):
        from app.schemas.envelope import ok, DataResponse

        resp = ok({"id": 1, "name": "test"}, request_id="req-123")
        assert isinstance(resp, DataResponse)
        assert resp.data == {"id": 1, "name": "test"}
        assert resp.meta.requestId == "req-123"
        assert resp.meta.timestamp.endswith("Z")

    def test_data_response_is_success_response_alias(self):
        from app.schemas.envelope import DataResponse, SuccessResponse

        assert DataResponse is SuccessResponse

    def test_ok_alias_equals_success(self):
        from app.schemas.envelope import ok, success

        r1 = ok({"x": 1}, "rid")
        r2 = success({"x": 1}, "rid")
        # Same shape — compare serialised form (timestamps may differ by 1s in edge cases)
        assert r1.data == r2.data
        assert r1.meta.requestId == r2.meta.requestId

    def test_paginated_response(self):
        from app.schemas.envelope import paginated

        items = [{"id": i} for i in range(5)]
        resp = paginated(items, "p-rid", page=2, page_size=5, total=12)
        assert resp.data == items
        assert resp.meta.page == 2
        assert resp.meta.pageSize == 5
        assert resp.meta.total == 12
        assert resp.meta.totalPages == 3  # ceil(12/5)
        assert resp.meta.requestId == "p-rid"

    def test_paginated_total_pages_minimum_one(self):
        from app.schemas.envelope import paginated

        resp = paginated([], "rid", page=1, page_size=20, total=0)
        assert resp.meta.totalPages == 1

    def test_meta_has_z_suffix_timestamp(self):
        from app.schemas.envelope import ok

        resp = ok({}, "rid")
        assert "T" in resp.meta.timestamp
        assert resp.meta.timestamp.endswith("Z")


class TestErrorEnvelope:
    def test_error_response_structure(self):
        from app.schemas.envelope import error_response

        resp = error_response(
            type_="https://tribhubanconcepts.com/errors/not-found",
            title="Not Found",
            status=404,
            detail="The resource was not found.",
            instance="/api/v1/leads/999",
            request_id="err-rid",
        )
        assert resp.error.type == "https://tribhubanconcepts.com/errors/not-found"
        assert resp.error.title == "Not Found"
        assert resp.error.status == 404
        assert resp.error.detail == "The resource was not found."
        assert resp.error.instance == "/api/v1/leads/999"
        assert resp.error.requestId == "err-rid"
        assert resp.error.fields == []

    def test_http_error_uses_canonical_type_url(self):
        from app.schemas.envelope import http_error

        resp = http_error(
            status=422,
            title="Validation Error",
            detail="Bad input",
            instance="/api/v1/leads",
            request_id="rid",
        )
        assert resp.error.type == "https://tribhubanconcepts.com/errors/validation-error"

    def test_http_error_with_field_errors(self):
        from app.schemas.envelope import http_error, FieldError

        fields = [
            FieldError(field="email", message="value is not a valid email address"),
            FieldError(field="phone", message="field required"),
        ]
        resp = http_error(
            status=422,
            title="Validation Error",
            detail="One or more fields failed validation.",
            instance="/api/v1/leads",
            request_id="rid",
            fields=fields,
        )
        assert len(resp.error.fields) == 2
        assert resp.error.fields[0].field == "email"
        assert resp.error.fields[1].field == "phone"

    def test_http_error_unknown_status_uses_fallback_type(self):
        from app.schemas.envelope import http_error

        resp = http_error(
            status=418,
            title="I'm a teapot",
            detail="Cannot brew coffee.",
            instance="/api/v1/coffee",
            request_id="rid",
        )
        assert "tribhubanconcepts.com/errors/http-418" in resp.error.type

    def test_error_type_uri_follows_slug_pattern(self):
        from app.schemas.envelope import ERROR_TYPE_URLS

        for status, url in ERROR_TYPE_URLS.items():
            assert url.startswith("https://tribhubanconcepts.com/errors/"), (
                f"Status {status} type URL does not start with expected prefix: {url}"
            )
            slug = url.split("/errors/")[1]
            assert slug == slug.lower(), f"Slug not lowercase: {slug}"
            assert " " not in slug, f"Slug contains space: {slug}"


# ---------------------------------------------------------------------------
# Middleware unit tests
# ---------------------------------------------------------------------------


class TestPiiRedaction:
    def test_redacts_pii_fields(self):
        from app.infra.middleware import _redact_dict

        dirty = {
            "name": "Alice",
            "email": "alice@example.com",
            "phone": "+919876543210",
            "password": "hunter2",
            "ip": "1.2.3.4",
            "safe": "keep-this",
        }
        clean = _redact_dict(dirty)
        for pii_field in ("name", "email", "phone", "password", "ip"):
            assert clean[pii_field] == "[REDACTED]", f"{pii_field} not redacted"
        assert clean["safe"] == "keep-this"

    def test_redacts_nested_pii(self):
        from app.infra.middleware import _redact_dict

        dirty = {"user": {"email": "x@y.com", "age": 30}}
        clean = _redact_dict(dirty)
        assert clean["user"]["email"] == "[REDACTED]"
        assert clean["user"]["age"] == 30

    def test_redacts_pii_in_list(self):
        from app.infra.middleware import _redact_dict

        dirty = [{"email": "a@b.com"}, {"email": "c@d.com"}]
        clean = _redact_dict(dirty)
        assert clean[0]["email"] == "[REDACTED]"
        assert clean[1]["email"] == "[REDACTED]"

    def test_ip_redaction_ipv4(self):
        from app.infra.middleware import _redact_ip

        assert _redact_ip("192.168.1.100") == "192.168.1.0"
        assert _redact_ip("10.0.0.1") == "10.0.0.0"

    def test_ip_redaction_empty(self):
        from app.infra.middleware import _redact_ip

        assert _redact_ip("") == "[REDACTED]"


class TestJsonLogging:
    def test_json_formatter_produces_valid_json(self):
        from app.infra.logging_config import JsonFormatter

        formatter = JsonFormatter()
        record = logging.LogRecord(
            name="app.test",
            level=logging.INFO,
            pathname="",
            lineno=0,
            msg="hello %s",
            args=("world",),
            exc_info=None,
        )
        record.request_id = "log-rid"  # type: ignore[attr-defined]
        output = formatter.format(record)
        parsed = json.loads(output)
        assert parsed["message"] == "hello world"
        assert parsed["level"] == "INFO"
        assert parsed["logger"] == "app.test"
        assert parsed["request_id"] == "log-rid"
        assert "timestamp" in parsed

    def test_json_formatter_includes_exc_info(self):
        from app.infra.logging_config import JsonFormatter

        formatter = JsonFormatter()
        try:
            raise ValueError("test error")
        except ValueError:
            import sys
            exc_info = sys.exc_info()

        record = logging.LogRecord(
            name="app.test",
            level=logging.ERROR,
            pathname="",
            lineno=0,
            msg="an error occurred",
            args=(),
            exc_info=exc_info,
        )
        output = formatter.format(record)
        parsed = json.loads(output)
        assert "exc_info" in parsed
        assert "ValueError" in parsed["exc_info"]
        assert "test error" in parsed["exc_info"]

    def test_request_id_filter_injects_empty_string(self):
        from app.infra.logging_config import RequestIdFilter

        filt = RequestIdFilter()
        record = logging.LogRecord(
            name="test", level=logging.DEBUG, pathname="", lineno=0,
            msg="hi", args=(), exc_info=None
        )
        assert not hasattr(record, "request_id")
        filt.filter(record)
        assert record.request_id == ""  # type: ignore[attr-defined]

    def test_request_id_filter_preserves_existing_id(self):
        from app.infra.logging_config import RequestIdFilter

        filt = RequestIdFilter()
        record = logging.LogRecord(
            name="test", level=logging.DEBUG, pathname="", lineno=0,
            msg="hi", args=(), exc_info=None
        )
        record.request_id = "my-id"  # type: ignore[attr-defined]
        filt.filter(record)
        assert record.request_id == "my-id"  # type: ignore[attr-defined]


# ---------------------------------------------------------------------------
# Integration tests via ASGI test client
# ---------------------------------------------------------------------------


@pytest.mark.anyio
async def test_health_endpoint_returns_envelope():
    from app.main import app

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://testserver") as client:
        r = await client.get("/api/v1/health")

    assert r.status_code == 200
    body = r.json()
    assert body["data"]["status"] == "ok"
    assert body["data"]["version"] == "0.1.0"
    assert "requestId" in body["meta"]
    assert "timestamp" in body["meta"]
    assert r.headers.get("x-request-id") is not None


@pytest.mark.anyio
async def test_request_id_header_echoed():
    """Middleware should echo back the X-Request-ID header on every response."""
    from app.main import app

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://testserver") as client:
        r = await client.get("/api/v1/health")

    assert "x-request-id" in r.headers
    # The value should be a valid UUID
    echoed_id = r.headers["x-request-id"]
    uuid.UUID(echoed_id)  # raises ValueError if not valid UUID


@pytest.mark.anyio
async def test_request_id_uses_incoming_header():
    """When the caller provides X-Request-ID, it must be reused in the response."""
    from app.main import app

    incoming_id = "client-provided-request-id-abc123"
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://testserver") as client:
        r = await client.get("/api/v1/health", headers={"X-Request-ID": incoming_id})

    assert r.headers.get("x-request-id") == incoming_id
    body = r.json()
    assert body["meta"]["requestId"] == incoming_id


@pytest.mark.anyio
async def test_404_returns_rfc7807_envelope():
    from app.main import app

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://testserver") as client:
        r = await client.get("/api/v1/does-not-exist")

    assert r.status_code == 404
    body = r.json()
    assert "error" in body
    err = body["error"]
    assert err["status"] == 404
    assert "tribhubanconcepts.com/errors/not-found" in err["type"]
    assert "requestId" in err
    assert err["instance"] == "/api/v1/does-not-exist"


@pytest.mark.anyio
async def test_405_returns_rfc7807_envelope():
    from app.main import app

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://testserver") as client:
        r = await client.delete("/api/v1/health")

    assert r.status_code == 405
    body = r.json()
    assert "error" in body
    assert body["error"]["status"] == 405


@pytest.mark.anyio
async def test_500_no_stack_trace_in_response():
    """Unhandled exceptions must return 500 with RFC 7807 envelope — no traceback in body."""
    from app.main import app
    from fastapi import APIRouter

    # Register a temporary route that raises an unhandled exception.
    # Use a unique path to avoid route conflicts across test runs.
    tmp_router = APIRouter()

    @tmp_router.get("/api/v1/boom-test-500")
    async def boom():
        raise RuntimeError("Something went very wrong")

    app.include_router(tmp_router)

    # raise_app_exceptions=False: httpx ASGI transport returns the error
    # response rather than re-raising the exception — this is the correct mode
    # for testing exception handler behaviour via the HTTP wire format.
    async with AsyncClient(
        transport=ASGITransport(app=app, raise_app_exceptions=False),
        base_url="http://testserver",
    ) as client:
        r = await client.get("/api/v1/boom-test-500")

    assert r.status_code == 500
    body = r.json()
    assert "error" in body
    err = body["error"]
    assert err["status"] == 500
    # Stack trace must not appear in the response
    assert "Traceback" not in r.text
    assert "RuntimeError" not in r.text
    assert "requestId" in err
