"""
Content repositories — async SQLAlchemy 2.0.

All public-facing queries apply two mandatory filters:
  1. ``deleted_at IS NULL``   — soft-delete safety
  2. ``status = 'published'`` — public content only

Classes
-------
ArticleRepository    — list_articles (list_published), get_by_slug (find_by_slug), get_related
CategoryRepository   — list_all
TagRepository        — list_all
KnowledgeRepository  — list_items (list_published), get_by_slug (find_by_slug)
FAQRepository        — list_faqs (flat), list_all_grouped (grouped by FAQCategory)

Requirements: 10.1, 10.2, 10.5, 10.6, 10.7, 22.8, 22.9
"""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Literal

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.domain.content import (
    Article,
    ArticleTag,
    Category,
    FAQ,
    FAQCategory,
    KnowledgeItem,
    KnowledgeItemTag,
    Tag,
)
from app.domain.identifiers import get_or_404

# ── Sort-option type ──────────────────────────────────────────────────────────

SortOption = Literal["newest", "oldest", "most-relevant"]

# ── Constants ─────────────────────────────────────────────────────────────────

_PUBLIC_ARTICLE_STATUS = "published"
_PUBLIC_KNOWLEDGE_STATUS = "published"
_PUBLIC_FAQ_STATUS = "published"

# Recency bonus window: articles published within this many days earn bonus 1.0
# decreasing linearly to 0.0 for older content (MVP approximation).
_RECENCY_WINDOW_DAYS: int = 365


# ── Helpers ───────────────────────────────────────────────────────────────────


def _recency_bonus(published_at: datetime | None) -> float:
    """Return a 0.0–1.0 bonus based on how recently the article was published.

    Articles published today → 1.0; articles published ≥ _RECENCY_WINDOW_DAYS
    ago (or with no publish date) → 0.0.  Linearly interpolated in-between.

    Algorithm §14.4.
    """
    if published_at is None:
        return 0.0
    now = datetime.now(timezone.utc)
    # Ensure both are timezone-aware for comparison
    if published_at.tzinfo is None:
        published_at = published_at.replace(tzinfo=timezone.utc)
    age_days = max((now - published_at).days, 0)
    if age_days >= _RECENCY_WINDOW_DAYS:
        return 0.0
    return 1.0 - (age_days / _RECENCY_WINDOW_DAYS)


def _shared_tag_ids(
    article: Article,
    candidate: Article,
) -> int:
    """Count the number of tag IDs shared between two articles.

    Uses the in-memory ``article_tags`` relationship (must be eagerly loaded).
    """
    a_tag_ids = {at.tag_id for at in (article.article_tags or [])}
    c_tag_ids = {at.tag_id for at in (candidate.article_tags or [])}
    return len(a_tag_ids & c_tag_ids)


# ══════════════════════════════════════════════════════════════════════════════
# ArticleRepository
# ══════════════════════════════════════════════════════════════════════════════


class ArticleRepository:
    """Async SQLAlchemy repository for the ``article`` table."""

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    # ── list_articles ────────────────────────────────────────────────────────

    async def list_articles(
        self,
        page: int,
        page_size: int,
        category: str | None = None,
        tag: str | None = None,
        sort: SortOption = "newest",
    ) -> tuple[list[Article], int]:
        """Return a paginated list of published articles and the total count.

        Filters
        -------
        - ``deleted_at IS NULL``
        - ``status = 'published'``
        - Optional ``category`` — matched by ``category.slug``
        - Optional ``tag``      — matched by ``tag.slug``

        Sort options (§14 spec)
        -----------------------
        - ``newest``       → ``published_at DESC, id ASC``
        - ``oldest``       → ``published_at ASC,  id ASC``
        - ``most-relevant``→ ``published_at DESC, id ASC`` (MVP: same as newest)

        Pagination
        ----------
        offset = (page - 1) * page_size
        """
        # ── Base query ───────────────────────────────────────────────────────
        stmt = (
            select(Article)
            .where(
                Article.deleted_at.is_(None),
                Article.status == _PUBLIC_ARTICLE_STATUS,
            )
            .options(
                selectinload(Article.category),
                selectinload(Article.author),
                selectinload(Article.article_tags).selectinload(ArticleTag.tag),
            )
        )

        # ── Optional category filter ─────────────────────────────────────────
        if category is not None:
            stmt = stmt.join(Article.category).where(Category.slug == category)

        # ── Optional tag filter ──────────────────────────────────────────────
        if tag is not None:
            stmt = (
                stmt
                .join(Article.article_tags)
                .join(ArticleTag.tag)
                .where(Tag.slug == tag)
            )

        # ── Count total (before pagination) ─────────────────────────────────
        count_stmt = select(
            # Subquery trick: wrap the base stmt filters in a subquery count
        )
        # Build a separate scalar count query with identical filters
        from sqlalchemy import func  # noqa: PLC0415
        count_base = (
            select(func.count())
            .select_from(Article)
            .where(
                Article.deleted_at.is_(None),
                Article.status == _PUBLIC_ARTICLE_STATUS,
            )
        )
        if category is not None:
            count_base = count_base.join(Article.category).where(Category.slug == category)
        if tag is not None:
            count_base = (
                count_base
                .join(Article.article_tags)
                .join(ArticleTag.tag)
                .where(Tag.slug == tag)
            )
        total_result = await self._session.execute(count_base)
        total: int = total_result.scalar_one()

        # ── Ordering ─────────────────────────────────────────────────────────
        if sort == "oldest":
            stmt = stmt.order_by(Article.published_at.asc(), Article.id.asc())
        else:
            # newest + most-relevant both use published_at DESC
            stmt = stmt.order_by(Article.published_at.desc(), Article.id.asc())

        # ── Pagination ───────────────────────────────────────────────────────
        offset = (page - 1) * page_size
        stmt = stmt.offset(offset).limit(page_size)

        result = await self._session.execute(stmt)
        articles = list(result.scalars().unique())
        return articles, total

    # ── get_by_slug ──────────────────────────────────────────────────────────

    async def get_by_slug(self, slug: str) -> Article | None:
        """Return a single published, non-deleted article by its slug.

        Returns ``None`` when not found (caller should raise 404).
        Eagerly loads category, author, and tags.
        """
        stmt = (
            select(Article)
            .where(
                Article.slug == slug,
                Article.deleted_at.is_(None),
                Article.status == _PUBLIC_ARTICLE_STATUS,
            )
            .options(
                selectinload(Article.category),
                selectinload(Article.author),
                selectinload(Article.article_tags).selectinload(ArticleTag.tag),
            )
        )
        result = await self._session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_slug_or_404(self, slug: str) -> Article:
        """Return a published, non-deleted article by slug, or raise HTTP 404.

        Raises:
            HTTPException(404): When no published, non-deleted article with *slug* exists.
        """
        return await get_or_404(
            lambda: self.get_by_slug(slug),
            detail=f"Article '{slug}' not found.",
        )

    # ── get_related ──────────────────────────────────────────────────────────

    async def get_related(self, article: Article, k: int = 3) -> list[Article]:
        """Return up to *k* related published articles using algorithm §14.4.

        Scoring
        -------
        - Same category → +3
        - Each shared tag → +2
        - Recency bonus → 0..1 (linearly decreasing over _RECENCY_WINDOW_DAYS)

        Sort: score DESC, published_at DESC, id ASC
        The article itself is always excluded.
        Only articles where score > 0 are included.

        Preconditions: article.article_tags must be loaded.
        """
        if k <= 0:
            return []

        # Fetch all published, non-deleted articles except self — eagerly load tags
        stmt = (
            select(Article)
            .where(
                Article.deleted_at.is_(None),
                Article.status == _PUBLIC_ARTICLE_STATUS,
                Article.id != article.id,
            )
            .options(
                selectinload(Article.category),
                selectinload(Article.author),
                selectinload(Article.article_tags).selectinload(ArticleTag.tag),
            )
        )
        result = await self._session.execute(stmt)
        candidates = list(result.scalars().unique())

        # Score each candidate per §14.4
        scored: list[tuple[Article, float]] = []
        for c in candidates:
            score: float = 0.0

            # Category match
            if (
                article.category_id is not None
                and c.category_id is not None
                and c.category_id == article.category_id
            ):
                score += 3

            # Tag overlap
            score += 2 * _shared_tag_ids(article, c)

            # Recency bonus
            score += _recency_bonus(c.published_at)

            if score > 0:
                scored.append((c, score))

        # Stable sort: score DESC, published_at DESC, id ASC
        scored.sort(
            key=lambda pair: (
                -pair[1],
                # Negate published_at for descending order; handle None
                -(pair[0].published_at.timestamp() if pair[0].published_at else 0),
                str(pair[0].id),  # ascending id as final tie-break
            )
        )

        return [c for c, _ in scored[:k]]


# ══════════════════════════════════════════════════════════════════════════════
# CategoryRepository
# ══════════════════════════════════════════════════════════════════════════════


class CategoryRepository:
    """Async SQLAlchemy repository for the ``category`` table."""

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def list_all(self) -> list[Category]:
        """Return all non-deleted categories ordered by sort_order, then name."""
        stmt = (
            select(Category)
            .where(Category.deleted_at.is_(None))
            .order_by(Category.sort_order.asc(), Category.name.asc())
        )
        result = await self._session.execute(stmt)
        return list(result.scalars())


# ══════════════════════════════════════════════════════════════════════════════
# TagRepository
# ══════════════════════════════════════════════════════════════════════════════


class TagRepository:
    """Async SQLAlchemy repository for the ``tag`` table."""

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def list_all(self) -> list[Tag]:
        """Return all non-deleted tags ordered by name."""
        stmt = (
            select(Tag)
            .where(Tag.deleted_at.is_(None))
            .order_by(Tag.name.asc())
        )
        result = await self._session.execute(stmt)
        return list(result.scalars())


# ══════════════════════════════════════════════════════════════════════════════
# KnowledgeRepository
# ══════════════════════════════════════════════════════════════════════════════


class KnowledgeRepository:
    """Async SQLAlchemy repository for the ``knowledge_item`` table."""

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def list_items(
        self,
        page: int,
        page_size: int,
    ) -> tuple[list[KnowledgeItem], int]:
        """Return a paginated list of published knowledge items and the total count.

        Filters: ``deleted_at IS NULL``, ``status = 'published'``
        Order: ``published_at DESC, id ASC``
        """
        from sqlalchemy import func  # noqa: PLC0415

        # Count
        count_stmt = (
            select(func.count())
            .select_from(KnowledgeItem)
            .where(
                KnowledgeItem.deleted_at.is_(None),
                KnowledgeItem.status == _PUBLIC_KNOWLEDGE_STATUS,
            )
        )
        total_result = await self._session.execute(count_stmt)
        total: int = total_result.scalar_one()

        # Items
        offset = (page - 1) * page_size
        stmt = (
            select(KnowledgeItem)
            .where(
                KnowledgeItem.deleted_at.is_(None),
                KnowledgeItem.status == _PUBLIC_KNOWLEDGE_STATUS,
            )
            .options(
                selectinload(KnowledgeItem.knowledge_item_tags).selectinload(
                    KnowledgeItemTag.tag
                ),
            )
            .order_by(KnowledgeItem.published_at.desc(), KnowledgeItem.id.asc())
            .offset(offset)
            .limit(page_size)
        )
        result = await self._session.execute(stmt)
        items = list(result.scalars().unique())
        return items, total

    async def get_by_slug(self, slug: str) -> KnowledgeItem | None:
        """Return a single published, non-deleted knowledge item by its slug.

        Returns ``None`` when not found (caller should raise 404).
        """
        stmt = (
            select(KnowledgeItem)
            .where(
                KnowledgeItem.slug == slug,
                KnowledgeItem.deleted_at.is_(None),
                KnowledgeItem.status == _PUBLIC_KNOWLEDGE_STATUS,
            )
            .options(
                selectinload(KnowledgeItem.knowledge_item_tags).selectinload(
                    KnowledgeItemTag.tag
                ),
                selectinload(KnowledgeItem.knowledge_category),
                selectinload(KnowledgeItem.author),
            )
        )
        result = await self._session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_slug_or_404(self, slug: str) -> KnowledgeItem:
        """Return a published, non-deleted knowledge item by slug, or raise HTTP 404.

        Raises:
            HTTPException(404): When no published, non-deleted knowledge item with *slug* exists.
        """
        return await get_or_404(
            lambda: self.get_by_slug(slug),
            detail=f"Knowledge item '{slug}' not found.",
        )


# ══════════════════════════════════════════════════════════════════════════════
# FAQRepository
# ══════════════════════════════════════════════════════════════════════════════


class FAQRepository:
    """Async SQLAlchemy repository for the ``faq`` table."""

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def list_faqs(self) -> list[FAQ]:
        """Return all published, non-deleted FAQs ordered by category sort_order,
        then faq sort_order, then id — effectively grouped by category.

        The FAQ's faq_category relationship is eagerly loaded so the API layer
        can embed category_name without additional queries.
        """
        stmt = (
            select(FAQ)
            .join(FAQ.faq_category)
            .where(
                FAQ.deleted_at.is_(None),
                FAQ.status == _PUBLIC_FAQ_STATUS,
                FAQCategory.deleted_at.is_(None),
            )
            .options(selectinload(FAQ.faq_category))
            .order_by(
                FAQCategory.sort_order.asc(),
                FAQ.sort_order.asc(),
                FAQ.id.asc(),
            )
        )
        result = await self._session.execute(stmt)
        return list(result.scalars())

    async def list_all_grouped(self) -> list[FAQCategory]:
        """Return all non-deleted FAQ categories with their published FAQs nested.

        Categories are ordered by sort_order ASC.  Within each category FAQs are
        ordered by sort_order ASC, id ASC.

        Only categories that have at least one published, non-deleted FAQ are
        included.  Categories with no published FAQs are omitted.

        Used by GET /api/v1/faqs to return the grouped wire format.
        """
        # Load categories that have at least one visible FAQ, with FAQs eagerly
        # loaded and pre-filtered to published+non-deleted rows.
        from sqlalchemy import exists  # noqa: PLC0415
        from sqlalchemy.orm import contains_eager  # noqa: PLC0415

        # Sub-query: category IDs that have ≥1 published non-deleted FAQ
        has_faq = (
            select(FAQ.faq_category_id)
            .where(
                FAQ.deleted_at.is_(None),
                FAQ.status == _PUBLIC_FAQ_STATUS,
            )
            .scalar_subquery()
        )

        cat_stmt = (
            select(FAQCategory)
            .where(
                FAQCategory.deleted_at.is_(None),
                FAQCategory.id.in_(has_faq),
            )
            .order_by(FAQCategory.sort_order.asc(), FAQCategory.name.asc())
        )
        cat_result = await self._session.execute(cat_stmt)
        categories = list(cat_result.scalars().unique())

        if not categories:
            return []

        # For each category load its published FAQs in sort_order ASC, id ASC
        cat_ids = [c.id for c in categories]
        faq_stmt = (
            select(FAQ)
            .where(
                FAQ.deleted_at.is_(None),
                FAQ.status == _PUBLIC_FAQ_STATUS,
                FAQ.faq_category_id.in_(cat_ids),
            )
            .order_by(FAQ.sort_order.asc(), FAQ.id.asc())
        )
        faq_result = await self._session.execute(faq_stmt)
        all_faqs = list(faq_result.scalars())

        # Group FAQs by category_id into a dict for O(1) lookup
        from collections import defaultdict  # noqa: PLC0415
        faq_by_cat: dict = defaultdict(list)
        for faq in all_faqs:
            faq_by_cat[faq.faq_category_id].append(faq)

        # Attach the pre-fetched FAQs onto the category objects so the API
        # layer can access them without additional queries.
        for cat in categories:
            # Temporarily store on a private attribute to avoid polluting ORM state
            cat._grouped_faqs = faq_by_cat.get(cat.id, [])  # type: ignore[attr-defined]

        return categories
