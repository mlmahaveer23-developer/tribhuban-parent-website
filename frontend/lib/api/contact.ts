/**
 * contact.ts — typed API client for the contact form endpoint.
 *
 * Uses NEXT_PUBLIC_API_URL env var (falls back to http://localhost:8000).
 * Sends JSON body to POST /api/v1/contact.
 *
 * Requirements: 8.1, 8.2
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

// ── Types ─────────────────────────────────────────────────────────────────────

export type ContactInterestArea =
  | 'solar'
  | 'products'
  | 'future_tech'
  | 'careers'
  | 'support'
  | 'other';

export interface ContactRequest {
  source: 'contact';
  fullName: string;
  email: string;
  phone?: string;
  interestArea: ContactInterestArea;
  message: string;
  consentMarketing: boolean;
  // UTM attribution (optional — captured from URL params client-side)
  utm?: {
    utm_source?: string | null;
    utm_medium?: string | null;
    utm_campaign?: string | null;
    utm_term?: string | null;
    utm_content?: string | null;
    referrer?: string | null;
    landing_page?: string | null;
    gclid?: string | null;
    fbclid?: string | null;
  };
}

export interface ContactResponse {
  referenceCode: string;
  status: string;
}

export interface ContactFieldError {
  field: string;
  message: string;
}

// ── API error ─────────────────────────────────────────────────────────────────

export class ContactApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly detail: string,
    public readonly fields?: ContactFieldError[],
  ) {
    super(detail);
    this.name = 'ContactApiError';
  }
}

// ── submitContact ─────────────────────────────────────────────────────────────

/**
 * Call POST /api/v1/contact.
 *
 * Returns ContactResponse on HTTP 200/201.
 * Throws ContactApiError on 4xx (includes field-level errors from 422).
 * Throws generic Error on network failure.
 */
export async function submitContact(
  req: ContactRequest,
): Promise<ContactResponse> {
  const response = await fetch(`${API_BASE}/api/v1/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
    cache: 'no-store',
  });

  if (!response.ok) {
    let detail = `Request failed with status ${response.status}`;
    let fields: ContactFieldError[] | undefined;

    try {
      const body = await response.json();
      // Backend RFC 7807 error envelope: { error: { detail, fields } }
      if (body?.error?.detail) detail = body.error.detail;
      else if (body?.detail && typeof body.detail === 'string')
        detail = body.detail;

      // Field-level validation errors from 422
      if (Array.isArray(body?.error?.fields)) {
        fields = body.error.fields as ContactFieldError[];
      } else if (Array.isArray(body?.detail)) {
        // FastAPI default validation error format
        fields = (body.detail as Array<{ loc: string[]; msg: string }>).map(
          (e) => ({
            field: e.loc?.[e.loc.length - 1] ?? 'unknown',
            message: e.msg,
          }),
        );
      }
    } catch {
      // ignore JSON parse errors
    }

    throw new ContactApiError(response.status, detail, fields);
  }

  // Backend wraps success in { data: ..., meta: ... } envelope
  const envelope = (await response.json()) as { data: ContactResponse };
  return envelope.data;
}
