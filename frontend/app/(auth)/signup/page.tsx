'use client';

import { useState, useId } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import AuthCard from '@/components/auth/AuthCard';

// ── Shared input style ────────────────────────────────────────────────────────

const inputBase = cn(
  'w-full h-11 rounded-lg border border-[var(--border-input)] bg-[var(--bg-muted)]',
  'px-3.5 text-sm text-[var(--fg)] placeholder:text-[var(--fg-subtle)]',
  'focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent',
  'disabled:opacity-50 disabled:cursor-not-allowed',
  'transition-all duration-150',
);

const inputError = 'border-red-400 focus:ring-red-400';

// Password strength checker
function getPasswordStrength(password: string): { score: number; label: string; color: string } {
  if (!password) return { score: 0, label: '', color: '' };
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const levels = [
    { score: 1, label: 'Weak', color: '#ef4444' },
    { score: 2, label: 'Fair', color: '#f97316' },
    { score: 3, label: 'Good', color: '#C9A227' },
    { score: 4, label: 'Strong', color: '#22c55e' },
  ];
  return levels[score - 1] ?? { score: 0, label: '', color: '' };
}

// ── Google OAuth button ───────────────────────────────────────────────────────

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

// ── Divider ───────────────────────────────────────────────────────────────────

function Divider() {
  return (
    <div className="relative my-5">
      <div className="absolute inset-0 flex items-center" aria-hidden="true">
        <div className="w-full border-t border-[var(--border)]" />
      </div>
      <div className="relative flex justify-center">
        <span className="bg-[var(--bg)] px-3 text-xs text-[var(--fg-subtle)] uppercase tracking-widest">
          or
        </span>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

type SignUpStep = 'form' | 'success';

export default function SignUpPage() {
  const uid = useId();
  const id = (s: string) => `${uid}-${s}`;

  const [step, setStep] = useState<SignUpStep>('form');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Form values
  const [values, setValues] = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [agreed, setAgreed] = useState(false);

  const strength = getPasswordStrength(values.password);

  function validate() {
    const e: Record<string, string> = {};
    if (!values.name.trim()) e.name = 'Full name is required';
    if (!values.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) e.email = 'Enter a valid email';
    if (!values.password) e.password = 'Password is required';
    else if (values.password.length < 8) e.password = 'Password must be at least 8 characters';
    if (values.password !== values.confirm) e.confirm = 'Passwords do not match';
    if (!agreed) e.agreed = 'You must agree to continue';
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    // Simulate API call — replace with real auth
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
    setStep('success');
  }

  function handleGoogle() {
    setGoogleLoading(true);
    // Initiate Google OAuth — replace with real provider URL
    window.location.href = '/api/auth/google';
  }

  function set(field: string, value: string) {
    setValues((v) => ({ ...v, [field]: value }));
    if (errors[field]) setErrors((e) => { const n = { ...e }; delete n[field]; return n; });
  }

  // ── Success state ─────────────────────────────────────────────────────────

  if (step === 'success') {
    return (
      <AuthCard>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-8"
        >
          <div className="flex justify-center mb-5">
            <div className="h-16 w-16 rounded-full flex items-center justify-center" style={{ background: 'rgba(34,197,94,0.1)' }}>
              <CheckCircle2 className="h-8 w-8 text-green-500" aria-hidden="true" />
            </div>
          </div>
          <h1 className="font-display text-2xl font-semibold text-[var(--fg)] mb-2">Account Created!</h1>
          <p className="text-sm text-[var(--fg-muted)] mb-6">
            Welcome to Tribhuban Concepts. We&apos;ve sent a verification email to <strong>{values.email}</strong>. Please verify to activate your account.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center h-11 px-6 rounded-lg text-sm font-semibold bg-[var(--btn-primary-bg)] text-[var(--btn-primary-fg)] hover:bg-[var(--btn-primary-hover)] transition-colors"
          >
            Go to Login
          </Link>
          <p className="text-xs text-[var(--fg-subtle)] mt-4">
            Didn&apos;t receive the email?{' '}
            <button className="text-[var(--accent)] hover:underline" onClick={() => {}}>Resend</button>
          </p>
        </motion.div>
      </AuthCard>
    );
  }

  // ── Form ──────────────────────────────────────────────────────────────────

  return (
    <AuthCard>
      <div className="space-y-1 mb-7">
        <h1 className="font-display text-2xl font-semibold text-[var(--fg)]">Create your account</h1>
        <p className="text-sm text-[var(--fg-muted)]">
          Already have an account?{' '}
          <Link href="/login" className="text-[var(--accent)] hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>

      {/* Google */}
      <GoogleButton onClick={handleGoogle} disabled={googleLoading || loading} />

      <Divider />

      {/* Form */}
      <form onSubmit={handleSubmit} noValidate className="space-y-4">

        {/* Name */}
        <div>
          <label htmlFor={id('name')} className="block text-sm font-medium text-[var(--fg-muted)] mb-1.5">
            Full Name <span aria-hidden="true" className="text-red-500">*</span>
          </label>
          <input
            id={id('name')}
            type="text"
            autoComplete="name"
            placeholder="Ravi Kumar"
            aria-required="true"
            aria-describedby={errors.name ? id('name-err') : undefined}
            className={cn(inputBase, errors.name && inputError)}
            value={values.name}
            onChange={(e) => set('name', e.target.value)}
          />
          {errors.name && <p id={id('name-err')} role="alert" className="mt-1 text-xs text-red-500">{errors.name}</p>}
        </div>

        {/* Email */}
        <div>
          <label htmlFor={id('email')} className="block text-sm font-medium text-[var(--fg-muted)] mb-1.5">
            Email Address <span aria-hidden="true" className="text-red-500">*</span>
          </label>
          <input
            id={id('email')}
            type="email"
            autoComplete="email"
            placeholder="ravi@example.com"
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
          <label htmlFor={id('password')} className="block text-sm font-medium text-[var(--fg-muted)] mb-1.5">
            Password <span aria-hidden="true" className="text-red-500">*</span>
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

          {/* Strength meter */}
          {values.password && (
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

        {/* Confirm password */}
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
              value={values.confirm}
              onChange={(e) => set('confirm', e.target.value)}
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

        {/* Terms agreement */}
        <div>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => { setAgreed(e.target.checked); if (errors.agreed) setErrors((er) => { const n = { ...er }; delete n.agreed; return n; }); }}
              aria-describedby={errors.agreed ? id('agreed-err') : undefined}
              className="mt-0.5 h-4 w-4 rounded border-[var(--border-input)] accent-[var(--accent)] cursor-pointer"
            />
            <span className="text-xs text-[var(--fg-muted)] leading-relaxed">
              I agree to Tribhuban Concepts&apos;{' '}
              <Link href="/legal/terms" className="text-[var(--accent)] hover:underline" target="_blank">Terms of Service</Link>
              {' '}and{' '}
              <Link href="/legal/privacy" className="text-[var(--accent)] hover:underline" target="_blank">Privacy Policy</Link>.
              Your data is safe and never shared.
            </span>
          </label>
          {errors.agreed && <p id={id('agreed-err')} role="alert" className="mt-1 text-xs text-red-500">{errors.agreed}</p>}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || googleLoading}
          aria-busy={loading}
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
            {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            {loading ? 'Creating Account…' : 'Create Account'}
          </span>
          <span className="absolute inset-0 -skew-x-12 bg-white/10 -translate-x-full group-hover:translate-x-[200%] transition-transform duration-500 pointer-events-none" aria-hidden="true" />
        </button>
      </form>

      {/* Footer */}
      <p className="text-center text-xs text-[var(--fg-subtle)] mt-6">
        By continuing, you acknowledge our{' '}
        <Link href="/legal/cookies" className="text-[var(--accent)] hover:underline">Cookie Policy</Link>.
      </p>
    </AuthCard>
  );
}
