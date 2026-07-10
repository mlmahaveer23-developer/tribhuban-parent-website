import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { OdishaSolarCalculator } from '@/components/solar/OdishaSolarCalculator';

export const metadata: Metadata = {
  title: 'Solar ROI Calculator — Odisha Subsidies, Payback & Savings',
  description: 'Engineering-grade solar ROI calculator for Odisha. PM Surya Ghar + OASBY subsidies, OERC telescopic tariffs, payback period, 25-year savings, CO₂ offset.',
  alternates: { canonical: '/businesses/rooftop-solar/solar-calculator' },
  robots: { index: true, follow: true },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Odisha Solar ROI Calculator',
  description: 'Calculate rooftop solar ROI with PM Surya Ghar + OASBY subsidies and OERC 2026–27 tariffs.',
  url: '${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://tribhuban-parent-website.vercel.app'}/businesses/rooftop-solar/solar-calculator',
  applicationCategory: 'FinanceApplication',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
};

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: '${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://tribhuban-parent-website.vercel.app'}/' },
    { '@type': 'ListItem', position: 2, name: 'Solar', item: '${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://tribhuban-parent-website.vercel.app'}/solar' },
    { '@type': 'ListItem', position: 3, name: 'Calculator', item: '${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://tribhuban-parent-website.vercel.app'}/solar/calculator' },
  ],
};

export default function SolarCalculatorPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <main id="main-content">
        {/* Hero */}
        <section className="bg-[var(--bg)] py-12 md:py-16">
          <div className="container-content">
            <nav aria-label="Breadcrumb" className="mb-6">
              <ol className="flex flex-wrap items-center gap-1 text-sm text-[var(--fg-subtle)]" role="list">
                {[{ label: 'Home', href: '/' }, { label: 'Businesses', href: '/businesses' }, { label: 'Rooftop Solar', href: '/businesses/rooftop-solar' }, { label: 'Calculator', href: null }].map((c, i) => (
                  <li key={c.label} className="flex items-center gap-1">
                    {i > 0 && <span aria-hidden="true" className="text-[var(--fg-subtle)]">/</span>}
                    {c.href ? <Link href={c.href} className="hover:text-[var(--accent)] transition-colors">{c.label}</Link> : <span aria-current="page" className="font-medium text-[var(--fg-muted)]">{c.label}</span>}
                  </li>
                ))}
              </ol>
            </nav>
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-[var(--accent)] mb-3">🧮 Engineering-Grade Estimate</span>
              <h1 className="font-display text-4xl sm:text-5xl font-semibold text-[var(--fg)] mb-4 leading-tight">Solar ROI Calculator</h1>
              <p className="text-lg text-[var(--fg-muted)] leading-relaxed">
                Built on OERC 2026–27 tariffs, PM Surya Ghar + OASBY subsidy slabs, and Odisha irradiance data. Get an instant system recommendation, subsidy breakdown, payback period, and 25-year savings projection.
              </p>
            </div>
          </div>
        </section>

        {/* Calculator island */}
        <section className="bg-[var(--bg-subtle)] py-12 md:py-16 border-y border-[var(--border)]" aria-labelledby="calculator-main-heading">
          <div className="container-content">
            <h2 id="calculator-main-heading" className="sr-only">Solar savings calculator tool</h2>
            <OdishaSolarCalculator />
          </div>
        </section>

        {/* Trust section */}
        <section className="bg-[var(--bg)] py-12 md:py-16" aria-labelledby="calc-trust-heading">
          <div className="container-content">
            <h2 id="calc-trust-heading" className="font-display text-2xl font-semibold text-[var(--fg)] mb-8 md:text-3xl">About this calculator</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { icon: '📊', title: 'Real OERC tariff data', body: 'Uses OERC 2026–27 telescopic residential slabs (₹2.90 → ₹6.10/kWh) and HT commercial tariffs (₹5.85/kVAh) for accurate bill offset calculations.' },
                { icon: '🏛️', title: 'Dual subsidy architecture', body: 'Applies PM Surya Ghar central DBT (up to ₹78,000) and Odisha OASBY state top-up (up to ₹60,000) using exact MNRE benchmark cost logic.' },
                { icon: '⚠️', title: 'Transparent assumptions', body: 'All assumptions — tariff rate, generation yield (120 units/kW/month), installation cost (₹65,000/kW), APPC rate — are clearly disclosed with each estimate.' },
              ].map((card) => (
                <div key={card.title} className="rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] p-6 flex flex-col gap-3">
                  <span className="text-3xl" aria-hidden="true">{card.icon}</span>
                  <h3 className="font-display text-base font-semibold text-[var(--fg)]">{card.title}</h3>
                  <p className="text-sm text-[var(--fg-muted)] leading-relaxed">{card.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-[var(--bg-subtle)] py-12 md:py-16 border-t border-[var(--border)]" aria-labelledby="calc-cta-heading">
          <div className="container-content text-center max-w-xl mx-auto">
            <h2 id="calc-cta-heading" className="font-display text-2xl font-semibold text-[var(--fg)] mb-3 md:text-3xl">Want an exact site-specific quote?</h2>
            <p className="text-[var(--fg-muted)] mb-8 leading-relaxed">Our ELBO-licensed engineers will assess your rooftop, verify your DISCOM load, and deliver a precise, no-obligation proposal with subsidy application support.</p>
            <Link href="/consultation" className={cn('inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--btn-primary-bg)] px-8 py-3 text-sm font-semibold text-[var(--btn-primary-fg)] hover:bg-[var(--btn-primary-hover)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]')}>
              Book a free consultation <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
