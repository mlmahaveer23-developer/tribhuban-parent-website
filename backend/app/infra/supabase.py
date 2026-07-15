"""
Supabase JWT verification for backend API authentication.

This module provides utilities to verify JWT tokens issued by Supabase Auth.
Tokens are decoded using the Supabase JWT secret and validated against the
expected audience and algorithm.
"""

from jose import JWTError, jwt

from app.config import settings

# ── Constants ────────────────────────────────────────────────────────────────
SUPABASE_JWT_ALGORITHM = "HS256"


# ── JWT Verification ────────────────────────────────────────────────────────
def verify_supabase_token(token: str) -> dict:
    """
    Verify a Supabase JWT and return the decoded payload.

    This function decodes a JWT token using the Supabase JWT secret and validates:
    - The signature using HS256 algorithm
    - The audience is "authenticated" (standard Supabase auth audience)
    - The token has not expired

    Args:
        token: The JWT token string to verify

    Returns:
        dict: The decoded JWT payload containing user and session information

    Raises:
        ValueError: If the token is invalid, expired, or verification fails.
                   The error message is safe to expose to clients.

    Example:
        >>> try:
        ...     payload = verify_supabase_token(request.headers.get("Authorization"))
        ...     user_id = payload.get("sub")
        ... except ValueError:
        ...     raise HTTPException(status_code=401, detail="Unauthorized")
    """
    try:
        payload = jwt.decode(
            token,
            settings.supabase_jwt_secret,
            algorithms=[SUPABASE_JWT_ALGORITHM],
            audience="authenticated",
        )
        return payload
    except JWTError as e:
        raise ValueError(f"Invalid token: {e}") from e


# ── Module Exports ──────────────────────────────────────────────────────────
__all__ = ["verify_supabase_token"]
