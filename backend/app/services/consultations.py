"""
Consultation service — booking creation (transactional).

Module layout
-------------
ConsultationService     — stateful service that wires repositories + outbox

ConsultationService.create_consultation(request, consent_ip, session) is the
single public entry point for POST /api/v1/consultations.

Flow
----
  1. Validate fields (already enforced by Pydantic at schema layer)
  2. Find or create Lead by email (LeadRepository.find_by_email; if none →
     create new Lead with source="consultation" in the same transaction)
  3. Generate reference_code via generate_reference_code()
  4. Persist Consultation + write outbox event ``consultation.requested`` in
     ONE database transaction
  5. Return ConsultationResponse (HTTP 202)

Business rules (Req 7.2, 7.3, 7.4, 7.5)
-----------------------------------------
  - preferred_date must be > today UTC (validated by schema)
  - preferred_date must be ≤ 365 days from today UTC (validated by schema)
  - If lead exists by email: link consultation to that lead
  - If no lead: create Lead(source="consultation", ...) in the same transaction
  - Outbox event ``consultation.requested`` emitted in same transaction
  - Response within 2 s (pure DB ops — easily met)

Outbox event payload:
  {
    "consultationId": "...",
    "leadId": "...",
    "referenceCode": "...",
    "preferredDate": "YYYY-MM-DD",
    "occurredAt": "ISO-8601 UTC"
  }
"""
from __future__ import annotations

import uuid
from datetime import datetime, timezone, date as date_type

from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.domain.booking import Consultation
from app.domain.lead import Lead
from app.domain.identifiers import generate_reference_code
from app.infra.outbox import write_outbox_event
from app.repositories.consultations import ConsultationRepository
from app.repositories.leads import LeadRepository
from app.schemas.consultations import (
    ConsultationCreateRequest,
    ConsultationResponse,
    ConsultationStatusResponse,
)


class ConsultationService:
    """Orchestrates consultation creation: lead linkage, persistence, and event emission.

    Usage::

        service = ConsultationService(session)
        response = await service.create_consultation(request, consent_ip="1.2.3.4")
    """

    def __init__(self, session: AsyncSession) -> None:
        self._session = session
        self._consultation_repo = ConsultationRepository(session)
        self._lead_repo = LeadRepository(session)

    async def create_consultation(
        self,
        request: ConsultationCreateRequest,
        consent_ip: str,
    ) -> ConsultationResponse:
        """Create a consultation from a validated public form submission.

        Validation (date range, field formats) is enforced upstream by the
        Pydantic schema.  This method handles the transactional write:
          - Find or create a lead matched by email
          - Persist the consultation record
          - Emit ``consultation.requested`` outbox event in the same transaction

        Args:
            request:    Validated :class:`ConsultationCreateRequest` from the router.
            consent_ip: Client IP resolved from X-Forwarded-For or client.host.

        Returns:
            :class:`ConsultationResponse` with id, referenceCode, status, createdAt.
        """
        settings = get_settings()
        org_id = uuid.UUID(settings.default_org_id)
        now = datetime.now(timezone.utc)

        # ── Generate reference code ───────────────────────────────────────────
        reference_code = generate_reference_code()

        # ── Parse preferred_date from ISO string (already validated by schema) ─
        preferred_date: date_type = date_type.fromisoformat(request.preferred_date)

        # ── Single transactional write ────────────────────────────────────────
        async with self._session.begin():

            # ── Find or create lead ───────────────────────────────────────────
            lead = await self._lead_repo.find_by_email(request.email, org_id)

            if lead is None:
                # Create a new lead with source="consultation"
                lead_reference_code = generate_reference_code()
                lead = Lead(
                    id=uuid.uuid4(),
                    org_id=org_id,
                    source="consultation",
                    full_name=request.full_name,
                    email=request.email,
                    phone=request.phone,
                    message=request.message,
                    interest_area=request.interest_area,
                    status="new",
                    score=0,
                    quality="cold",
                    context=request.context,
                    consent_marketing=request.consent_marketing,
                    consent_timestamp=None,
                    consent_ip=None,
                    utm_id=None,
                    reference_code=lead_reference_code,
                    created_at=now,
                    updated_at=now,
                    version=1,
                )
                lead = await self._lead_repo.create(lead)

            # ── Build and persist consultation ────────────────────────────────
            consultation = Consultation(
                id=uuid.uuid4(),
                org_id=org_id,
                lead_id=lead.id,
                full_name=request.full_name,
                email=request.email,
                phone=request.phone,
                interest_area=request.interest_area,
                location=request.location,
                preferred_date=preferred_date,
                preferred_time_window=request.preferred_time_window,
                message=request.message,
                status="requested",
                reference_code=reference_code,
                context=request.context,
                created_at=now,
                updated_at=now,
                version=1,
            )
            consultation = await self._consultation_repo.create(consultation)

            # ── Write outbox event in the SAME transaction (Req 7.5) ──────────
            await write_outbox_event(
                self._session,
                aggregate_type="Consultation",
                aggregate_id=consultation.id,
                event_type="consultation.requested",
                payload={
                    "consultationId": str(consultation.id),
                    "leadId": str(lead.id),
                    "referenceCode": consultation.reference_code,
                    "preferredDate": str(consultation.preferred_date),
                    "occurredAt": now.isoformat(),
                },
                org_id=org_id,
            )

        # ── Build and return public response ──────────────────────────────────
        return ConsultationResponse(
            id=str(consultation.id),
            reference_code=consultation.reference_code,
            status="requested",
            created_at=consultation.created_at.strftime("%Y-%m-%dT%H:%M:%SZ"),
        )

    async def get_consultation_status(
        self,
        reference_code: str,
    ) -> ConsultationStatusResponse | None:
        """Return status for a consultation by reference code (NO PII).

        Returns ``None`` when the reference code does not match any record
        (caller should raise HTTP 404).

        Args:
            reference_code: The reference code to look up.

        Returns:
            :class:`ConsultationStatusResponse` with referenceCode + status,
            or ``None`` if not found.
        """
        consultation = await self._consultation_repo.find_by_reference_code(
            reference_code
        )
        if consultation is None:
            return None
        return ConsultationStatusResponse(
            reference_code=consultation.reference_code,
            status=consultation.status,  # type: ignore[arg-type]
        )
