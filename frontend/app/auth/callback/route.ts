/**
 * OAuth & Magic-Link Callback Route
 *
 * Handles the redirect from Supabase after:
 *   - Google OAuth (PKCE flow) — Supabase sends ?code=...
 *   - Password reset link     — Supabase sends ?code=... after email click
 *   - Magic link sign-in      — Supabase sends ?code=...
 *
 * Flow:
 *   1. Read the `code` query parameter from the incoming request.
 *   2. Validate the `next` redirect target (must be a safe relative path).
 *   3. Exchange the code for a session using the Supabase server client.
 *   4. On success: redirect to `next` (default: '/').
 *   5. On error or missing code: redirect to /login?error=oauth_error.
 *
 * Security:
 *   - `next` is validated to be a relative same-origin path — prevents
 *     open redirect attacks where an attacker could set next=https://evil.com.
 *   - X-Frame-Options: DENY is added to all redirect responses to prevent
 *     clickjacking on the callback endpoint.
 *   - No secrets are ever returned in the response body.
 *
 * This route MUST be registered in the Supabase Dashboard under:
 *   Authentication → URL Configuration → Redirect URLs
 *   e.g. https://tribhuban-parent-website.vercel.app/auth/callback
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

/**
 * Validates that a redirect target is a safe relative path.
 *
 * Rules:
 *   - Must start with '/' (relative path, not a protocol-relative or absolute URL)
 *   - Must NOT start with '//' (protocol-relative URL — treated as external)
 *   - Must NOT contain a protocol scheme (http://, https://, etc.)
 *
 * @param path  The candidate redirect path from the `next` query parameter.
 * @returns     The validated path, or '/' if the path is unsafe.
 */
function validateRedirectPath(path: string | null): string {
  if (!path) return '/';
  // Reject protocol-relative URLs (//evil.com) and absolute URLs.
  if (!path.startsWith('/') || path.startsWith('//')) return '/';
  // Reject anything with a colon before the first slash (e.g. javascript:, http:).
  if (/^[^/]*:/.test(path)) return '/';
  return path;
}

/**
 * Builds a NextResponse redirect with security headers applied.
 *
 * Always sets X-Frame-Options: DENY on auth callback redirects to
 * prevent the callback URL from being embedded in an iframe.
 */
function secureRedirect(url: URL): NextResponse {
  const response = NextResponse.redirect(url);
  response.headers.set('X-Frame-Options', 'DENY');
  return response;
}

/**
 * GET /auth/callback
 *
 * Query parameters:
 *   code  — The PKCE authorization code from Supabase (required).
 *   next  — The relative path to redirect to after sign-in (optional, default: '/').
 *
 * @param request  The incoming NextRequest from the browser redirect.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams, origin } = new URL(request.url);

  const code = searchParams.get('code');
  const next = validateRedirectPath(searchParams.get('next'));

  // If no code is present, the user may have navigated here directly
  // or the OAuth flow was cancelled — redirect to login cleanly.
  if (!code) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[Auth] /auth/callback called without a code parameter.');
    }
    return secureRedirect(new URL('/login?error=oauth_error', origin));
  }

  try {
    const supabase = await getSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[Auth] exchangeCodeForSession error:', error);
      }
      return secureRedirect(new URL('/login?error=oauth_error', origin));
    }

    // Session established — redirect to the intended destination.
    return secureRedirect(new URL(next, origin));
  } catch (err) {
    // Unexpected error (e.g. network failure, misconfigured env vars).
    if (process.env.NODE_ENV === 'development') {
      console.error('[Auth] Unexpected error in /auth/callback:', err);
    }
    return secureRedirect(new URL('/login?error=oauth_error', origin));
  }
}
