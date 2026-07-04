'use client';

/**
 * NewsletterForm.tsx
 *
 * Double opt-in newsletter signup form (Task 8.2).
 *
 * States:
 *   idle        — email input + Subscribe button
 *   submitting  — spinner + "Subscribing…", input + button disabled
 *   success     — check + contextual message (per API status field)
 *   error       — inline error below input, input value preserved
 *
 * API: POST /api/v1/newsletter/subscribe → { data: { message, status } }
 *
 * Accessibility (Req 1.8, 24.4):
 *   - <label> (sr-only) linked to input via htmlFor / id
 *   - aria-describedby on input when error present
 *   - aria-busy on submit button while submitting
 *   - role="status" + aria-live="polite" on success message
 *
 * Requirements: 1.8, 9.1
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, CheckCircle2 } from 'lucide-react';

import { cn } from '@/lib/utils/cn';
import { subscribeNewsletter, NewsletterApiError } from '@/lib/api/newsletter';

// ── Schema ────────────────────────────────────────────────────────────────────

const newsletterSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .max(254, 'Email is too long'),
});

type NewsletterFormValues = z.infer<typeof newsletterSchema>;

// ── State types ───────────────────────────────────────────────────────────────

type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

// ── Props ─────────────────────────────────────────────────────────────────────

export interface NewsletterFormProps {
  /** Attribution source sent to the API (e.g. "footer", "home_cta") */
  source?: string;
  /** Additional class names for the form wrapper */
  className?: string;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function NewsletterForm({
  source = 'footer',
  className,
}: NewsletterFormProps) {
  const [formStatus, setFormStatus] = useState<FormStatus>('idle');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<NewsletterFormValues>({
    resolver: zodResolver(newsletterSchema),
    mode: 'onTouched',
  });

  const errorId = 'newsletter-email-error';
  const isSubmitting = formStatus === 'submitting';

  // ── Submit handler ─────────────────────────────────────────────────────────
  async function onSubmit(data: NewsletterFormValues) {
    setFormStatus('submitting');
    setErrorMessage('');

    try {
      const result = await subscribeNewsletter(data.email, source);

      if (result.status === 'already_confirmed') {
        setSuccessMessage("✓ You're already subscribed!");
      } else if (result.status === 'already_pending') {
        setSuccessMessage('✓ Check your inbox — confirmation email already sent');
      } else {
        // status === 'pending' (or any future success status)
        setSuccessMessage('✓ Check your inbox to confirm your subscription');
      }

      setFormStatus('success');
    } catch (err) {
      let message = 'Something went wrong. Please try again.';
      if (err instanceof NewsletterApiError) {
        message = err.detail || message;
      } else if (err instanceof Error) {
        message = err.message || message;
      }
      setErrorMessage(message);
      setFormStatus('error');
    }
  }

  // ── Success state ──────────────────────────────────────────────────────────
  if (formStatus === 'success') {
    return (
      <p
        role="status"
        aria-live="polite"
        className="flex items-center gap-2 text-sm font-medium text-[color:#2E7D5B]"
      >
        <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
        {successMessage}
      </p>
    );
  }

  // ── Idle / submitting / error ──────────────────────────────────────────────
  const hasInputError = !!errors.email || formStatus === 'error';

  return (
    <form
      aria-label="Newsletter signup"
      onSubmit={handleSubmit(onSubmit)}
      className={cn('w-full', className)}
      noValidate
    >
      {/* Accessible label — sr-only for compact layout */}
      <label htmlFor="newsletter-email" className="sr-only">
        Email address
      </label>

      {/* Input + button row */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
        <div className="flex flex-col gap-1 min-w-0 flex-1">
          <input
            id="newsletter-email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            disabled={isSubmitting}
            aria-required="true"
            aria-invalid={hasInputError ? 'true' : 'false'}
            aria-describedby={hasInputError ? errorId : undefined}
            {...register('email')}
            className={cn(
              'h-10 w-full rounded-md border px-3',
              'text-sm text-[var(--fg)] bg-[var(--bg-muted)]',
              'placeholder:text-[var(--fg-subtle)]',
              hasInputError
                ? 'border-[#A83232] focus-visible:ring-[#A83232]'
                : 'border-[var(--border-input)] focus-visible:ring-[var(--ring)]',
              'focus-visible:outline-none focus-visible:ring-2',
              'focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--bg)]',
              'disabled:opacity-60 disabled:cursor-not-allowed',
              'transition-colors duration-150',
            )}
          />

          {/* Zod validation error */}
          {errors.email && (
            <p
              id={errorId}
              role="alert"
              className="text-xs text-[color:#A83232]"
            >
              {errors.email.message}
            </p>
          )}

          {/* API / network error (only when no Zod error is present) */}
          {formStatus === 'error' && !errors.email && (
            <p
              id={errorId}
              role="alert"
              className="text-xs text-[color:#A83232]"
            >
              {errorMessage}
            </p>
          )}
        </div>

        {/* Subscribe button */}
        <button
          type="submit"
          disabled={isSubmitting}
          aria-disabled={isSubmitting}
          aria-busy={isSubmitting}
          className={cn(
            'relative h-10 px-5 rounded-md shrink-0 overflow-hidden',
            'text-sm font-semibold whitespace-nowrap',
            'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-fg)]',
            'hover:bg-[var(--btn-primary-hover)] transition-colors duration-150',
            'focus-visible:outline-none focus-visible:ring-2',
            'focus-visible:ring-[var(--ring)] focus-visible:ring-offset-1',
            'focus-visible:ring-offset-[var(--bg)]',
            'disabled:opacity-60 disabled:cursor-not-allowed',
            'inline-flex items-center justify-center gap-2',
            'w-full sm:w-auto group',
          )}
        >
          {/* shimmer sweep */}
          <span
            className="absolute inset-0 -skew-x-12 bg-white/10 translate-x-[-100%]
                       group-hover:translate-x-[200%] transition-transform duration-500 ease-in-out pointer-events-none"
            aria-hidden="true"
          />
          <span className="relative z-10 flex items-center gap-2">
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                <span>Subscribing…</span>
              </>
            ) : (
              'Subscribe'
            )}
          </span>
        </button>
      </div>
    </form>
  );
}
