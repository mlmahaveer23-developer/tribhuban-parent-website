"""
Email infrastructure — AWS SES transactional email client.

Public API
----------
send_email(to, subject, html_body, text_body="") -> bool
    Send a transactional email via AWS SES.
    Returns True on success, False on failure.

    Dev mode: when settings.aws_access_key_id is empty, logs a WARNING and
    returns True without attempting an SES call so local development never
    fails due to missing AWS credentials.
"""
from __future__ import annotations

import logging

import boto3
from botocore.exceptions import BotoCoreError, ClientError

from app.config import get_settings

logger = logging.getLogger(__name__)


def _get_ses_client():
    """Build a boto3 SES client using settings credentials or ambient IAM role."""
    settings = get_settings()
    kwargs: dict = {"region_name": settings.aws_region}
    if settings.aws_access_key_id and settings.aws_secret_access_key:
        kwargs["aws_access_key_id"] = settings.aws_access_key_id
        kwargs["aws_secret_access_key"] = settings.aws_secret_access_key
    return boto3.client("ses", **kwargs)


async def send_email(
    to: str,
    subject: str,
    html_body: str,
    text_body: str = "",
) -> bool:
    """Send email via AWS SES.  Returns True on success, False on failure.

    Args:
        to:        Recipient email address.
        subject:   Email subject line.
        html_body: HTML body of the email.
        text_body: Plain-text alternative (optional, defaults to empty string).

    Returns:
        True  — email was sent (or dev-mode skip).
        False — delivery failed; caller should handle retry/dead-letter.

    Dev mode:
        When ``settings.aws_access_key_id`` is empty (local dev / CI), this
        function logs a WARNING and returns True immediately without calling
        SES.  This prevents test failures caused by missing AWS credentials.
    """
    settings = get_settings()

    # ── Dev mode: skip SES when no credentials are configured ────────────────
    if not settings.aws_access_key_id:
        logger.warning(
            "send_email: AWS credentials not configured — skipping SES send "
            "(dev mode). to=%s subject=%r",
            to,
            subject,
        )
        return True

    # ── Production / staging: send via SES ───────────────────────────────────
    try:
        ses = _get_ses_client()
        sender = f"{settings.ses_sender_name} <{settings.ses_sender_email}>"
        response = ses.send_email(
            Source=sender,
            Destination={"ToAddresses": [to]},
            Message={
                "Subject": {"Data": subject, "Charset": "UTF-8"},
                "Body": {
                    "Html": {"Data": html_body, "Charset": "UTF-8"},
                    "Text": {"Data": text_body or html_body, "Charset": "UTF-8"},
                },
            },
        )
        message_id: str = response["MessageId"]
        logger.info(
            "send_email: sent via SES to=%s messageId=%s", to, message_id
        )
        return True

    except (BotoCoreError, ClientError) as exc:
        logger.exception(
            "send_email: SES delivery failed to=%s subject=%r error=%s",
            to,
            subject,
            exc,
        )
        return False

    except Exception as exc:  # noqa: BLE001
        logger.exception(
            "send_email: unexpected error to=%s subject=%r error=%s",
            to,
            subject,
            exc,
        )
        return False
