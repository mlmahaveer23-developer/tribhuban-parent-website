/**
 * Sentry server-side (Node.js / Edge) configuration.
 *
 * Loaded automatically by @sentry/nextjs for server-side rendering and
 * API routes.  Instruments unhandled exceptions in Server Components, Route
 * Handlers, and middleware.
 *
 * Key behaviours:
 *  - Captures server-side rendering errors and Next.js route handler errors.
 *  - Attaches requestId from X-Request-ID header to Sentry events via
 *    beforeSend so events correlate with backend structured logs.
 *  - PII is never sent.
 *  - DSN read from SENTRY_DSN (server env var, not NEXT_PUBLIC_*).
 */

import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN;
const RELEASE = process.env.APP_VERSION
  ? `tribhuban-parent-website@${process.env.APP_VERSION}`
  : undefined;

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    release: RELEASE,
    environment: process.env.ENVIRONMENT ?? process.env.NODE_ENV,

    // ── Tracing ─────────────────────────────────────────────────────────────
    tracesSampleRate: IS_PRODUCTION ? 0.1 : 1.0,

    // ── Privacy ─────────────────────────────────────────────────────────────
    sendDefaultPii: false,

    // ── Event filtering ─────────────────────────────────────────────────────
    beforeSend(event, hint) {
      // Strip user PII
      if (event.user) {
        delete event.user.email;
        delete event.user.ip_address;
        delete event.user.username;
      }

      // Attempt to extract requestId from the request context
      const req = hint?.originalException as (Error & { requestId?: string }) | null;
      const requestId = req?.requestId;
      if (requestId) {
        event.tags = { ...event.tags, request_id: requestId };
      }

      return event;
    },
  });
}
