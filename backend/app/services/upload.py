"""
Upload service — presigned S3 PUT URL generation for resume uploads.

UploadService.create_presign(file_type, file_size, org_id):
  1. Validate file_type ∈ {pdf, doc, docx} → 422 if not (Req 12.2)
  2. Validate file_size 1..5242880 → 422 if out of range (Req 12.3)
  3. Generate unique S3 object key
  4. Generate presigned S3 PUT URL (900 s expiry) via boto3
     Dev mode: return a fake URL if aws_access_key_id is empty
  5. Store the key in Redis with TTL 3600 s:
       redis.setex("presign:{key}", 3600, "1")
     so that CareerService can later verify the key is fresh (Req 12.4)
  6. Return PresignResponse(url, key, expires_in=900)

Requirements: 12.1, 12.2, 12.3, 12.4
"""
from __future__ import annotations

import logging
import uuid

from fastapi import HTTPException, status

from app.config import get_settings
from app.schemas.careers import PresignRequest, PresignResponse

logger = logging.getLogger(__name__)

# ── Constants ─────────────────────────────────────────────────────────────────

_PRESIGN_EXPIRY_SECONDS: int = 900        # 15 minutes — URL lifetime (Req 12.1)
_RESUME_KEY_TTL_SECONDS: int = 3600       # 60 minutes — Redis key TTL (Req 12.4)
_CONTENT_TYPE_MAP: dict[str, str] = {
    "pdf": "application/pdf",
    "doc": "application/msword",
    "docx": (
        "application/vnd.openxmlformats-officedocument"
        ".wordprocessingml.document"
    ),
}
_REDIS_KEY_PREFIX: str = "presign:"


class UploadService:
    """Generates presigned S3 PUT URLs for resume uploads.

    After generating a presigned URL the service stores the object key in Redis
    with a 3600-second TTL so ``CareerService`` can verify the key originates
    from a recent presign when processing applications (Req 12.4).

    Dev mode:
        When ``aws_access_key_id`` is empty in settings, a mock URL is returned
        so the API is testable without real AWS credentials.  The Redis key is
        still stored in dev mode.

    Usage::

        service = UploadService()
        response = await service.create_presign(
            PresignRequest(file_type="pdf", file_size=102400), org_id=org_id
        )
    """

    async def create_presign(
        self,
        request: PresignRequest,
        org_id: uuid.UUID | None = None,
    ) -> PresignResponse:
        """Generate a presigned S3 PUT URL for a resume file.

        Validation of file_type and file_size is enforced at the Pydantic schema
        layer (:class:`PresignRequest`), but values are re-checked here as a
        service-level defence-in-depth guard.

        Args:
            request: Validated :class:`PresignRequest` with file_type and file_size.
            org_id:  Organisation UUID (unused for key scoping in MVP but accepted
                     for future multi-tenant isolation).

        Returns:
            :class:`PresignResponse` with url, key, and expires_in=900.

        Raises:
            HTTPException(422): For invalid file_type or file_size.
            HTTPException(503): If S3 presign generation fails in production mode.
        """
        settings = get_settings()

        # ── Service-level validation (defence-in-depth) ───────────────────────
        file_type = request.file_type.lower()
        if file_type not in {"pdf", "doc", "docx"}:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=(
                    f"Unsupported file type '{request.file_type}'. "
                    "Allowed: pdf, doc, docx."
                ),
            )
        if request.file_size < 1 or request.file_size > 5_242_880:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="file_size must be between 1 and 5,242,880 bytes (5 MB).",
            )

        # ── Generate unique object key ────────────────────────────────────────
        object_key = f"resumes/{uuid.uuid4()}.{file_type}"

        # ── Generate presigned URL ────────────────────────────────────────────
        if not settings.aws_access_key_id:
            # Dev mode: return a mock URL without hitting AWS
            logger.info(
                "Dev mode: returning mock presign URL for key=%s type=%s size=%d",
                object_key,
                file_type,
                request.file_size,
            )
            presigned_url = (
                f"http://localhost:9000/{settings.s3_bucket_name}/{object_key}"
                f"?X-Amz-Expires={_PRESIGN_EXPIRY_SECONDS}&mock=1"
            )
        else:
            # Production: generate a real presigned URL via boto3
            try:
                import boto3  # noqa: PLC0415

                s3_client = boto3.client(
                    "s3",
                    region_name=settings.aws_region,
                    aws_access_key_id=settings.aws_access_key_id,
                    aws_secret_access_key=settings.aws_secret_access_key,
                )

                content_type = _CONTENT_TYPE_MAP.get(
                    file_type, "application/octet-stream"
                )

                presigned_url = s3_client.generate_presigned_url(
                    "put_object",
                    Params={
                        "Bucket": settings.s3_bucket_name,
                        "Key": object_key,
                        "ContentType": content_type,
                        "ContentLength": request.file_size,
                    },
                    ExpiresIn=_PRESIGN_EXPIRY_SECONDS,
                )

            except Exception as exc:
                logger.error(
                    "Failed to generate presigned URL: %s", exc, exc_info=True
                )
                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                    detail="Unable to generate upload URL. Please try again later.",
                ) from exc

        # ── Store key in Redis with TTL 3600 s (Req 12.4) ────────────────────
        # Format: "presign:{object_key}" → "1" with 3600 s TTL
        # CareerService checks this key to verify the resume was recently
        # presigned before accepting the application.
        await self._store_presign_key_in_redis(object_key)

        return PresignResponse(
            url=presigned_url,
            key=object_key,
            expires_in=_PRESIGN_EXPIRY_SECONDS,
        )

    async def _store_presign_key_in_redis(self, object_key: str) -> None:
        """Store ``presign:{object_key}`` in Redis with a 3600-second TTL.

        Failure to store is logged but does NOT abort the presign response —
        the fallback is that CareerService will reject applications whose key
        is not found in Redis (treating them as stale / not from a presign).
        """
        redis_key = f"{_REDIS_KEY_PREFIX}{object_key}"
        try:
            from app.infra.cache import redis_client  # noqa: PLC0415

            await redis_client.setex(redis_key, _RESUME_KEY_TTL_SECONDS, "1")
            logger.debug("Stored presign key in Redis: %s (TTL=%ds)", redis_key, _RESUME_KEY_TTL_SECONDS)
        except Exception as exc:
            # Non-fatal: log and continue so the upload URL is still returned.
            logger.warning(
                "Failed to store presign key in Redis [key=%s]: %s — "
                "application with this resume key will be rejected.",
                redis_key,
                exc,
            )

    @staticmethod
    async def verify_presign_key(object_key: str) -> bool:
        """Return True if the object key was issued by a presign within the last 3600 s.

        Used by :class:`CareerService` to validate resume keys on application
        submission (Req 12.4).

        Args:
            object_key: The S3 object key claimed by the applicant.

        Returns:
            ``True`` if the key exists in Redis (i.e. was issued within TTL),
            ``False`` otherwise.
        """
        redis_key = f"{_REDIS_KEY_PREFIX}{object_key}"
        try:
            from app.infra.cache import redis_client  # noqa: PLC0415

            value = await redis_client.get(redis_key)
            return value is not None
        except Exception as exc:
            logger.warning(
                "Failed to verify presign key in Redis [key=%s]: %s — "
                "treating as invalid.",
                redis_key,
                exc,
            )
            return False
