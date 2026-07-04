"""Initial schema — all tables for Tribhuban Parent Website.

Revision ID: 001_initial_schema
Revises:
Create Date: 2025-01-01 00:00:00.000000

Creates ALL tables defined in design §9.3–9.6 with full §9.2 conventions:
  - UUID PK (v7 time-ordered; Python default uuid4, DB default gen_random_uuid())
  - org_id UUID NOT NULL
  - Audit fields: created_at, updated_at, created_by, updated_by
  - Soft delete: deleted_at TIMESTAMPTZ NULL  (where applicable)
  - Optimistic concurrency: version INT       (where applicable)
  - All FK columns indexed
  - Composite / GIN / FTS indexes per §9.3–9.6
"""
from __future__ import annotations

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers
revision: str = "001_initial_schema"
down_revision: str | None = None
branch_labels: str | None = None
depends_on: str | None = None


def upgrade() -> None:
    # ── Enable pg extensions ──────────────────────────────────────────────────
    op.execute("CREATE EXTENSION IF NOT EXISTS pg_trgm")
    op.execute("CREATE EXTENSION IF NOT EXISTS pgcrypto")

    # ─────────────────────────────────────────────────────────────────────────
    # 1. utm_attribution  (no FK deps)
    # ─────────────────────────────────────────────────────────────────────────
    op.create_table(
        "utm_attribution",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True,
                  server_default=sa.text("gen_random_uuid()")),
        sa.Column("org_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("utm_source", sa.String(255), nullable=True),
        sa.Column("utm_medium", sa.String(255), nullable=True),
        sa.Column("utm_campaign", sa.String(255), nullable=True),
        sa.Column("utm_term", sa.String(255), nullable=True),
        sa.Column("utm_content", sa.String(255), nullable=True),
        sa.Column("referrer", sa.Text(), nullable=True),
        sa.Column("landing_page", sa.Text(), nullable=True),
        sa.Column("gclid", sa.String(255), nullable=True),
        sa.Column("fbclid", sa.String(255), nullable=True),
        sa.Column("first_seen_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("last_seen_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("session_id", sa.String(255), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False,
                  server_default=sa.text("now()")),
    )
    op.create_index("ix_utm_attribution_org_id", "utm_attribution", ["org_id"])
    op.create_index("ix_utm_attribution_session_id", "utm_attribution", ["session_id"])

    # ─────────────────────────────────────────────────────────────────────────
    # 2. lead  (FK → utm_attribution)
    # ─────────────────────────────────────────────────────────────────────────
    op.create_table(
        "lead",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True,
                  server_default=sa.text("gen_random_uuid()")),
        sa.Column("org_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("source", sa.String(50), nullable=False),
        sa.Column("full_name", sa.String(255), nullable=False),
        sa.Column("email", sa.String(254), nullable=False),
        sa.Column("phone", sa.String(20), nullable=True),
        sa.Column("company", sa.String(255), nullable=True),
        sa.Column("message", sa.Text(), nullable=True),
        sa.Column("interest_area", sa.String(50), nullable=False),
        sa.Column("status", sa.String(50), nullable=False, server_default="new"),
        sa.Column("score", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("quality", sa.String(10), nullable=False, server_default="cold"),
        sa.Column("context", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("consent_marketing", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("consent_timestamp", sa.DateTime(timezone=True), nullable=True),
        sa.Column("consent_ip", sa.String(45), nullable=True),
        sa.Column("utm_id", postgresql.UUID(as_uuid=True),
                  sa.ForeignKey("utm_attribution.id", ondelete="SET NULL"), nullable=True),
        sa.Column("reference_code", sa.String(64), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False,
                  server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False,
                  server_default=sa.text("now()")),
        sa.Column("created_by", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("updated_by", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("version", sa.Integer(), nullable=False, server_default="1"),
        sa.UniqueConstraint("reference_code", name="uq_lead_reference_code"),
    )
    op.create_index("ix_lead_org_id", "lead", ["org_id"])
    op.create_index("ix_lead_email", "lead", ["email"])
    op.create_index("ix_lead_status", "lead", ["status"])
    op.create_index("ix_lead_source", "lead", ["source"])
    op.create_index("ix_lead_created_at", "lead", ["created_at"])
    op.create_index("ix_lead_score", "lead", ["score"])
    op.create_index("ix_lead_utm_id", "lead", ["utm_id"])
    op.create_index("ix_lead_context_gin", "lead", ["context"], postgresql_using="gin")

    # ─────────────────────────────────────────────────────────────────────────
    # 3. consultation  (FK → lead)
    # ─────────────────────────────────────────────────────────────────────────
    op.create_table(
        "consultation",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True,
                  server_default=sa.text("gen_random_uuid()")),
        sa.Column("org_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("lead_id", postgresql.UUID(as_uuid=True),
                  sa.ForeignKey("lead.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("full_name", sa.String(255), nullable=False),
        sa.Column("email", sa.String(254), nullable=False),
        sa.Column("phone", sa.String(20), nullable=False),
        sa.Column("interest_area", sa.String(50), nullable=True),
        sa.Column("location", sa.String(255), nullable=True),
        sa.Column("preferred_date", sa.Date(), nullable=False),
        sa.Column("preferred_time_window", sa.String(20), nullable=False),
        sa.Column("message", sa.Text(), nullable=True),
        sa.Column("status", sa.String(50), nullable=False, server_default="requested"),
        sa.Column("reference_code", sa.String(64), nullable=False),
        sa.Column("context", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False,
                  server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False,
                  server_default=sa.text("now()")),
        sa.Column("created_by", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("updated_by", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("version", sa.Integer(), nullable=False, server_default="1"),
        sa.UniqueConstraint("reference_code", name="uq_consultation_reference_code"),
    )
    op.create_index("ix_consultation_org_id", "consultation", ["org_id"])
    op.create_index("ix_consultation_lead_id", "consultation", ["lead_id"])
    op.create_index("ix_consultation_status", "consultation", ["status"])
    op.create_index("ix_consultation_preferred_date", "consultation", ["preferred_date"])
    op.create_index("ix_consultation_email", "consultation", ["email"])
    op.create_index("ix_consultation_reference_code", "consultation", ["reference_code"], unique=True)

    # ─────────────────────────────────────────────────────────────────────────
    # 4. newsletter_subscriber  (no FK deps)
    # ─────────────────────────────────────────────────────────────────────────
    op.create_table(
        "newsletter_subscriber",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True,
                  server_default=sa.text("gen_random_uuid()")),
        sa.Column("org_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("email", sa.String(254), nullable=False),
        sa.Column("status", sa.String(20), nullable=False, server_default="pending"),
        sa.Column("confirm_token", sa.String(255), nullable=True),
        sa.Column("confirm_token_expires_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("confirmed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("unsubscribed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("consent_ip", sa.String(45), nullable=True),
        sa.Column("source", sa.String(50), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False,
                  server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False,
                  server_default=sa.text("now()")),
        sa.Column("created_by", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("updated_by", postgresql.UUID(as_uuid=True), nullable=True),
        # Req 9.7 / §22.4 — unique email per org
        sa.UniqueConstraint("org_id", "email", name="uq_newsletter_subscriber_org_email"),
    )
    op.create_index("ix_newsletter_subscriber_org_id", "newsletter_subscriber", ["org_id"])
    op.create_index("ix_newsletter_subscriber_email", "newsletter_subscriber", ["email"])
    op.create_index("ix_newsletter_subscriber_status", "newsletter_subscriber", ["status"])
    op.create_index("ix_newsletter_subscriber_confirm_token", "newsletter_subscriber", ["confirm_token"])

    # ─────────────────────────────────────────────────────────────────────────
    # 5. author  (no FK deps)
    # ─────────────────────────────────────────────────────────────────────────
    op.create_table(
        "author",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True,
                  server_default=sa.text("gen_random_uuid()")),
        sa.Column("org_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("slug", sa.String(255), nullable=False),
        sa.Column("bio", sa.Text(), nullable=True),
        sa.Column("avatar_key", sa.String(500), nullable=True),
        sa.Column("social", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False,
                  server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False,
                  server_default=sa.text("now()")),
        sa.Column("created_by", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("updated_by", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("version", sa.Integer(), nullable=False, server_default="1"),
        sa.UniqueConstraint("slug", name="uq_author_slug"),
    )
    op.create_index("ix_author_org_id", "author", ["org_id"])
    op.create_index("ix_author_slug", "author", ["slug"])

    # ─────────────────────────────────────────────────────────────────────────
    # 6. category  (no FK deps)
    # ─────────────────────────────────────────────────────────────────────────
    op.create_table(
        "category",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True,
                  server_default=sa.text("gen_random_uuid()")),
        sa.Column("org_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("slug", sa.String(255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("seo", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False,
                  server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False,
                  server_default=sa.text("now()")),
        sa.Column("created_by", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("updated_by", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("version", sa.Integer(), nullable=False, server_default="1"),
        sa.UniqueConstraint("slug", name="uq_category_slug"),
    )
    op.create_index("ix_category_org_id", "category", ["org_id"])

    # ─────────────────────────────────────────────────────────────────────────
    # 7. tag  (no FK deps)
    # ─────────────────────────────────────────────────────────────────────────
    op.create_table(
        "tag",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True,
                  server_default=sa.text("gen_random_uuid()")),
        sa.Column("org_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("slug", sa.String(255), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False,
                  server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False,
                  server_default=sa.text("now()")),
        sa.Column("created_by", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("updated_by", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("version", sa.Integer(), nullable=False, server_default="1"),
        sa.UniqueConstraint("slug", name="uq_tag_slug"),
    )
    op.create_index("ix_tag_org_id", "tag", ["org_id"])

    # ─────────────────────────────────────────────────────────────────────────
    # 8. article  (FK → category, author)
    # ─────────────────────────────────────────────────────────────────────────
    op.create_table(
        "article",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True,
                  server_default=sa.text("gen_random_uuid()")),
        sa.Column("org_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("slug", sa.String(255), nullable=False),
        sa.Column("title", sa.String(500), nullable=False),
        sa.Column("excerpt", sa.Text(), nullable=True),
        sa.Column("body", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("hero_image_key", sa.String(500), nullable=True),
        sa.Column("category_id", postgresql.UUID(as_uuid=True),
                  sa.ForeignKey("category.id", ondelete="RESTRICT"), nullable=True),
        sa.Column("author_id", postgresql.UUID(as_uuid=True),
                  sa.ForeignKey("author.id", ondelete="RESTRICT"), nullable=True),
        sa.Column("status", sa.String(20), nullable=False, server_default="draft"),
        sa.Column("published_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("reading_time_min", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("seo", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        # search_vector — populated by trigger; GIN indexed for FTS
        sa.Column("search_vector", postgresql.TSVECTOR(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False,
                  server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False,
                  server_default=sa.text("now()")),
        sa.Column("created_by", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("updated_by", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("version", sa.Integer(), nullable=False, server_default="1"),
        sa.UniqueConstraint("slug", name="uq_article_slug"),
    )
    op.create_index("ix_article_org_id", "article", ["org_id"])
    op.create_index("ix_article_status_published_at", "article", ["status", "published_at"])
    op.create_index("ix_article_category_id", "article", ["category_id"])
    op.create_index("ix_article_author_id", "article", ["author_id"])
    op.create_index("ix_article_search_vector_gin", "article", ["search_vector"],
                    postgresql_using="gin")
    # Expression-based GIN FTS index on title + excerpt (§9.4)
    op.execute(
        "CREATE INDEX ix_article_fts ON article "
        "USING GIN (to_tsvector('english', coalesce(title,'') || ' ' || coalesce(excerpt,'')))"
    )

    # Trigger to keep search_vector up-to-date on INSERT/UPDATE
    op.execute(
        """
        CREATE FUNCTION article_search_vector_update() RETURNS trigger
            LANGUAGE plpgsql AS $$
        BEGIN
            NEW.search_vector :=
                to_tsvector('english',
                    coalesce(NEW.title, '') || ' ' || coalesce(NEW.excerpt, ''));
            RETURN NEW;
        END;
        $$
        """
    )
    op.execute(
        """
        CREATE TRIGGER tg_article_search_vector
            BEFORE INSERT OR UPDATE OF title, excerpt
            ON article
            FOR EACH ROW EXECUTE FUNCTION article_search_vector_update()
        """
    )

    # ─────────────────────────────────────────────────────────────────────────
    # 9. article_tag  (FK → article, tag)
    # ─────────────────────────────────────────────────────────────────────────
    op.create_table(
        "article_tag",
        sa.Column("article_id", postgresql.UUID(as_uuid=True),
                  sa.ForeignKey("article.id", ondelete="CASCADE"), primary_key=True),
        sa.Column("tag_id", postgresql.UUID(as_uuid=True),
                  sa.ForeignKey("tag.id", ondelete="CASCADE"), primary_key=True),
    )
    op.create_index("ix_article_tag_tag_id", "article_tag", ["tag_id"])
    op.create_index("ix_article_tag_article_id", "article_tag", ["article_id"])

    # ─────────────────────────────────────────────────────────────────────────
    # 10. article_version  (FK → article)
    # ─────────────────────────────────────────────────────────────────────────
    op.create_table(
        "article_version",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True,
                  server_default=sa.text("gen_random_uuid()")),
        sa.Column("article_id", postgresql.UUID(as_uuid=True),
                  sa.ForeignKey("article.id", ondelete="CASCADE"), nullable=False),
        sa.Column("version", sa.Integer(), nullable=False),
        sa.Column("snapshot", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("changed_by", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False,
                  server_default=sa.text("now()")),
    )
    op.create_index("ix_article_version_article_id", "article_version", ["article_id"])
    op.create_index("ix_article_version_article_version", "article_version",
                    ["article_id", "version"])

    # ─────────────────────────────────────────────────────────────────────────
    # 11. knowledge_category  (no FK deps)
    # ─────────────────────────────────────────────────────────────────────────
    op.create_table(
        "knowledge_category",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True,
                  server_default=sa.text("gen_random_uuid()")),
        sa.Column("org_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("slug", sa.String(255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False,
                  server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False,
                  server_default=sa.text("now()")),
        sa.Column("created_by", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("updated_by", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("version", sa.Integer(), nullable=False, server_default="1"),
        sa.UniqueConstraint("slug", name="uq_knowledge_category_slug"),
    )
    op.create_index("ix_knowledge_category_org_id", "knowledge_category", ["org_id"])

    # ─────────────────────────────────────────────────────────────────────────
    # 12. knowledge_item  (FK → knowledge_category, author)
    # ─────────────────────────────────────────────────────────────────────────
    op.create_table(
        "knowledge_item",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True,
                  server_default=sa.text("gen_random_uuid()")),
        sa.Column("org_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("slug", sa.String(255), nullable=False),
        sa.Column("title", sa.String(500), nullable=False),
        sa.Column("excerpt", sa.Text(), nullable=True),
        sa.Column("body", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("hero_image_key", sa.String(500), nullable=True),
        sa.Column("knowledge_category_id", postgresql.UUID(as_uuid=True),
                  sa.ForeignKey("knowledge_category.id", ondelete="RESTRICT"), nullable=True),
        sa.Column("author_id", postgresql.UUID(as_uuid=True),
                  sa.ForeignKey("author.id", ondelete="RESTRICT"), nullable=True),
        sa.Column("doc_type", sa.String(20), nullable=False, server_default="guide"),
        sa.Column("status", sa.String(20), nullable=False, server_default="draft"),
        sa.Column("published_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("reading_time_min", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("seo", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        # search_vector — populated by trigger; GIN indexed for FTS
        sa.Column("search_vector", postgresql.TSVECTOR(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False,
                  server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False,
                  server_default=sa.text("now()")),
        sa.Column("created_by", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("updated_by", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("version", sa.Integer(), nullable=False, server_default="1"),
        sa.UniqueConstraint("slug", name="uq_knowledge_item_slug"),
    )
    op.create_index("ix_knowledge_item_org_id", "knowledge_item", ["org_id"])
    op.create_index("ix_knowledge_item_status_published_at", "knowledge_item",
                    ["status", "published_at"])
    op.create_index("ix_knowledge_item_knowledge_category_id", "knowledge_item",
                    ["knowledge_category_id"])
    op.create_index("ix_knowledge_item_author_id", "knowledge_item", ["author_id"])
    op.create_index("ix_knowledge_item_search_vector_gin", "knowledge_item",
                    ["search_vector"], postgresql_using="gin")
    op.execute(
        "CREATE INDEX ix_knowledge_item_fts ON knowledge_item "
        "USING GIN (to_tsvector('english', coalesce(title,'') || ' ' || coalesce(excerpt,'')))"
    )

    # Trigger to keep knowledge_item.search_vector up-to-date
    op.execute(
        """
        CREATE FUNCTION knowledge_item_search_vector_update() RETURNS trigger
            LANGUAGE plpgsql AS $$
        BEGIN
            NEW.search_vector :=
                to_tsvector('english',
                    coalesce(NEW.title, '') || ' ' || coalesce(NEW.excerpt, ''));
            RETURN NEW;
        END;
        $$
        """
    )
    op.execute(
        """
        CREATE TRIGGER tg_knowledge_item_search_vector
            BEFORE INSERT OR UPDATE OF title, excerpt
            ON knowledge_item
            FOR EACH ROW EXECUTE FUNCTION knowledge_item_search_vector_update()
        """
    )

    # ─────────────────────────────────────────────────────────────────────────
    # 13. knowledge_item_tag  (FK → knowledge_item, tag)
    # ─────────────────────────────────────────────────────────────────────────
    op.create_table(
        "knowledge_item_tag",
        sa.Column("knowledge_item_id", postgresql.UUID(as_uuid=True),
                  sa.ForeignKey("knowledge_item.id", ondelete="CASCADE"), primary_key=True),
        sa.Column("tag_id", postgresql.UUID(as_uuid=True),
                  sa.ForeignKey("tag.id", ondelete="CASCADE"), primary_key=True),
    )
    op.create_index("ix_knowledge_item_tag_knowledge_item_id", "knowledge_item_tag",
                    ["knowledge_item_id"])
    op.create_index("ix_knowledge_item_tag_tag_id", "knowledge_item_tag", ["tag_id"])

    # ─────────────────────────────────────────────────────────────────────────
    # 14. faq_category  (no FK deps)
    # ─────────────────────────────────────────────────────────────────────────
    op.create_table(
        "faq_category",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True,
                  server_default=sa.text("gen_random_uuid()")),
        sa.Column("org_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("slug", sa.String(255), nullable=False),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False,
                  server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False,
                  server_default=sa.text("now()")),
        sa.Column("created_by", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("updated_by", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("version", sa.Integer(), nullable=False, server_default="1"),
        sa.UniqueConstraint("slug", name="uq_faq_category_slug"),
    )
    op.create_index("ix_faq_category_org_id", "faq_category", ["org_id"])

    # ─────────────────────────────────────────────────────────────────────────
    # 15. faq  (FK → faq_category)
    # ─────────────────────────────────────────────────────────────────────────
    op.create_table(
        "faq",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True,
                  server_default=sa.text("gen_random_uuid()")),
        sa.Column("org_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("faq_category_id", postgresql.UUID(as_uuid=True),
                  sa.ForeignKey("faq_category.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("question", sa.Text(), nullable=False),
        sa.Column("answer", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("status", sa.String(20), nullable=False, server_default="published"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False,
                  server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False,
                  server_default=sa.text("now()")),
        sa.Column("created_by", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("updated_by", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("version", sa.Integer(), nullable=False, server_default="1"),
    )
    op.create_index("ix_faq_org_id", "faq", ["org_id"])
    op.create_index("ix_faq_faq_category_id", "faq", ["faq_category_id"])
    op.create_index("ix_faq_status", "faq", ["status"])

    # ─────────────────────────────────────────────────────────────────────────
    # 16. department  (no FK deps)
    # ─────────────────────────────────────────────────────────────────────────
    op.create_table(
        "department",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True,
                  server_default=sa.text("gen_random_uuid()")),
        sa.Column("org_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("slug", sa.String(255), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False,
                  server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False,
                  server_default=sa.text("now()")),
        sa.Column("created_by", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("updated_by", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("version", sa.Integer(), nullable=False, server_default="1"),
        sa.UniqueConstraint("slug", name="uq_department_slug"),
    )
    op.create_index("ix_department_org_id", "department", ["org_id"])

    # ─────────────────────────────────────────────────────────────────────────
    # 17. job  (FK → department)
    # ─────────────────────────────────────────────────────────────────────────
    op.create_table(
        "job",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True,
                  server_default=sa.text("gen_random_uuid()")),
        sa.Column("org_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("slug", sa.String(255), nullable=False),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("department_id", postgresql.UUID(as_uuid=True),
                  sa.ForeignKey("department.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("location", sa.String(255), nullable=True),
        sa.Column("location_type", sa.String(20), nullable=False, server_default="onsite"),
        sa.Column("employment_type", sa.String(20), nullable=False),
        sa.Column("experience_level", sa.String(50), nullable=True),
        sa.Column("description", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("responsibilities", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("requirements", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("benefits", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("salary_min_minor", sa.BigInteger(), nullable=True),
        sa.Column("salary_max_minor", sa.BigInteger(), nullable=True),
        sa.Column("currency", sa.String(3), nullable=False, server_default="INR"),
        sa.Column("status", sa.String(20), nullable=False, server_default="open"),
        sa.Column("posted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("valid_through", sa.Date(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False,
                  server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False,
                  server_default=sa.text("now()")),
        sa.Column("created_by", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("updated_by", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("version", sa.Integer(), nullable=False, server_default="1"),
        sa.UniqueConstraint("slug", name="uq_job_slug"),
    )
    op.create_index("ix_job_org_id", "job", ["org_id"])
    op.create_index("ix_job_status_posted_at", "job", ["status", "posted_at"])
    op.create_index("ix_job_department_id", "job", ["department_id"])
    op.create_index("ix_job_slug", "job", ["slug"], unique=True)

    # ─────────────────────────────────────────────────────────────────────────
    # 18. job_application  (FK → job)
    # ─────────────────────────────────────────────────────────────────────────
    op.create_table(
        "job_application",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True,
                  server_default=sa.text("gen_random_uuid()")),
        sa.Column("org_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("job_id", postgresql.UUID(as_uuid=True),
                  sa.ForeignKey("job.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("full_name", sa.String(255), nullable=False),
        sa.Column("email", sa.String(254), nullable=False),
        sa.Column("phone", sa.String(20), nullable=True),
        sa.Column("resume_key", sa.String(500), nullable=True),
        sa.Column("cover_note", sa.Text(), nullable=True),
        sa.Column("linkedin_url", sa.String(500), nullable=True),
        sa.Column("portfolio_url", sa.String(500), nullable=True),
        sa.Column("status", sa.String(20), nullable=False, server_default="received"),
        sa.Column("reference_code", sa.String(64), nullable=False),
        sa.Column("consent", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("context", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False,
                  server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False,
                  server_default=sa.text("now()")),
        sa.Column("created_by", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("updated_by", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        # No version column — status transitions are the record (per design)
        sa.UniqueConstraint("reference_code", name="uq_job_application_reference_code"),
    )
    op.create_index("ix_job_application_org_id", "job_application", ["org_id"])
    op.create_index("ix_job_application_job_id", "job_application", ["job_id"])
    op.create_index("ix_job_application_email", "job_application", ["email"])
    op.create_index("ix_job_application_status", "job_application", ["status"])
    op.create_index("ix_job_application_reference_code", "job_application",
                    ["reference_code"], unique=True)
    op.create_index("ix_job_application_context_gin", "job_application",
                    ["context"], postgresql_using="gin")

    # ─────────────────────────────────────────────────────────────────────────
    # 19. outbox_event  (append-only log — no soft-delete, no version)
    # ─────────────────────────────────────────────────────────────────────────
    op.create_table(
        "outbox_event",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True,
                  server_default=sa.text("gen_random_uuid()")),
        sa.Column("org_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("aggregate_type", sa.String(50), nullable=False),
        sa.Column("aggregate_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("event_type", sa.String(100), nullable=False),
        sa.Column("payload", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("occurred_at", sa.DateTime(timezone=True), nullable=False,
                  server_default=sa.text("now()")),
        sa.Column("published_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("attempts", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("status", sa.String(20), nullable=False, server_default="pending"),
    )
    op.create_index("ix_outbox_event_org_id", "outbox_event", ["org_id"])
    op.create_index("ix_outbox_event_status_occurred_at", "outbox_event",
                    ["status", "occurred_at"])
    op.create_index("ix_outbox_event_aggregate_id", "outbox_event", ["aggregate_id"])
    op.create_index("ix_outbox_event_event_type", "outbox_event", ["event_type"])

    # ─────────────────────────────────────────────────────────────────────────
    # 20. redirect  (no FK deps)
    # ─────────────────────────────────────────────────────────────────────────
    op.create_table(
        "redirect",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True,
                  server_default=sa.text("gen_random_uuid()")),
        sa.Column("org_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("from_path", sa.String(500), nullable=False),
        sa.Column("to_path", sa.String(500), nullable=False),
        sa.Column("status_code", sa.SmallInteger(), nullable=False, server_default="301"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False,
                  server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False,
                  server_default=sa.text("now()")),
        sa.Column("created_by", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("updated_by", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("version", sa.Integer(), nullable=False, server_default="1"),
        sa.UniqueConstraint("from_path", name="uq_redirect_from_path"),
    )
    op.create_index("ix_redirect_org_id", "redirect", ["org_id"])
    op.create_index("ix_redirect_from_path", "redirect", ["from_path"], unique=True)

    # ─────────────────────────────────────────────────────────────────────────
    # 21. admin_user  (no FK deps — dormant operator auth)
    # ─────────────────────────────────────────────────────────────────────────
    op.create_table(
        "admin_user",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True,
                  server_default=sa.text("gen_random_uuid()")),
        sa.Column("org_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("email", sa.String(254), nullable=False),
        sa.Column("role", sa.String(50), nullable=False, server_default="editor"),
        sa.Column("password_hash", sa.String(255), nullable=True),
        sa.Column("disabled", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False,
                  server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False,
                  server_default=sa.text("now()")),
        sa.Column("created_by", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("updated_by", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("version", sa.Integer(), nullable=False, server_default="1"),
        sa.UniqueConstraint("email", name="uq_admin_user_email"),
    )
    op.create_index("ix_admin_user_org_id", "admin_user", ["org_id"])


def downgrade() -> None:
    """Drop all tables in reverse dependency order.

    Leaf tables (those with FKs pointing at other tables) are dropped first
    so that no FK constraint violation occurs.  Triggers and functions are
    dropped before the tables they reference.
    """
    # Drop triggers and functions before tables
    op.execute("DROP TRIGGER IF EXISTS tg_knowledge_item_search_vector ON knowledge_item")
    op.execute("DROP FUNCTION IF EXISTS knowledge_item_search_vector_update()")
    op.execute("DROP TRIGGER IF EXISTS tg_article_search_vector ON article")
    op.execute("DROP FUNCTION IF EXISTS article_search_vector_update()")

    # ── Infra / integration ──────────────────────────────────────────────────
    op.drop_table("admin_user")
    op.drop_table("redirect")
    op.drop_table("outbox_event")

    # ── Careers ──────────────────────────────────────────────────────────────
    op.drop_table("job_application")
    op.drop_table("job")
    op.drop_table("department")

    # ── FAQ ───────────────────────────────────────────────────────────────────
    op.drop_table("faq")
    op.drop_table("faq_category")

    # ── Knowledge ────────────────────────────────────────────────────────────
    op.drop_table("knowledge_item_tag")
    op.drop_table("knowledge_item")
    op.drop_table("knowledge_category")

    # ── Blog ─────────────────────────────────────────────────────────────────
    op.drop_table("article_version")
    op.drop_table("article_tag")
    op.drop_table("article")
    op.drop_table("tag")
    op.drop_table("category")
    op.drop_table("author")

    # ── Newsletter ────────────────────────────────────────────────────────────
    op.drop_table("newsletter_subscriber")

    # ── Booking / Lead ────────────────────────────────────────────────────────
    op.drop_table("consultation")
    op.drop_table("lead")
    op.drop_table("utm_attribution")
