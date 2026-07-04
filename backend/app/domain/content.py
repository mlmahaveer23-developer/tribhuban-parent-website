"""
Domain models: blog, knowledge center, FAQs.

Models in this file:
  Author, Category, Tag, Article, ArticleTag, ArticleVersion
  KnowledgeCategory, KnowledgeItem, KnowledgeItemTag
  FAQCategory, FAQ
"""
from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any

from sqlalchemy import (
    DateTime,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import JSONB, TSVECTOR, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.infra.db import Base


# ═══════════════════════════════════════════════════════════════════════════════
# Shared primitives: Author, Category, Tag
# ═══════════════════════════════════════════════════════════════════════════════


class Author(Base):
    """Content author — referenced by articles and knowledge items."""

    __tablename__ = "author"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    org_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    bio: Mapped[str | None] = mapped_column(Text, nullable=True)
    avatar_key: Mapped[str | None] = mapped_column(String(500), nullable=True)
    social: Mapped[dict[str, Any] | None] = mapped_column(JSONB, nullable=True)

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
    articles: Mapped[list["Article"]] = relationship(back_populates="author")
    knowledge_items: Mapped[list["KnowledgeItem"]] = relationship(back_populates="author")

    __table_args__ = (
        Index("ix_author_org_id", "org_id"),
        Index("ix_author_slug", "slug"),
    )


class Category(Base):
    """Blog / article taxonomy category."""

    __tablename__ = "category"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    org_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    seo: Mapped[dict[str, Any] | None] = mapped_column(JSONB, nullable=True)
    sort_order: Mapped[int] = mapped_column(Integer, nullable=False, server_default="0")

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
    articles: Mapped[list["Article"]] = relationship(back_populates="category")

    __table_args__ = (
        Index("ix_category_org_id", "org_id"),
    )


class Tag(Base):
    """Content tag — many-to-many with articles and knowledge items."""

    __tablename__ = "tag"

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
    article_tags: Mapped[list["ArticleTag"]] = relationship(back_populates="tag")
    knowledge_item_tags: Mapped[list["KnowledgeItemTag"]] = relationship(back_populates="tag")

    __table_args__ = (
        Index("ix_tag_org_id", "org_id"),
    )


# ═══════════════════════════════════════════════════════════════════════════════
# Blog: Article, ArticleTag, ArticleVersion
# ═══════════════════════════════════════════════════════════════════════════════


class Article(Base):
    """Blog article.

    body is stored as JSONB (rich text / MDX AST) so it can be rendered by
    any client that understands the schema.  search_vector is a computed
    TSVECTOR column updated by a DB trigger or application logic.
    """

    __tablename__ = "article"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    org_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)

    slug: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    excerpt: Mapped[str | None] = mapped_column(Text, nullable=True)
    body: Mapped[dict[str, Any] | None] = mapped_column(JSONB, nullable=True)
    hero_image_key: Mapped[str | None] = mapped_column(String(500), nullable=True)

    category_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("category.id", ondelete="RESTRICT"),
        nullable=True,
    )
    author_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("author.id", ondelete="RESTRICT"),
        nullable=True,
    )

    status: Mapped[str] = mapped_column(
        String(20), nullable=False, server_default="draft"
    )  # draft|scheduled|published|archived
    published_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    reading_time_min: Mapped[int] = mapped_column(Integer, nullable=False, server_default="0")
    seo: Mapped[dict[str, Any] | None] = mapped_column(JSONB, nullable=True)

    # Full-text search vector — populated via trigger or service layer
    search_vector: Mapped[Any] = mapped_column(TSVECTOR, nullable=True)

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
    category: Mapped["Category | None"] = relationship(back_populates="articles")
    author: Mapped["Author | None"] = relationship(back_populates="articles")
    article_tags: Mapped[list["ArticleTag"]] = relationship(
        back_populates="article", cascade="all, delete-orphan"
    )
    versions: Mapped[list["ArticleVersion"]] = relationship(
        back_populates="article", cascade="all, delete-orphan"
    )

    __table_args__ = (
        Index("ix_article_org_id", "org_id"),
        Index("ix_article_status_published_at", "status", "published_at"),
        Index("ix_article_category_id", "category_id"),
        Index("ix_article_author_id", "author_id"),
        # GIN index on the pre-computed search_vector column (§9.4)
        Index("ix_article_search_vector_gin", "search_vector", postgresql_using="gin"),
    )


class ArticleTag(Base):
    """Many-to-many join: article ↔ tag."""

    __tablename__ = "article_tag"

    article_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("article.id", ondelete="CASCADE"),
        primary_key=True,
    )
    tag_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("tag.id", ondelete="CASCADE"),
        primary_key=True,
    )

    # Relationships
    article: Mapped["Article"] = relationship(back_populates="article_tags")
    tag: Mapped["Tag"] = relationship(back_populates="article_tags")

    __table_args__ = (
        Index("ix_article_tag_tag_id", "tag_id"),
        Index("ix_article_tag_article_id", "article_id"),
    )


class ArticleVersion(Base):
    """Editorial audit trail for article content snapshots.

    Allows rollback and future Workplace content-module import of history.
    No soft-delete / version on this table — it is itself the version log.
    """

    __tablename__ = "article_version"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    article_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("article.id", ondelete="CASCADE"),
        nullable=False,
    )
    version: Mapped[int] = mapped_column(Integer, nullable=False)
    snapshot: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False)
    changed_by: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default="now()"
    )

    # Relationship
    article: Mapped["Article"] = relationship(back_populates="versions")

    __table_args__ = (
        Index("ix_article_version_article_id", "article_id"),
        Index("ix_article_version_article_version", "article_id", "version"),
    )


# ═══════════════════════════════════════════════════════════════════════════════
# Knowledge center: KnowledgeCategory, KnowledgeItem, KnowledgeItemTag
# ═══════════════════════════════════════════════════════════════════════════════


class KnowledgeCategory(Base):
    """Taxonomy category for knowledge center items."""

    __tablename__ = "knowledge_category"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    org_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    sort_order: Mapped[int] = mapped_column(Integer, nullable=False, server_default="0")

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
    items: Mapped[list["KnowledgeItem"]] = relationship(back_populates="knowledge_category")

    __table_args__ = (
        Index("ix_knowledge_category_org_id", "org_id"),
    )


class KnowledgeItem(Base):
    """Evergreen reference / guide in the knowledge center.

    search_vector is a TSVECTOR column for PostgreSQL full-text search,
    populated via trigger or service layer.
    """

    __tablename__ = "knowledge_item"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    org_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)

    slug: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    excerpt: Mapped[str | None] = mapped_column(Text, nullable=True)
    body: Mapped[dict[str, Any] | None] = mapped_column(JSONB, nullable=True)
    hero_image_key: Mapped[str | None] = mapped_column(String(500), nullable=True)

    knowledge_category_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("knowledge_category.id", ondelete="RESTRICT"),
        nullable=True,
    )
    author_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("author.id", ondelete="RESTRICT"),
        nullable=True,
    )
    doc_type: Mapped[str] = mapped_column(
        String(30), nullable=False, server_default="guide"
    )  # guide|reference|research

    status: Mapped[str] = mapped_column(
        String(20), nullable=False, server_default="draft"
    )  # draft|published|archived
    published_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    reading_time_min: Mapped[int] = mapped_column(Integer, nullable=False, server_default="0")
    seo: Mapped[dict[str, Any] | None] = mapped_column(JSONB, nullable=True)

    # Full-text search vector — populated via trigger or service layer
    search_vector: Mapped[Any] = mapped_column(TSVECTOR, nullable=True)

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
    knowledge_category: Mapped["KnowledgeCategory | None"] = relationship(back_populates="items")
    author: Mapped["Author | None"] = relationship(back_populates="knowledge_items")
    knowledge_item_tags: Mapped[list["KnowledgeItemTag"]] = relationship(
        back_populates="knowledge_item", cascade="all, delete-orphan"
    )

    __table_args__ = (
        Index("ix_knowledge_item_org_id", "org_id"),
        Index("ix_knowledge_item_status_published_at", "status", "published_at"),
        Index("ix_knowledge_item_knowledge_category_id", "knowledge_category_id"),
        Index("ix_knowledge_item_author_id", "author_id"),
        # GIN index on the pre-computed search_vector column
        Index("ix_knowledge_item_search_vector_gin", "search_vector", postgresql_using="gin"),
    )


class KnowledgeItemTag(Base):
    """Many-to-many join: knowledge_item ↔ tag."""

    __tablename__ = "knowledge_item_tag"

    knowledge_item_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("knowledge_item.id", ondelete="CASCADE"),
        primary_key=True,
    )
    tag_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("tag.id", ondelete="CASCADE"),
        primary_key=True,
    )

    # Relationships
    knowledge_item: Mapped["KnowledgeItem"] = relationship(back_populates="knowledge_item_tags")
    tag: Mapped["Tag"] = relationship(back_populates="knowledge_item_tags")

    __table_args__ = (
        Index("ix_knowledge_item_tag_tag_id", "tag_id"),
        Index("ix_knowledge_item_tag_knowledge_item_id", "knowledge_item_id"),
    )


# ═══════════════════════════════════════════════════════════════════════════════
# FAQ: FAQCategory, FAQ
# ═══════════════════════════════════════════════════════════════════════════════


class FAQCategory(Base):
    """FAQ grouping category."""

    __tablename__ = "faq_category"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    org_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    sort_order: Mapped[int] = mapped_column(Integer, nullable=False, server_default="0")

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
    faqs: Mapped[list["FAQ"]] = relationship(back_populates="faq_category")

    __table_args__ = (
        Index("ix_faq_category_org_id", "org_id"),
    )


class FAQ(Base):
    """A single FAQ entry grouped under a FAQCategory."""

    __tablename__ = "faq"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    org_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)

    faq_category_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("faq_category.id", ondelete="RESTRICT"),
        nullable=False,
    )
    question: Mapped[str] = mapped_column(Text, nullable=False)
    answer: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False)  # rich text
    sort_order: Mapped[int] = mapped_column(Integer, nullable=False, server_default="0")
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, server_default="published"
    )  # draft|published|archived

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
    faq_category: Mapped["FAQCategory"] = relationship(back_populates="faqs")

    __table_args__ = (
        Index("ix_faq_org_id", "org_id"),
        Index("ix_faq_faq_category_id", "faq_category_id"),
        Index("ix_faq_status", "status"),
    )
