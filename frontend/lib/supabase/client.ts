/**
 * Supabase Browser Client
 *
 * Singleton factory for the Supabase client used in Client Components.
 * Uses @supabase/ssr's createBrowserClient which manages HTTP-only cookies
 * automatically — session tokens are never stored in localStorage.
 *
 * Usage:
 *   import { getSupabaseBrowserClient } from '@/lib/supabase/client';
 *   const supabase = getSupabaseBrowserClient();
 */

import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

// Module-level singleton — one client instance per browser session.
let client: SupabaseClient | null = null;

/**
 * Returns the Supabase browser client singleton.
 *
 * Validates that required environment variables are present before
 * creating the client. Logs a clear error in development if they are
 * missing so misconfiguration is immediately obvious.
 *
 * @throws {Error} If NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY
 *   are not set. Authentication features will not function without these.
 */
export function getSupabaseBrowserClient(): SupabaseClient {
  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    const missing = [
      !url && 'NEXT_PUBLIC_SUPABASE_URL',
      !key && 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    ]
      .filter(Boolean)
      .join(', ');

    console.error(
      `[Supabase] Missing required environment variable(s): ${missing}. ` +
        'Authentication features will not function. ' +
        'Copy .env.example to .env.local and fill in your Supabase project credentials.',
    );

    throw new Error(
      `Supabase is not configured. Missing environment variable(s): ${missing}`,
    );
  }

  client = createBrowserClient(url, key);
  return client;
}
