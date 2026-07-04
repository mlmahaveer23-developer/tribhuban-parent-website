/**
 * Sentry client-side configuration.
 *
 * Loaded automatically by @sentry/nextjs for browser (client) code.
 * Instruments client-side errors, unhandled promise rejections, and
 * performance traces.
 *
 * Key behaviours:
 *  - requestId is attached as a tag to every event via beforeSend, so Sentry
 *    events can be correlated with the backend structured JSON log stream.
 *  - PII is never sent (no user data, IP addresses stripped).
 *  - Release tag matches backend format: "{app_name}@{version}".
 *  - Tracing is gated: 10 % sampling in production, 100 % otherwise.
 *  - DSN is read from NEXT_PUBLIC_SENTRY_DSN; missing = Sentry disabled (dev).
 */

import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;
const RELEASE = process.env.NEXT_PUBLIC_APP_VERSION
  ? `tribhuban-parent-website@${process.env.NEXT_PUBLIC_APP_VERSION}`
  : undefined;

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    release: RELEASE,
    environment: process.env.NEXT_PUBLIC_ENVIRONMENT ?? process.env.NODE_ENV,

    // ── Tracing ─────────────────────────────────────────────────────────────
    // Capture 10 % of transactions in production to keep quota manageable;
    // 100 % in development/staging so every trace is visible.
    tracesSampleRate: IS_PRODUCTION ? 0.1 : 1.0,

    // ── Session replay ───────────────────────────────────────────────────────
    // Session replays are DISABLED until the visitor grants analytics consent
    // (Req 17.1). The replaysSessionSampleRate / replaysOnErrorSampleRate
    // values are set to 0 here; the ConsentBanner task (18.1) must re-enable
    // them via Sentry.setUser / dynamic replay enable on consent grant.
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: IS_PRODUCTION ? 0.1 : 0,

    // ── Integrations ────────────────────────────────────────────────────────
    integrations: [
      // Browser tracing: captures page loads, navigation, and API calls
      Sentry.browserTracingIntegration(),
    ],

    // ── Privacy ─────────────────────────────────────────────────────────────
    // Never send PII (DPDP / GDPR compliance — Req 17.7, 26.2).
    sendDefaultPii: false,

    // ── Event filtering ─────────────────────────────────────────────────────
    beforeSend(event) {
      // Strip any accidentally captured user PII
      if (event.user) {
        delete event.user.email;
        delete event.user.ip_address;
        delete event.user.username;
      }

      // Attach the requestId from the X-Request-ID response header if it was
      // stored on the window by the API client.
      const requestId =
        (typeof window !== 'undefined' &&
          (window as Window & { __requestId?: string }).__requestId) ||
        undefined;

      if (requestId) {
        event.tags = { ...event.tags, request_id: requestId };
        const existing = Array.isArray(event.breadcrumbs) ? event.breadcrumbs : [];
        const requestBreadcrumb = {
          type: 'info' as const,
          category: 'request',
          message: `requestId: ${requestId}`,
          level: 'info' as const,
        };
        event.breadcrumbs = [requestBreadcrumb, ...existing];
      }

      return event;
    },

    // ── Transport / network ─────────────────────────────────────────────────
    // Tunnel events through our own API to avoid ad-blocker interference.
    // Uncomment when the /api/sentry-tunnel route is implemented (Post-MVP).
    // tunnel: '/api/sentry-tunnel',
  });
}
