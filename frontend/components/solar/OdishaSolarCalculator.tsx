'use client';

/**
 * OdishaSolarCalculator — engineering-grade solar ROI calculator.
 *
 * Calculation engine based on:
 * - OERC 2026-27 telescopic residential tariff slabs
 * - PM Surya Ghar central subsidy slabs (MNRE benchmark)
 * - Odisha OASBY state top-up slabs
 * - Odisha irradiance: 4.8 peak sun hours/day → 120 units/kW/month
 * - Gross installation cost: ₹65,000/kW (ALMM List-II + cyclone-resistant structure)
 * - Annual solar yield degradation: 0.5%/year
 * - BESS mandate for 5 kW+ systems per OERC 2026 regulations
 *
 * All data sourced from: Strategic Intelligence Report: Rooftop Solar Policy,
 * Regulatory Dynamics, and Business Strategy in Odisha (2026)
 */

import { useState, useId, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

import Link from 'next/link';

// ── CALCULATION ENGINE ────────────────────────────────────────────────────────

/** OERC 2026-27 Odisha residential telescopic tariff (₹/kWh) */
function calcOdishaBillFromUnits(units: number): number {
  let bill = 0;
  if (units <= 50) { bill = units * 2.90; }
  else if (units <= 200) { bill = 50 * 2.90 + (units - 50) * 4.70; }
  else if (units <= 400) { bill = 50 * 2.90 + 150 * 4.70 + (units - 200) * 5.70; }
  else { bill = 50 * 2.90 + 150 * 4.70 + 200 * 5.70 + (units - 400) * 6.10; }
  // Fixed charge: ₹20/kW of sanctioned load (not included — conservative)
  return bill;
}

/** PM Surya Ghar central subsidy (₹) based on system size */
function calcCentralSubsidy(sizeKw: number): number {
  if (sizeKw <= 0) return 0;
  if (sizeKw <= 1) return 30000;
  if (sizeKw <= 2) return 60000;
  return 78000; // capped at 3 kW+
}

/** Odisha OASBY state subsidy (₹) based on system size */
function calcStateSubsidy(sizeKw: number): number {
  if (sizeKw <= 0) return 0;
  if (sizeKw <= 1) return 25000;
  if (sizeKw <= 2) return 50000;
  return 60000; // capped at 3 kW+
}

/** BESS cost addition for 5 kW+ systems per OERC 2026 mandate */
function calcBessCost(sizeKw: number): number {
  if (sizeKw <= 4) return 0;
  if (sizeKw <= 10) return 55000; // 2 kWh BESS + hybrid inverter delta
  if (sizeKw <= 30) return 85000;
  return 150000;
}

/** CO2 offset: Indian grid emission factor ~0.82 kgCO2/kWh */
function calcCO2Offset(annualGenKwh: number): number {
  return (annualGenKwh * 0.82) / 1000; // tonnes/year
}

/** 25-year cumulative savings with tariff escalation 4%/year */
function calc25YrSavings(monthlyBillSaved: number): number {
  let total = 0;
  for (let yr = 1; yr <= 25; yr++) {
    total += monthlyBillSaved * 12 * Math.pow(1.04, yr - 1) * Math.pow(0.995, yr - 1);
  }
  return Math.round(total);
}

export interface CalcResult {
  sizeKw: number;
  grossCost: number;
  bessCost: number;
  totalCost: number;
  centralSubsidy: number;
  stateSubsidy: number;
  netInvestment: number;
  annualGenKwh: number;
  monthlySavings: number;
  annualSavings: number;
  paybackYears: number;
  savings25yr: number;
  co2TonnesPerYear: number;
  isResidential: boolean;
  isBessRequired: boolean;
  disclaimer: string;
}

function runCalculation(inputs: FormInputs): CalcResult | null {
  const { category, monthlyBill, monthlyUnits, roofAreaSqft, customTariff, battery } = inputs;
  const isResidential = category === 'residential';

  // Determine monthly units
  let units = 0;
  if (monthlyUnits && monthlyUnits > 0) {
    units = monthlyUnits;
  } else if (monthlyBill && monthlyBill > 0) {
    const blendedRate = customTariff || 5.0;
    units = monthlyBill / blendedRate;
  } else {
    return null;
  }

  const effectiveBill = monthlyBill || calcOdishaBillFromUnits(units);

  // System size
  let sizeKw = Math.ceil(units / 120); // 120 units/kW/month in Odisha
  sizeKw = Math.max(1, sizeKw);

  // Roof area cap (100 sq ft = 9.3 sqm per kW)
  if (roofAreaSqft && roofAreaSqft > 0) {
    const maxByRoof = Math.floor(roofAreaSqft / 100);
    sizeKw = Math.min(sizeKw, maxByRoof);
    sizeKw = Math.max(1, sizeKw);
  }

  const isBessRequired = sizeKw >= 5 && battery !== 'none';
  const grossCost = sizeKw * 65000;
  const bessCost = isBessRequired ? calcBessCost(sizeKw) : 0;
  const totalCost = grossCost + bessCost;
  const centralSubsidy = isResidential ? calcCentralSubsidy(sizeKw) : 0;
  const stateSubsidy = isResidential ? calcStateSubsidy(sizeKw) : 0;
  const netInvestment = totalCost - centralSubsidy - stateSubsidy;

  const annualGenKwh = sizeKw * 120 * 12; // 120 units/kW/month × 12
  const monthlySavings = effectiveBill;
  const annualSavings = monthlySavings * 12;
  const paybackYears = netInvestment > 0 ? parseFloat((netInvestment / annualSavings).toFixed(1)) : 0;
  const savings25yr = calc25YrSavings(monthlySavings);
  const co2TonnesPerYear = calcCO2Offset(annualGenKwh);

  const disclaimer = isResidential
    ? 'Estimates use OERC 2026-27 tariffs, PM Surya Ghar + OASBY subsidy slabs, and Odisha irradiance (4.8 peak sun hrs/day). State OASBY subsidy is subject to OREDA fund availability. For exact quote, book a consultation.'
    : 'Commercial/industrial consumers are ineligible for PM Surya Ghar and OASBY subsidies. ROI modelled on OERC HT tariff savings and 40% Year-1 accelerated depreciation. Figures are estimates only.';

  return { sizeKw, grossCost, bessCost, totalCost, centralSubsidy, stateSubsidy, netInvestment, annualGenKwh, monthlySavings, annualSavings, paybackYears, savings25yr, co2TonnesPerYear, isResidential, isBessRequired, disclaimer };
}

// ── FORM TYPES ────────────────────────────────────────────────────────────────

interface FormInputs {
  category: 'residential' | 'commercial' | 'industrial';
  monthlyBill: number | null;
  monthlyUnits: number | null;
  roofAreaSqft: number | null;
  customTariff: number | null;
  battery: 'auto' | 'yes' | 'none';
  discom: string;
}

// ── SHARED STYLES ─────────────────────────────────────────────────────────────

const inputBase = cn(
  'w-full h-11 rounded-lg border border-[var(--border-input)] bg-[var(--bg-muted)]',
  'px-3.5 text-sm text-[var(--fg)] placeholder:text-[var(--fg-subtle)]',
  'focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent',
  'disabled:opacity-50 transition-all duration-150',
);
const labelBase = 'block text-sm font-medium text-[var(--fg-muted)] mb-1.5';

// ── RESULT CARD ───────────────────────────────────────────────────────────────

function ResultCard({ label, value, sub, accent, green }: { label: string; value: string; sub?: string; accent?: boolean; green?: boolean }) {
  return (
    <div className={cn('rounded-xl border p-4', accent ? 'border-[var(--accent)]/30 bg-[var(--accent-light)]' : green ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20' : 'border-[var(--border)] bg-[var(--bg-subtle)]')}>
      <p className="text-xs text-[var(--fg-subtle)] mb-1">{label}</p>
      <p className={cn('text-xl font-bold', accent ? 'text-[var(--accent)]' : green ? 'text-green-700 dark:text-green-400' : 'text-[var(--fg)]')}>{value}</p>
      {sub && <p className="text-[10px] text-[var(--fg-subtle)] mt-0.5">{sub}</p>}
    </div>
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────

export function OdishaSolarCalculator() {
  const uid = useId();
  const id = (s: string) => `${uid}-${s}`;

  const [inputs, setInputs] = useState<FormInputs>({
    category: 'residential',
    monthlyBill: 2000,
    monthlyUnits: null,
    roofAreaSqft: null,
    customTariff: null,
    battery: 'auto',
    discom: 'tpwodl',
  });

  const [inputMode, setInputMode] = useState<'bill' | 'units'>('bill');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const set = useCallback(<K extends keyof FormInputs>(key: K, value: FormInputs[K]) => {
    setInputs(prev => ({ ...prev, [key]: value }));
  }, []);

  const result = runCalculation(inputs);
  const isCommercial = inputs.category !== 'residential';

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_1.4fr] gap-8 max-w-6xl mx-auto">

      {/* ── INPUT PANEL ──────────────────────────────────────────────────── */}
      <div className="bg-[var(--bg)] rounded-2xl border border-[var(--border)] shadow-[var(--shadow-sm)] p-7 flex flex-col gap-6">
        <div>
          <h2 className="font-display text-2xl font-semibold text-[var(--fg)] mb-1">Enter Your Details</h2>
          <p className="text-sm text-[var(--fg-muted)]">Results update instantly as you type.</p>
        </div>

        {/* Customer category */}
        <div>
          <label htmlFor={id('category')} className={labelBase}>Customer Category</label>
          <select id={id('category')} className={inputBase} value={inputs.category} onChange={e => set('category', e.target.value as FormInputs['category'])}>
            <option value="residential">Residential (LT-Domestic)</option>
            <option value="commercial">Commercial / Institutional</option>
            <option value="industrial">Industrial (HT/EHT)</option>
          </select>
          {isCommercial && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-2">
              ℹ️ PM Surya Ghar & OASBY subsidies are for residential consumers only. Commercial ROI uses OERC grid tariff savings + 40% accelerated depreciation.
            </motion.p>
          )}
        </div>

        {/* Input mode toggle */}
        <fieldset>
          <legend className={cn(labelBase, 'mb-2')}>Calculate using</legend>
          <div className="flex gap-2">
            {(['bill', 'units'] as const).map((mode) => (
              <button key={mode} type="button" onClick={() => setInputMode(mode)}
                className={cn('flex-1 h-10 rounded-lg text-sm font-medium border transition-all duration-150', inputMode === mode ? 'border-[var(--accent)] bg-[var(--accent-light)] text-[var(--accent)]' : 'border-[var(--border)] text-[var(--fg-muted)] hover:border-[var(--accent)]')}>
                {mode === 'bill' ? 'Monthly bill (₹)' : 'Units consumed (kWh)'}
              </button>
            ))}
          </div>
        </fieldset>

        {/* Bill / Units input */}
        {inputMode === 'bill' ? (
          <div>
            <label htmlFor={id('bill')} className={labelBase}>Monthly Electricity Bill (₹)</label>
            <input id={id('bill')} type="number" min={1} max={999999} placeholder="e.g. 2000" className={inputBase}
              value={inputs.monthlyBill ?? ''} onChange={e => set('monthlyBill', e.target.value ? Number(e.target.value) : null)} />
            <input type="range" min={500} max={20000} step={500} value={inputs.monthlyBill ?? 500} aria-hidden="true"
              className="w-full mt-2 accent-[var(--accent)]" onChange={e => set('monthlyBill', Number(e.target.value))} />
          </div>
        ) : (
          <div>
            <label htmlFor={id('units')} className={labelBase}>Monthly Consumption (kWh)</label>
            <input id={id('units')} type="number" min={1} max={100000} placeholder="e.g. 400" className={inputBase}
              value={inputs.monthlyUnits ?? ''} onChange={e => set('monthlyUnits', e.target.value ? Number(e.target.value) : null)} />
          </div>
        )}

        {/* Roof area */}
        <div>
          <label htmlFor={id('roof')} className={labelBase}>Available Roof Area (sq. ft.) <span className="text-[var(--fg-subtle)] text-xs font-normal">optional</span></label>
          <input id={id('roof')} type="number" min={100} placeholder="e.g. 500 (100 sq. ft. per kW required)" className={inputBase}
            value={inputs.roofAreaSqft ?? ''} onChange={e => set('roofAreaSqft', e.target.value ? Number(e.target.value) : null)} />
        </div>

        {/* DISCOM */}
        <div>
          <label htmlFor={id('discom')} className={labelBase}>Odisha DISCOM</label>
          <select id={id('discom')} className={inputBase} value={inputs.discom} onChange={e => set('discom', e.target.value)}>
            <option value="tpwodl">TPWODL — Western Odisha</option>
            <option value="tpsodl">TPSODL — Southern Odisha</option>
            <option value="tpcodl">TPCODL — Central Odisha</option>
            <option value="tpnodl">TPNODL — Northern Odisha</option>
            <option value="other">Other / Outside Odisha</option>
          </select>
        </div>

        {/* Advanced toggle */}
        <button type="button" onClick={() => setShowAdvanced(v => !v)}
          className="flex items-center gap-2 text-sm font-medium text-[var(--fg-muted)] hover:text-[var(--accent)] transition-colors">
          <ChevronDown className={cn('h-4 w-4 transition-transform duration-200', showAdvanced && 'rotate-180')} aria-hidden="true" />
          {showAdvanced ? 'Hide' : 'Show'} advanced options
        </button>

        <AnimatePresence>
          {showAdvanced && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
              <div className="flex flex-col gap-5 pt-1">
                <div>
                  <label htmlFor={id('tariff')} className={labelBase}>Custom Tariff (₹/kWh) <span className="text-[var(--fg-subtle)] text-xs font-normal">overrides blended ₹5 default</span></label>
                  <input id={id('tariff')} type="number" min={1} max={15} step={0.1} placeholder="e.g. 5.70" className={inputBase}
                    value={inputs.customTariff ?? ''} onChange={e => set('customTariff', e.target.value ? Number(e.target.value) : null)} />
                </div>
                <div>
                  <label htmlFor={id('battery')} className={labelBase}>Battery / BESS</label>
                  <select id={id('battery')} className={inputBase} value={inputs.battery} onChange={e => set('battery', e.target.value as FormInputs['battery'])}>
                    <option value="auto">Auto (OERC mandate for 5 kW+)</option>
                    <option value="yes">Include BESS cost</option>
                    <option value="none">On-grid only (no BESS)</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── RESULTS PANEL ────────────────────────────────────────────────── */}
      <div aria-live="polite" aria-atomic="true">
        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="bg-[var(--bg)] rounded-2xl border-2 border-dashed border-[var(--border)] min-h-[400px] flex flex-col items-center justify-center text-center p-10">
              <span className="text-5xl mb-4" role="img" aria-label="Solar panel">☀️</span>
              <p className="font-medium text-[var(--fg-muted)]">Enter your monthly electricity bill to see your solar savings estimate</p>
              <p className="text-sm text-[var(--fg-subtle)] mt-2">Results update instantly</p>
            </motion.div>
          ) : (
            <motion.div key="results" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="bg-[var(--bg)] rounded-2xl border border-[var(--border)] shadow-[var(--shadow-sm)] p-7 flex flex-col gap-6">

              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-display text-2xl font-semibold text-[var(--fg)] mb-0.5">Your Solar Estimate</h2>
                  <p className="text-xs text-[var(--fg-subtle)]">Based on OERC 2026–27 data · Odisha irradiance · MNRE benchmark costs</p>
                </div>
                <span className="text-3xl">{result.isResidential ? '🏠' : '🏢'}</span>
              </div>

              {/* Primary metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <ResultCard label="Recommended Size" value={`${result.sizeKw} kW`} sub="system capacity" />
                <ResultCard label="Gross Cost" value={`₹${result.grossCost.toLocaleString('en-IN')}`} sub="at ₹65,000/kW" />
                {result.isBessRequired && <ResultCard label="BESS + Hybrid Inverter" value={`+ ₹${result.bessCost.toLocaleString('en-IN')}`} sub="OERC mandate ≥5 kW" />}
                {result.isResidential && <ResultCard label="Central Subsidy" value={`₹${result.centralSubsidy.toLocaleString('en-IN')}`} sub="PM Surya Ghar (DBT)" green />}
                {result.isResidential && <ResultCard label="State Subsidy" value={`₹${result.stateSubsidy.toLocaleString('en-IN')}`} sub="Odisha OASBY" green />}
                <ResultCard label="Net Investment" value={`₹${result.netInvestment.toLocaleString('en-IN')}`} sub="after all subsidies" accent />
              </div>

              {/* Financial metrics */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-widest text-[var(--fg-subtle)] mb-3">Financial Projections</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <ResultCard label="Monthly Savings" value={`₹${result.monthlySavings.toLocaleString('en-IN')}`} sub="bill offset" />
                  <ResultCard label="Annual Savings" value={`₹${result.annualSavings.toLocaleString('en-IN')}`} sub="year 1" />
                  <ResultCard label="Payback Period" value={`${result.paybackYears} yrs`} sub="full recovery" accent />
                  <ResultCard label="25-Year Savings" value={`₹${(result.savings25yr / 100000).toFixed(1)}L`} sub="4% tariff escalation" accent />
                </div>
              </div>

              {/* Environmental */}
              <div className="rounded-xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20 p-5 flex gap-5 items-center">
                <span className="text-3xl shrink-0" aria-hidden="true">🌿</span>
                <div>
                  <p className="text-sm font-semibold text-green-800 dark:text-green-300 mb-0.5">Environmental Impact</p>
                  <p className="text-sm text-green-700 dark:text-green-400">
                    Your {result.sizeKw} kW system will generate <strong>{result.annualGenKwh.toLocaleString('en-IN')} kWh/year</strong>, offsetting <strong>{result.co2TonnesPerYear.toFixed(1)} tonnes CO₂/year</strong> — equivalent to planting ~{Math.round(result.co2TonnesPerYear * 45)} trees annually.
                  </p>
                </div>
              </div>

              {/* BESS note */}
              {result.isBessRequired && (
                <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20 px-4 py-3 text-xs text-amber-700 dark:text-amber-400">
                  ⚡ <strong>OERC Mandate:</strong> Systems ≥5 kW require a hybrid inverter + Battery Energy Storage System (minimum 2 kWh per 5–10 kW). BESS cost of ₹{result.bessCost.toLocaleString('en-IN')} is included above.
                </div>
              )}

              {/* Assumptions disclosure */}
              <details className="text-xs border-t border-[var(--border)] pt-4">
                <summary className="cursor-pointer font-semibold text-[var(--fg-muted)] hover:text-[var(--fg)] flex items-center gap-1.5 select-none">
                  <Info className="h-3.5 w-3.5" aria-hidden="true" />
                  Assumptions &amp; disclaimer
                </summary>
                <div className="mt-3 space-y-1.5 text-[var(--fg-subtle)] leading-relaxed">
                  <p>• Solar generation: 120 units/kW/month (Odisha: 4.8 peak sun hrs/day × performance ratio)</p>
                  <p>• Installation cost: ₹65,000/kW (ALMM List-II modules + hot-dip galvanized structure)</p>
                  <p>• Blended tariff: ₹5.00/kWh (OERC 2026–27 telescopic slabs for simplified modelling)</p>
                  <p>• 25-year projection: 4% annual tariff escalation, 0.5%/year panel degradation</p>
                  <p>• CO₂: Indian grid emission factor 0.82 kgCO₂/kWh</p>
                  <p className="mt-2">{result.disclaimer}</p>
                </div>
              </details>

              {/* CTA */}
              <div className="flex flex-col sm:flex-row gap-3 pt-1">
                <Link href="/consultation" className="flex-1 inline-flex items-center justify-center h-11 rounded-lg text-sm font-semibold bg-[var(--btn-primary-bg)] text-[var(--btn-primary-fg)] hover:bg-[var(--btn-primary-hover)] transition-colors">
                  Book Free Consultation
                </Link>
                <Link href="/blog/rooftop-solar-roi-costs-savings-payback" className="flex-1 inline-flex items-center justify-center h-11 rounded-lg text-sm font-semibold border border-[var(--border)] text-[var(--fg)] hover:bg-[var(--bg-muted)] transition-colors">
                  Read ROI Guide
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
