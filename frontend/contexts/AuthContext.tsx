'use client';

/**
 * AuthContext — Application-wide authentication state and methods.
 *
 * Provides a React context that wraps the entire application (via AuthProvider
 * in app/layout.tsx) and exposes:
 *
 *   State:
 *     - user      : The currently authenticated Supabase User, or null.
 *     - session   : The current Session (contains access/refresh tokens), or null.
 *     - loading   : True while the initial session is being fetched on mount.
 *     - error     : A user-friendly error string, or null.
 *
 *   Methods:
 *     - signUp          : Create a new account with email/password + full name.
 *     - signIn          : Sign in with email/password.
 *     - signInWithGoogle: Initiate Google OAuth (PKCE flow).
 *     - signOut         : Invalidate session server-side and redirect to home.
 *     - resetPassword   : Send a password reset email.
 *     - updatePassword  : Set a new password (requires active reset session).
 *     - clearError      : Manually clear the error state.
 *
 * Security:
 *   - Sessions are stored in HTTP-only cookies managed by @supabase/ssr.
 *   - The access token never touches localStorage or sessionStorage.
 *   - Google OAuth uses PKCE flow (not implicit).
 *   - redirect_to values are validated to be relative same-origin paths.
 *
 * Usage:
 *   import { useAuth } from '@/contexts/AuthContext';
 *   const { user, signIn, signOut } = useAuth();
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { mapAuthError } from '@/lib/supabase/auth-errors';

// ── Types ─────────────────────────────────────────────────────────────────────

interface SignUpParams {
  email: string;
  password: string;
  fullName: string;
}

interface SignInParams {
  email: string;
  password: string;
}

interface AuthContextValue {
  /** The currently authenticated user, or null if not signed in. */
  user: User | null;
  /** The current session containing access/refresh tokens, or null. */
  session: Session | null;
  /** True while the initial session is being resolved on mount. */
  loading: boolean;
  /** A user-friendly error message, or null if no error. */
  error: string | null;
  /** Create a new account. Sets error state on failure. */
  signUp: (params: SignUpParams) => Promise<void>;
  /** Sign in with email and password. Sets error state on failure. */
  signIn: (params: SignInParams) => Promise<void>;
  /** Initiate Google OAuth (PKCE). Redirects to Google consent screen. */
  signInWithGoogle: (redirectTo?: string) => Promise<void>;
  /** Sign out, invalidate the session server-side, redirect to home. */
  signOut: () => Promise<void>;
  /** Send a password reset email. Always resolves (prevents enumeration). */
  resetPassword: (email: string) => Promise<void>;
  /** Set a new password. Requires an active reset session. */
  updatePassword: (newPassword: string) => Promise<void>;
  /** Clear the current error state. */
  clearError: () => void;
}

// ── Context ───────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ── Provider ──────────────────────────────────────────────────────────────────

/**
 * AuthProvider — wraps the application at the root layout level.
 *
 * Lifecycle:
 *  1. On mount: calls getSession() to set the initial user/session state,
 *     then sets loading=false regardless of outcome.
 *  2. Subscribes to onAuthStateChange() for reactive updates (sign-in,
 *     sign-out, token refresh, cross-tab sync).
 *  3. Unsubscribes from the listener on unmount to prevent memory leaks.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]       = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  // Stable supabase client reference — created once, never recreated.
  const supabaseRef = useRef(getSupabaseBrowserClient());
  const supabase = supabaseRef.current;

  useEffect(() => {
    let mounted = true;

    // 1. Fetch the current session on mount.
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (!mounted) return;
      setSession(s);
      setUser(s?.user ?? null);
      setLoading(false);
    });

    // 2. Subscribe to auth state changes for reactive updates across
    //    the component tree and across browser tabs.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, s) => {
        if (!mounted) return;
        setSession(s);
        setUser(s?.user ?? null);
        // Clear any stale error when auth state changes successfully.
        if (s) setError(null);
      },
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  // ── signUp ──────────────────────────────────────────────────────────────────

  const signUp = useCallback(
    async ({ email, password, fullName }: SignUpParams): Promise<void> => {
      setError(null);
      const origin =
        typeof window !== 'undefined' ? window.location.origin : '';

      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          // After email confirmation, the verification link calls /auth/verify
          // which exchanges the token and redirects to /login?verified=1.
          emailRedirectTo: `${origin}/auth/verify`,
        },
      });

      if (authError) {
        setError(mapAuthError(authError.message));
        if (process.env.NODE_ENV === 'development') {
          console.error('[Auth] signUp error:', authError);
        }
      }
    },
    [supabase],
  );

  // ── signIn ──────────────────────────────────────────────────────────────────

  const signIn = useCallback(
    async ({ email, password }: SignInParams): Promise<void> => {
      setError(null);

      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(mapAuthError(authError.message));
        if (process.env.NODE_ENV === 'development') {
          console.error('[Auth] signIn error:', authError);
        }
      }
    },
    [supabase],
  );

  // ── signInWithGoogle ─────────────────────────────────────────────────────────

  const signInWithGoogle = useCallback(
    async (redirectTo?: string): Promise<void> => {
      setError(null);
      const origin =
        typeof window !== 'undefined' ? window.location.origin : '';

      // Validate redirectTo is a safe relative path (prevent open redirect).
      const safePath =
        redirectTo &&
        redirectTo.startsWith('/') &&
        !redirectTo.startsWith('//')
          ? redirectTo
          : '/';

      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          // After Google consent, Supabase redirects to /auth/callback which
          // exchanges the PKCE code for a session, then redirects to safePath.
          redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(safePath)}`,
          queryParams: {
            // Request offline access for a refresh token.
            access_type: 'offline',
            // Always show the account chooser.
            prompt: 'consent',
          },
        },
      });

      if (authError) {
        setError(mapAuthError(authError.message));
        if (process.env.NODE_ENV === 'development') {
          console.error('[Auth] signInWithGoogle error:', authError);
        }
      }
    },
    [supabase],
  );

  // ── signOut ──────────────────────────────────────────────────────────────────

  const signOut = useCallback(async (): Promise<void> => {
    setError(null);

    const { error: authError } = await supabase.auth.signOut();

    if (authError) {
      // Even if the server-side signout fails (e.g. network error), clear
      // local state so the user is treated as signed out in this tab.
      setUser(null);
      setSession(null);
      setError(mapAuthError(authError.message));
      if (process.env.NODE_ENV === 'development') {
        console.error('[Auth] signOut error (local state cleared):', authError);
      }
    }

    // Always redirect to home — even on error the local session is gone.
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  }, [supabase]);

  // ── resetPassword ────────────────────────────────────────────────────────────

  const resetPassword = useCallback(
    async (email: string): Promise<void> => {
      setError(null);
      const origin =
        typeof window !== 'undefined' ? window.location.origin : '';

      // The reset email contains a link to /auth/callback?next=/reset-password.
      // The callback route exchanges the code for a session, then redirects
      // the user to /reset-password where they can set a new password.
      const { error: authError } = await supabase.auth.resetPasswordForEmail(
        email,
        { redirectTo: `${origin}/auth/callback?next=/reset-password` },
      );

      // We intentionally do NOT surface "email not found" errors to the caller
      // to prevent email enumeration attacks. The UI always shows success.
      if (authError) {
        if (process.env.NODE_ENV === 'development') {
          console.error('[Auth] resetPassword error:', authError);
        }
        // Only set error for non-enumeration errors (e.g. rate limiting).
        const msg = authError.message.toLowerCase();
        if (msg.includes('rate') || msg.includes('limit')) {
          setError(mapAuthError(authError.message));
        }
      }
    },
    [supabase],
  );

  // ── updatePassword ───────────────────────────────────────────────────────────

  const updatePassword = useCallback(
    async (newPassword: string): Promise<void> => {
      setError(null);

      const { error: authError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (authError) {
        setError(mapAuthError(authError.message));
        if (process.env.NODE_ENV === 'development') {
          console.error('[Auth] updatePassword error:', authError);
        }
        return;
      }

      // On success: sign out and redirect to login with a success indicator.
      await supabase.auth.signOut();
      if (typeof window !== 'undefined') {
        window.location.href = '/login?reset=1';
      }
    },
    [supabase],
  );

  // ── clearError ───────────────────────────────────────────────────────────────

  const clearError = useCallback(() => setError(null), []);

  // ── Context value ─────────────────────────────────────────────────────────────

  const value: AuthContextValue = {
    user,
    session,
    loading,
    error,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
    updatePassword,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ── useAuth hook ──────────────────────────────────────────────────────────────

/**
 * useAuth — consume the AuthContext from any Client Component.
 *
 * Throws a descriptive error if used outside of AuthProvider so
 * misconfiguration is immediately obvious during development.
 *
 * @returns The AuthContextValue with user, session, loading, error, and methods.
 */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error(
      'useAuth() must be used inside <AuthProvider>. ' +
        'Ensure <AuthProvider> wraps your component tree in app/layout.tsx.',
    );
  }
  return ctx;
}
