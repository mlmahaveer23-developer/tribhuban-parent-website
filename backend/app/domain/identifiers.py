"""
Domain identifier utilities — reference codes and UUIDs.

``generate_reference_code``        — single candidate (used by services).
``generate_unique_reference_code`` — collision-safe wrapper with retry.
``generate_uuid``                  — UUID4 primary key helper.
``get_or_404``                     — fetch helper that raises HTTP 404 on
                                     missing / soft-deleted rows.
"""
from __future__ import annotations

import secrets
import string
import uuid
from collections.abc import Awaitable, Callable
from typing import TypeVar

from fastapi import HTTPException

# Alphabet excludes visually ambiguous characters: 0/O and 1/I/L
_REF_CODE_ALPHABET: str = (
    string.ascii_uppercase.replace("O", "").replace("I", "").replace("L", "")
    + string.digits.replace("0", "").replace("1", "")
)
_REF_CODE_MAX_ATTEMPTS: int = 3

T = TypeVar("T")


# ── Helpers ───────────────────────────────────────────────────────────────────


def generate_uuid() -> str:
    """Generate a UUID4 primary key as a string."""
    return str(uuid.uuid4())


def generate_reference_code(length: int = 8) -> str:
    """Generate a short, unique, human-readable alphanumeric reference code.

    Uses uppercase letters and digits; excludes visually ambiguous characters
    (0, O, 1, I, L) so codes are unambiguous when read aloud or transcribed.
    Length is 8 by default, within the required 8–32 range.

    Uses ``secrets.choice`` for cryptographic randomness.

    For collision-safe generation use ``generate_unique_reference_code``.
    """
    return "".join(secrets.choice(_REF_CODE_ALPHABET) for _ in range(length))


async def generate_unique_reference_code(
    check_exists: Callable[[str], Awaitable[bool]],
    max_attempts: int = _REF_CODE_MAX_ATTEMPTS,
    length: int = 8,
) -> str:
    """Generate a reference code that does not already exist in the store.

    Calls *check_exists* with each candidate code.  If the code already exists,
    a new candidate is generated and retried up to *max_attempts* times.

    Args:
        check_exists:  Async callable that accepts a candidate code string and
                       returns ``True`` if that code is already taken.
        max_attempts:  Maximum number of attempts before giving up.
                       Defaults to ``_REF_CODE_MAX_ATTEMPTS`` (3).
        length:        Length of the generated code (default 8).

    Returns:
        A collision-free reference code string.

    Raises:
        RuntimeError: When a unique code cannot be found within *max_attempts*.
    """
    for attempt in range(1, max_attempts + 1):
        code = generate_reference_code(length=length)
        if not await check_exists(code):
            return code
    raise RuntimeError(
        f"Failed to generate a unique reference code after {max_attempts} attempts. "
        "This is extremely unlikely — check for a data integrity issue."
    )


async def get_or_404(
    fetch: Callable[[], Awaitable[T | None]],
    detail: str = "Resource not found.",
) -> T:
    """Call *fetch* and return the result; raise HTTP 404 if the result is ``None``.

    Intended for use in route handlers and services to provide a uniform
    soft-delete–aware 404 response without duplicating the ``if row is None``
    pattern everywhere.

    Example::

        consultation = await get_or_404(
            lambda: repo.find_by_reference_code(ref_code),
            detail="Consultation not found.",
        )

    Args:
        fetch:   Async zero-argument callable that returns the ORM row or
                 ``None`` when not found / soft-deleted.
        detail:  Human-readable error detail included in the HTTP 404 response.

    Returns:
        The non-``None`` result of *fetch*.

    Raises:
        HTTPException(404): When *fetch* returns ``None``.
    """
    result = await fetch()
    if result is None:
        raise HTTPException(status_code=404, detail=detail)
    return result
