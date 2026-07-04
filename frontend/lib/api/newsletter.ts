/**
 * newsletter.ts — typed API client for newsletter subscription endpoint.
 *
 * Uses the NEXT_PUBLIC_API_URL env var (falls back to http://localhost:8000).
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

// ── Response type ─────────────────────────────────────────────────────────────

export interface NewsletterSubscribeResponse {
  /** Human-readable message */
  message: string;
  /**
   * Subscription status:
   * - "pending"           — new subscriber, confirmation email sent
   * - "already_confirmed" — email already has confirmed subscription
   * - "already_pending"   — confirmation email already sent, awaiting click
   */
  status: string;
}

// ── API error ─────────────────────────────────────────────────────────────────

export class NewsletterApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly detail: string,
    /** Field-level validation errors, keyed by field name */
    public readonly fields?: Record<string, string>,
  ) {
    super(detail);
    this.name = 'NewsletterApiError';
  }
}

// ── subscribeNewsletter ───────────────────────────────────────────────────────

/**
 * Call POST /api/v1/newsletter/subscribe.
 *
 * @param email  - Subscriber email address (max 254 chars, RFC 5322)
 * @param source - Attribution source (e.g. "footer", "home_cta")
 * @returns      Resolved response on 2xx
 * @throws       NewsletterApiError on 4xx/5xx
 * @throws       Error on network failure
 */
export async function subscribeNewsletter(
  email: string,
  source: string,
): Promise<NewsletterSubscribeResponse> {
  const response = await fetch(`${API_BASE}/api/v1/newsletter/subscribe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, source }),
    cache: 'no-store',
  });

  if (!response.ok) {
    let detail = `Request failed with status ${response.status}`;
    let fields: Record<string, string> | undefined;
    try {
      const body = await response.json();
      // Backend returns RFC 7807 error envelope: { error: { detail, fields } }
      if (body?.error?.detail) detail = body.error.detail;
      else if (body?.detail) detail = body.detail;
      if (body?.error?.fields) fields = body.error.fields;
    } catch {
      // ignore parse errors
    }
    throw new NewsletterApiError(response.status, detail, fields);
  }

  // Backend wraps response in { data: ..., meta: ... } envelope
  const envelope = await response.json() as { data: NewsletterSubscribeResponse };
  return envelope.data;
}
