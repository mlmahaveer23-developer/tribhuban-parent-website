"""
Pydantic request / response schemas for the Careers and Upload endpoints.

DepartmentRef            — nested department reference within job summaries
JobSummary               — list view of a job posting (GET /api/v1/jobs)
JobDetail                — full job posting detail (GET /api/v1/jobs/{slug})
ApplicationCreateRequest — body of POST /api/v1/jobs/{slug}/applications
ApplicationResponse      — returned on successful application (HTTP 201)
PresignResponse          — returned presigned S3 URL details

Aliases retained for backwards compatibility:
  JobApplicationRequest  = ApplicationCreateRequest
  JobApplicationResponse = ApplicationResponse

Validation rules (Req 11.1, 12.1-12.5):
  - full_name: 1–255 chars
  - email: RFC 5322 format, ≤ 254 chars
  - cover_note: max 2000 chars
  - consent: bool (required)
  - file_type: pdf | doc | docx (case-insensitive)
  - file_size: 1..5242880 bytes
"""
from __future__ import annotations

import re
from typing import Any

from pydantic import AliasGenerator, BaseModel, ConfigDict, Field, field_validator
from pydantic.alias_generators import to_camel

# ── Email validation regex (consistent with other schemas) ───────────────────
_EMAIL_RE: re.Pattern[str] = re.compile(
    r"^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+"
    r"@"
    r"[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?"
    r"(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*"
    r"\.[a-zA-Z]{2,}$"
)

# ── Allowed file types for resume upload ─────────────────────────────────────
_ALLOWED_FILE_TYPES: frozenset[str] = frozenset({"pdf", "doc", "docx"})
_MAX_FILE_SIZE: int = 5_242_880  # 5 MB in bytes


# ── Department reference (nested within job summaries) ────────────────────────


class DepartmentRef(BaseModel):
    """Minimal department reference embedded in job responses."""

    model_config = ConfigDict(
        populate_by_name=True,
        alias_generator=AliasGenerator(serialization_alias=to_camel),
    )

    id: str
    name: str
    slug: str


# ── Job summary schema (list view) ────────────────────────────────────────────


class JobSummary(BaseModel):
    """Returned in ``GET /api/v1/jobs`` list responses."""

    model_config = ConfigDict(
        populate_by_name=True,
        alias_generator=AliasGenerator(serialization_alias=to_camel),
    )

    id: str
    slug: str
    title: str
    department: DepartmentRef
    location: str | None
    location_type: str = Field(..., alias="locationType")
    employment_type: str = Field(..., alias="employmentType")
    posted_at: str | None = Field(None, alias="postedAt")
    status: str


# ── Job detail schema (single job view) ──────────────────────────────────────


class JobDetail(JobSummary):
    """Returned in ``GET /api/v1/jobs/{slug}`` responses."""

    description: dict[str, Any] | None
    responsibilities: dict[str, Any] | None
    requirements: dict[str, Any] | None
    benefits: dict[str, Any] | None
    salary_min_minor: int | None = Field(None, alias="salaryMinMinor")
    salary_max_minor: int | None = Field(None, alias="salaryMaxMinor")
    currency: str


# ── Application create request schema ────────────────────────────────────────


class ApplicationCreateRequest(BaseModel):
    """Body for ``POST /api/v1/jobs/{slug}/applications``."""

    model_config = ConfigDict(
        populate_by_name=True,
        alias_generator=AliasGenerator(serialization_alias=to_camel),
    )

    full_name: str = Field(
        ...,
        min_length=1,
        max_length=255,
        alias="fullName",
        description="Applicant's full name.",
    )

    email: str = Field(
        ...,
        max_length=254,
        description="RFC 5322 email address.",
    )

    phone: str | None = Field(
        None,
        max_length=30,
        description="Optional phone number.",
    )

    resume_key: str | None = Field(
        None,
        alias="resumeKey",
        description="S3 object key for a pre-uploaded resume.",
    )

    cover_note: str | None = Field(
        None,
        max_length=2000,
        alias="coverNote",
        description="Optional cover letter or note (max 2000 chars).",
    )

    linkedin_url: str | None = Field(
        None,
        alias="linkedinUrl",
        description="Optional LinkedIn profile URL.",
    )

    portfolio_url: str | None = Field(
        None,
        alias="portfolioUrl",
        description="Optional portfolio URL.",
    )

    consent: bool = Field(
        ...,
        description="Applicant's consent to data processing (required).",
    )

    # ── Validators ─────────────────────────────────────────────────────────────

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        """Reject strings that don't match the basic RFC 5322 addr-spec pattern."""
        v = v.strip()
        if not v:
            raise ValueError("email must not be empty")
        if not _EMAIL_RE.match(v):
            raise ValueError("value is not a valid email address")
        return v


# ── Backwards-compat alias ────────────────────────────────────────────────────
# Earlier scaffolding used JobApplicationRequest — keep the alias so existing
# imports in the router and test modules don't break.
JobApplicationRequest = ApplicationCreateRequest


# ── Application response schema ───────────────────────────────────────────────


class ApplicationResponse(BaseModel):
    """Returned by ``POST /api/v1/jobs/{slug}/applications`` on success (HTTP 201)."""

    model_config = ConfigDict(
        populate_by_name=True,
        alias_generator=AliasGenerator(serialization_alias=to_camel),
    )

    id: str
    reference_code: str = Field(..., alias="referenceCode")
    status: str
    created_at: str = Field(..., alias="createdAt")


# Backwards-compat alias
JobApplicationResponse = ApplicationResponse


# ── Presign request schema ────────────────────────────────────────────────────


class PresignRequest(BaseModel):
    """Body for ``POST /api/v1/uploads/presign``."""

    model_config = ConfigDict(
        populate_by_name=True,
        alias_generator=AliasGenerator(serialization_alias=to_camel),
    )

    file_type: str = Field(
        ...,
        alias="fileType",
        description="Declared MIME type / extension: pdf, doc, or docx.",
    )

    file_size: int = Field(
        ...,
        alias="fileSize",
        description="Declared file size in bytes (1 to 5,242,880).",
    )

    # ── Validators ─────────────────────────────────────────────────────────────

    @field_validator("file_type")
    @classmethod
    def validate_file_type(cls, v: str) -> str:
        """Reject unsupported file types (case-insensitive)."""
        normalised = v.strip().lower()
        if normalised not in _ALLOWED_FILE_TYPES:
            raise ValueError(
                f"Unsupported file type '{v}'. Allowed types: pdf, doc, docx."
            )
        return normalised

    @field_validator("file_size")
    @classmethod
    def validate_file_size(cls, v: int) -> int:
        """Reject size = 0 or size > 5 MB."""
        if v < 1:
            raise ValueError("file_size must be at least 1 byte.")
        if v > _MAX_FILE_SIZE:
            raise ValueError(
                f"file_size must not exceed {_MAX_FILE_SIZE} bytes (5 MB)."
            )
        return v


# ── Presign response schema ───────────────────────────────────────────────────


class PresignResponse(BaseModel):
    """Returned by ``POST /api/v1/uploads/presign`` on success.

    Fields match the task spec exactly:
      url        — the presigned S3 PUT URL
      key        — the unique S3 object key for the uploaded file
      expires_in — seconds until the presigned URL expires (always 900)
    """

    model_config = ConfigDict(
        populate_by_name=True,
        alias_generator=AliasGenerator(serialization_alias=to_camel),
    )

    url: str = Field(..., description="Presigned S3 PUT URL.")
    key: str = Field(..., description="Unique S3 object key for the uploaded file.")
    expires_in: int = Field(
        ...,
        alias="expiresIn",
        description="Seconds until the presigned URL expires.",
    )


# ── Rebuild models ─────────────────────────────────────────────────────────────
DepartmentRef.model_rebuild()
JobSummary.model_rebuild()
JobDetail.model_rebuild()
ApplicationCreateRequest.model_rebuild()
ApplicationResponse.model_rebuild()
PresignRequest.model_rebuild()
PresignResponse.model_rebuild()
