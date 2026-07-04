/**
 * Shared fetch client for all Tribhuban API calls.
 *
 * Responsibilities:
 *  - Reads NEXT_PUBLIC_API_URL for the base URL.
 *  - Extracts the X-Request-ID response header and stores it via
 *    setRequestIdContext() so Sentry can attach it to any subsequent error.
 *  - Returns the raw Response so individual API modules can parse it as needed.
 *  - Client-safe: typeof window guard on the Sentry helper ensures server
 *    components can also call this without errors.
 *
 * Usage:
 *   import { apiFetch } from '@/lib/api/fetch-client';
 *   const res = await apiFetch('/api/v1/consultations', { method: 'POST', body: ... });
 */

export const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

/**
 * Wraps the native `fetch` with:
 *  1. Base URL prepending (API_BASE + path).
 *  2. X-Request-ID capture → stored in window.__requestId for Sentry.
 *
 * @param path     API path starting with '/', e.g. '/api/v1/consultations'.
 * @param options  Standard RequestInit options (method, headers, body, cache, etc.).
 * @returns        The native Response object (not yet consumed).
 */
export async function apiFetch(path: string, options?: RequestInit): Promise<Response> {
  const response = await fetch(`${API_BASE}${path}`, options);

  // Capture requestId for Sentry correlation (client-side only).
  if (typeof window !== 'undefined') {
    const requestId = response.headers.get('x-request-id');
    if (requestId) {
      // Lazy import: setRequestIdContext is a no-op when Sentry is absent.
      try {
        const { setRequestIdContext } = await import('@/lib/utils/sentry');
        setRequestIdContext(requestId);
      } catch {
        // Sentry module not available — skip
      }
    }
  }

  return response;
}
