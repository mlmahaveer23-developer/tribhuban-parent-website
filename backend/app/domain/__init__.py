"""
Domain models package.

All models are imported here so that Alembic's ``env.py`` (which imports
``Base`` from ``app.infra.db``) can pick up every table in
``Base.metadata`` without needing to import each module individually.
"""

# Lead / attribution
from app.domain.lead import Lead, UTMAttribution  # noqa: F401

# Booking
from app.domain.booking import Consultation  # noqa: F401

# Newsletter
from app.domain.newsletter import NewsletterSubscriber  # noqa: F401

# Content — blog, knowledge, FAQ
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

# Careers
from app.domain.careers import Department, Job, JobApplication  # noqa: F401

# Infrastructure / integration
from app.domain.infra import AdminUser, OutboxEvent, Redirect  # noqa: F401

__all__ = [
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
