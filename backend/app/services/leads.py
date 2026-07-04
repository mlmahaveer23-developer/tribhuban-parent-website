"""
Lead service — scoring (pure) + creation (transactional).

Module layout
-------------
score_lead()            — pure, deterministic scoring function (§14.2)
is_disposable_email()   — disposable-domain detection helper
LeadService             — stateful service that wires repositories + outbox

LeadService.create_lead(request, consent_ip) is the single public entry point
for both POST /api/v1/leads and POST /api/v1/contact.

Flow
----
  1. Honeypot check     — non-empty website field → store as spam, HTTP 200
  2. Time-to-submit     — page_load_at present and delta < 3 s → spam
  3. Marketing consent  — consentMarketing=True requires consent_timestamp +
                          consent_ip; missing → 422
  4. score_lead()       — pure function, no I/O
  5. generate_reference_code() — from domain/identifiers.py
  6. Persist Lead + UTMAttribution in ONE transaction
  7. write_outbox_event("lead.created") in the SAME transaction
  8. Return LeadResponse (status always "new" on public endpoint)
"""
from __future__ import annotations

import re
import uuid
from dataclasses import dataclass
from datetime import datetime, timezone, timedelta
from typing import Literal

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.domain.lead import Lead, UTMAttribution
from app.domain.identifiers import generate_reference_code
from app.infra.outbox import write_outbox_event
from app.repositories.leads import LeadRepository
from app.repositories.utm import UTMRepository
from app.schemas.leads import LeadCreateRequest, LeadResponse

# ── Disposable-email domain blocklist ─────────────────────────────────────────
# frozenset for O(1) membership test; all domains lowercase.
_DISPOSABLE_DOMAINS: frozenset[str] = frozenset(
    {
        "mailinator.com",
        "guerrillamail.com",
        "tempmail.com",
        "throwaway.email",
        "yopmail.com",
        "maildrop.cc",
        "sharklasers.com",
        "trashmail.com",
        "dispostable.com",
        "fakeinbox.com",
        "spamgourmet.com",
        "mailnull.com",
        "spam4.me",
        "getairmail.com",
        "discard.email",
        # Additional common disposable domains
        "mailnesia.com",
        "trashmail.at",
        "trashmail.io",
        "trashmail.me",
        "trashmail.net",
        "tempr.email",
        "temp-mail.org",
        "guerrillamailblock.com",
        "grr.la",
        "spam.la",
        "trbvm.com",
        "dropmail.me",
        "10minutemail.com",
        "guerrillamail.info",
        "guerrillamail.biz",
        "guerrillamail.de",
        "guerrillamail.net",
        "guerrillamail.org",
    }
)

# ── Calculator-result context keys ────────────────────────────────────────────
_CALCULATOR_KEYS: frozenset[str] = frozenset(
    {
        "calculator",
        "recommendedSizeKw",
        "estimatedAnnualSavingsMinor",
        "solar_estimate",
    }
)

# ── Interest areas that earn a bonus ──────────────────────────────────────────
_BONUS_INTEREST_AREAS: frozenset[str] = frozenset({"solar", "products"})

# ── Score band thresholds ─────────────────────────────────────────────────────
_HOT_THRESHOLD: int = 70
_WARM_THRESHOLD: int = 40

# ── Time-to-submit minimum (seconds) ─────────────────────────────────────────
_MIN_SUBMIT_SECONDS: int = 3

QualityBand = Literal["cold", "warm", "hot"]


# ── Input dataclass ───────────────────────────────────────────────────────────

@dataclass(frozen=True)
class LeadScoreInput:
    """Immutable value object passed to :func:`score_lead`."""

    source: str
    """LeadSource enum value as a string (e.g. ``"consultation"``)."""

    email: str
    """The lead's email address (used for disposable-email detection)."""

    phone: str | None = None
    """Optional phone number string (any format; validated by digit extraction)."""

    company: str | None = None
    """Optional company/organisation name."""

    interest_area: str | None = None
    """InterestArea enum value as a string (e.g. ``"solar"``)."""

    context: dict | None = None
    """JSONB context dict — checked for calculator-result keys."""

    consent_marketing: bool = False
    """Whether the visitor granted marketing consent."""


# ── Helper functions ──────────────────────────────────────────────────────────

def is_disposable_email(email: str) -> bool:
    """Return ``True`` iff *email*'s domain is on the disposable blocklist.

    Never raises; returns ``False`` for any email that doesn't parse cleanly.
    Domain comparison is case-insensitive.
    """
    try:
        _, domain_part = email.rsplit("@", 1)
        return domain_part.lower() in _DISPOSABLE_DOMAINS
    except (ValueError, AttributeError):
        return False


def _has_valid_phone(phone: str | None) -> bool:
    """Return ``True`` iff *phone* contains between 7 and 15 digits (inclusive).

    Strips all non-digit characters before counting.
    Empty string or ``None`` → ``False``.
    """
    if not phone:
        return False
    digits = re.sub(r"\D", "", phone)
    return 7 <= len(digits) <= 15


def _has_calculator_context(context: dict | None) -> bool:
    """Return ``True`` iff *context* contains at least one calculator-result key."""
    if not context:
        return False
    return bool(_CALCULATOR_KEYS & context.keys())


# ── Core scoring function ─────────────────────────────────────────────────────

def score_lead(lead: LeadScoreInput) -> tuple[int, QualityBand]:
    """Deterministic lead scoring per design §14.2.

    Pure function — no I/O, no side effects, no DB access.

    Args:
        lead: An immutable :class:`LeadScoreInput` value object.

    Returns:
        A ``(score, quality_band)`` tuple where ``score`` is an integer in
        ``[0, 100]`` and ``quality_band`` is one of ``"hot"``, ``"warm"``,
        or ``"cold"``.

    Postconditions (verified by property tests in task 4.2):
        - ``0 ≤ score ≤ 100``
        - band is ``"hot"`` iff ``score ≥ 70``
        - band is ``"warm"`` iff ``40 ≤ score < 70``
        - band is ``"cold"`` iff ``score < 40``
        - Adding phone / company / consent never *decreases* the score
        - A disposable email never *increases* the score
    """
    s: int = 0

    # ── Source weight (mutually exclusive, highest match first) ───────────────
    if lead.source == "consultation":
        s += 40
    elif lead.source == "calculator":
        s += 30
    elif lead.source == "product_interest":
        s += 20
    else:
        # contact / newsletter / career_interest / other → baseline
        s += 10

    # ── Positive signals ──────────────────────────────────────────────────────
    if _has_valid_phone(lead.phone):
        s += 15

    if lead.company:
        s += 10  # B2B signal

    if lead.interest_area in _BONUS_INTEREST_AREAS:
        s += 10

    if _has_calculator_context(lead.context):
        s += 10

    if lead.consent_marketing:
        s += 5

    # ── Negative signal ───────────────────────────────────────────────────────
    if is_disposable_email(lead.email):
        s -= 20

    # ── Clamp to [0, 100] ─────────────────────────────────────────────────────
    s = max(0, min(100, s))

    # ── Band derivation ───────────────────────────────────────────────────────
    if s >= _HOT_THRESHOLD:
        band: QualityBand = "hot"
    elif s >= _WARM_THRESHOLD:
        band = "warm"
    else:
        band = "cold"

    return s, band


# ── Lead Service ──────────────────────────────────────────────────────────────

class LeadService:
    """Orchestrates lead creation: scoring, persistence, and event emission.

    Usage::

        service = LeadService(session)
        response = await service.create_lead(request, consent_ip="1.2.3.4")
    """

    def __init__(self, session: AsyncSession) -> None:
        self._session = session
        self._lead_repo = LeadRepository(session)
        self._utm_repo = UTMRepository(session)

    async def create_lead(
        self,
        request: LeadCreateRequest,
        consent_ip: str,
    ) -> LeadResponse:
        """Create a lead from a validated public form submission.

        Honeypot or time-to-submit spam → stored with status ``"spam"``
        and HTTP 200 returned (silent rejection — bots must not learn
        they were detected).

        Marketing consent without timestamp/IP → HTTP 422 raised.

        All DB writes (Lead + UTMAttribution + OutboxEvent) happen inside
        a single ``async with session.begin()`` transaction.

        The returned :class:`LeadResponse` always carries ``status="new"``
        (the real internal status is never exposed via the public endpoint).
        """
        settings = get_settings()
        org_id = uuid.UUID(settings.default_org_id)
        now = datetime.now(timezone.utc)

        # ── 1. Spam detection ─────────────────────────────────────────────────
        is_spam = False

        # Honeypot: non-empty website field → spam
        if request.website:
            is_spam = True

        # Time-to-submit heuristic: page_load_at present and delta < 3 s → spam
        if not is_spam and request.page_load_at is not None:
            submitted = request.submitted_at or now
            # Ensure both datetimes are tz-aware for subtraction
            page_load = request.page_load_at
            if page_load.tzinfo is None:
                page_load = page_load.replace(tzinfo=timezone.utc)
            if submitted.tzinfo is None:
                submitted = submitted.replace(tzinfo=timezone.utc)
            delta = submitted - page_load
            if delta < timedelta(seconds=_MIN_SUBMIT_SECONDS):
                is_spam = True

        # ── 2. Marketing-consent guard (Req 6.1, 17.5, 17.6) ─────────────────
        # Skip for spam: we accept and silently store without consent validation.
        if not is_spam and request.consent_marketing:
            if not request.consent_timestamp:
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail=(
                        "consentTimestamp is required when consentMarketing is true."
                    ),
                )
            # consent_ip is injected by the endpoint from X-Forwarded-For,
            # so if it arrives empty here something is wrong at the router level.
            if not consent_ip:
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail="consent_ip could not be determined from the request.",
                )

        # ── 3. Score ──────────────────────────────────────────────────────────
        score_input = LeadScoreInput(
            source=request.source,
            email=request.email,
            phone=request.phone,
            company=request.company,
            interest_area=request.interest_area,
            context=request.context,
            consent_marketing=request.consent_marketing,
        )
        score, quality = score_lead(score_input)

        # ── 4. Reference code ─────────────────────────────────────────────────
        reference_code = generate_reference_code()

        # ── 5. Transactional write ────────────────────────────────────────────
        async with self._session.begin():
            # 5a. Persist UTM attribution (if any utm data supplied)
            utm_id: uuid.UUID | None = None
            if request.utm is not None:
                utm_record = UTMAttribution(
                    id=uuid.uuid4(),
                    org_id=org_id,
                    utm_source=request.utm.source,
                    utm_medium=request.utm.medium,
                    utm_campaign=request.utm.campaign,
                    utm_term=request.utm.term,
                    utm_content=request.utm.content,
                    referrer=request.utm.referrer,
                    landing_page=request.utm.landing_page,
                    gclid=request.utm.gclid,
                    fbclid=request.utm.fbclid,
                    first_seen_at=now,
                    last_seen_at=now,
                )
                utm_record = await self._utm_repo.create(utm_record)
                utm_id = utm_record.id

            # 5b. Determine consent fields
            parsed_consent_ts: datetime | None = None
            effective_consent_ip: str | None = None
            if request.consent_marketing and not is_spam:
                # parse ISO 8601 string from schema (already validated present)
                try:
                    parsed_consent_ts = datetime.fromisoformat(
                        request.consent_timestamp.replace("Z", "+00:00")
                    )
                except (AttributeError, ValueError):
                    parsed_consent_ts = now
                effective_consent_ip = consent_ip

            # 5c. Build Lead ORM object
            lead = Lead(
                id=uuid.uuid4(),
                org_id=org_id,
                source=request.source,
                full_name=request.full_name,
                email=request.email,
                phone=request.phone,
                company=request.company,
                message=request.message,
                interest_area=request.interest_area,
                status="spam" if is_spam else "new",
                score=score,
                quality=quality,
                context=request.context,
                consent_marketing=request.consent_marketing,
                consent_timestamp=parsed_consent_ts,
                consent_ip=effective_consent_ip,
                utm_id=utm_id,
                reference_code=reference_code,
                created_at=now,
                updated_at=now,
                version=1,
            )
            lead = await self._lead_repo.create(lead)

            # 5d. Write outbox event in the SAME transaction (Req 6.7)
            await write_outbox_event(
                self._session,
                aggregate_type="Lead",
                aggregate_id=lead.id,
                event_type="lead.created",
                payload={
                    "leadId": str(lead.id),
                    "orgId": str(org_id),
                    "source": lead.source,
                    "email": lead.email,
                    "interestArea": lead.interest_area,
                    "score": lead.score,
                    "quality": lead.quality,
                    "referenceCode": lead.reference_code,
                    "isSpam": is_spam,
                    "occurredAt": now.isoformat(),
                },
                org_id=org_id,
            )

        # ── 6. Build public response ──────────────────────────────────────────
        # NEVER expose the real internal status on the public endpoint (Req 6.10).
        return LeadResponse(
            id=str(lead.id),
            reference_code=lead.reference_code,
            status="new",          # always "new" on public endpoint
            score=lead.score,
            quality=lead.quality,
            created_at=lead.created_at.strftime("%Y-%m-%dT%H:%M:%SZ"),
        )
