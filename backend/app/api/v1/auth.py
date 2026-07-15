"""
Authentication endpoints — user identity verification.

GET /api/v1/auth/me  — returns current user identity from JWT token

The endpoint uses HTTP Bearer token authentication (Authorization: Bearer <token>).
The token is verified against Supabase JWT secret. Invalid or expired tokens
return HTTP 401 Unauthorized.

Response (success):
    {
        "id": "user-uuid",
        "email": "user@example.com",
        "role": "authenticated"
    }
"""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.infra.supabase import verify_supabase_token

router = APIRouter(prefix="/auth", tags=["auth"])
bearer = HTTPBearer()


# ── Auth dependencies ────────────────────────────────────────────────────────


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Security(bearer),
) -> dict:
    """Dependency that extracts and verifies the JWT token from Authorization header.

    Extracts the Bearer token from the Authorization header and verifies it
    against the Supabase JWT secret. Returns the decoded JWT payload containing
    user information.

    Args:
        credentials: HTTPAuthorizationCredentials extracted by HTTPBearer security

    Returns:
        dict: Decoded JWT payload with user claims (sub, email, role, etc.)

    Raises:
        HTTPException(401): If the token is invalid, expired, or verification fails
    """
    try:
        return verify_supabase_token(credentials.credentials)
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e)) from e


# ── Endpoints ────────────────────────────────────────────────────────────────


@router.get(
    "/me",
    summary="Get current user",
    description="Returns the identity of the authenticated user from the JWT token.",
    response_model=dict,
    responses={
        200: {
            "description": "Current user identity",
            "content": {
                "application/json": {
                    "example": {
                        "id": "550e8400-e29b-41d4-a716-446655440000",
                        "email": "user@example.com",
                        "role": "authenticated",
                    }
                }
            },
        },
        401: {"description": "Unauthorized — missing or invalid token"},
    },
)
def get_me(user: dict = Depends(get_current_user)) -> dict:
    """Get the current user's identity information.

    Requires a valid Bearer token in the Authorization header. The token must be
    a valid Supabase JWT signed with the configured JWT secret.

    Args:
        user: Decoded JWT payload injected by get_current_user dependency

    Returns:
        dict: User identity containing:
            - id: User UUID (from JWT "sub" claim)
            - email: User email address
            - role: User role (typically "authenticated" for Supabase Auth)

    Raises:
        HTTPException(401): If no valid Bearer token is provided
    """
    return {
        "id": user.get("sub"),
        "email": user.get("email"),
        "role": user.get("role"),
    }
