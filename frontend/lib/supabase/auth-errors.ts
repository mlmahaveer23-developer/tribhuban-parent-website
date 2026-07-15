/**
 * Supabase Auth Error Mapper
 *
 * Maps Supabase Auth error message strings to user-friendly messages suitable
 * for display in the UI. Supabase error messages are implementation details —
 * this layer ensures:
 *
 *   1. Users see clear, actionable language instead of internal error codes.
 *   2. No information is leaked that would help enumerate valid emails or
 *      expose internal system details (e.g. "Invalid login credentials" is
 *      intentionally kept generic to prevent user-existence probing).
 *   3. A single place to update copy when Supabase changes error messages.
 *
 * Usage:
 *   import { mapAuthError } from '@/lib/supabase/auth-errors';
 *   const friendly = mapAuthError(error.message);
 */

/**
 * Ordered list of [substring, friendlyMessage] pairs.
 *
 * Matching is case-insensitive substring search. The first match wins,
 * so more specific patterns should appear before more general ones.
 */
const AUTH_ERROR_MAP: ReadonlyArray<readonly [string, string]> = [
  // ── Sign-in errors ──────────────────────────────────────────────────────────
  ['invalid login credentials',     'Incorrect email or password. Please try again.'],
  ['invalid_credentials',           'Incorrect email or password. Please try again.'],
  ['email not confirmed',           'Please verify your email address before signing in. Check your inbox for the confirmation link.'],
  ['email_not_confirmed',           'Please verify your email address before signing in. Check your inbox for the confirmation link.'],

  // ── Sign-up errors ──────────────────────────────────────────────────────────
  ['user already registered',       'An account with this email address already exists. Try signing in instead.'],
  ['email address already exists',  'An account with this email address already exists. Try signing in instead.'],

  // ── Password errors ─────────────────────────────────────────────────────────
  ['password should be at least',   'Password must be at least 8 characters long.'],
  ['weak_password',                 'Password is too weak. Use at least 8 characters with a mix of letters, numbers, and symbols.'],
  ['same_password',                 'Your new password must be different from your current password.'],

  // ── Session / token errors ───────────────────────────────────────────────────
  ['auth session missing',          'Your session has expired. Please sign in again.'],
  ['session_not_found',             'Your session has expired. Please sign in again.'],
  ['token has expired',             'This link has expired. Please request a new one.'],
  ['token expired',                 'This link has expired. Please request a new one.'],
  ['invalid token',                 'This link is invalid or has already been used. Please request a new one.'],
  ['otp expired',                   'This verification link has expired. Please request a new one.'],

  // ── OAuth errors ─────────────────────────────────────────────────────────────
  ['oauth_callback_error',          'Google sign-in failed. Please try again.'],
  ['unexpected_failure',            'Google sign-in failed. Please try again.'],
  ['provider_email_needs_verification', 'Your Google account email needs to be verified before you can sign in.'],

  // ── Rate limiting ─────────────────────────────────────────────────────────────
  ['over_email_send_rate_limit',    'Too many requests. Please wait a few minutes before trying again.'],
  ['too many requests',             'Too many requests. Please wait a few minutes before trying again.'],
  ['rate_limit',                    'Too many requests. Please wait a few minutes before trying again.'],

  // ── Account / access errors ───────────────────────────────────────────────────
  ['signup_disabled',               'New sign-ups are currently disabled. Please contact support.'],
  ['user_banned',                   'This account has been suspended. Please contact support.'],
  ['not_admin',                     'You do not have permission to perform this action.'],

  // ── Network / connectivity ────────────────────────────────────────────────────
  ['failed to fetch',               'Unable to connect. Please check your internet connection and try again.'],
  ['network request failed',        'Unable to connect. Please check your internet connection and try again.'],
  ['load failed',                   'Unable to connect. Please check your internet connection and try again.'],
] as const;

/**
 * Maps a Supabase Auth error message to a user-friendly string.
 *
 * Performs case-insensitive substring matching against the known error map.
 * Falls back to a generic message for any unrecognised error so the UI
 * never shows raw Supabase internals to the user.
 *
 * In development, the original message is logged to the console for
 * debugging purposes while the user still sees a clean message.
 *
 * @param message  The raw error message from a Supabase AuthError.
 * @returns        A user-friendly error string safe to display in the UI.
 */
export function mapAuthError(message: string): string {
  if (!message) return 'An unexpected error occurred. Please try again.';

  const lower = message.toLowerCase();

  for (const [pattern, friendly] of AUTH_ERROR_MAP) {
    if (lower.includes(pattern.toLowerCase())) {
      if (process.env.NODE_ENV === 'development') {
        console.debug(`[Auth] Mapped error: "${message}" → "${friendly}"`);
      }
      return friendly;
    }
  }

  // Unrecognised error — log for debugging, show generic message to user.
  if (process.env.NODE_ENV === 'development') {
    console.warn(`[Auth] Unmapped Supabase error: "${message}"`);
  }

  return 'An unexpected error occurred. Please try again.';
}
