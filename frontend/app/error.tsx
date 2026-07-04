'use client';

/**
 * error.tsx — Branded 500 error boundary.
 *
 * Requirements: 3.4, 16.3
 *
 * MUST:
 * - Be a Client Component ("use client") — Next.js App Router requirement.
 * - Render without any backend or data-layer dependency (Req 3.4).
 * - Show reassurance message, retry button, contact info, and error ID.
 *
 * NOTE: Cannot export `metadata` from a Client Component. noindex is handled
 * by the root layout robots defaults; error pages are not indexed by crawlers.
 */

import { useEffect } from 'react';
import Link from 'next/link';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Forward to Sentry with requestId breadcrumb for log correlation.
    // Dynamic import: @sentry/nextjs may not be installed in all environments.
    const reportToSentry = async () => {
      try {
        const Sentry = await import('@sentry/nextjs');
        const requestId =
          (typeof window !== 'undefined' &&
            (window as Window & { __requestId?: string }).__requestId) ||
          undefined;

        Sentry.withScope((scope) => {
          if (requestId) {
            scope.setTag('request_id', requestId);
            scope.addBreadcrumb({
              category: 'error.boundary',
              message: `Error boundary triggered — requestId: ${requestId}`,
              level: 'error',
            });
          }
          if (error.digest) {
            scope.setTag('next_digest', error.digest);
          }
          Sentry.captureException(error);
        });
      } catch {
        // Sentry not available — fall back to console
        console.error('[Error boundary]', error);
      }
    };

    reportToSentry();
  }, [error]);

  // Sentry attaches its own event ID via a custom property on the Error object.
  // Use digest (Next.js server hash) as the correlation ID shown to the user.
  const sentryEventId = (error as unknown as Record<string, unknown>).__sentryEventId;
  const errorId: string | undefined =
    error.digest ??
    (typeof sentryEventId === 'string' ? sentryEventId : undefined);

  return (
    <div
      className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-24 text-center"
      role="alert"
      aria-live="assertive"
    >
      {/* Accent label */}
      <p
        className="text-sm font-semibold uppercase tracking-widest mb-4"
        style={{ color: 'var(--accent)' }}
      >
        500
      </p>

      {/* Main heading */}
      <h1
        className="text-4xl font-semibold mb-4"
        style={{ fontFamily: 'var(--font-display)', color: 'var(--fg)' }}
      >
        Something Went Wrong
      </h1>

      {/* Reassurance message */}
      <p className="text-lg mb-8 max-w-md" style={{ color: 'var(--fg-muted)' }}>
        We ran into an unexpected issue. Our team has been notified. Please try again, or reach out
        if the problem continues.
      </p>

      {/* Sentry / digest error ID — shown only when available */}
      {errorId && (
        <p className="text-xs mb-8 font-mono" style={{ color: 'var(--fg-subtle)' }}>
          Error ID: <span className="select-all">{errorId}</span>
        </p>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center px-7 py-3 rounded-md text-sm font-semibold transition-colors"
          style={{ backgroundColor: 'var(--accent)', color: 'var(--btn-primary-fg)' }}
        >
          Try Again
        </button>
        <Link
          href="/"
          className="inline-flex items-center px-7 py-3 rounded-md text-sm font-semibold border transition-colors"
          style={{
            borderColor: 'var(--border)',
            color: 'var(--fg)',
            backgroundColor: 'transparent',
          }}
        >
          Return Home
        </Link>
      </div>

      {/* Contact info — no external dependencies, plain mailto link */}
      <p className="text-sm" style={{ color: 'var(--fg-subtle)' }}>
        Need help? Email us at{' '}
        <a
          href="mailto:hello@tribhubanconcepts.com"
          className="hover:underline"
          style={{ color: 'var(--accent)' }}
        >
          hello@tribhubanconcepts.com
        </a>
      </p>
    </div>
  );
}
