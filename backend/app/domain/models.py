"""
Unified ORM models module — re-exports every SQLAlchemy model and the shared
DeclarativeBase so that callers can import from a single location:

    from app.domain.models import Base, Lead, Article, ...

Models are defined in focused sub-modules (lead.py, content.py, etc.) and
aggregated here.  This module is the canonical surface for type annotations,
repository imports, and Alembic autogenerate discovery.
"""
from __future__ import annotations

# Re-export Base so callers only need one import
from app.infra.db import Base  # noqa: F401

# ── Lead & attribution ────────────────────────────────────────────────────────
from app.domain.lead import Lead, UTMAttribution  # noqa: F401

# ── Booking ──────────────────────────────────────────────────────────────────
from app.domain.booking import Consultation  # noqa: F401

# ── Newsletter ────────────────────────────────────────────────────────────────
from app.domain.newsletter import NewsletterSubscriber  # noqa: F401

# ── Content: blog, knowledge center, FAQ ─────────────────────────────────────
from app.domain.content import (  # noqa: F401
    Article,
    ArticleTag,
    ArticleVersion,
    Author,
    Category,
    FAQ,
    FAQCategory,
    KnowledgeCategory,
    KnowledgeItem,
    KnowledgeItemTag,
    Tag,
)

# ── Careers ───────────────────────────────────────────────────────────────────
from app.domain.careers import Department, Job, JobApplication  # noqa: F401

# ── Infrastructure / integration ─────────────────────────────────────────────
from app.domain.infra import AdminUser, OutboxEvent, Redirect  # noqa: F401

__all__ = [
    # Base
    "Base",
    # Lead
    "Lead",
    "UTMAttribution",
    # Booking
    "Consultation",
    # Newsletter
    "NewsletterSubscriber",
    # Content
    "Author",
    "Category",
    "Tag",
    "Article",
    "ArticleTag",
    "ArticleVersion",
    "KnowledgeCategory",
    "KnowledgeItem",
    "KnowledgeItemTag",
    "FAQCategory",
    "FAQ",
    # Careers
    "Department",
    "Job",
    "JobApplication",
    # Infrastructure
    "OutboxEvent",
    "Redirect",
    "AdminUser",
]
