"""
Search schemas — Pydantic DTOs for the site-wide full-text search API.

Requirements: 13.1–13.6
"""
from __future__ import annotations

from pydantic import AliasGenerator, BaseModel, ConfigDict
from pydantic.alias_generators import to_camel


class SearchHit(BaseModel):
    """A single search result item returned by the Search_Service."""

    model_config = ConfigDict(
        populate_by_name=True,
        alias_generator=AliasGenerator(serialization_alias=to_camel),
    )

    id: str
    """UUID of the matched content record (as a string for JSON transport)."""

    type: str
    """Content type: 'article' | 'knowledge' | 'faq' | 'job'."""

    title: str
    """Display title of the result."""

    slug: str | None = None
    """URL slug (None for FAQ entries which use a fixed support URL)."""

    excerpt: str | None = None
    """Short summary/excerpt; None for content types without an excerpt column."""

    published_at: str | None = None
    """ISO 8601 UTC string of the publish timestamp; None when not applicable."""

    url: str
    """
    Resolved frontend URL for the result:
      article   → /blog/{slug}
      knowledge → /knowledge/{slug}
      faq       → /support/faq
      job       → /careers/{slug}
    """


class SearchResponse(BaseModel):
    """The paginated body returned by GET /api/v1/search."""

    model_config = ConfigDict(
        populate_by_name=True,
        alias_generator=AliasGenerator(serialization_alias=to_camel),
    )

    hits: list[SearchHit]
    """The matched results for this page (len ≤ page_size)."""

    total: int
    """Total number of matching records across all pages."""

    page: int
    """Current page number (1-indexed)."""

    page_size: int
    """Number of results per page (1–50)."""

    query: str
    """The (trimmed) search query that produced these results."""
