'use client';

import { useState, useId, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Loader2, AlertCircle, UserX, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import AuthCard from '@/components/auth/AuthCard';
import { useAuth } from '@/contexts/AuthContext';
import { Suspense } from 'react';

// ── Shared input style ────────────────────────────────────────────────────────

const inputBase = cn(
  'w-full h-11 rounded-lg border border-[var(--border-input)] bg-[var(--bg-muted)]',
  'px-3.5 text-sm text-[var(--fg)] placeholder:text-[var(--fg-subtle)]',
  'focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent',
  'disabled:opacity-50 disabled:cursor-not-allowed',
  'transition-all duration-150',
);

const inputError = 'border-red-400 focus:ring-red-400';

// ── Google button ─────────────────────────────────────────────────────────────

function GoogleButton({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'w-full h-11 flex items-center justify-center gap-3 rounded-lg',
        'border border-[var(--border)] bg-[var(--surface)]',
        'text-sm font-medium text-[var(--fg)]',
        'hover:bg-[var(--bg-subtle)] hover:border-[var(--accent)]/40',
        'transition-all duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]',
        'disabled:opacity-50 disabled:cursor-not-allowed',
      )}
    >
      <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
        <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
        <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/>
        <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z"/>
        <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z"/>
      </svg>
      Continue with Google
    </button>
  );
}

function Divider() {
  return (
    <div className="relative my-5">
      <div className="absolute inset-0 flex items-center" aria-hidden="true">
        <div className="w-full border-t border-[var(--border)]" />
      </div>
      <div className="relative flex justify-center">
        <span className="bg-[var(--bg)] px-3 text-xs text-[var(--fg-subtle)] uppercase tracking-widest">or</span>
      </div>
    </div>
  );
}

// ── "No account" banner — shown when ?noAccount=1 ─────────────────────────────

function NoAccountBanner() {
  const searchParams = useSearchParams();
  const noAccount = searchParams.get('noAccount');
  if (!noAccount) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        role="alert"
        className={cn(
          'flex items-start gap-3 rounded-xl p-4 mb-6',
          'border border-amber-200 bg-amber-50',
        )}
      >
        <UserX className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
        <div>
          <p className="text-sm font-semibold text-amber-800">No account found</p>
          <p className="text-xs text-amber-700 mt-0.5">
            It looks like you haven&apos;t created an account yet.{' '}
            <Link href="/signup" className="font-semibold underline hover:text-amber-900 transition-colors">
              Create one now
            </Link>{' '}
            to get started — it only takes a minute!
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── Email verified success banner — shown when ?verified=1 ────────────────────

function VerifiedBanner() {
  const searchParams = useSearchParams();
  if (searchParams.get('verified') !== '1') return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        role="alert"
        className={cn(
          'flex items-start gap-3 rounded-xl p-4 mb-6',
          'border border-green-200 bg-green-50',
        )}
      >
        <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" aria-hidden="true" />
        <div>
          <p className="text-sm font-semibold text-green-800">Email verified!</p>
          <p className="text-xs text-green-700 mt-0.5">
            Your email has been confirmed. You can now sign in.
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── Password reset success banner — shown when ?reset=1 ───────────────────────

function PasswordResetBanner() {
  const searchParams = useSearchParams();
  if (searchParams.get('reset') !== '1') return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        role="alert"
        className={cn(
          'flex items-start gap-3 rounded-xl p-4 mb-6',
          'border border-green-200 bg-green-50',
        )}
      >
        <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" aria-hidden="true" />
        <div>
          <p className="text-sm font-semibold text-green-800">Password updated!</p>
          <p className="text-xs text-green-700 mt-0.5">
            Your password has been changed successfully. Please sign in.
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── Main login form ───────────────────────────────────────────────────────────

function LoginForm() {
  const uid = useId();
  const id = (s: string) => `${uid}-${s}`;
  const router = useRouter();
  const searchParams = useSearchParams();

  const { signIn, signInWithGoogle, loading: authLoading, error: authError, clearError } = useAuth();

  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [values, setValues] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [localAuthError, setLocalAuthError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  // Sync context-level auth errors (e.g. from Google OAuth redirect errors)
  // into local display state.
  useEffect(() => {
    if (authError) setLocalAuthError(authError);
  }, [authError]);

  // Handle ?error=oauth_error query param from /auth/callback failures.
  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam === 'oauth_error') {
      setLocalAuthError('Google sign-in failed. Please try again.');
    } else if (errorParam === 'verification_failed') {
      setLocalAuthError('Email verification failed. Please request a new verification email.');
    }
  }, [searchParams]);

  function validate() {
    const e: Record<string, string> = {};
    if (!values.email.trim()) e.email = 'Email is required';
    if (!values.password) e.password = 'Password is required';
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setLocalAuthError('');
    clearError();

    await signIn({ email: values.email, password: values.password });

    // After signIn, check for errors via authError (synced via useEffect above).
    // If no error, the onAuthStateChange listener will update the session
    // and we redirect.
    if (!authError) {
      // Validate redirect_to — only allow relative same-origin paths.
      const redirectTo = searchParams.get('redirect_to');
      const safePath =
        redirectTo && redirectTo.startsWith('/') && !redirectTo.startsWith('//')
          ? redirectTo
          : '/';
      router.push(safePath);
    } else {
      // Clear password field on auth error for security.
      setValues((v) => ({ ...v, password: '' }));
    }
  }

  function set(field: string, value: string) {
    setValues((v) => ({ ...v, [field]: value }));
    if (errors[field]) setErrors((e) => { const n = { ...e }; delete n[field]; return n; });
    if (localAuthError) { setLocalAuthError(''); clearError(); }
  }

  async function handleGoogle() {
    setGoogleLoading(true);
    setLocalAuthError('');
    clearError();
    const redirectTo = searchParams.get('redirect_to');
    const safePath =
      redirectTo && redirectTo.startsWith('/') && !redirectTo.startsWith('//')
        ? redirectTo
        : '/';
    await signInWithGoogle(safePath);
    // signInWithGoogle redirects the browser to Google — if we reach here
    // it means an error occurred before the redirect.
    setGoogleLoading(false);
  }

  const isLoading = authLoading || googleLoading;

  return (
    <AuthCard>
      {/* Query param banners */}
      <NoAccountBanner />
      <VerifiedBanner />
      <PasswordResetBanner />

      <div className="space-y-1 mb-7">
        <h1 className="font-display text-2xl font-semibold text-[var(--fg)]">Welcome back</h1>
        <p className="text-sm text-[var(--fg-muted)]">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-[var(--accent)] hover:underline font-medium">
            Sign up free
          </Link>
        </p>
      </div>

      {/* Google */}
      <GoogleButton onClick={handleGoogle} disabled={isLoading} />

      <Divider />

      {/* Auth error banner */}
      <AnimatePresence>
        {localAuthError && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 overflow-hidden"
          >
            <div className="flex items-center gap-2.5 rounded-lg p-3 bg-red-50 border border-red-200" role="alert">
              <AlertCircle className="h-4 w-4 text-red-500 shrink-0" aria-hidden="true" />
              <p className="text-xs text-red-700 font-medium">{localAuthError}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Form */}
      <form onSubmit={handleSubmit} noValidate className="space-y-4">

        {/* Email */}
        <div>
          <label htmlFor={id('email')} className="block text-sm font-medium text-[var(--fg-muted)] mb-1.5">
            Email Address <span aria-hidden="true" className="text-red-500">*</span>
          </label>
          <input
            id={id('email')}
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            aria-required="true"
            aria-describedby={errors.email ? id('email-err') : undefined}
            className={cn(inputBase, errors.email && inputError)}
            value={values.email}
            onChange={(e) => set('email', e.target.value)}
          />
          {errors.email && <p id={id('email-err')} role="alert" className="mt-1 text-xs text-red-500">{errors.email}</p>}
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor={id('password')} className="text-sm font-medium text-[var(--fg-muted)]">
              Password <span aria-hidden="true" className="text-red-500">*</span>
            </label>
            <Link
              href="/forgot-password"
              className="text-xs text-[var(--accent)] hover:underline font-medium"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              id={id('password')}
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="Enter your password"
              aria-required="true"
              aria-describedby={errors.password ? id('pwd-err') : undefined}
              className={cn(inputBase, 'pr-10', errors.password && inputError)}
              value={values.password}
              onChange={(e) => set('password', e.target.value)}
            />
            <button
              type="button"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--fg-subtle)] hover:text-[var(--fg)] transition-colors"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <p id={id('pwd-err')} role="alert" className="mt-1 text-xs text-red-500">{errors.password}</p>}
        </div>

        {/* Remember me */}
        <label className="flex items-center gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="h-4 w-4 rounded border-[var(--border-input)] accent-[var(--accent)] cursor-pointer"
          />
          <span className="text-sm text-[var(--fg-muted)]">Remember me for 30 days</span>
        </label>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          aria-busy={authLoading}
          className={cn(
            'relative w-full h-11 rounded-lg text-sm font-semibold overflow-hidden',
            'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-fg)]',
            'hover:bg-[var(--btn-primary-hover)] transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]',
            'disabled:opacity-60 disabled:cursor-not-allowed group',
          )}
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            {authLoading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            {authLoading ? 'Signing in…' : 'Sign In'}
          </span>
          <span className="absolute inset-0 -skew-x-12 bg-white/10 -translate-x-full group-hover:translate-x-[200%] transition-transform duration-500 pointer-events-none" aria-hidden="true" />
        </button>
      </form>

      {/* Footer links */}
      <div className="mt-6 pt-5 border-t border-[var(--border)] space-y-2 text-center">
        <p className="text-xs text-[var(--fg-subtle)]">
          <Link href="/legal/terms" className="text-[var(--accent)] hover:underline">Terms of Service</Link>
          {' · '}
          <Link href="/legal/privacy" className="text-[var(--accent)] hover:underline">Privacy Policy</Link>
          {' · '}
          <Link href="/legal/cookies" className="text-[var(--accent)] hover:underline">Cookie Policy</Link>
        </p>
        <p className="text-xs text-[var(--fg-subtle)]">
          Need help?{' '}
          <Link href="/contact" className="text-[var(--accent)] hover:underline">Contact support</Link>
        </p>
      </div>
    </AuthCard>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
