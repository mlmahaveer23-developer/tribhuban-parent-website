"""
Domain models: Department, Job, JobApplication.
"""
from __future__ import annotations

import uuid
from datetime import date, datetime
from typing import Any

from sqlalchemy import (
    BIGINT,
    Boolean,
    Date,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.infra.db import Base


class Department(Base):
    """Organisational department that owns job postings."""

    __tablename__ = "department"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    org_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)

    # §9.2 Audit
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default="now()"
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default="now()"
    )
    created_by: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), nullable=True)
    updated_by: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), nullable=True)
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    version: Mapped[int] = mapped_column(Integer, nullable=False, server_default="1")

    # Relationships
    jobs: Mapped[list["Job"]] = relationship(back_populates="department")

    __table_args__ = (
        Index("ix_department_org_id", "org_id"),
    )


class Job(Base):
    """A job posting.

    Rich JSONB fields (description, responsibilities, requirements, benefits)
    carry the structured content so they can be rendered server-side or
    delivered to future consumers without schema changes.
    """

    __tablename__ = "job"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    org_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)

    slug: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)

    department_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("department.id", ondelete="RESTRICT"),
        nullable=False,
    )
    location: Mapped[str | None] = mapped_column(String(255), nullable=True)
    location_type: Mapped[str] = mapped_column(
        String(20), nullable=False, server_default="onsite"
    )  # onsite|hybrid|remote
    employment_type: Mapped[str] = mapped_column(
        String(30), nullable=False
    )  # full_time|part_time|contract|internship
    experience_level: Mapped[str | None] = mapped_column(String(50), nullable=True)

    description: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False)
    responsibilities: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False)
    requirements: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False)
    benefits: Mapped[dict[str, Any] | None] = mapped_column(JSONB, nullable=True)

    # §9.2 Money convention — minor units + currency code
    salary_min_minor: Mapped[int | None] = mapped_column(BIGINT, nullable=True)
    salary_max_minor: Mapped[int | None] = mapped_column(BIGINT, nullable=True)
    currency: Mapped[str | None] = mapped_column(String(3), nullable=True, server_default="INR")

    status: Mapped[str] = mapped_column(
        String(20), nullable=False, server_default="open"
    )  # open|closed|filled
    posted_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    valid_through: Mapped[date | None] = mapped_column(Date, nullable=True)

    # §9.2 Audit
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default="now()"
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default="now()"
    )
    created_by: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), nullable=True)
    updated_by: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), nullable=True)
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    version: Mapped[int] = mapped_column(Integer, nullable=False, server_default="1")

    # Relationships
    department: Mapped["Department"] = relationship(back_populates="jobs")
    applications: Mapped[list["JobApplication"]] = relationship(back_populates="job")

    __table_args__ = (
        Index("ix_job_org_id", "org_id"),
        Index("ix_job_status_posted_at", "status", "posted_at"),
        Index("ix_job_department_id", "department_id"),
    )


class JobApplication(Base):
    """A candidate's application for a specific job posting."""

    __tablename__ = "job_application"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    org_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)

    job_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("job.id", ondelete="RESTRICT"),
        nullable=False,
    )

    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(254), nullable=False)
    phone: Mapped[str | None] = mapped_column(String(30), nullable=True)

    resume_key: Mapped[str | None] = mapped_column(String(500), nullable=True)
    cover_note: Mapped[str | None] = mapped_column(Text, nullable=True)
    linkedin_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    portfolio_url: Mapped[str | None] = mapped_column(String(500), nullable=True)

    status: Mapped[str] = mapped_column(
        String(30), nullable=False, server_default="received"
    )  # received|screening|shortlisted|rejected|hired
    reference_code: Mapped[str] = mapped_column(
        String(64), nullable=False, unique=True
    )
    consent: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default="false")
    context: Mapped[dict[str, Any] | None] = mapped_column(JSONB, nullable=True)

    # §9.2 Audit
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default="now()"
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default="now()"
    )
    created_by: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), nullable=True)
    updated_by: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), nullable=True)
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    # No version on job_application per design (status transitions are the record)

    # Relationships
    job: Mapped["Job"] = relationship(back_populates="applications")

    __table_args__ = (
        Index("ix_job_application_org_id", "org_id"),
        Index("ix_job_application_job_id", "job_id"),
        Index("ix_job_application_email", "email"),
        Index("ix_job_application_status", "status"),
        Index(
            "ix_job_application_context_gin", "context", postgresql_using="gin"
        ),
    )
