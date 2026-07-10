/**
 * /support/faq — Searchable, filterable FAQ page.
 *
 * Server Component: injects FAQPage JSON-LD (Req 23.2), renders
 * FAQAccordion as a client island.
 * ISR 1 hour, no backend dependency (static placeholder data).
 *
 * Requirements: 14.2, 14.3, 23.2
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE_URL } from '@/lib/siteConfig';
import FAQAccordion, { type FAQCategory } from '@/components/content/FAQAccordion';

// ── ISR ───────────────────────────────────────────────────────────────────────

export const revalidate = 3600; // 1 hour

// ── Static FAQ data — 10 FAQs across 3 categories ────────────────────────────

const FAQ_CATEGORIES: FAQCategory[] = [
  {
    name: 'Solar Basics',
    slug: 'solar-basics',
    faqs: [
      {
        question: 'How does a rooftop solar system work?',
        answer:
          'Rooftop solar panels convert sunlight into direct current (DC) electricity. An inverter converts this to alternating current (AC) for use in your home or business. Surplus power can be exported to the grid (net metering) or stored in a battery bank for later use.',
      },
      {
        question: 'How much roof area do I need for a 5 kW system?',
        answer:
          'As a general rule, a grid-tied solar system requires approximately 10 square metres per kW of installed capacity, depending on panel efficiency and mounting angle. A 5 kW system therefore typically needs around 50 m² of unshaded roof space. Our calculator gives you a personalised estimate.',
      },
      {
        question: 'What is net metering and am I eligible?',
        answer:
          'Net metering allows you to export surplus solar power to the grid and receive a credit on your electricity bill. Eligibility and tariff rates vary by state DISCOM and connection type. Most residential and commercial consumers in India with a sanctioned load up to 500 kW are eligible. Our team will confirm your eligibility during the site assessment.',
      },
      {
        question: 'How long does a solar installation take?',
        answer:
          'A residential rooftop installation typically takes 2–5 days from the start of civil work to grid synchronisation. The full timeline, including site survey, design approval, equipment procurement, and net-metering paperwork, is usually 4–8 weeks.',
      },
    ],
  },
  {
    name: 'Pricing & Finance',
    slug: 'pricing-finance',
    faqs: [
      {
        question: 'What does a typical rooftop solar system cost in India?',
        answer:
          'System cost varies by capacity, panel brand, inverter type, and structural requirements. As a benchmark, grid-tied residential systems in India typically cost ₹50,000–₹75,000 per kW (installed) before subsidies. Use our Solar Calculator for a personalised estimate, and contact us for a detailed quote.',
      },
      {
        question: 'Are there government subsidies available?',
        answer:
          'Yes. The PM Surya Ghar Muft Bijli Yojana scheme offers central subsidies for residential systems up to 3 kW, and state-level subsidies may stack on top. Commercial and industrial systems qualify for accelerated depreciation benefits. Subsidy amounts and eligibility change periodically; our team will advise you on the latest applicable benefits.',
      },
      {
        question: 'What financing options are available?',
        answer:
          'We assist with documentation for solar-specific loans available from nationalised banks, NBFCs, and DISCOMs under various central and state schemes. EMI tenures of 5–10 years are common, with many customers achieving positive cash flow from day one once their electricity bill savings exceed the EMI.',
      },
    ],
  },
  {
    name: 'Technical',
    slug: 'technical',
    faqs: [
      {
        question: 'What warranty do I get on panels and the inverter?',
        answer:
          'Solar panels typically carry a 10-year product warranty and a 25–30 year performance warranty (guaranteeing at least 80 % output at end of life). Inverters usually have a 5–10 year manufacturer warranty, extendable to 10 years. We supply only Tier-1 manufacturer products and will advise on specific warranties for the equipment in your proposal.',
      },
      {
        question: 'How do I monitor my system performance?',
        answer:
          'Most inverters include a manufacturer app or web portal that shows real-time generation, consumption, and export data. Tribhuban installations include setup and walkthrough of the monitoring portal. If you experience a significant drop in generation, contact our support team — many issues can be diagnosed remotely.',
      },
      {
        question: 'What maintenance does a solar system require?',
        answer:
          'Solar panels require minimal maintenance. In most Indian climates, cleaning panels every 1–3 months (depending on dust and monsoon) ensures optimal performance. Inverters are solid-state with no routine servicing requirement; our team checks connections and logs during annual health check visits.',
      },
    ],
  },
];

// ── JSON-LD: FAQPage schema ───────────────────────────────────────────────────

const faqPageJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ_CATEGORIES.flatMap((cat) =>
    cat.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  ),
};

// ── Metadata ──────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: 'FAQ — Tribhuban Concepts',
  description:
    'Frequently asked questions about Tribhuban Concepts solar systems, pricing, financing, and technical support.',
  alternates: { canonical: `${SITE_URL}/support/faq` },
  openGraph: {
    title: 'FAQ — Tribhuban Concepts',
    description:
      'Find answers to common questions about solar installation, pricing, subsidies, warranties, and more.',
    type: 'website',
  },
};

// ── Page ──────────────────────────────────────────────────────────────────────

export default function FAQPageRoute() {
  return (
    <>
      {/* JSON-LD structured data (Req 23.2) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageJsonLd) }}
      />

      <main id="main-content" className="bg-page">

        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <section
          aria-labelledby="faq-heading"
          className="bg-[var(--bg-subtle)] border-b border-[var(--border)] py-14 sm:py-20"
        >
          <div className="container-content max-w-2xl mx-auto text-center">
            {/* Breadcrumb */}
            <nav aria-label="Breadcrumb" className="mb-4">
              <ol className="flex items-center justify-center gap-1 text-xs text-[var(--fg-subtle)] list-none p-0 m-0">
                <li>
                  <Link
                    href="/support"
                    className="hover:text-[var(--accent)] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--ring)] rounded-sm"
                  >
                    Support
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li aria-current="page" className="text-[var(--fg-muted)] font-medium">
                  FAQ
                </li>
              </ol>
            </nav>

            <h1
              id="faq-heading"
              className="mb-3 font-display text-3xl font-semibold text-[var(--fg)] sm:text-4xl"
            >
              Frequently Asked Questions
            </h1>
            <p className="text-base leading-relaxed text-[var(--fg-muted)]">
              Browse answers to common questions about solar, pricing, and our products.
              Can&apos;t find what you need?{' '}
              <Link
                href="/contact"
                className="font-medium text-[var(--accent)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] rounded-sm"
              >
                Contact us
              </Link>
              .
            </p>
          </div>
        </section>

        {/* ── FAQ accordion (client island) ────────────────────────────── */}
        <section
          aria-label="FAQ list"
          className="container-content max-w-3xl mx-auto py-12 sm:py-16"
        >
          <FAQAccordion categories={FAQ_CATEGORIES} />
        </section>

        {/* ── Bottom CTA ───────────────────────────────────────────────── */}
        <section
          aria-label="Contact support"
          className="border-t border-[var(--border)] bg-[var(--bg-subtle)] py-12"
        >
          <div className="container-content text-center max-w-xl mx-auto">
            <h2 className="mb-3 font-display text-xl font-semibold text-[var(--fg)]">
              Didn&apos;t find your answer?
            </h2>
            <p className="mb-6 text-sm text-[var(--fg-muted)]">
              Our support team is available Monday to Friday, 9 AM–6 PM IST and will
              respond within one business day.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center h-11 px-6 rounded-md text-sm font-semibold bg-[var(--btn-primary-bg)] text-[var(--btn-primary-fg)] hover:bg-[var(--btn-primary-hover)] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]"
            >
              Contact Support
            </Link>
          </div>
        </section>

      </main>
    </>
  );
}
