/**
 * Sentry Edge runtime configuration.
 *
 * Used by Next.js Edge middleware and Edge Route Handlers.
 * Shares the same DSN and settings as the server config.
 */

import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN;
const RELEASE = process.env.APP_VERSION
  ? `tribhuban-parent-website@${process.env.APP_VERSION}`
  : undefined;

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    release: RELEASE,
    environment: process.env.ENVIRONMENT ?? process.env.NODE_ENV,
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    sendDefaultPii: false,
  });
}
