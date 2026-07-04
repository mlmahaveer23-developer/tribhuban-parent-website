'use client';

/**
 * ContactForm.tsx
 *
 * Client island for the Contact page (Task 15.1).
 *
 * Fields:
 *   name (required, 1–255), email (required, RFC5322, ≤254),
 *   phone (optional, ≤20), subject/topic (select, required),
 *   message (required, ≤2000), consent (checkbox, required)
 *
 * States: ready → submitting → success (referenceCode) / error (preserve input)
 *
 * Accessibility (Req 8.3):
 *   - All inputs linked by <label htmlFor> + id
 *   - Errors linked via aria-describedby
 *   - Submit: aria-busy + disabled while submitting
 *   - Success: focus moves to success heading
 *   - Error: focus moves to error alert
 *
 * Requirements: 8.1, 8.2, 8.3
 */

import React, { useId, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, CheckCircle, AlertTriangle } from 'lucide-react';

import { cn } from '@/lib/utils/cn';
import {
  submitContact,
  ContactApiError,
  type ContactInterestArea,
} from '@/lib/api/contact';

// ── Zod schema ────────────────────────────────────────────────────────────────

const contactSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(255, 'Name must be at most 255 characters'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .max(254, 'Email must be at most 254 characters'),
  phone: z
    .string()
    .max(20, 'Phone must be at most 20 characters')
    .optional()
    .or(z.literal('')),
  topic: z.enum(
    ['solar', 'products', 'future_tech', 'careers', 'support', 'other'],
    { required_error: 'Please select a subject' },
  ),
  message: z
    .string()
    .min(1, 'Message is required')
    .max(2000, 'Message must be at most 2000 characters'),
  consent: z
    .boolean()
    .refine((val) => val === true, {
      message: 'You must consent to send this message',
    }),
});

type FormValues = z.infer<typeof contactSchema>;

// ── Topic options ─────────────────────────────────────────────────────────────

const TOPICS: { value: ContactInterestArea; label: string }[] = [
  { value: 'solar', label: 'Solar Enquiry' },
  { value: 'products', label: 'Product Interest' },
  { value: 'future_tech', label: 'Future Technologies' },
  { value: 'careers', label: 'Career' },
  { value: 'support', label: 'Support' },
  { value: 'other', label: 'Other' },
];

// ── Shared style helpers ──────────────────────────────────────────────────────

const inputBase = cn(
  'w-full rounded-lg border border-[var(--border-input)] bg-[var(--bg-muted)]',
  'px-3 py-2 text-sm text-[var(--fg)] placeholder:text-[var(--fg-subtle)]',
  'focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-0',
  'disabled:opacity-50 disabled:cursor-not-allowed',
  'transition-colors',
);

const inputError = 'border-red-500 focus:ring-red-400';
const labelBase = 'block text-sm font-medium text-[var(--fg-muted)] mb-1';
const errorBase = 'mt-1 text-xs text-[color:var(--color-danger,#A83232)]';

// ── Component ─────────────────────────────────────────────────────────────────

export interface ContactFormProps {
  className?: string;
}

export function ContactForm({ className }: ContactFormProps) {
  const uid = useId();
  const id = (suffix: string) => `${uid}-${suffix}`;

  // ── Form ─────────────────────────────────────────────────────────────────
  const {
    register,
    handleSubmit,
    setFocus,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(contactSchema),
    mode: 'onTouched',
    defaultValues: {
      topic: undefined,
      consent: false,
    },
  });

  // ── Result / error state ─────────────────────────────────────────────────
  type FormState = 'ready' | 'success' | 'error';
  const [formState, setFormState] = useState<FormState>('ready');
  const [referenceCode, setReferenceCode] = useState<string | null>(null);
  const [formLevelError, setFormLevelError] = useState<string | null>(null);
  const [fieldApiErrors, setFieldApiErrors] = useState<
    Record<string, string>
  >({});

  // Focus refs
  const successHeadingRef = useRef<HTMLHeadingElement>(null);
  const errorAlertRef = useRef<HTMLDivElement>(null);

  // ── Submit handler ───────────────────────────────────────────────────────
  const onSubmit = async (data: FormValues) => {
    setFormLevelError(null);
    setFieldApiErrors({});

    // Collect UTM params from URL (client-side only)
    let utm: Record<string, string | null> | undefined;
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      utm = {
        utm_source: params.get('utm_source'),
        utm_medium: params.get('utm_medium'),
        utm_campaign: params.get('utm_campaign'),
        utm_term: params.get('utm_term'),
        utm_content: params.get('utm_content'),
        referrer: document.referrer || null,
        landing_page: window.location.href,
        gclid: params.get('gclid'),
        fbclid: params.get('fbclid'),
      };
    }

    try {
      const result = await submitContact({
        source: 'contact',
        fullName: data.name,
        email: data.email,
        phone: data.phone || undefined,
        interestArea: data.topic as ContactInterestArea,
        message: data.message,
        consentMarketing: data.consent,
        utm,
      });

      setReferenceCode(result.referenceCode);
      setFormState('success');

      // Move focus to success heading (Req 8.3)
      setTimeout(() => {
        successHeadingRef.current?.focus();
      }, 50);
    } catch (err) {
      setFormState('error');

      if (err instanceof ContactApiError) {
        if (err.status === 422 && err.fields && err.fields.length > 0) {
          const mapped: Record<string, string> = {};
          err.fields.forEach(({ field, message }) => {
            mapped[field] = message;
          });
          setFieldApiErrors(mapped);
          setFormLevelError(
            'Please review the highlighted fields and try again.',
          );
        } else {
          setFormLevelError(
            err.detail ||
              'Your message could not be sent. Please try again.',
          );
        }
      } else {
        setFormLevelError(
          'A network error occurred. Please check your connection and try again.',
        );
      }

      // Focus error alert
      setTimeout(() => {
        const firstErrorField = Object.keys(errors)[0];
        if (firstErrorField) {
          setFocus(firstErrorField as keyof FormValues);
        } else {
          errorAlertRef.current?.focus();
        }
      }, 50);
    }
  };

  // ── Message character counter ────────────────────────────────────────────
  const messageValue = watch('message') ?? '';

  // ── Success state ────────────────────────────────────────────────────────
  if (formState === 'success' && referenceCode) {
    return (
      <div
        className={cn(
          'rounded-xl border border-[var(--border)] bg-[var(--surface)] p-8',
          'text-center shadow-[var(--shadow-md)]',
          className,
        )}
        role="status"
        aria-live="polite"
      >
        <div className="mb-4 flex justify-center">
          <CheckCircle
            className="h-14 w-14 text-[color:#2E7D5B]"
            aria-hidden="true"
          />
        </div>
        <h2
          ref={successHeadingRef}
          tabIndex={-1}
          className="mb-2 font-display text-2xl font-semibold text-[var(--fg)] focus:outline-none"
        >
          Message Sent!
        </h2>
        <p className="mb-6 text-sm text-[var(--fg-muted)]">
          Thank you for getting in touch. We will respond within 1 business
          day.
        </p>
        <div className="mx-auto mb-6 max-w-xs rounded-lg border border-[var(--border)] bg-[var(--bg-subtle)] px-6 py-4">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--fg-subtle)]">
            Your reference code
          </p>
          <p
            className="mt-1 font-display text-2xl font-bold tracking-widest text-[var(--accent)]"
            aria-label={`Reference code: ${referenceCode}`}
          >
            {referenceCode}
          </p>
        </div>
        <p className="text-xs text-[var(--fg-subtle)]">
          Keep this code — you can use it to follow up on your enquiry.
        </p>
      </div>
    );
  }

  // ── Form ─────────────────────────────────────────────────────────────────
  return (
    <div className={cn('w-full', className)}>
      {/* Form-level error */}
      {formState === 'error' && formLevelError && (
        <div
          ref={errorAlertRef}
          role="alert"
          tabIndex={-1}
          className={cn(
            'mb-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50',
            'px-4 py-3 text-sm text-red-700',
            'dark:border-red-900 dark:bg-red-950/30 dark:text-red-400',
            'focus:outline-none',
          )}
        >
          <AlertTriangle
            className="mt-0.5 h-4 w-4 shrink-0"
            aria-hidden="true"
          />
          <span>{formLevelError}</span>
        </div>
      )}

      <form
        id={id('form')}
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        aria-label="Contact form"
        className="flex flex-col gap-5"
      >
        {/* ── Name ──────────────────────────────────────────────────────── */}
        <div>
          <label htmlFor={id('name')} className={labelBase}>
            Name{' '}
            <span
              aria-hidden="true"
              className="text-[color:var(--color-danger,#A83232)]"
            >
              *
            </span>
          </label>
          <input
            type="text"
            id={id('name')}
            autoComplete="name"
            placeholder="Your full name"
            aria-required="true"
            aria-describedby={
              errors.name || fieldApiErrors.full_name
                ? id('name-error')
                : undefined
            }
            className={cn(
              inputBase,
              (errors.name || fieldApiErrors.full_name) && inputError,
            )}
            {...register('name')}
          />
          {(errors.name || fieldApiErrors.full_name) && (
            <p id={id('name-error')} className={errorBase} role="alert">
              {errors.name?.message ?? fieldApiErrors.full_name}
            </p>
          )}
        </div>

        {/* ── Email ──────────────────────────────────────────────────────── */}
        <div>
          <label htmlFor={id('email')} className={labelBase}>
            Email address{' '}
            <span
              aria-hidden="true"
              className="text-[color:var(--color-danger,#A83232)]"
            >
              *
            </span>
          </label>
          <input
            type="email"
            id={id('email')}
            autoComplete="email"
            placeholder="you@example.com"
            aria-required="true"
            aria-describedby={
              errors.email || fieldApiErrors.email
                ? id('email-error')
                : undefined
            }
            className={cn(
              inputBase,
              (errors.email || fieldApiErrors.email) && inputError,
            )}
            {...register('email')}
          />
          {(errors.email || fieldApiErrors.email) && (
            <p id={id('email-error')} className={errorBase} role="alert">
              {errors.email?.message ?? fieldApiErrors.email}
            </p>
          )}
        </div>

        {/* ── Phone (optional) ───────────────────────────────────────────── */}
        <div>
          <label htmlFor={id('phone')} className={labelBase}>
            Phone{' '}
            <span className="text-xs font-normal text-[var(--fg-subtle)]">
              optional
            </span>
          </label>
          <input
            type="tel"
            id={id('phone')}
            autoComplete="tel"
            placeholder="+91 98765 43210"
            aria-describedby={
              errors.phone || fieldApiErrors.phone
                ? id('phone-error')
                : undefined
            }
            className={cn(
              inputBase,
              (errors.phone || fieldApiErrors.phone) && inputError,
            )}
            {...register('phone')}
          />
          {(errors.phone || fieldApiErrors.phone) && (
            <p id={id('phone-error')} className={errorBase} role="alert">
              {errors.phone?.message ?? fieldApiErrors.phone}
            </p>
          )}
        </div>

        {/* ── Subject / Topic ────────────────────────────────────────────── */}
        <div>
          <label htmlFor={id('topic')} className={labelBase}>
            Subject{' '}
            <span
              aria-hidden="true"
              className="text-[color:var(--color-danger,#A83232)]"
            >
              *
            </span>
          </label>
          <select
            id={id('topic')}
            aria-required="true"
            aria-describedby={
              errors.topic || fieldApiErrors.interest_area
                ? id('topic-error')
                : undefined
            }
            className={cn(
              inputBase,
              'cursor-pointer',
              (errors.topic || fieldApiErrors.interest_area) && inputError,
            )}
            {...register('topic')}
          >
            <option value="">Select a subject…</option>
            {TOPICS.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          {(errors.topic || fieldApiErrors.interest_area) && (
            <p id={id('topic-error')} className={errorBase} role="alert">
              {errors.topic?.message ?? fieldApiErrors.interest_area}
            </p>
          )}
        </div>

        {/* ── Message ────────────────────────────────────────────────────── */}
        <div>
          <div className="mb-1 flex items-baseline justify-between">
            <label
              htmlFor={id('message')}
              className={labelBase.replace('mb-1', '')}
            >
              Message{' '}
              <span
                aria-hidden="true"
                className="text-[color:var(--color-danger,#A83232)]"
              >
                *
              </span>
            </label>
            <span
              className="text-xs text-[var(--fg-subtle)]"
              aria-live="polite"
              aria-atomic="true"
            >
              {messageValue.length}/2000
            </span>
          </div>
          <textarea
            id={id('message')}
            rows={5}
            placeholder="Tell us about your enquiry…"
            aria-required="true"
            aria-describedby={
              errors.message || fieldApiErrors.message
                ? id('message-error')
                : undefined
            }
            className={cn(
              inputBase,
              'resize-y',
              (errors.message || fieldApiErrors.message) && inputError,
            )}
            {...register('message')}
          />
          {(errors.message || fieldApiErrors.message) && (
            <p id={id('message-error')} className={errorBase} role="alert">
              {errors.message?.message ?? fieldApiErrors.message}
            </p>
          )}
        </div>

        {/* ── Consent (required) ────────────────────────────────────────── */}
        <div>
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id={id('consent')}
              aria-required="true"
              aria-describedby={
                errors.consent ? id('consent-error') : undefined
              }
              className={cn(
                'mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded',
                'border-[var(--border-input)] accent-[var(--accent)]',
                'focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-1',
                'focus:ring-offset-[var(--bg)]',
                errors.consent && 'ring-1 ring-red-500',
              )}
              {...register('consent')}
            />
            <label
              htmlFor={id('consent')}
              className="text-sm leading-relaxed text-[var(--fg-muted)]"
            >
              I agree to Tribhuban Concepts contacting me about my enquiry and
              related offerings. You can unsubscribe at any time.{' '}
              <span
                aria-hidden="true"
                className="text-[color:var(--color-danger,#A83232)]"
              >
                *
              </span>
            </label>
          </div>
          {errors.consent && (
            <p id={id('consent-error')} className={errorBase} role="alert">
              {errors.consent.message}
            </p>
          )}
        </div>

        {/* ── Submit ────────────────────────────────────────────────────── */}
        <button
          type="submit"
          disabled={isSubmitting}
          aria-busy={isSubmitting}
          className={cn(
            'relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-lg px-6 py-3',
            'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-fg)] text-sm font-semibold',
            'hover:bg-[var(--btn-primary-hover)] transition-colors',
            'focus-visible:outline-none focus-visible:ring-2',
            'focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2',
            'focus-visible:ring-offset-[var(--bg)]',
            'disabled:opacity-60 disabled:cursor-not-allowed',
            'min-h-[44px]',
            'group',
          )}
        >
          {/* shimmer sweep */}
          <span
            className="absolute inset-0 -skew-x-12 bg-white/10 translate-x-[-100%]
                       group-hover:translate-x-[200%] transition-transform duration-500 ease-in-out pointer-events-none"
            aria-hidden="true"
          />
          <span className="relative z-10 flex items-center gap-2">
            {isSubmitting && (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            )}
            {isSubmitting ? 'Sending…' : 'Send Message'}
          </span>
        </button>

        <p className="text-xs text-[var(--fg-subtle)]">
          Fields marked with{' '}
          <span
            aria-hidden="true"
            className="text-[color:var(--color-danger,#A83232)]"
          >
            *
          </span>{' '}
          are required. Your information is kept private and secure.
        </p>
      </form>
    </div>
  );
}
