'use client';

/**
 * SolarCalculatorPreview — teaser section on the Solar overview page.
 * Gives an instant feel for the calculator without loading the full engine.
 * Includes a quick 2-input mini-estimate and a CTA to the full calculator.
 */

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Zap } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { motion, AnimatePresence } from 'framer-motion';

// Quick estimate using document research parameters
function quickEstimate(bill: number): {
  size: number; gross: number; central: number; state: number; net: number; payback: number;
} {
  const units = bill / 5; // blended ₹5/unit Odisha rate
  const size = Math.max(1, Math.round(units / 120)); // 120 units/kW/month
  const gross = size * 65000;
  const central = size >= 3 ? 78000 : size === 2 ? 60000 : 30000;
  const state = size >= 3 ? 60000 : size === 2 ? 50000 : 25000;
  const net = Math.max(0, gross - central - state);
  const payback = net > 0 ? parseFloat((net / (bill * 12)).toFixed(1)) : 0;
  return { size, gross, central, state, net, payback };
}

const inputBase = cn(
  'w-full h-12 rounded-lg border border-[var(--border-input)] bg-[var(--bg)]',
  'px-4 text-sm text-[var(--fg)] placeholder:text-[var(--fg-subtle)]',
  'focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent',
  'transition-all duration-150',
);

export default function SolarCalculatorPreview() {
  const [bill, setBill] = useState(2000);
  const [category, setCategory] = useState<'residential' | 'commercial'>('residential');
  const est = quickEstimate(bill);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 rounded-2xl border border-[var(--border)] bg-[var(--bg)] shadow-[var(--shadow-md)] overflow-hidden">

        {/* Input side */}
        <div className="lg:col-span-2 p-8 bg-[var(--bg-subtle)] flex flex-col gap-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-[var(--accent)] uppercase tracking-wider">
            <Zap className="h-4 w-4" aria-hidden="true" />
            Quick Estimate
          </div>
          <div>
            <label htmlFor="preview-bill" className="block text-sm font-medium text-[var(--fg-muted)] mb-1.5">
              Monthly electricity bill (₹)
            </label>
            <input
              id="preview-bill"
              type="range"
              min={500}
              max={15000}
              step={500}
              value={bill}
              onChange={(e) => setBill(Number(e.target.value))}
              className="w-full mb-2 accent-[var(--accent)]"
              aria-valuemin={500}
              aria-valuemax={15000}
              aria-valuenow={bill}
            />
            <div className="flex justify-between text-xs text-[var(--fg-subtle)] mb-3">
              <span>₹500</span>
              <span className="font-semibold text-[var(--accent)] text-sm">₹{bill.toLocaleString('en-IN')}</span>
              <span>₹15,000</span>
            </div>
          </div>
          <div>
            <label htmlFor="preview-category" className="block text-sm font-medium text-[var(--fg-muted)] mb-1.5">Customer type</label>
            <select
              id="preview-category"
              value={category}
              onChange={(e) => setCategory(e.target.value as 'residential' | 'commercial')}
              className={inputBase}
            >
              <option value="residential">Residential</option>
              <option value="commercial">Commercial / Industrial</option>
            </select>
          </div>
          <Link
            href={`/solar/calculator?bill=${bill}&type=${category}`}
            className={cn(
              'inline-flex items-center justify-center gap-2 h-12 px-6 rounded-lg',
              'text-sm font-semibold bg-[var(--btn-primary-bg)] text-[var(--btn-primary-fg)]',
              'hover:bg-[var(--btn-primary-hover)] transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]',
            )}
          >
            Full Engineering Calculator
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        {/* Results side */}
        <div className="lg:col-span-3 p-8 flex flex-col gap-4" aria-live="polite" aria-atomic="true">
          <AnimatePresence mode="wait">
            {category === 'commercial' ? (
              <motion.div
                key="commercial"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center justify-center h-full text-center py-8"
              >
                <span className="text-4xl mb-4">🏢</span>
                <h3 className="font-display text-xl font-semibold text-[var(--fg)] mb-2">Commercial / Industrial</h3>
                <p className="text-sm text-[var(--fg-muted)] leading-relaxed max-w-sm">
                  PM Surya Ghar and OASBY subsidies apply exclusively to residential consumers. Commercial ROI is calculated using 40% Year-1 accelerated depreciation and LCOE vs. OERC grid tariffs.
                </p>
                <Link href="/solar/calculator?type=commercial" className="mt-5 text-sm font-semibold text-[var(--accent)] hover:underline">Open Commercial Calculator →</Link>
              </motion.div>
            ) : (
              <motion.div
                key="residential"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col gap-4 h-full"
              >
                <p className="text-xs text-[var(--fg-subtle)] uppercase tracking-widest font-semibold">Estimated for Odisha Residential · 3 kW benchmark</p>
                <div className="grid grid-cols-2 gap-3 flex-1">
                  {[
                    { label: 'Recommended Size', value: `${est.size} kW`, sub: 'system capacity' },
                    { label: 'Gross Cost', value: `₹${est.gross.toLocaleString('en-IN')}`, sub: 'at ₹65,000/kW' },
                    { label: 'Total Subsidy', value: `₹${(est.central + est.state).toLocaleString('en-IN')}`, sub: 'Central + OASBY', accent: true },
                    { label: 'Net Investment', value: `₹${est.net.toLocaleString('en-IN')}`, sub: 'after subsidies', bold: true },
                    { label: 'Monthly Savings', value: `~₹${bill.toLocaleString('en-IN')}`, sub: 'electricity bill offset' },
                    { label: 'Payback Period', value: `${est.payback} yrs`, sub: '25-yr panel lifespan', bold: true },
                  ].map((row) => (
                    <div key={row.label} className={cn('rounded-xl border p-4', row.bold ? 'border-[var(--accent)]/30 bg-[var(--accent-light)]' : 'border-[var(--border)] bg-[var(--bg-subtle)]')}>
                      <p className="text-xs text-[var(--fg-subtle)] mb-1">{row.label}</p>
                      <p className={cn('text-lg font-bold', row.accent ? 'text-green-600 dark:text-green-400' : row.bold ? 'text-[var(--accent)]' : 'text-[var(--fg)]')}>{row.value}</p>
                      <p className="text-[10px] text-[var(--fg-subtle)] mt-0.5">{row.sub}</p>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-[var(--fg-subtle)] pt-1">Estimates based on OERC 2026–27 tariffs, MNRE benchmark costs, and Odisha irradiance (4.8 peak sun hrs/day). For an exact quote, book a free consultation.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
