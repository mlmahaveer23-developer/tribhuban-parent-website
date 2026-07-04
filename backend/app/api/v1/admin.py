"""
Admin API router — internal content authoring endpoints.

All routes are protected by an operator auth guard:
  - When ``ADMIN_AUTH_ENABLED=false`` (default / development): every endpoint
    returns HTTP 401 with a clear message so callers know the API exists but
    is intentionally disabled.
  - When ``ADMIN_AUTH_ENABLED=true``: a real authentication check is applied
    (token validation to be wired in a future task).  Until that logic is
    implemented the guard still returns HTTP 401 to prevent accidental exposure.

This satisfies Requirement 26.6: the admin API surface is structurally present
and guarded from day one; full auth is added when the flag is enabled in a
production environment.

Requirements: 6.10, 26.6
"""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException

from app.config import Settings, get_settings

router = APIRouter(prefix="/admin", tags=["admin"])


# ── Auth guard ────────────────────────────────────────────────────────────────


async def _require_admin_auth(
    settings: Settings = Depends(get_settings),
) -> None:
    """Dependency that enforces operator authentication on every admin route.

    Behaviour
    ---------
    - ``admin_auth_enabled=False``:
        Raises HTTP 401 "Admin API is not enabled".
        This is the default/dev posture — the routes exist but are intentionally
        disabled until the operator explicitly enables and configures auth.

    - ``admin_auth_enabled=True``:
        Raises HTTP 401 "Unauthorized".
        Placeholder for real token/credential validation (future task).
        Keeps the guard strict so no route can be reached without auth logic.

    Raises:
        HTTPException(401): Always — until real auth is wired.
    """
    if not settings.admin_auth_enabled:
        raise HTTPException(
            status_code=401,
            detail="Admin API is not enabled. Set ADMIN_AUTH_ENABLED=true to activate.",
        )
    # Real authentication logic (API key / JWT validation) will be added here
    # when ADMIN_AUTH_ENABLED=true is deployed.  Until then, remain 401.
    raise HTTPException(
        status_code=401,
        detail="Unauthorized. Admin authentication is not yet configured.",
    )


# ── Stub endpoints ────────────────────────────────────────────────────────────
#
# Each endpoint declares _require_admin_auth as a dependency so FastAPI
# enforces the guard before the handler body executes.  The handler bodies
# are intentional ``...`` stubs — they are unreachable until the guard passes.
#
# Response models and full implementations are added in a future task once
# ADMIN_AUTH_ENABLED=true auth is configured.


@router.get(
    "/leads",
    summary="[Admin] List all leads",
    description=(
        "Returns paginated lead records. "
        "Requires operator authentication (ADMIN_AUTH_ENABLED=true)."
    ),
    dependencies=[Depends(_require_admin_auth)],
    status_code=200,
)
async def admin_list_leads() -> dict:
    """Stub: list all leads (admin-only)."""
    ...  # pragma: no cover


@router.get(
    "/leads/{lead_id}",
    summary="[Admin] Get lead by ID",
    description=(
        "Returns a single lead record including status. "
        "Requires operator authentication (ADMIN_AUTH_ENABLED=true)."
    ),
    dependencies=[Depends(_require_admin_auth)],
    status_code=200,
)
async def admin_get_lead(lead_id: str) -> dict:
    """Stub: get a single lead by ID (admin-only)."""
    ...  # pragma: no cover


@router.get(
    "/consultations",
    summary="[Admin] List all consultations",
    description=(
        "Returns paginated consultation records including PII. "
        "Requires operator authentication (ADMIN_AUTH_ENABLED=true)."
    ),
    dependencies=[Depends(_require_admin_auth)],
    status_code=200,
)
async def admin_list_consultations() -> dict:
    """Stub: list all consultations (admin-only)."""
    ...  # pragma: no cover


@router.get(
    "/applications",
    summary="[Admin] List all job applications",
    description=(
        "Returns paginated job application records. "
        "Requires operator authentication (ADMIN_AUTH_ENABLED=true)."
    ),
    dependencies=[Depends(_require_admin_auth)],
    status_code=200,
)
async def admin_list_applications() -> dict:
    """Stub: list all job applications (admin-only)."""
    ...  # pragma: no cover
