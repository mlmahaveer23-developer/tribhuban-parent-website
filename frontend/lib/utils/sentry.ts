/**
 * Sentry frontend helpers.
 *
 * Provides thin wrappers around @sentry/nextjs that:
 *  - Attach the requestId (from X-Request-ID response header) as a Sentry
 *    tag and breadcrumb for log-stream correlation with the backend.
 *  - Strip PII before sending events.
 *  - Never throw — Sentry is optional and must not impact the application.
 *
 * Usage:
 *   // In API client after receiving a response:
 *   import { setRequestIdContext } from '@/lib/utils/sentry';
 *   setRequestIdContext(response.headers.get('x-request-id'));
 *
 *   // In error handlers:
 *   import { captureException } from '@/lib/utils/sentry';
 *   captureException(err, { requestId, context: 'ConsultationForm' });
 */

// ── requestId window store ────────────────────────────────────────────────────
// The requestId from the most recent API response is stored on window so that
// the Sentry beforeSend callback in sentry.client.config.ts can attach it to
// every event captured in the current request context.

/**
 * Store the requestId from an API response so Sentry can attach it to events.
 *
 * Call this whenever the frontend receives a response with an X-Request-ID
 * header (which the backend attaches to every response).
 *
 * @param requestId  Value of the X-Request-ID response header, or null/undefined.
 */
export function setRequestIdContext(requestId: string | null | undefined): void {
  if (typeof window === 'undefined' || !requestId) return;
  (window as typeof window & { __requestId?: string }).__requestId = requestId;
}

// ── Exception capture ─────────────────────────────────────────────────────────

export interface CaptureOptions {
  /** The requestId from the associated API call (X-Request-ID header). */
  requestId?: string | null;
  /** Human-readable context name, e.g. "ConsultationForm" or "NewsletterForm". */
  context?: string;
  /** Additional structured tags to attach to the Sentry event. */
  tags?: Record<string, string>;
}

/**
 * Capture an exception in Sentry with requestId and context breadcrumbs.
 *
 * Safe to call anywhere — silently no-ops if Sentry is not configured.
 *
 * @param error    The Error object to capture.
 * @param options  Optional enrichment metadata.
 */
export async function captureException(
  error: unknown,
  options: CaptureOptions = {},
): Promise<void> {
  try {
    const Sentry = await import('@sentry/nextjs');

    const requestId =
      options.requestId ??
      (typeof window !== 'undefined'
        ? (window as typeof window & { __requestId?: string }).__requestId
        : undefined);

    Sentry.withScope((scope) => {
      if (requestId) {
        scope.setTag('request_id', requestId);
        scope.addBreadcrumb({
          category: 'api',
          message: `requestId: ${requestId}`,
          level: 'info',
        });
      }
      if (options.context) {
        scope.setTag('context', options.context);
        scope.addBreadcrumb({
          category: 'ui.action',
          message: options.context,
          level: 'info',
        });
      }
      if (options.tags) {
        for (const [key, value] of Object.entries(options.tags)) {
          scope.setTag(key, value);
        }
      }
      Sentry.captureException(error);
    });
  } catch {
    // Sentry not available — swallow silently
  }
}

/**
 * Add a breadcrumb to the current Sentry scope.
 *
 * Safe to call anywhere — silently no-ops if Sentry is not configured.
 */
export async function addBreadcrumb(
  category: string,
  message: string,
  data?: Record<string, string>,
): Promise<void> {
  try {
    const Sentry = await import('@sentry/nextjs');
    Sentry.addBreadcrumb({
      category,
      message,
      data,
      level: 'info',
    });
  } catch {
    // Sentry not available
  }
}
