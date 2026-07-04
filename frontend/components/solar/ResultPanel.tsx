/**
 * ResultPanel.tsx
 *
 * Displays solar savings estimate results as visual stat cards.
 * Receives an authoritative (or optimistic) SolarEstimateResponse and renders:
 *  - System size (kW)
 *  - Estimated annual generation (kWh)
 *  - Estimated annual savings (₹ — converted from paise)
 *  - Payback period (years)
 *  - CO₂ offset (tonnes/year)
 *
 * The "Get exact quote" link navigates to /consultation prefilled with
 * calculator context via URL params: ?source=calculator&size=…&savings=…
 */

import { Sun, Zap, IndianRupee, Clock, Leaf, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils/cn';
import type { SolarEstimateResponse } from '@/lib/api/solar';

interface ResultPanelProps {
  result: SolarEstimateResponse;
  /** Whether this is an optimistic (client-side) estimate vs authoritative server result */
  isOptimistic?: boolean;
  /** Optional id for the heading — used by focus management */
  headingId?: string;
  className?: string;
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  unit: string;
  highlight?: boolean;
}

function StatCard({ icon, label, value, unit, highlight }: StatCardProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-2 rounded-xl border p-4 transition-shadow',
        'border-[var(--border)] bg-[var(--surface)]',
        '[box-shadow:var(--shadow-sm)] hover:[box-shadow:var(--shadow-md)]',
        highlight && 'border-[var(--accent)] bg-[var(--accent-light)]',
      )}
    >
      <div
        className={cn(
          'flex h-9 w-9 items-center justify-center rounded-lg',
          highlight
            ? 'bg-[var(--accent)] text-[var(--btn-primary-fg)]'
            : 'bg-[var(--bg-muted)] text-[var(--accent)]',
        )}
        aria-hidden="true"
      >
        {icon}
      </div>
      <p className="text-xs font-medium uppercase tracking-wider text-[var(--fg-subtle)]">
        {label}
      </p>
      <p className="text-2xl font-bold text-[var(--fg)]">
        {value}
        <span className="ml-1 text-sm font-normal text-[var(--fg-muted)]">{unit}</span>
      </p>
    </div>
  );
}

/** Format a number with Indian locale separators */
function fmt(n: number, decimals = 0): string {
  return n.toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function ResultPanel({
  result,
  isOptimistic = false,
  headingId = 'result-panel-heading',
  className,
}: ResultPanelProps) {
  // Convert savings from paise → rupees
  const savingsRupees = result.estimatedAnnualSavingsMinor / 100;

  // Build consultation link with prefilled context
  const consultationHref = `/consultation?source=calculator&size=${encodeURIComponent(
    result.recommendedSizeKw.toFixed(2),
  )}&savings=${encodeURIComponent(Math.round(savingsRupees).toString())}`;

  return (
    <section className={cn('flex flex-col gap-6', className)} aria-labelledby={headingId}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2
            id={headingId}
            className="font-display text-xl font-semibold text-[var(--fg)] sm:text-2xl"
          >
            Your Solar Estimate
          </h2>
          {isOptimistic && (
            <p className="mt-1 text-xs text-[var(--fg-subtle)]">
              Instant preview — calculating precise result…
            </p>
          )}
        </div>
      </div>

      {/* Stat grid — 2 columns mobile, 3 on sm+ */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard
          icon={<Sun className="h-5 w-5" />}
          label="System size"
          value={fmt(result.recommendedSizeKw, 2)}
          unit="kW"
          highlight
        />
        <StatCard
          icon={<Zap className="h-5 w-5" />}
          label="Annual generation"
          value={fmt(result.estimatedAnnualGenerationKwh, 0)}
          unit="kWh/yr"
        />
        <StatCard
          icon={<IndianRupee className="h-5 w-5" />}
          label="Annual savings"
          value={`₹${fmt(savingsRupees, 0)}`}
          unit="/yr"
        />
        <StatCard
          icon={<Clock className="h-5 w-5" />}
          label="Payback period"
          value={fmt(result.paybackYears, 1)}
          unit="years"
        />
        <StatCard
          icon={<Leaf className="h-5 w-5" />}
          label="CO₂ offset"
          value={fmt(result.co2OffsetTonnesPerYear, 2)}
          unit="t CO₂/yr"
        />
      </div>

      {/* CTA — "Get exact quote" */}
      <Link
        href={consultationHref}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold',
          'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-fg)]',
          'hover:bg-[var(--btn-primary-hover)]',
          'transition-colors focus-visible:outline-none focus-visible:ring-2',
          'focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2',
          'focus-visible:ring-offset-[var(--bg)]',
        )}
      >
        Get exact quote — book a consultation
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </section>
  );
}
