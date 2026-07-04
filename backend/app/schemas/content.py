"""
Pydantic response DTOs for the Content service (blog, knowledge, FAQs).

All models expose camelCase aliases on the wire (via `by_alias=True` in
serialisation) while using snake_case internally — consistent with every
other schema in this project.

Models
------
CategoryOut            — category summary (for list + embedding)
TagOut                 — tag summary
AuthorOut              — author summary (embedded in articles)
ArticleSummary         — article row for list responses + related-articles
ArticleDetail          — single-article detail (extends ArticleSummary)
KnowledgeItemSummary   — knowledge item row for list responses
KnowledgeItemDetail    — single knowledge-item detail
FAQItem                — a single FAQ entry (answer as raw JSON)
FAQCategoryOut         — FAQ category with nested list of FAQItem
FAQOut                 — (legacy flat) a single FAQ entry (answer as raw JSON)
PaginatedArticles      — paginated article list envelope
PaginatedKnowledgeItems — paginated knowledge item list envelope

Requirements: 10.1, 10.2, 10.5, 10.6, 10.7
"""
from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any

from pydantic import AliasGenerator, BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel


# ── Shared alias convention ───────────────────────────────────────────────────
# populate_by_name=True lets tests/internal code use snake_case attribute
# access even when instances are created from camelCase JSON.
# alias_generator=to_camel ensures all snake_case fields are serialized as
# camelCase on the wire (Req 27.2).

class _Base(BaseModel):
    model_config = ConfigDict(
        populate_by_name=True,
        alias_generator=AliasGenerator(serialization_alias=to_camel),
    )


# ── Leaf DTOs ─────────────────────────────────────────────────────────────────


class CategoryOut(_Base):
    """Blog/article taxonomy category."""

    id: uuid.UUID
    name: str
    slug: str
    description: str | None = Field(default=None)


class TagOut(_Base):
    """Content tag."""

    id: uuid.UUID
    name: str
    slug: str


class AuthorOut(_Base):
    """Article / knowledge-item author."""

    id: uuid.UUID
    name: str
    slug: str
    bio: str | None = Field(default=None)
    avatar_key: str | None = Field(default=None, alias="avatarKey")


# ── Article DTOs ───────────────────────────────────────────────────────────────


class ArticleSummary(_Base):
    """Article row — used in list responses and as the related-articles shape."""

    id: uuid.UUID
    slug: str
    title: str
    excerpt: str | None = Field(default=None)
    hero_image_key: str | None = Field(default=None, alias="heroImageKey")
    category: CategoryOut | None = Field(default=None)
    author: AuthorOut | None = Field(default=None)
    published_at: datetime | None = Field(default=None, alias="publishedAt")
    reading_time_min: int = Field(default=0, alias="readingTimeMin")
    tags: list[TagOut] = Field(default_factory=list)


class ArticleDetail(ArticleSummary):
    """Single-article detail — adds body, SEO, and related articles."""

    body: Any | None = Field(default=None)
    seo: Any | None = Field(default=None)
    related_articles: list[ArticleSummary] = Field(
        default_factory=list, alias="relatedArticles"
    )


# ── Knowledge item DTOs ────────────────────────────────────────────────────────


class KnowledgeItemSummary(_Base):
    """Knowledge item row — used in list responses."""

    id: uuid.UUID
    slug: str
    title: str
    excerpt: str | None = Field(default=None)
    doc_type: str = Field(alias="docType")
    published_at: datetime | None = Field(default=None, alias="publishedAt")
    reading_time_min: int = Field(default=0, alias="readingTimeMin")


class KnowledgeItemDetail(KnowledgeItemSummary):
    """Single knowledge-item detail — adds body and SEO."""

    body: Any | None = Field(default=None)
    seo: Any | None = Field(default=None)


# ── FAQ DTOs ────────────────────────────────────────────────────────────────────


class FAQItem(_Base):
    """Single FAQ entry (nested within FAQCategoryOut).

    ``answer`` is stored as JSONB (rich text); the DTO echoes it as raw JSON
    so frontends can render with their own rich-text renderer.
    """

    id: uuid.UUID
    question: str
    answer: Any  # rich-text JSON payload
    sort_order: int = Field(default=0, alias="sortOrder")


class FAQCategoryOut(_Base):
    """FAQ category with nested FAQs — the grouped response shape for GET /faqs."""

    name: str
    slug: str
    faqs: list[FAQItem] = Field(default_factory=list)


class FAQOut(_Base):
    """Single FAQ entry (flat representation — kept for backward compatibility).

    ``answer`` is stored as JSONB (rich text); the DTO echoes it as raw JSON
    so frontends can render with their own rich-text renderer.
    ``category_name`` is denormalised from the faq_category join for convenience.
    """

    id: uuid.UUID
    question: str
    answer: Any  # rich-text JSON payload
    sort_order: int = Field(default=0, alias="sortOrder")
    category_name: str = Field(alias="categoryName")


# ── Paginated envelopes ────────────────────────────────────────────────────────


class PaginatedArticles(_Base):
    """Paginated article list (items + pagination counters)."""

    items: list[ArticleSummary]
    total: int
    page: int
    page_size: int = Field(alias="pageSize")


class PaginatedKnowledgeItems(_Base):
    """Paginated knowledge item list (items + pagination counters)."""

    items: list[KnowledgeItemSummary]
    total: int
    page: int
    page_size: int = Field(alias="pageSize")


# ── Rebuild (required for `from __future__ import annotations`) ───────────────

CategoryOut.model_rebuild()
TagOut.model_rebuild()
AuthorOut.model_rebuild()
ArticleSummary.model_rebuild()
ArticleDetail.model_rebuild()
KnowledgeItemSummary.model_rebuild()
KnowledgeItemDetail.model_rebuild()
FAQItem.model_rebuild()
FAQCategoryOut.model_rebuild()
FAQOut.model_rebuild()
PaginatedArticles.model_rebuild()
PaginatedKnowledgeItems.model_rebuild()
