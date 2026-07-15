/**
 * Supabase Middleware Client
 *
 * Factory function for creating a Supabase client inside Next.js middleware.
 * Unlike the server client, middleware runs in the Edge Runtime and does not
 * have access to next/headers — cookies must be read from the incoming
 * NextRequest and written to the outgoing NextResponse directly.
 *
 * This client is used by middleware.ts to:
 *   1. Read the current session from request cookies.
 *   2. Refresh an expired access token (using the refresh token cookie).
 *   3. Write updated session cookies back onto the response so the browser
 *      receives them without a full round-trip to Supabase on every request.
 *
 * Usage (middleware.ts):
 *   import { createSupabaseMiddlewareClient } from '@/lib/supabase/middleware';
 *   const supabase = createSupabaseMiddlewareClient(request, response);
 *   const { data: { user } } = await supabase.auth.getUser();
 */

import { createServerClient } from '@supabase/ssr';
import type { NextRequest, NextResponse } from 'next/server';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Creates a Supabase client scoped to a middleware request/response pair.
 *
 * Cookie reads come from the NextRequest; writes are applied to both the
 * NextRequest (so subsequent middleware code sees updated values) and the
 * NextResponse (so the browser receives the refreshed session cookies).
 *
 * @param request  The incoming NextRequest from middleware.
 * @param response The outgoing NextResponse being built by middleware.
 * @returns        A SupabaseClient configured for the current request context.
 */
export function createSupabaseMiddlewareClient(
  request: NextRequest,
  response: NextResponse,
): SupabaseClient {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        /**
         * Read all cookies from the incoming request.
         * @supabase/ssr uses these to locate the current session tokens.
         */
        getAll() {
          return request.cookies.getAll();
        },

        /**
         * Write updated/refreshed session cookies to both the request and
         * the response. Writing to the request ensures any code that runs
         * after this point in the same middleware chain sees the fresh
         * values. Writing to the response ensures the browser stores them.
         */
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );
}
