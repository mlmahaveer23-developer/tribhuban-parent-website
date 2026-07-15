'use client';

import { useState, useEffect, useId } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import AuthCard from '@/components/auth/AuthCard';
import { useAuth } from '@/contexts/AuthContext';
import { getPasswordStrength } from '@/lib/utils/password-strength';

const inputBase = cn(
  'w-full h-11 rounded-lg border border-[var(--border-input)] bg-[var(--bg-muted)]',
  'px-3.5 text-sm text-[var(--fg)] placeholder:text-[var(--fg-subtle)]',
  'focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent',
  'disabled:opacity-50 disabled:cursor-not-allowed',
  'transition-all duration-150',
);

const inputError = 'border-red-400 focus:ring-red-400';

export default function ResetPasswordPage() {
  const uid = useId();
  const id = (s: string) => `${uid}-${s}`;
  const router = useRouter();

  const { updatePassword, loading: authLoading, error: authError, clearError, session, loading: sessionLoading } = useAuth();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sessionReady, setSessionReady] = useState(false);

  // Check if user has valid session on mount
  useEffect(() => {
    // If session loading, wait
    if (sessionLoading) return;
    
    // If no session after loading completes, show error
    if (!session) {
      setSessionReady(false);
      return;
    }
    
    // Session exists, ready to show form
    setSessionReady(true);
  }, [session, sessionLoading]);

  const strength = getPasswordStrength(password);

  function validate() {
    const e: Record<string, string> = {};
    if (!password) e.password = 'Password is required';
    else if (password.length < 8) e.password = 'Password must be at least 8 characters';
    if (!confirm) e.confirm = 'Confirm password is required';
    else if (password !== confirm) e.confirm = 'Passwords do not match';
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    clearError();

    // Call updatePassword from useAuth
    await updatePassword(password);

    // On success (no error), context redirects to /login?reset=1
    // On error, error message is in authError state
    if (!authError) {
      // updatePassword should have redirected already, but just in case:
      router.push('/login?reset=1');
    }
  }

  // Session check in progress
  if (sessionLoading) {
    return (
      <AuthCard>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-[var(--fg-muted)]" />
        </div>
      </AuthCard>
    );
  }

  // No session (token expired/invalid)
  if (!sessionReady) {
    return (
      <AuthCard>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-8"
        >
          <div className="flex justify-center mb-5">
            <div className="h-16 w-16 rounded-full flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.1)' }}>
              <AlertCircle className="h-8 w-8 text-red-500" aria-hidden="true" />
            </div>
          </div>
          <h1 className="font-display text-2xl font-semibold text-[var(--fg)] mb-2">Link expired</h1>
          <p className="text-sm text-[var(--fg-muted)] mb-6">
            Your password reset link has expired. Please request a new one.
          </p>
          <Link
            href="/forgot-password"
            className="inline-flex items-center justify-center h-11 px-6 rounded-lg text-sm font-semibold bg-[var(--btn-primary-bg)] text-[var(--btn-primary-fg)] hover:bg-[var(--btn-primary-hover)] transition-colors"
          >
            Request New Link
          </Link>
        </motion.div>
      </AuthCard>
    );
  }

  // Form state (session valid)
  return (
    <AuthCard>
      <div className="mb-7">
        <Link
          href="/forgot-password"
          className="inline-flex items-center gap-1.5 text-sm text-[var(--fg-muted)] hover:text-[var(--accent)] transition-colors mb-5"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Back
        </Link>
        <h1 className="font-display text-2xl font-semibold text-[var(--fg)] mb-1">Set a new password</h1>
        <p className="text-sm text-[var(--fg-muted)]">
          Enter a strong password to secure your account.
        </p>
      </div>

      {/* Error banner */}
      {authError && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mb-4 overflow-hidden"
        >
          <div className="flex items-center gap-2.5 rounded-lg p-3 bg-red-50 border border-red-200" role="alert">
            <p className="text-xs text-red-700 font-medium">{authError}</p>
          </div>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* New Password */}
        <div>
          <label htmlFor={id('password')} className="block text-sm font-medium text-[var(--fg-muted)] mb-1.5">
            New Password <span aria-hidden="true" className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              id={id('password')}
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Min. 8 characters"
              aria-required="true"
              aria-describedby={errors.password ? id('pwd-err') : id('pwd-hint')}
              className={cn(inputBase, 'pr-10', errors.password && inputError)}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors(prev => {const n = {...prev}; delete n.password; return n;});
                if (authError) clearError();
              }}
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

          {/* Strength meter */}
          {password && (
            <div className="mt-2" aria-live="polite" id={id('pwd-hint')}>
              <div className="flex gap-1 mb-1">
                {[1, 2, 3, 4].map((n) => (
                  <div
                    key={n}
                    className="h-1 flex-1 rounded-full transition-all duration-300"
                    style={{ background: n <= strength.score ? strength.color : 'var(--bg-muted)' }}
                  />
                ))}
              </div>
              <p className="text-[11px]" style={{ color: strength.color }}>
                {strength.label} password
              </p>
            </div>
          )}
          {errors.password && <p id={id('pwd-err')} role="alert" className="mt-1 text-xs text-red-500">{errors.password}</p>}
        </div>

        {/* Confirm Password */}
        <div>
          <label htmlFor={id('confirm')} className="block text-sm font-medium text-[var(--fg-muted)] mb-1.5">
            Confirm Password <span aria-hidden="true" className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              id={id('confirm')}
              type={showConfirm ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Re-enter password"
              aria-required="true"
              aria-describedby={errors.confirm ? id('confirm-err') : undefined}
              className={cn(inputBase, 'pr-10', errors.confirm && inputError)}
              value={confirm}
              onChange={(e) => {
                setConfirm(e.target.value);
                if (errors.confirm) setErrors(prev => {const n = {...prev}; delete n.confirm; return n;});
                if (authError) clearError();
              }}
            />
            <button
              type="button"
              aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--fg-subtle)] hover:text-[var(--fg)] transition-colors"
            >
              {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.confirm && <p id={id('confirm-err')} role="alert" className="mt-1 text-xs text-red-500">{errors.confirm}</p>}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={authLoading}
          aria-busy={authLoading}
          className={cn(
            'relative w-full h-11 rounded-lg text-sm font-semibold overflow-hidden',
            'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-fg)]',
            'hover:bg-[var(--btn-primary-hover)] transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]',
            'disabled:opacity-60 disabled:cursor-not-allowed',
            'group',
          )}
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            {authLoading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            {authLoading ? 'Updating…' : 'Update Password'}
          </span>
          <span className="absolute inset-0 -skew-x-12 bg-white/10 -translate-x-full group-hover:translate-x-[200%] transition-transform duration-500 pointer-events-none" aria-hidden="true" />
        </button>
      </form>

      {/* Footer */}
      <p className="text-center text-xs text-[var(--fg-subtle)] mt-6">
        <Link href="/login" className="text-[var(--accent)] hover:underline">Back to login</Link>
      </p>
    </AuthCard>
  );
}
