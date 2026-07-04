'use client';

/**
 * SolarCalculator.tsx
 *
 * Interactive solar savings calculator island (client component).
 *
 * Inputs:
 *   - Input mode: monthly bill (INR) OR monthly consumption (kWh)
 *   - State (10 supported Indian states)
 *   - Connection type (Residential / Commercial / Industrial)
 *   - Optional roof area (sqm)
 *
 * Flow:
 *   1. User fills form → client-side optimistic estimate shows instantly.
 *   2. On submit → calls POST /api/v1/solar/estimate for authoritative result.
 *   3. ResultPanel renders; aria-live region announces result.
 *   4. AssumptionsDisclosure shows assumptions used.
 *
 * Accessibility:
 *   - All inputs have associated <label htmlFor>
 *   - Error messages linked via aria-describedby
 *   - aria-live="polite" announces results (Req 5.9)
 *   - Submit button shows aria-busy + disabled while loading
 *   - Focus moves to ResultPanel heading on successful calculation
 *   - Bill slider has text-input alternative (Req 5.9)
 *
 * Requirements: 5.1, 5.9, 24.4
 */

import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';

import { cn } from '@/lib/utils/cn';
import { fetchSolarEstimate, SolarApiError } from '@/lib/api/solar';
import type { SolarEstimateResponse } from '@/lib/api/solar';
import { estimateSolarOptimistic } from '@/lib/utils/solar-client';
import { ResultPanel } from './ResultPanel';
import { AssumptionsDisclosure } from './AssumptionsDisclosure';

// ── Zod validation schema ─────────────────────────────────────────────────────

const schema = z
  .object({
    inputMode: z.enum(['bill', 'units']),
    monthlyBill: z.coerce
      .number()
      .positive('Must be a positive number')
      .max(9_999_999.99, 'Value is too large')
      .optional(),
    monthlyUnits: z.coerce
      .number()
      .positive('Must be a positive number')
      .max(1_000_000, 'Value is too large')
      .optional(),
    state: z.string().min(1, 'State is required'),
    connectionType: z.enum(['residential', 'commercial', 'industrial']),
    roofArea: z.coerce
      .number()
      .positive('Must be a positive number')
      .optional()
      .or(z.literal(undefined))
      .or(z.nan().transform(() => undefined)),
  })
  .refine(
    (data) => {
      if (data.inputMode === 'bill') {
        return data.monthlyBill !== undefined && data.monthlyBill > 0;
      }
      return data.monthlyUnits !== undefined && data.monthlyUnits > 0;
    },
    {
      message: 'Please enter a valid amount',
      path: ['monthlyBill'],
    },
  );

type FormValues = z.infer<typeof schema>;

// ── State options ─────────────────────────────────────────────────────────────

const STATE_OPTIONS = [
  { value: 'maharashtra',    label: 'Maharashtra' },
  { value: 'gujarat',        label: 'Gujarat' },
  { value: 'rajasthan',      label: 'Rajasthan' },
  { value: 'karnataka',      label: 'Karnataka' },
  { value: 'tamil_nadu',     label: 'Tamil Nadu' },
  { value: 'delhi',          label: 'Delhi' },
  { value: 'uttar_pradesh',  label: 'Uttar Pradesh' },
  { value: 'west_bengal',    label: 'West Bengal' },
  { value: 'andhra_pradesh', label: 'Andhra Pradesh' },
  { value: 'telangana',      label: 'Telangana' },
] as const;

const CONNECTION_OPTIONS = [
  { value: 'residential', label: 'Residential' },
  { value: 'commercial',  label: 'Commercial' },
  { value: 'industrial',  label: 'Industrial' },
] as const;

// ── Bill slider constants ─────────────────────────────────────────────────────

const BILL_SLIDER_MIN = 500;
const BILL_SLIDER_MAX = 50_000;
const BILL_SLIDER_STEP = 500;

// ── Utility: paise → rupees for bill input (user enters ₹, backend expects paise) ──

/** Convert rupee string → paise (minor units) for the API */
function rupeesToPaise(rupees: number): number {
  return Math.round(rupees * 100);
}

// ── Shared input styles ───────────────────────────────────────────────────────

const inputBase = cn(
  'w-full rounded-lg border border-[var(--border-input)] bg-[var(--bg-muted)]',
  'px-3 py-2 text-sm text-[var(--fg)] placeholder:text-[var(--fg-subtle)]',
  'focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-0',
  'disabled:opacity-50 disabled:cursor-not-allowed',
  'transition-colors',
);

const labelBase = 'block text-sm font-medium text-[var(--fg-muted)] mb-1';
const errorBase = 'mt-1 text-xs text-[color:var(--color-danger,#A83232)]';

// ── Component ─────────────────────────────────────────────────────────────────

export function SolarCalculator({ className }: { className?: string }) {
  // Unique IDs for accessibility
  const uid = useId();
  const id = (suffix: string) => `${uid}-${suffix}`;

  // Form state
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      inputMode: 'bill',
      state: '',
      connectionType: 'residential',
    },
    mode: 'onTouched',
  });

  const inputMode = watch('inputMode');
  const monthlyBill = watch('monthlyBill');
  const monthlyUnits = watch('monthlyUnits');
  const state = watch('state');
  const connectionType = watch('connectionType');
  const roofArea = watch('roofArea');

  // Result state
  const [optimisticResult, setOptimisticResult] = useState<SolarEstimateResponse | null>(null);
  const [serverResult, setServerResult] = useState<SolarEstimateResponse | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isFetchingServer, setIsFetchingServer] = useState(false);

  // The displayed result — server wins over optimistic
  const displayedResult = serverResult ?? optimisticResult;

  // Focus management — move to ResultPanel heading after successful calculation
  const resultHeadingRef = useRef<HTMLHeadingElement | null>(null);

  // Sync result heading ref via callback ref on ResultPanel wrapper
  const resultPanelRef = useCallback((node: HTMLElement | null) => {
    if (node) {
      const heading = node.querySelector<HTMLHeadingElement>('[id$="-heading"]');
      resultHeadingRef.current = heading;
    }
  }, []);

  // ── Optimistic estimate (instant UX) ─────────────────────────────────────

  useEffect(() => {
    if (!state || !connectionType) return;

    // Build the estimate request from current form values
    const req = {
      state,
      connectionType: connectionType as 'residential' | 'commercial' | 'industrial',
      ...(roofArea && roofArea > 0 ? { roofAreaSqm: roofArea } : {}),
      ...(inputMode === 'bill' && monthlyBill && monthlyBill > 0
        ? { monthlyBillMinor: rupeesToPaise(monthlyBill) }
        : {}),
      ...(inputMode === 'units' && monthlyUnits && monthlyUnits > 0
        ? { monthlyUnitsKwh: monthlyUnits }
        : {}),
    };

    // Only compute if we have the consumption input
    const hasConsumption =
      (inputMode === 'bill' && monthlyBill && monthlyBill > 0) ||
      (inputMode === 'units' && monthlyUnits && monthlyUnits > 0);

    if (!hasConsumption) return;

    const optimistic = estimateSolarOptimistic(req);
    if (optimistic) {
      // Reset server result so optimistic is shown while server fetch hasn't happened yet
      if (!serverResult) {
        setOptimisticResult(optimistic);
      }
    }
  }, [inputMode, monthlyBill, monthlyUnits, state, connectionType, roofArea, serverResult]);

  // ── Form submit → authoritative server result ─────────────────────────────

  const onSubmit = async (data: FormValues) => {
    setServerError(null);
    setIsFetchingServer(true);

    try {
      const req = {
        state: data.state,
        connectionType: data.connectionType,
        ...(data.roofArea && data.roofArea > 0 ? { roofAreaSqm: data.roofArea } : {}),
        ...(data.inputMode === 'bill' && data.monthlyBill
          ? { monthlyBillMinor: rupeesToPaise(data.monthlyBill) }
          : {}),
        ...(data.inputMode === 'units' && data.monthlyUnits
          ? { monthlyUnitsKwh: data.monthlyUnits }
          : {}),
      };

      const result = await fetchSolarEstimate(req);
      setServerResult(result);
      setOptimisticResult(null);

      // Move focus to ResultPanel heading (Req 5.9)
      // Small timeout so the DOM has updated
      setTimeout(() => {
        resultHeadingRef.current?.focus();
      }, 50);
    } catch (err) {
      if (err instanceof SolarApiError) {
        setServerError(err.detail);
      } else {
        setServerError(
          'Unable to calculate your estimate right now. Please try again in a moment.',
        );
      }
    } finally {
      setIsFetchingServer(false);
    }
  };

  // ── Slider ↔ text-input sync ──────────────────────────────────────────────

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setValue('monthlyBill', val, { shouldValidate: true });
  };

  const handleBillTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (!isNaN(val)) {
      const clamped = Math.min(Math.max(val, BILL_SLIDER_MIN), BILL_SLIDER_MAX);
      setValue('monthlyBill', clamped, { shouldValidate: true });
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div
      className={cn(
        'grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]',
        className,
      )}
    >
      {/* ── Left column: Input form ─────────────────────────────────────── */}
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="font-display text-2xl font-semibold text-[var(--fg)] sm:text-3xl">
            Solar Savings Calculator
          </h1>
          <p className="mt-2 text-sm text-[var(--fg-muted)]">
            Enter your electricity details to estimate your rooftop solar savings.
          </p>
        </div>

        <form
          id={id('form')}
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-5"
          noValidate
          aria-label="Solar savings calculator form"
        >
          {/* ── Input mode toggle ──────────────────────────────────────── */}
          <fieldset>
            <legend className={cn(labelBase, 'mb-2')}>
              Calculate using
            </legend>
            <div
              className="flex gap-2"
              role="radiogroup"
              aria-label="Input mode"
            >
              {(['bill', 'units'] as const).map((mode) => (
                <label
                  key={mode}
                  htmlFor={id(`mode-${mode}`)}
                  className={cn(
                    'flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium',
                    'transition-colors select-none',
                    inputMode === mode
                      ? 'border-[var(--accent)] bg-[var(--accent-light)] text-[var(--accent)]'
                      : 'border-[var(--border)] text-[var(--fg-muted)] hover:border-[var(--accent)]',
                  )}
                >
                  <input
                    type="radio"
                    id={id(`mode-${mode}`)}
                    value={mode}
                    className="sr-only"
                    {...register('inputMode')}
                    onChange={() => {
                      setValue('inputMode', mode);
                      // Reset the other field to avoid confusion
                      if (mode === 'bill') setValue('monthlyUnits', undefined);
                      else setValue('monthlyBill', undefined);
                      setServerResult(null);
                      setOptimisticResult(null);
                    }}
                    checked={inputMode === mode}
                  />
                  {mode === 'bill' ? 'Monthly bill (₹)' : 'Monthly usage (kWh)'}
                </label>
              ))}
            </div>
          </fieldset>

          {/* ── Bill input (slider + text alternative) ─────────────────── */}
          {inputMode === 'bill' && (
            <div>
              <label htmlFor={id('monthly-bill-text')} className={labelBase}>
                Monthly electricity bill (₹)
              </label>
              {/* Slider — visual affordance */}
              <div className="mb-2">
                <input
                  type="range"
                  id={id('monthly-bill-slider')}
                  aria-label="Monthly electricity bill slider"
                  aria-describedby={errors.monthlyBill ? id('monthly-bill-error') : undefined}
                  min={BILL_SLIDER_MIN}
                  max={BILL_SLIDER_MAX}
                  step={BILL_SLIDER_STEP}
                  value={monthlyBill ?? BILL_SLIDER_MIN}
                  onChange={handleSliderChange}
                  className={cn(
                    'h-2 w-full cursor-pointer appearance-none rounded-full',
                    'bg-[var(--bg-muted)] accent-[var(--accent)]',
                  )}
                />
                <div className="mt-1 flex justify-between text-xs text-[var(--fg-subtle)]">
                  <span>₹{BILL_SLIDER_MIN.toLocaleString('en-IN')}</span>
                  <span>₹{BILL_SLIDER_MAX.toLocaleString('en-IN')}</span>
                </div>
              </div>
              {/* Text input alternative (Req 5.9) */}
              <input
                type="number"
                id={id('monthly-bill-text')}
                inputMode="decimal"
                placeholder="e.g. 3000"
                aria-describedby={errors.monthlyBill ? id('monthly-bill-error') : undefined}
                className={cn(inputBase, errors.monthlyBill && 'border-red-500 focus:ring-red-400')}
                min={1}
                max={9_999_999.99}
                step="any"
                value={monthlyBill ?? ''}
                onChange={handleBillTextChange}
              />
              {errors.monthlyBill && (
                <p id={id('monthly-bill-error')} className={errorBase} role="alert">
                  {errors.monthlyBill.message}
                </p>
              )}
            </div>
          )}

          {/* ── Units input ────────────────────────────────────────────── */}
          {inputMode === 'units' && (
            <div>
              <label htmlFor={id('monthly-units')} className={labelBase}>
                Monthly consumption (kWh)
              </label>
              <input
                type="number"
                id={id('monthly-units')}
                inputMode="decimal"
                placeholder="e.g. 250"
                aria-describedby={errors.monthlyUnits ? id('monthly-units-error') : undefined}
                className={cn(inputBase, errors.monthlyUnits && 'border-red-500 focus:ring-red-400')}
                min={1}
                max={1_000_000}
                step="any"
                {...register('monthlyUnits', { valueAsNumber: true })}
              />
              {errors.monthlyUnits && (
                <p id={id('monthly-units-error')} className={errorBase} role="alert">
                  {errors.monthlyUnits.message}
                </p>
              )}
            </div>
          )}

          {/* ── State dropdown ─────────────────────────────────────────── */}
          <div>
            <label htmlFor={id('state')} className={labelBase}>
              State <span aria-hidden="true" className="text-[color:var(--color-danger,#A83232)]">*</span>
            </label>
            <select
              id={id('state')}
              aria-required="true"
              aria-describedby={errors.state ? id('state-error') : undefined}
              className={cn(inputBase, 'cursor-pointer', errors.state && 'border-red-500 focus:ring-red-400')}
              {...register('state')}
            >
              <option value="">Select a state…</option>
              {STATE_OPTIONS.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            {errors.state && (
              <p id={id('state-error')} className={errorBase} role="alert">
                {errors.state.message}
              </p>
            )}
          </div>

          {/* ── Connection type ─────────────────────────────────────────── */}
          <div>
            <label htmlFor={id('connection-type')} className={labelBase}>
              Connection type
            </label>
            <select
              id={id('connection-type')}
              aria-describedby={errors.connectionType ? id('connection-type-error') : undefined}
              className={cn(inputBase, 'cursor-pointer')}
              {...register('connectionType')}
            >
              {CONNECTION_OPTIONS.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            {errors.connectionType && (
              <p id={id('connection-type-error')} className={errorBase} role="alert">
                {errors.connectionType.message}
              </p>
            )}
          </div>

          {/* ── Optional roof area ─────────────────────────────────────── */}
          <div>
            <label htmlFor={id('roof-area')} className={labelBase}>
              Available roof area (sqm){' '}
              <span className="text-xs font-normal text-[var(--fg-subtle)]">optional</span>
            </label>
            <input
              type="number"
              id={id('roof-area')}
              inputMode="decimal"
              placeholder="e.g. 50"
              aria-describedby={errors.roofArea ? id('roof-area-error') : undefined}
              className={cn(inputBase, errors.roofArea && 'border-red-500 focus:ring-red-400')}
              min={1}
              step="any"
              {...register('roofArea', {
                setValueAs: (v) => (v === '' || v === null ? undefined : parseFloat(v)),
              })}
            />
            {errors.roofArea && (
              <p id={id('roof-area-error')} className={errorBase} role="alert">
                {errors.roofArea.message}
              </p>
            )}
          </div>

          {/* ── Submit ─────────────────────────────────────────────────── */}
          <button
            type="submit"
            disabled={isSubmitting || isFetchingServer}
            aria-busy={isSubmitting || isFetchingServer}
            className={cn(
              'inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3',
              'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-fg)] text-sm font-semibold',
              'hover:bg-[var(--btn-primary-hover)] transition-colors',
              'focus-visible:outline-none focus-visible:ring-2',
              'focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2',
              'focus-visible:ring-offset-[var(--bg)]',
              'disabled:opacity-60 disabled:cursor-not-allowed',
            )}
          >
            {(isSubmitting || isFetchingServer) && (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            )}
            {isSubmitting || isFetchingServer ? 'Calculating…' : 'Calculate my savings'}
          </button>

          {/* ── Server error message (Req 5.11) ───────────────────────── */}
          {serverError && (
            <div
              role="alert"
              className={cn(
                'rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700',
                'dark:border-red-900 dark:bg-red-950/30 dark:text-red-400',
              )}
            >
              {serverError}
            </div>
          )}
        </form>
      </div>

      {/* ── Right column: Results ────────────────────────────────────────── */}
      <div className="flex flex-col gap-6">
        {/* aria-live region — announces result to assistive technologies (Req 5.9) */}
        <div aria-live="polite" aria-atomic="true">
          {displayedResult ? (
            <div ref={resultPanelRef}>
              <ResultPanel
                result={displayedResult}
                isOptimistic={!serverResult && !!optimisticResult}
                headingId={id('result-heading')}
              />
            </div>
          ) : (
            /* Placeholder state before any estimate */
            <div
              className={cn(
                'flex min-h-[320px] flex-col items-center justify-center rounded-xl border',
                'border-dashed border-[var(--border)] bg-[var(--bg-subtle)] text-center px-6',
              )}
            >
              <span
                className="mb-3 text-4xl"
                role="img"
                aria-label="Solar panel"
              >
                ☀️
              </span>
              <p className="text-sm font-medium text-[var(--fg-muted)]">
                Fill in the form to see your solar savings estimate
              </p>
              <p className="mt-1 text-xs text-[var(--fg-subtle)]">
                Instant preview updates as you type
              </p>
            </div>
          )}
        </div>

        {/* Assumptions disclosure — only shown when there is a result */}
        {displayedResult && (
          <AssumptionsDisclosure assumptions={displayedResult.assumptions} />
        )}

        {/* Skeleton loading overlay while fetching authoritative result */}
        {isFetchingServer && !displayedResult && (
          <div className="space-y-3" aria-hidden="true">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-20 animate-pulse rounded-xl bg-[var(--bg-muted)]"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
