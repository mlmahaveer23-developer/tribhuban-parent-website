"""
Application configuration — loaded from environment variables.
All secrets are read at startup; missing required secrets raise a clear error.
"""
from functools import lru_cache
from typing import Literal

from pydantic import AnyHttpUrl, Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Pydantic-settings model for all application configuration."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ── Environment ──────────────────────────────────────────────────────────
    environment: Literal["development", "staging", "production"] = "development"
    debug: bool = False

    # ── Application ──────────────────────────────────────────────────────────
    app_name: str = "Tribhuban Parent Website API"
    app_version: str = "0.1.0"
    api_v1_prefix: str = "/api/v1"

    # ── CORS ─────────────────────────────────────────────────────────────────
    allowed_origins: list[str] = Field(
        default=["http://localhost:3000"],
        description="Explicit list of allowed CORS origins (website frontend origins only)",
    )

    # ── Database ─────────────────────────────────────────────────────────────
    database_url: str = Field(
        default="postgresql+asyncpg://postgres:postgres@localhost:5432/tribhuban",
        description="SQLAlchemy async database URL",
    )
    database_pool_size: int = 10
    database_max_overflow: int = 20
    database_pool_timeout: int = 30

    # ── Redis ─────────────────────────────────────────────────────────────────
    redis_url: str = Field(
        default="redis://localhost:6379/0",
        description="Redis connection URL",
    )
    redis_max_connections: int = 20

    # ── AWS ───────────────────────────────────────────────────────────────────
    aws_region: str = "ap-south-1"
    aws_access_key_id: str = Field(default="", description="AWS access key (set via env or IAM role)")
    aws_secret_access_key: str = Field(default="", description="AWS secret key (set via env or IAM role)")

    s3_bucket_name: str = Field(default="tribhuban-media", description="S3 bucket for media and uploads")
    s3_presign_expiry_seconds: int = 900     # 15 minutes for presigned upload URLs
    s3_resume_expiry_seconds: int = 3600     # 60 minutes for resume key validation

    ses_sender_email: str = Field(default="noreply@tribhubanconcepts.com", description="SES from address")
    ses_sender_name: str = "Tribhuban Concepts"

    # ── Security ─────────────────────────────────────────────────────────────
    secret_key: str = Field(
        default="change-me-in-production-must-be-at-least-32-chars-long!!",
        description="Secret key for signing tokens and internal webhooks",
    )
    revalidate_secret: str = Field(
        default="change-me-revalidation-secret",
        description="Shared secret for ISR on-demand revalidation webhook",
    )
    admin_auth_enabled: bool = Field(
        default=False,
        description="Enable admin API authentication (disable in dev, always on in production)",
    )

    # ── Rate limiting ─────────────────────────────────────────────────────────
    rate_limit_read_per_minute: int = 100
    rate_limit_write_per_minute: int = 20

    # ── Idempotency ───────────────────────────────────────────────────────────
    idempotency_ttl_seconds: int = 86400    # 24 hours

    # ── Newsletter ────────────────────────────────────────────────────────────
    newsletter_confirmation_ttl_hours: int = 72

    # ── Frontend ─────────────────────────────────────────────────────────────
    frontend_url: AnyHttpUrl = Field(
        default="http://localhost:3000",
        description="Frontend base URL for generating links in emails",
    )

    # ── Observability ─────────────────────────────────────────────────────────
    sentry_dsn: str = Field(default="", description="Sentry DSN (empty to disable)")
    otel_exporter_otlp_endpoint: str = Field(default="", description="OTLP endpoint (empty to disable)")

    # ── Organisation ──────────────────────────────────────────────────────────
    default_org_id: str = Field(
        default="00000000-0000-0000-0000-000000000001",
        description="Default organisation UUID (single-tenant MVP)",
    )

    @field_validator("secret_key")
    @classmethod
    def secret_key_must_be_strong(cls, v: str) -> str:
        if len(v) < 32:
            raise ValueError("secret_key must be at least 32 characters long")
        return v

    def is_production(self) -> bool:
        return self.environment == "production"

    def validate_production_secrets(self) -> None:
        """Call at startup to ensure required production secrets are set."""
        if not self.is_production():
            return
        errors: list[str] = []
        if "change-me" in self.secret_key:
            errors.append("SECRET_KEY must be changed in production")
        if not self.aws_access_key_id and not self.aws_secret_access_key:
            # IAM role is acceptable — skip if both are empty (assume role-based auth)
            pass
        # SENTRY_DSN is optional — only warn, never block startup
        if errors:
            raise RuntimeError(
                "Production secrets validation failed:\n" + "\n".join(f"  - {e}" for e in errors)
            )


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Return cached Settings instance. Use as a FastAPI dependency."""
    return Settings()
