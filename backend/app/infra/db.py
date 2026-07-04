"""
Database infrastructure — SQLAlchemy 2.0 async engine and session factory.
"""
from __future__ import annotations

from collections.abc import AsyncIterator
from datetime import datetime, timezone
from functools import lru_cache

from sqlalchemy import MetaData, event, inspect
from sqlalchemy.ext.asyncio import (
    AsyncAttrs,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase

from app.config import get_settings

# ── Naming conventions ────────────────────────────────────────────────────────
_NAMING_CONVENTION: dict[str, str] = {
    "ix": "ix_%(column_0_label)s",
    "uq": "uq_%(table_name)s_%(column_0_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s",
}

_metadata = MetaData(naming_convention=_NAMING_CONVENTION)


# ── Declarative Base ──────────────────────────────────────────────────────────
class Base(AsyncAttrs, DeclarativeBase):
    metadata = _metadata


# ── Engine (lazy — built on first request, not at import time) ────────────────
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
    return _build_engine()


# Module-level alias (does NOT call _build_engine at import time)
engine = property(get_engine)


# ── Session factory (lazy) ────────────────────────────────────────────────────
@lru_cache(maxsize=1)
def _build_session_maker():
    return async_sessionmaker(
        bind=_build_engine(),
        class_=AsyncSession,
        expire_on_commit=False,
        autoflush=False,
        autocommit=False,
    )


# Aliases used across the codebase
def get_session_maker():
    return _build_session_maker()


# These are called lazily via get_session_maker()
AsyncSessionLocal = _build_session_maker
AsyncSessionFactory = _build_session_maker


# ── FastAPI dependency ────────────────────────────────────────────────────────
async def get_db_session() -> AsyncIterator[AsyncSession]:
    """Yield an async DB session; commit on success, rollback on exception."""
    async with _build_session_maker()() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise


get_db = get_db_session


# ── updated_at auto-bump ──────────────────────────────────────────────────────
@event.listens_for(Base, "before_update", propagate=True)
def _bump_updated_at(mapper, connection, target):  # noqa: ARG001
    try:
        insp = inspect(type(target))
        if "updated_at" in [c.key for c in insp.mapper.column_attrs]:
            target.updated_at = datetime.now(timezone.utc)
    except Exception:
        pass


__all__ = [
    "Base",
    "get_engine",
    "AsyncSessionLocal",
    "AsyncSessionFactory",
    "AsyncSession",
    "get_db_session",
    "get_db",
    "get_session_maker",
]
