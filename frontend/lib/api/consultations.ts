/**
 * consultations.ts — typed API client for the consultation booking endpoint.
 *
 * Uses NEXT_PUBLIC_API_URL env var (falls back to http://localhost:8000).
 * Sends camelCase JSON body matching ConsultationCreateRequest on the backend.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

// ── Types ─────────────────────────────────────────────────────────────────────

export type TimeWindow = 'morning' | 'afternoon' | 'evening';
export type InterestArea =
  | 'solar'
  | 'products'
  | 'future_tech'
  | 'careers'
  | 'support'
  | 'other';

export interface ConsultationCreateRequest {
  fullName: string;
  email: string;
  phone: string;
  interestArea: InterestArea;
  preferredDate: string; // ISO 8601 date string YYYY-MM-DD
  preferredTimeWindow: TimeWindow;
  location?: string;
  message?: string;
  consentMarketing?: boolean;
  context?: Record<string, unknown>;
  utm?: Record<string, unknown>;
}

export interface ConsultationResponse {
  id: string;
  referenceCode: string;
  status: 'requested' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  createdAt: string;
}

export interface ConsultationFieldError {
  field: string;
  message: string;
}

// ── API error ─────────────────────────────────────────────────────────────────

export class ConsultationApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly detail: string,
    public readonly fields?: ConsultationFieldError[],
  ) {
    super(detail);
    this.name = 'ConsultationApiError';
  }
}

// ── createConsultation ────────────────────────────────────────────────────────

/**
 * Call POST /api/v1/consultations.
 *
 * Returns ConsultationResponse on HTTP 202.
 * Throws ConsultationApiError on 4xx (includes field-level errors from 422).
 * Throws generic Error on network failure.
 */
export async function createConsultation(
  req: ConsultationCreateRequest,
): Promise<ConsultationResponse> {
  const response = await fetch(`${API_BASE}/api/v1/consultations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
    cache: 'no-store',
  });

  if (!response.ok) {
    let detail = `Request failed with status ${response.status}`;
    let fields: ConsultationFieldError[] | undefined;

    try {
      const body = await response.json();
      // Backend RFC 7807 error envelope: { error: { detail, fields } }
      if (body?.error?.detail) detail = body.error.detail;
      else if (body?.detail) detail = body.detail;

      // Field-level validation errors from 422
      if (Array.isArray(body?.error?.fields)) {
        fields = body.error.fields as ConsultationFieldError[];
      } else if (Array.isArray(body?.detail)) {
        // FastAPI default validation error format
        fields = (body.detail as Array<{ loc: string[]; msg: string }>).map((e) => ({
          field: e.loc?.[e.loc.length - 1] ?? 'unknown',
          message: e.msg,
        }));
      }
    } catch {
      // ignore JSON parse errors
    }

    throw new ConsultationApiError(response.status, detail, fields);
  }

  // Backend wraps 202 in { data: ..., meta: ... } envelope
  const envelope = await response.json() as { data: ConsultationResponse };
  return envelope.data;
}
