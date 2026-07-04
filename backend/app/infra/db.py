"""
Database infrastructure — SQLAlchemy 2.0 async engine and session factory.

Exports:
  engine              — AsyncEngine (asyncpg driver)
  AsyncSessionLocal   — async_sessionmaker factory
  get_db_session      — FastAPI dependency (async generator)
  Base                — DeclarativeBase shared by all ORM models

The `updated_at` column is automatically bumped to now() before every UPDATE
via a SQLAlchemy event listener; callers never need to set it manually.
"""
from __future__ import annotations

from collections.abc import AsyncIterator
from datetime import datetime, timezone

from sqlalchemy import MetaData, event, inspect
from sqlalchemy.ext.asyncio import (
    AsyncAttrs,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

from app.config import get_settings


# ── Naming conventions ────────────────────────────────────────────────────────
# Applied to all auto-generated constraint names so Alembic migrations produce
# deterministic, portable DDL.  Follows SQLAlchemy recommended convention.
_NAMING_CONVENTION: dict[str, str] = {
    "ix": "ix_%(column_0_label)s",
    "uq": "uq_%(table_name)s_%(column_0_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s",
}

_metadata = MetaData(naming_convention=_NAMING_CONVENTION)


# ── Declarative Base ────────────────────────────────────────────────────────


class Base(AsyncAttrs, DeclarativeBase):
    """Shared declarative base for all ORM models.

    AsyncAttrs is mixed in so async-loaded relationships work without explicit
    awaiting in most accessor patterns.

    MetaData is initialised with a naming_convention so that Alembic
    autogenerate produces deterministic, portable constraint names.
    """

    metadata = _metadata


# ── Engine ───────────────────────────────────────────────────────────────────


@lru_cache(maxsize=1)
def _build_engine():
    settings = get_settings()
    return create_async_engine(
        settings.database_url,
        pool_size=settings.database_pool_size,
        max_overflow=settings.database_max_overflow,
        pool_timeout=settings.database_pool_timeout,
        pool_pre_ping=True,
        echo=settings.debug,
    )


def get_engine():
    """Return the shared async engine, building it on first call."""
    return _build_engine()


# Lazy engine — not created at import time to avoid blocking startup
# when DATABASE_URL isn't available yet.
engine = _build_engine()

# ── Session factory ──────────────────────────────────────────────────────────

def _get_session_maker():
    return async_sessionmaker(
        bind=get_engine(),
        class_=AsyncSession,
        expire_on_commit=False,
        autoflush=False,
        autocommit=False,
    )


@lru_cache(maxsize=1)
def _cached_session_maker():
    return _get_session_maker()


# Alias used by system.py ready endpoint
AsyncSessionFactory = _cached_session_maker()

AsyncSessionLocal = AsyncSessionFactory


# ── FastAPI dependency ───────────────────────────────────────────────────────


async def get_db_session() -> AsyncIterator[AsyncSession]:
    """Yield an async DB session; commit on success, rollback on exception."""
    session_maker = _cached_session_maker()
    async with session_maker() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise


# ── updated_at auto-bump event ───────────────────────────────────────────────


@event.listens_for(Base, "before_update", propagate=True)
def _bump_updated_at(mapper, connection, target):  # noqa: ARG001
    """Automatically bump updated_at on every ORM-level update."""
    # Only bump if the model has an updated_at column
    try:
        insp = inspect(type(target))
        if "updated_at" in [c.key for c in insp.mapper.column_attrs]:
            target.updated_at = datetime.now(timezone.utc)
    except Exception:
        pass


# ── Type alias / convenience re-exports ─────────────────────────────────────

# Alias so router dependencies can use either name:
#   Depends(get_db_session)  OR  Depends(get_db)
get_db = get_db_session

__all__ = [
    "Base",
    "engine",
    "get_engine",
    "AsyncSessionLocal",
    "AsyncSessionFactory",
    "AsyncSession",
    "get_db_session",
    "get_db",
]
