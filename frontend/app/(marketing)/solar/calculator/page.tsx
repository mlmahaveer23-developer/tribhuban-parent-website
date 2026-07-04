import type { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle2, Zap, ArrowRight } from 'lucide-react';

import { cn } from '@/lib/utils/cn';
import { SolarCalculator } from '@/components/solar/SolarCalculator';

// ── Metadata ──────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: 'Solar Savings Calculator — Tribhuban Concepts',
  description:
    'Calculate your rooftop solar savings with our free interactive tool. Estimate system size, annual generation, bill savings, and payback period.',
  alternates: {
    canonical: '/solar/calculator',
  },
  robots: {
    index: true,
    follow: true,
  },
};

// ── JSON-LD structured data ───────────────────────────────────────────────────

const webApplicationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Solar Savings Calculator',
  description:
    'Calculate your rooftop solar savings with our free interactive tool. Estimate system size, annual generation, bill savings, and payback period.',
  url: 'https://tribhubanconcepts.com/solar/calculator',
  applicationCategory: 'FinanceApplication',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'INR',
  },
};

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: 'https://tribhubanconcepts.com/',
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Solar',
      item: 'https://tribhubanconcepts.com/solar',
    },
    {
      '@type': 'ListItem',
      position: 3,
      name: 'Calculator',
      item: 'https://tribhubanconcepts.com/solar/calculator',
    },
  ],
};

// ── Trust callout data ────────────────────────────────────────────────────────

const trustCallouts = [
  {
    icon: CheckCircle2,
    heading: 'Why use our calculator',
    body: 'Built on real Indian tariff data and state-wise irradiance figures, our tool gives you a grounded savings estimate — not a sales pitch. Transparent assumptions, every time.',
  },
  {
    icon: Zap,
    heading: 'How it works',
    body: 'Enter your monthly bill or consumption, pick your state, and choose your connection type. We size the system, project annual generation, and compute payback period in seconds.',
  },
  {
    icon: ArrowRight,
    heading: "What's next",
    body: 'Your estimate is a starting point. Book a free consultation and our engineers will conduct a rooftop survey and deliver a site-specific proposal with no obligation.',
  },
];

// ── Page ─────────────────────────────────────────────────────────────────────

export default function SolarCalculatorPage() {
  return (
    <>
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webApplicationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <main>
        {/* ── Hero section ────────────────────────────────────────────────── */}
        <section className="bg-page py-12 md:py-16">
          <div className="container-content">
            {/* Breadcrumb */}
            <Breadcrumb />

            {/* Heading */}
            <div className="mt-6 max-w-2xl">
              <h1
                className={cn(
                  'font-display text-4xl font-semibold leading-tight text-[var(--fg)]',
                  'sm:text-5xl',
                )}
              >
                Solar Savings Calculator
              </h1>
              <p className="mt-4 text-lg text-[var(--fg-muted)] leading-relaxed">
                Find out how much rooftop solar can save you. Enter your electricity details below
                for an instant personalised estimate — system size, annual generation, bill savings,
                and payback period.
              </p>
            </div>
          </div>
        </section>

        {/* ── Calculator island ────────────────────────────────────────────── */}
        <section className="bg-subtle py-12 md:py-16" aria-labelledby="calculator-heading">
          <div className="container-content">
            <h2 id="calculator-heading" className="sr-only">
              Solar savings calculator tool
            </h2>
            {/*
              SolarCalculator renders its own internal 2-col grid on lg+.
              On mobile it is single column by default (grid stacks).
              The page provides the full-width container; the island
              controls its own internal responsive layout.
            */}
            <SolarCalculator />
          </div>
        </section>

        {/* ── Trust section ────────────────────────────────────────────────── */}
        <section
          className="bg-page py-12 md:py-16"
          aria-labelledby="trust-heading"
        >
          <div className="container-content">
            <h2
              id="trust-heading"
              className="font-display text-2xl font-semibold text-[var(--fg)] mb-8 md:text-3xl"
            >
              Everything you need to know
            </h2>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {trustCallouts.map(({ icon: Icon, heading, body }) => (
                <div
                  key={heading}
                  className={cn(
                    'rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)]',
                    'p-6 flex flex-col gap-3',
                    '[box-shadow:var(--shadow-sm)]',
                  )}
                >
                  <div
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-lg',
                      'bg-[var(--accent-light)] text-[var(--accent)]',
                    )}
                    aria-hidden="true"
                  >
                    <Icon className="h-5 w-5" strokeWidth={1.75} />
                  </div>
                  <h3 className="font-display text-base font-semibold text-[var(--fg)]">
                    {heading}
                  </h3>
                  <p className="text-sm text-[var(--fg-muted)] leading-relaxed">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Consultation CTA ─────────────────────────────────────────────── */}
        <section
          className="bg-subtle py-12 md:py-16 border-t border-[var(--border)]"
          aria-labelledby="cta-heading"
        >
          <div className="container-content text-center">
            <h2
              id="cta-heading"
              className="font-display text-2xl font-semibold text-[var(--fg)] mb-3 md:text-3xl"
            >
              Ready for an exact quote?
            </h2>
            <p className="text-[var(--fg-muted)] mb-8 max-w-xl mx-auto leading-relaxed">
              Our engineers will assess your rooftop, usage patterns, and local grid conditions to
              give you a precise, no-obligation proposal.
            </p>
            <Link
              href="/consultation"
              className={cn(
                'inline-flex items-center justify-center gap-2',
                'rounded-lg bg-[var(--btn-primary-bg)] px-6 py-3',
                'text-sm font-semibold text-[var(--btn-primary-fg)]',
                'hover:bg-[var(--btn-primary-hover)] transition-colors',
                'focus-visible:outline-none focus-visible:ring-2',
                'focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2',
                'focus-visible:ring-offset-[var(--bg-subtle)]',
              )}
            >
              Book a free consultation
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}

// ── Breadcrumb component ──────────────────────────────────────────────────────

function Breadcrumb() {
  const crumbs = [
    { label: 'Home', href: '/' },
    { label: 'Solar', href: '/solar' },
    { label: 'Calculator', href: null }, // current page — no link
  ];

  return (
    <nav aria-label="Breadcrumb">
      <ol
        className="flex flex-wrap items-center gap-1 text-sm text-[var(--fg-subtle)]"
        role="list"
      >
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;
          return (
            <li key={crumb.label} className="flex items-center gap-1">
              {/* Separator — not shown before first item */}
              {index > 0 && (
                <span aria-hidden="true" className="select-none text-[var(--fg-subtle)]">
                  /
                </span>
              )}

              {isLast ? (
                <span
                  aria-current="page"
                  className="font-medium text-[var(--fg-muted)]"
                >
                  {crumb.label}
                </span>
              ) : (
                <Link
                  href={crumb.href as string}
                  className={cn(
                    'hover:text-[var(--accent)] transition-colors',
                    'focus-visible:outline-none focus-visible:rounded',
                    'focus-visible:ring-2 focus-visible:ring-[var(--ring)]',
                  )}
                >
                  {crumb.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
