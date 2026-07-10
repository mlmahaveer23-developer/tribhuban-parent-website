'use client';

/**
 * global-error.tsx — Top-level React error boundary for the App Router.
 *
 * This file is required by Sentry to capture React rendering errors that
 * propagate past all nested error.tsx boundaries (i.e. root layout crashes).
 *
 * It replaces the entire <html> / <body> when rendered, so it must include them.
 * Keep it fully static — no data fetching, no imports that can fail.
 */

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#FEFDFB',
          fontFamily: 'system-ui, sans-serif',
          padding: '2rem',
          textAlign: 'center',
        }}
      >
        <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</p>
        <h1
          style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            color: '#1C1815',
            marginBottom: '0.75rem',
          }}
        >
          Something went wrong
        </h1>
        <p
          style={{
            color: '#5A4E3F',
            marginBottom: '2rem',
            maxWidth: '36ch',
            lineHeight: 1.6,
          }}
        >
          An unexpected error occurred. Our team has been notified.
          {error?.digest && (
            <span
              style={{
                display: 'block',
                marginTop: '0.5rem',
                fontSize: '0.75rem',
                color: '#8C7B66',
              }}
            >
              Error ID: {error.digest}
            </span>
          )}
        </p>
        <button
          type="button"
          onClick={reset}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '2.75rem',
            padding: '0 1.5rem',
            borderRadius: '0.5rem',
            background: '#B87333',
            color: '#fff',
            fontWeight: 600,
            fontSize: '0.875rem',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
