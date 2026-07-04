"""
Content API router — articles, knowledge center, categories, tags, FAQs.

Endpoints
---------
GET /api/v1/articles                   paginated article list
GET /api/v1/articles/{slug}            article detail (includes related articles)
GET /api/v1/categories                 all blog categories
GET /api/v1/knowledge                  paginated knowledge-item list
GET /api/v1/knowledge/{slug}           knowledge-item detail
GET /api/v1/faqs                       all published FAQs (grouped by category)

All read endpoints
  • Return success envelope: { data: ..., meta: { requestId, timestamp } }
  • Add Cache-Control: public, max-age=600 + ETag header
  • Return empty data: [] + HTTP 200 on zero results (not an error)

Validation
  • page < 1                → 422
  • page_size outside 1–50  → 422
  • unknown query params     → 400
  • unknown article slug     → 404
  • unknown knowledge slug   → 404

Requirements: 10.1, 10.2, 10.5, 10.6, 10.7, 25.3
"""
from __future__ import annotations

import hashlib
import json
import logging
from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.infra.db import get_db_session
from app.repositories.content import (
    ArticleRepository,
    CategoryRepository,
    FAQRepository,
    KnowledgeRepository,
    TagRepository,
)
from app.schemas.content import (
    ArticleDetail,
    ArticleSummary,
    AuthorOut,
    CategoryOut,
    FAQCategoryOut,
    FAQItem,
    FAQOut,
    KnowledgeItemDetail,
    KnowledgeItemSummary,
    TagOut,
)
from app.schemas.envelope import ok, paginated

logger = logging.getLogger(__name__)

router = APIRouter(tags=["content"])

# ── Allowed query-param sets (for unknown-param rejection) ────────────────────

_ARTICLES_ALLOWED_PARAMS = frozenset({"page", "page_size", "category", "tag", "sort"})
_KNOWLEDGE_ALLOWED_PARAMS = frozenset({"page", "page_size"})
_SORT_VALUES = frozenset({"newest", "oldest", "most-relevant"})

# ── Cache-Control constants ───────────────────────────────────────────────────
# Articles list gets stale-while-revalidate for fresher list experience;
# all other read endpoints use the basic public cache.

_CACHE_CONTROL_LIST = "public, max-age=600, stale-while-revalidate=60"
_CACHE_CONTROL = "public, max-age=600"


# ── Helpers ───────────────────────────────────────────────────────────────────


def _get_request_id(request: Request) -> str:
    return getattr(request.state, "request_id", "") or ""


def _etag_from(data: Any) -> str:
    """Generate a weak ETag from a JSON-serialisable payload."""
    raw = json.dumps(data, default=str, sort_keys=True)
    digest = hashlib.md5(raw.encode(), usedforsecurity=False).hexdigest()  # noqa: S324
    return f'W/"{digest}"'


def _cache_headers(etag: str, list_endpoint: bool = False) -> dict[str, str]:
    cache = _CACHE_CONTROL_LIST if list_endpoint else _CACHE_CONTROL
    return {"Cache-Control": cache, "ETag": etag}


def _reject_unknown_params(
    request: Request,
    allowed: frozenset[str],
) -> None:
    """Raise HTTP 400 if any query param is not in *allowed*."""
    unknown = set(request.query_params.keys()) - allowed
    if unknown:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Unknown query parameter(s): {', '.join(sorted(unknown))}. "
                f"Allowed: {', '.join(sorted(allowed))}."
            ),
        )


# ── ORM → DTO converters ──────────────────────────────────────────────────────


def _category_out(cat) -> CategoryOut | None:
    if cat is None:
        return None
    return CategoryOut(
        id=cat.id,
        name=cat.name,
        slug=cat.slug,
        description=cat.description,
    )


def _author_out(author) -> AuthorOut | None:
    if author is None:
        return None
    return AuthorOut(
        id=author.id,
        name=author.name,
        slug=author.slug,
        bio=author.bio,
        avatar_key=author.avatar_key,
    )


def _tag_out(tag) -> TagOut:
    return TagOut(id=tag.id, name=tag.name, slug=tag.slug)


def _article_summary(article) -> ArticleSummary:
    tags = [_tag_out(at.tag) for at in (article.article_tags or []) if at.tag is not None]
    return ArticleSummary(
        id=article.id,
        slug=article.slug,
        title=article.title,
        excerpt=article.excerpt,
        hero_image_key=article.hero_image_key,
        category=_category_out(article.category),
        author=_author_out(article.author),
        published_at=article.published_at,
        reading_time_min=article.reading_time_min,
        tags=tags,
    )


def _knowledge_summary(item) -> KnowledgeItemSummary:
    return KnowledgeItemSummary(
        id=item.id,
        slug=item.slug,
        title=item.title,
        excerpt=item.excerpt,
        doc_type=item.doc_type,
        published_at=item.published_at,
        reading_time_min=item.reading_time_min,
    )


def _faq_out(faq) -> FAQOut:
    category_name = faq.faq_category.name if faq.faq_category else ""
    return FAQOut(
        id=faq.id,
        question=faq.question,
        answer=faq.answer,
        sort_order=faq.sort_order,
        category_name=category_name,
    )


# ── GET /articles ─────────────────────────────────────────────────────────────


@router.get(
    "/articles",
    summary="List published blog articles",
    responses={
        200: {"description": "Paginated article list (empty list on zero results)"},
        400: {"description": "Unknown query parameter"},
        422: {"description": "page or page_size out of range"},
    },
)
async def list_articles(
    request: Request,
    session: Annotated[AsyncSession, Depends(get_db_session)],
    page: int = Query(default=1, ge=1, description="Page number (min 1)"),
    page_size: int = Query(
        default=20,
        ge=1,
        le=50,
        alias="page_size",
        description="Items per page (1–50, default 20)",
    ),
    category: str | None = Query(default=None, description="Filter by category slug"),
    tag: str | None = Query(default=None, description="Filter by tag slug"),
    sort: str = Query(
        default="newest",
        description="Sort order: newest | oldest | most-relevant",
    ),
) -> JSONResponse:
    # Reject unknown params first
    _reject_unknown_params(request, _ARTICLES_ALLOWED_PARAMS)

    # Validate sort value
    if sort not in _SORT_VALUES:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=(
                f"Invalid sort value '{sort}'. "
                f"Accepted values: {', '.join(sorted(_SORT_VALUES))}."
            ),
        )

    repo = ArticleRepository(session)
    articles, total = await repo.list_articles(
        page=page,
        page_size=page_size,
        category=category,
        tag=tag,
        sort=sort,  # type: ignore[arg-type]
    )

    items = [_article_summary(a) for a in articles]
    request_id = _get_request_id(request)

    envelope = paginated(
        data=items,
        request_id=request_id,
        page=page,
        page_size=page_size,
        total=total,
    )
    body = envelope.model_dump(by_alias=True, mode="json")
    etag = _etag_from(body)

    return JSONResponse(
        content=body,
        status_code=status.HTTP_200_OK,
        headers=_cache_headers(etag, list_endpoint=True),
    )


# ── GET /articles/{slug} ──────────────────────────────────────────────────────


@router.get(
    "/articles/{slug}",
    summary="Get a single published article by slug",
    responses={
        200: {"description": "Article detail with related articles"},
        404: {"description": "Article not found"},
    },
)
async def get_article(
    slug: str,
    request: Request,
    session: Annotated[AsyncSession, Depends(get_db_session)],
) -> JSONResponse:
    repo = ArticleRepository(session)
    article = await repo.get_by_slug(slug)

    if article is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Article '{slug}' not found.",
        )

    related_orm = await repo.get_related(article, k=3)
    related = [_article_summary(r) for r in related_orm]

    tags = [_tag_out(at.tag) for at in (article.article_tags or []) if at.tag is not None]
    detail = ArticleDetail(
        id=article.id,
        slug=article.slug,
        title=article.title,
        excerpt=article.excerpt,
        hero_image_key=article.hero_image_key,
        category=_category_out(article.category),
        author=_author_out(article.author),
        published_at=article.published_at,
        reading_time_min=article.reading_time_min,
        tags=tags,
        body=article.body,
        seo=article.seo,
        related_articles=related,
    )

    request_id = _get_request_id(request)
    envelope = ok(detail, request_id)
    body = envelope.model_dump(by_alias=True, mode="json")
    etag = _etag_from(body)

    return JSONResponse(
        content=body,
        status_code=status.HTTP_200_OK,
        headers=_cache_headers(etag),
    )


# ── GET /categories ───────────────────────────────────────────────────────────


@router.get(
    "/categories",
    summary="List all blog categories",
    responses={
        200: {"description": "Category list (empty list on zero results)"},
    },
)
async def list_categories(
    request: Request,
    session: Annotated[AsyncSession, Depends(get_db_session)],
) -> JSONResponse:
    repo = CategoryRepository(session)
    categories = await repo.list_all()

    items = [
        CategoryOut(
            id=c.id,
            name=c.name,
            slug=c.slug,
            description=c.description,
        )
        for c in categories
    ]

    request_id = _get_request_id(request)
    envelope = ok(items, request_id)
    body = envelope.model_dump(by_alias=True, mode="json")
    etag = _etag_from(body)

    return JSONResponse(
        content=body,
        status_code=status.HTTP_200_OK,
        headers=_cache_headers(etag),
    )


# ── GET /knowledge ────────────────────────────────────────────────────────────


@router.get(
    "/knowledge",
    summary="List published knowledge items",
    responses={
        200: {"description": "Paginated knowledge list (empty list on zero results)"},
        400: {"description": "Unknown query parameter"},
        422: {"description": "page or page_size out of range"},
    },
)
async def list_knowledge(
    request: Request,
    session: Annotated[AsyncSession, Depends(get_db_session)],
    page: int = Query(default=1, ge=1, description="Page number (min 1)"),
    page_size: int = Query(
        default=20,
        ge=1,
        le=50,
        alias="page_size",
        description="Items per page (1–50, default 20)",
    ),
) -> JSONResponse:
    _reject_unknown_params(request, _KNOWLEDGE_ALLOWED_PARAMS)

    repo = KnowledgeRepository(session)
    items_orm, total = await repo.list_items(page=page, page_size=page_size)

    items = [_knowledge_summary(i) for i in items_orm]
    request_id = _get_request_id(request)

    envelope = paginated(
        data=items,
        request_id=request_id,
        page=page,
        page_size=page_size,
        total=total,
    )
    body = envelope.model_dump(by_alias=True, mode="json")
    etag = _etag_from(body)

    return JSONResponse(
        content=body,
        status_code=status.HTTP_200_OK,
        headers=_cache_headers(etag),
    )


# ── GET /knowledge/{slug} ─────────────────────────────────────────────────────


@router.get(
    "/knowledge/{slug}",
    summary="Get a single published knowledge item by slug",
    responses={
        200: {"description": "Knowledge item detail"},
        404: {"description": "Knowledge item not found"},
    },
)
async def get_knowledge_item(
    slug: str,
    request: Request,
    session: Annotated[AsyncSession, Depends(get_db_session)],
) -> JSONResponse:
    repo = KnowledgeRepository(session)
    item = await repo.get_by_slug(slug)

    if item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Knowledge item '{slug}' not found.",
        )

    detail = KnowledgeItemDetail(
        id=item.id,
        slug=item.slug,
        title=item.title,
        excerpt=item.excerpt,
        doc_type=item.doc_type,
        published_at=item.published_at,
        reading_time_min=item.reading_time_min,
        body=item.body,
        seo=item.seo,
    )

    request_id = _get_request_id(request)
    envelope = ok(detail, request_id)
    body = envelope.model_dump(by_alias=True, mode="json")
    etag = _etag_from(body)

    return JSONResponse(
        content=body,
        status_code=status.HTTP_200_OK,
        headers=_cache_headers(etag),
    )


# ── GET /faqs ─────────────────────────────────────────────────────────────────


@router.get(
    "/faqs",
    summary="List all published FAQs (grouped by category)",
    responses={
        200: {"description": "FAQs grouped by category (empty list on zero results)"},
    },
)
async def list_faqs(
    request: Request,
    session: Annotated[AsyncSession, Depends(get_db_session)],
) -> JSONResponse:
    repo = FAQRepository(session)
    categories = await repo.list_all_grouped()

    items = [
        FAQCategoryOut(
            name=cat.name,
            slug=cat.slug,
            faqs=[
                FAQItem(
                    id=faq.id,
                    question=faq.question,
                    answer=faq.answer,
                    sort_order=faq.sort_order,
                )
                for faq in getattr(cat, "_grouped_faqs", [])
            ],
        )
        for cat in categories
    ]

    request_id = _get_request_id(request)
    envelope = ok(items, request_id)
    body = envelope.model_dump(by_alias=True, mode="json")
    etag = _etag_from(body)

    return JSONResponse(
        content=body,
        status_code=status.HTTP_200_OK,
        headers=_cache_headers(etag),
    )
