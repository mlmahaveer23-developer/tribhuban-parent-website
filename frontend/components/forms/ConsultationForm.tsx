'use client';

/**
 * ConsultationForm.tsx
 *
 * Client island for booking a consultation (Task 7.2).
 *
 * Fields:
 *   fullName, email, phone, interestArea, preferredDate,
 *   preferredTimeWindow, location (optional), message (optional),
 *   consentMarketing (optional checkbox)
 *
 * States: ready → submitting → success (referenceCode) / error
 *
 * Accessibility (Req 7.9, 24.4):
 *   - All inputs linked by <label htmlFor> + id
 *   - Errors linked via aria-describedby
 *   - Submit: aria-busy + disabled while submitting
 *   - Success: focus moves to success heading
 *   - Error: focus moves to first errored field
 *
 * URL prefill (Req 7.6):
 *   - ?source=calculator&size=X&savings=Y → prefill interestArea=solar + message note
 *
 * Requirements: 7.2, 7.6, 7.9, 24.4
 */

import React, { useEffect, useId, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, CheckCircle, AlertTriangle } from 'lucide-react';

import { cn } from '@/lib/utils/cn';
import {
  createConsultation,
  ConsultationApiError,
  type InterestArea,
  type TimeWindow,
} from '@/lib/api/consultations';

// ── Zod schema ────────────────────────────────────────────────────────────────

const consultationSchema = z.object({
  fullName: z
    .string()
    .min(1, 'Full name is required')
    .max(100, 'Full name must be at most 100 characters'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .max(254, 'Email must be at most 254 characters'),
  phone: z
    .string()
    .min(1, 'Phone number is required')
    .regex(
      /^\+?[\d\s\-().]{7,20}$/,
      '7–15 digit phone number required (spaces, dashes, and + are allowed)',
    ),
  interestArea: z.enum(
    ['solar', 'products', 'future_tech', 'careers', 'support', 'other'],
    { required_error: 'Please select an area of interest' },
  ),
  preferredDate: z
    .string()
    .min(1, 'Preferred date is required')
    .refine((d) => {
      const date = new Date(d);
      if (isNaN(date.getTime())) return false;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const maxDate = new Date(today);
      maxDate.setDate(maxDate.getDate() + 365);
      return date > today && date <= maxDate;
    }, 'Date must be a future date within 365 days'),
  preferredTimeWindow: z.enum(['morning', 'afternoon', 'evening'], {
    required_error: 'Please select a time window',
  }),
  location: z
    .string()
    .max(255, 'Location must be at most 255 characters')
    .optional()
    .or(z.literal('')),
  message: z
    .string()
    .max(2000, 'Message must be at most 2000 characters')
    .optional()
    .or(z.literal('')),
  consentMarketing: z.boolean().optional(),
});

type FormValues = z.infer<typeof consultationSchema>;

// ── Options ───────────────────────────────────────────────────────────────────

const INTEREST_AREAS: { value: InterestArea; label: string }[] = [
  { value: 'solar', label: 'Solar Energy' },
  { value: 'products', label: 'Products' },
  { value: 'future_tech', label: 'Future Technologies' },
  { value: 'careers', label: 'Careers' },
  { value: 'support', label: 'Support' },
  { value: 'other', label: 'Other' },
];

const TIME_WINDOWS: { value: TimeWindow; label: string }[] = [
  { value: 'morning', label: 'Morning (9 AM – 12 PM)' },
  { value: 'afternoon', label: 'Afternoon (12 PM – 5 PM)' },
  { value: 'evening', label: 'Evening (5 PM – 8 PM)' },
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

// ── Min/max date helpers for date input ───────────────────────────────────────

function getTodayPlusOne(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

function getTodayPlus365(): string {
  const d = new Date();
  d.setDate(d.getDate() + 365);
  return d.toISOString().split('T')[0];
}

// ── Component ─────────────────────────────────────────────────────────────────

export interface ConsultationFormProps {
  /** Optional extra className on the root element */
  className?: string;
}

export function ConsultationForm({ className }: ConsultationFormProps) {
  const uid = useId();
  const id = (suffix: string) => `${uid}-${suffix}`;

  // ── URL prefill (Req 7.6) ────────────────────────────────────────────────
  const [prefillNote, setPrefillNote] = useState<string | null>(null);

  // ── Form ─────────────────────────────────────────────────────────────────
  const {
    register,
    handleSubmit,
    setValue,
    setFocus,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(consultationSchema),
    mode: 'onTouched',
    defaultValues: {
      interestArea: undefined,
      preferredTimeWindow: undefined,
      consentMarketing: false,
    },
  });

  // ── Read URL params client-side ──────────────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const source = params.get('source');
    const size = params.get('size');
    const savings = params.get('savings');

    if (source === 'calculator') {
      setValue('interestArea', 'solar');
      const parts: string[] = ['I used the solar calculator.'];
      if (size) parts.push(`Recommended system size: ${size} kW.`);
      if (savings) parts.push(`Estimated savings: ₹${savings}/year.`);
      parts.push('Please provide me with a personalised quote.');
      const note = parts.join(' ');
      setPrefillNote(note);
      setValue('message', note);
    }
  }, [setValue]);

  // ── Result / error state ─────────────────────────────────────────────────
  type FormState = 'ready' | 'submitting' | 'success' | 'error';
  const [formState, setFormState] = useState<FormState>('ready');
  const [referenceCode, setReferenceCode] = useState<string | null>(null);
  const [formLevelError, setFormLevelError] = useState<string | null>(null);
  const [fieldApiErrors, setFieldApiErrors] = useState<Record<string, string>>({});

  // Focus refs
  const successHeadingRef = useRef<HTMLHeadingElement>(null);
  const errorAlertRef = useRef<HTMLDivElement>(null);

  // ── Submit handler ───────────────────────────────────────────────────────
  const onSubmit = async (data: FormValues) => {
    setFormState('submitting');
    setFormLevelError(null);
    setFieldApiErrors({});

    try {
      const result = await createConsultation({
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        interestArea: data.interestArea as InterestArea,
        preferredDate: data.preferredDate,
        preferredTimeWindow: data.preferredTimeWindow as TimeWindow,
        location: data.location || undefined,
        message: data.message || undefined,
        consentMarketing: data.consentMarketing ?? false,
      });

      setReferenceCode(result.referenceCode);
      setFormState('success');

      // Move focus to success heading (Req 7.9)
      setTimeout(() => {
        successHeadingRef.current?.focus();
      }, 50);
    } catch (err) {
      setFormState('error');

      if (err instanceof ConsultationApiError) {
        if (err.status === 422 && err.fields && err.fields.length > 0) {
          // Map field errors from API onto our state
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
              'Your booking could not be submitted. Please try again.',
          );
        }
      } else {
        setFormLevelError(
          'A network error occurred. Please check your connection and try again.',
        );
      }

      // Focus first field with an error, or the error alert
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
  // We need to watch the message field value for the character counter
  // This must be called unconditionally at the component level (Rules of Hooks)
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
          Consultation Booked!
        </h2>
        <p className="mb-6 text-sm text-[var(--fg-muted)]">
          We have received your request and will get back to you within 1
          business day.
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
          Keep this code handy — you can use it to track your consultation
          status.
        </p>
      </div>
    );
  }

  // ── Form ─────────────────────────────────────────────────────────────────
  return (
    <div className={cn('w-full', className)}>
      {/* Prefill notice */}
      {prefillNote && (
        <div
          className={cn(
            'mb-6 rounded-lg border border-[var(--accent)] bg-[var(--accent-light)]',
            'px-4 py-3 text-sm text-[var(--accent)]',
          )}
          role="note"
        >
          <strong>Calculator context applied.</strong> We&apos;ve pre-filled some
          details from your solar calculator results.
        </div>
      )}

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
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{formLevelError}</span>
        </div>
      )}

      <form
        id={id('form')}
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        aria-label="Consultation booking form"
        className="flex flex-col gap-5"
      >
        {/* ── Full name ──────────────────────────────────────────────────── */}
        <div>
          <label htmlFor={id('fullName')} className={labelBase}>
            Full name{' '}
            <span aria-hidden="true" className="text-[color:var(--color-danger,#A83232)]">
              *
            </span>
          </label>
          <input
            type="text"
            id={id('fullName')}
            autoComplete="name"
            placeholder="Your full name"
            aria-required="true"
            aria-describedby={
              errors.fullName || fieldApiErrors.full_name
                ? id('fullName-error')
                : undefined
            }
            className={cn(
              inputBase,
              (errors.fullName || fieldApiErrors.full_name) && inputError,
            )}
            {...register('fullName')}
          />
          {(errors.fullName || fieldApiErrors.full_name) && (
            <p id={id('fullName-error')} className={errorBase} role="alert">
              {errors.fullName?.message ?? fieldApiErrors.full_name}
            </p>
          )}
        </div>

        {/* ── Email ──────────────────────────────────────────────────────── */}
        <div>
          <label htmlFor={id('email')} className={labelBase}>
            Email address{' '}
            <span aria-hidden="true" className="text-[color:var(--color-danger,#A83232)]">
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
              errors.email || fieldApiErrors.email ? id('email-error') : undefined
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

        {/* ── Phone ──────────────────────────────────────────────────────── */}
        <div>
          <label htmlFor={id('phone')} className={labelBase}>
            Phone number{' '}
            <span aria-hidden="true" className="text-[color:var(--color-danger,#A83232)]">
              *
            </span>
          </label>
          <input
            type="tel"
            id={id('phone')}
            autoComplete="tel"
            placeholder="+91 98765 43210"
            aria-required="true"
            aria-describedby={
              errors.phone || fieldApiErrors.phone ? id('phone-error') : undefined
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

        {/* ── Interest area ──────────────────────────────────────────────── */}
        <div>
          <label htmlFor={id('interestArea')} className={labelBase}>
            Area of interest{' '}
            <span aria-hidden="true" className="text-[color:var(--color-danger,#A83232)]">
              *
            </span>
          </label>
          <select
            id={id('interestArea')}
            aria-required="true"
            aria-describedby={
              errors.interestArea || fieldApiErrors.interest_area
                ? id('interestArea-error')
                : undefined
            }
            className={cn(
              inputBase,
              'cursor-pointer',
              (errors.interestArea || fieldApiErrors.interest_area) && inputError,
            )}
            {...register('interestArea')}
          >
            <option value="">Select an area…</option>
            {INTEREST_AREAS.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          {(errors.interestArea || fieldApiErrors.interest_area) && (
            <p id={id('interestArea-error')} className={errorBase} role="alert">
              {errors.interestArea?.message ?? fieldApiErrors.interest_area}
            </p>
          )}
        </div>

        {/* ── Preferred date + time window ───────────────────────────────── */}
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Date */}
          <div>
            <label htmlFor={id('preferredDate')} className={labelBase}>
              Preferred date{' '}
              <span aria-hidden="true" className="text-[color:var(--color-danger,#A83232)]">
                *
              </span>
            </label>
            <input
              type="date"
              id={id('preferredDate')}
              aria-required="true"
              min={getTodayPlusOne()}
              max={getTodayPlus365()}
              aria-describedby={
                errors.preferredDate || fieldApiErrors.preferred_date
                  ? id('preferredDate-error')
                  : undefined
              }
              className={cn(
                inputBase,
                'cursor-pointer',
                (errors.preferredDate || fieldApiErrors.preferred_date) && inputError,
              )}
              {...register('preferredDate')}
            />
            {(errors.preferredDate || fieldApiErrors.preferred_date) && (
              <p id={id('preferredDate-error')} className={errorBase} role="alert">
                {errors.preferredDate?.message ?? fieldApiErrors.preferred_date}
              </p>
            )}
          </div>

          {/* Time window */}
          <div>
            <label htmlFor={id('preferredTimeWindow')} className={labelBase}>
              Preferred time{' '}
              <span aria-hidden="true" className="text-[color:var(--color-danger,#A83232)]">
                *
              </span>
            </label>
            <select
              id={id('preferredTimeWindow')}
              aria-required="true"
              aria-describedby={
                errors.preferredTimeWindow || fieldApiErrors.preferred_time_window
                  ? id('preferredTimeWindow-error')
                  : undefined
              }
              className={cn(
                inputBase,
                'cursor-pointer',
                (errors.preferredTimeWindow || fieldApiErrors.preferred_time_window) &&
                  inputError,
              )}
              {...register('preferredTimeWindow')}
            >
              <option value="">Select a time…</option>
              {TIME_WINDOWS.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            {(errors.preferredTimeWindow || fieldApiErrors.preferred_time_window) && (
              <p id={id('preferredTimeWindow-error')} className={errorBase} role="alert">
                {errors.preferredTimeWindow?.message ??
                  fieldApiErrors.preferred_time_window}
              </p>
            )}
          </div>
        </div>

        {/* ── Location (optional) ────────────────────────────────────────── */}
        <div>
          <label htmlFor={id('location')} className={labelBase}>
            Location{' '}
            <span className="text-xs font-normal text-[var(--fg-subtle)]">
              optional
            </span>
          </label>
          <input
            type="text"
            id={id('location')}
            autoComplete="address-level2"
            placeholder="City or address"
            aria-describedby={
              errors.location || fieldApiErrors.location
                ? id('location-error')
                : undefined
            }
            className={cn(
              inputBase,
              (errors.location || fieldApiErrors.location) && inputError,
            )}
            {...register('location')}
          />
          {(errors.location || fieldApiErrors.location) && (
            <p id={id('location-error')} className={errorBase} role="alert">
              {errors.location?.message ?? fieldApiErrors.location}
            </p>
          )}
        </div>

        {/* ── Message (optional) ────────────────────────────────────────── */}
        <div>
          <div className="mb-1 flex items-baseline justify-between">
            <label htmlFor={id('message')} className={labelBase.replace('mb-1', '')}>
              Message{' '}
              <span className="text-xs font-normal text-[var(--fg-subtle)]">
                optional
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
            rows={4}
            placeholder="Tell us what you'd like to discuss…"
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

        {/* ── Marketing consent ─────────────────────────────────────────── */}
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id={id('consentMarketing')}
            className={cn(
              'mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded',
              'border-[var(--border-input)] accent-[var(--accent)]',
              'focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-1',
              'focus:ring-offset-[var(--bg)]',
            )}
            {...register('consentMarketing')}
          />
          <label
            htmlFor={id('consentMarketing')}
            className="text-sm leading-relaxed text-[var(--fg-muted)]"
          >
            I agree to receive marketing communications about solar energy and
            Tribhuban Concepts offerings. You can unsubscribe at any time.
          </label>
        </div>

        {/* ── Submit ────────────────────────────────────────────────────── */}
        <button
          type="submit"
          disabled={isSubmitting}
          aria-busy={isSubmitting}
          className={cn(
            'inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3',
            'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-fg)] text-sm font-semibold',
            'hover:bg-[var(--btn-primary-hover)] transition-colors',
            'focus-visible:outline-none focus-visible:ring-2',
            'focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2',
            'focus-visible:ring-offset-[var(--bg)]',
            'disabled:opacity-60 disabled:cursor-not-allowed',
            'min-h-[44px]', // WCAG touch target
          )}
        >
          {isSubmitting && (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          )}
          {isSubmitting ? 'Submitting…' : 'Book Consultation'}
        </button>

        <p className="text-xs text-[var(--fg-subtle)]">
          Fields marked with{' '}
          <span aria-hidden="true" className="text-[color:var(--color-danger,#A83232)]">
            *
          </span>{' '}
          are required. Your information is kept private and secure.
        </p>
      </form>
    </div>
  );
}
