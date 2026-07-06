'use client';

import { useState, useId } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Loader2, ArrowLeft, Mail } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import AuthCard from '@/components/auth/AuthCard';

const inputBase = cn(
  'w-full h-11 rounded-lg border border-[var(--border-input)] bg-[var(--bg-muted)]',
  'px-3.5 text-sm text-[var(--fg)] placeholder:text-[var(--fg-subtle)]',
  'focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent',
  'disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150',
);

export default function ForgotPasswordPage() {
  const uid = useId();
  const id = (s: string) => `${uid}-${s}`;

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) { setError('Email is required'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Enter a valid email address'); return; }
    setError('');
    setLoading(true);
    // Simulate API call — replace with real password reset
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setSent(true);
  }

  if (sent) {
    return (
      <AuthCard>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-6"
        >
          <div className="flex justify-center mb-5">
            <div className="h-16 w-16 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(201,162,39,0.12)', border: '2px solid rgba(201,162,39,0.3)' }}>
              <Mail className="h-8 w-8" style={{ color: '#C9A227' }} aria-hidden="true" />
            </div>
          </div>
          <h1 className="font-display text-2xl font-semibold text-[var(--fg)] mb-2">Check your inbox</h1>
          <p className="text-sm text-[var(--fg-muted)] mb-2">
            We&apos;ve sent a password reset link to
          </p>
          <p className="text-sm font-semibold text-[var(--accent)] mb-6">{email}</p>
          <p className="text-xs text-[var(--fg-subtle)] mb-6">
            The link expires in 30 minutes. Check your spam folder if you don&apos;t see it.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => { setSent(false); }}
              className="w-full h-11 rounded-lg text-sm font-medium border border-[var(--border)] text-[var(--fg)] hover:bg-[var(--bg-subtle)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
            >
              Try a different email
            </button>
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 w-full h-11 rounded-lg text-sm font-semibold bg-[var(--btn-primary-bg)] text-[var(--btn-primary-fg)] hover:bg-[var(--btn-primary-hover)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
            >
              Back to Login
            </Link>
          </div>
        </motion.div>
      </AuthCard>
    );
  }

  return (
    <AuthCard>
      <div className="mb-7">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-sm text-[var(--fg-muted)] hover:text-[var(--accent)] transition-colors mb-5"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Back to Login
        </Link>
        <h1 className="font-display text-2xl font-semibold text-[var(--fg)] mb-1">Reset your password</h1>
        <p className="text-sm text-[var(--fg-muted)]">
          Enter the email address associated with your account and we&apos;ll send you a reset link.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
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
            aria-describedby={error ? id('email-err') : undefined}
            className={cn(inputBase, error && 'border-red-400 focus:ring-red-400')}
            value={email}
            onChange={(e) => { setEmail(e.target.value); if (error) setError(''); }}
          />
          {error && <p id={id('email-err')} role="alert" className="mt-1 text-xs text-red-500">{error}</p>}
        </div>

        <button
          type="submit"
          disabled={loading}
          aria-busy={loading}
          className={cn(
            'relative w-full h-11 rounded-lg text-sm font-semibold overflow-hidden',
            'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-fg)]',
            'hover:bg-[var(--btn-primary-hover)] transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]',
            'disabled:opacity-60 disabled:cursor-not-allowed group',
          )}
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            {loading ? 'Sending…' : 'Send Reset Link'}
          </span>
          <span className="absolute inset-0 -skew-x-12 bg-white/10 -translate-x-full group-hover:translate-x-[200%] transition-transform duration-500 pointer-events-none" aria-hidden="true" />
        </button>
      </form>

      <div className="mt-6 pt-5 border-t border-[var(--border)] text-center">
        <p className="text-xs text-[var(--fg-subtle)]">
          Remember your password?{' '}
          <Link href="/login" className="text-[var(--accent)] hover:underline font-medium">Sign in</Link>
        </p>
        <p className="text-xs text-[var(--fg-subtle)] mt-2">
          <Link href="/legal/privacy" className="text-[var(--accent)] hover:underline">Privacy Policy</Link>
          {' · '}
          <Link href="/legal/terms" className="text-[var(--accent)] hover:underline">Terms of Service</Link>
        </p>
      </div>
    </AuthCard>
  );
}
