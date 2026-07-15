/**
 * Email Verification Route
 *
 * Handles the redirect from Supabase after a user clicks the confirmation
 * link in their signup verification email.
 *
 * Supabase sends the user to this route with a token_hash and type parameter:
 *   /auth/verify?token_hash=<hash>&type=email
 *
 * Flow:
 *   1. Read `token_hash` and `type` from query parameters.
 *   2. Call supabase.auth.verifyOtp() to exchange the token for a session.
 *   3. On success: redirect to /login?verified=1 so the login page can show
 *      a "Email verified! You can now sign in." success banner.
 *   4. On error (expired/already used token): redirect to
 *      /login?error=verification_failed so the user can request a new link.
 *   5. If required params are missing: redirect to /login.
 *
 * Security:
 *   - X-Frame-Options: DENY is set on all responses (clickjacking prevention).
 *   - Token is consumed server-side — never exposed in a client response body.
 *   - All redirects are to relative same-origin paths only.
 *
 * Email template configuration (Supabase Dashboard):
 *   Authentication → Email Templates → Confirm signup
 *   Set Confirmation URL to:
 *     {{ .SiteURL }}/auth/verify?token_hash={{ .TokenHash }}&type=email
 */

import { NextRequest, NextResponse } from 'next/server';
import type { EmailOtpType } from '@supabase/supabase-js';
import { getSupabaseServerClient } from '@/lib/supabase/server';

/**
 * Builds a NextResponse redirect with X-Frame-Options: DENY applied.
 */
function secureRedirect(url: URL): NextResponse {
  const response = NextResponse.redirect(url);
  response.headers.set('X-Frame-Options', 'DENY');
  return response;
}

/**
 * GET /auth/verify
 *
 * Query parameters:
 *   token_hash — The OTP token hash from the verification email (required).
 *   type        — The OTP type, e.g. 'email', 'recovery', 'invite' (required).
 *
 * @param request  The incoming NextRequest from the email link click.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams, origin } = new URL(request.url);

  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;

  // Missing required parameters — redirect to login cleanly.
  if (!token_hash || !type) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        '[Auth] /auth/verify called with missing params:',
        { token_hash: !!token_hash, type },
      );
    }
    return secureRedirect(new URL('/login', origin));
  }

  try {
    const supabase = await getSupabaseServerClient();

    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type,
    });

    if (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[Auth] verifyOtp error:', error);
      }
      // Token expired, already used, or invalid — prompt user to re-request.
      return secureRedirect(
        new URL('/login?error=verification_failed', origin),
      );
    }

    // Email verified successfully — redirect to login with success indicator.
    // The login page reads ?verified=1 and shows a green success banner.
    return secureRedirect(new URL('/login?verified=1', origin));
  } catch (err) {
    // Unexpected error (e.g. network failure, misconfigured env vars).
    if (process.env.NODE_ENV === 'development') {
      console.error('[Auth] Unexpected error in /auth/verify:', err);
    }
    return secureRedirect(
      new URL('/login?error=verification_failed', origin),
    );
  }
}
