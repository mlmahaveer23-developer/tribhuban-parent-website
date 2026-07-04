/**
 * AssumptionsDisclosure.tsx
 *
 * Collapsible disclosure of the assumptions used in a solar estimate.
 * Uses @radix-ui/react-accordion, collapsed by default.
 *
 * Displays:
 *  - Tariff per kWh (₹)
 *  - Sun hours/day
 *  - Performance ratio
 *  - Cost per kW (₹)
 */

import * as Accordion from '@radix-ui/react-accordion';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { SolarAssumptions } from '@/lib/api/solar';

interface AssumptionsDisclosureProps {
  assumptions: SolarAssumptions;
  className?: string;
}

/** Format paise → rupees with Indian locale */
function paiseToRupees(paise: number): string {
  return (paise / 100).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function AssumptionsDisclosure({ assumptions, className }: AssumptionsDisclosureProps) {
  const items: { label: string; value: string }[] = [
    {
      label: 'Electricity tariff',
      value: `₹${paiseToRupees(assumptions.tariffMinorPerKwh)} / kWh`,
    },
    {
      label: 'Peak sun hours',
      value: `${assumptions.sunHoursPerDay.toFixed(1)} h / day`,
    },
    {
      label: 'System performance ratio',
      value: `${(assumptions.performanceRatio * 100).toFixed(0)}%`,
    },
    {
      label: 'Installed cost per kW',
      value: `₹${paiseToRupees(assumptions.costPerKwMinor)}`,
    },
  ];

  return (
    <Accordion.Root
      type="single"
      collapsible
      className={cn('w-full', className)}
    >
      <Accordion.Item
        value="assumptions"
        className="rounded-lg border border-[var(--border)] bg-[var(--surface)]"
      >
        <Accordion.Header asChild>
          <h3>
            <Accordion.Trigger
              className={cn(
                'group flex w-full items-center justify-between gap-2 px-4 py-3',
                'text-sm font-medium text-[var(--fg-muted)]',
                'hover:text-[var(--fg)] focus-visible:outline-none',
                'focus-visible:ring-2 focus-visible:ring-[var(--ring)]',
                'focus-visible:ring-inset rounded-lg transition-colors',
              )}
            >
              <span>Assumptions used in this estimate</span>
              <ChevronDown
                className={cn(
                  'h-4 w-4 shrink-0 text-[var(--fg-subtle)] transition-transform duration-200',
                  'group-data-[state=open]:rotate-180',
                )}
                aria-hidden="true"
              />
            </Accordion.Trigger>
          </h3>
        </Accordion.Header>

        <Accordion.Content
          className={cn(
            'overflow-hidden',
            'data-[state=open]:animate-[accordionOpen_200ms_ease-out]',
            'data-[state=closed]:animate-[accordionClose_200ms_ease-in]',
          )}
        >
          <dl className="divide-y divide-[var(--border)] px-4 pb-4 pt-1">
            {items.map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between py-2">
                <dt className="text-xs text-[var(--fg-subtle)]">{label}</dt>
                <dd className="text-xs font-medium text-[var(--fg)]">{value}</dd>
              </div>
            ))}
          </dl>
        </Accordion.Content>
      </Accordion.Item>
    </Accordion.Root>
  );
}
