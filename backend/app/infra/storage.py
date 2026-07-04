"""
Storage infrastructure — AWS S3 client and presigned URL helpers.
"""
from functools import lru_cache

import boto3
from botocore.client import Config

from app.config import get_settings


@lru_cache(maxsize=1)
def get_s3_client():
    """Return a cached boto3 S3 client."""
    settings = get_settings()
    kwargs: dict = {
        "region_name": settings.aws_region,
        "config": Config(signature_version="s3v4"),
    }
    if settings.aws_access_key_id and settings.aws_secret_access_key:
        kwargs["aws_access_key_id"] = settings.aws_access_key_id
        kwargs["aws_secret_access_key"] = settings.aws_secret_access_key
    return boto3.client("s3", **kwargs)


def generate_presigned_put_url(object_key: str, content_type: str, expiry_seconds: int) -> str:
    """Generate a presigned S3 PUT URL for direct client upload."""
    s3 = get_s3_client()
    settings = get_settings()
    url: str = s3.generate_presigned_url(
        "put_object",
        Params={
            "Bucket": settings.s3_bucket_name,
            "Key": object_key,
            "ContentType": content_type,
        },
        ExpiresIn=expiry_seconds,
        HttpMethod="PUT",
    )
    return url


def get_object_metadata(object_key: str) -> dict:
    """Return S3 object metadata (content-type, content-length) for validation."""
    s3 = get_s3_client()
    settings = get_settings()
    response = s3.head_object(Bucket=settings.s3_bucket_name, Key=object_key)
    return {
        "content_type": response.get("ContentType", ""),
        "content_length": response.get("ContentLength", 0),
    }
