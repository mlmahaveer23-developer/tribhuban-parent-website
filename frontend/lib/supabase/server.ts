/**
 * Supabase Server Client
 *
 * Factory function for creating a Supabase client in Server Components,
 * Server Actions, and Route Handlers. Uses @supabase/ssr's createServerClient
 * with the Next.js cookies() API so the session is read from and written to
 * HTTP-only cookies — never exposed to JavaScript or localStorage.
 *
 * A new client instance is created per request (not a singleton) because
 * the Next.js cookies() store is request-scoped.
 *
 * Usage (Server Component or Server Action):
 *   import { getSupabaseServerClient } from '@/lib/supabase/server';
 *   const supabase = await getSupabaseServerClient();
 *   const { data: { user } } = await supabase.auth.getUser();
 */

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Creates and returns a Supabase server client for the current request.
 *
 * Cookie reads/writes are handled transparently via the Next.js cookies()
 * API. In read-only contexts (Server Components that cannot set cookies),
 * the setAll handler silently no-ops — the client will still work for reads
 * and the middleware is responsible for refreshing the session cookie.
 *
 * @returns A fully configured SupabaseClient bound to the current request cookies.
 */
export async function getSupabaseServerClient(): Promise<SupabaseClient> {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        /**
         * Return all cookies as an array of { name, value } objects.
         * @supabase/ssr uses this to read the current session tokens.
         */
        getAll() {
          return cookieStore.getAll();
        },

        /**
         * Persist updated session cookies back to the response.
         * In Server Component contexts, cookies() is read-only and
         * the set will throw — we catch and ignore it here because the
         * middleware will handle the refresh on the next request.
         */
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Server Component read-only context — the middleware will
            // refresh the session cookie on the next incoming request.
          }
        },
      },
    },
  );
}
