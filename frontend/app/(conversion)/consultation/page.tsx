/**
 * /consultation — static shell page for consultation booking.
 *
 * Server Component — mounts ConsultationForm as a client island.
 * Design: copper/gold/ivory, two-col layout on lg (form left, trust right).
 * 
 * Updated with navigation section links to provide context and guide users
 * through different consultation pathways based on their interests across
 * Company, Solutions, Resources, and Legal sections.
 *
 * Requirements: 7.2, 7.9, 24.4
 */

import type { Metadata } from 'next';
import { Shield, Users, Zap, ArrowRight } from 'lucide-react';
import Link from 'next/link';

import { ConsultationForm } from '@/components/forms/ConsultationForm';

// ── Metadata ──────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: 'Book a Consultation — Tribhuban Concepts',
  description:
    'Schedule a free consultation with our expert engineers. We respond within 1 business day.',
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Book a Consultation — Tribhuban Concepts',
    description:
      'Schedule a free consultation with our expert engineers. We respond within 1 business day.',
    type: 'website',
  },
};

// ── Trust signals ─────────────────────────────────────────────────────────────

const TRUST_SIGNALS = [
  {
    icon: Shield,
    title: 'Free Consultation',
    body: 'No fees, no obligation. We are here to help you explore what solar and technology can do for you.',
  },
  {
    icon: Users,
    title: 'Expert Engineers',
    body: 'You will speak directly with our experienced engineers — not a sales team.',
  },
  {
    icon: Zap,
    title: 'No Obligation',
    body: 'A consultation is just a conversation. There is no pressure to commit to anything.',
  },
] as const;

// ── Page ─────────────────────────────────────────────────────────────────────

export default function ConsultationPage() {
  return (
    <main className="bg-page min-h-screen">
      {/* ── Hero section ───────────────────────────────────────────────── */}
      <section
        aria-labelledby="consultation-heading"
        className="bg-subtle border-b border-default py-14 sm:py-20"
      >
        <div className="container-content">
          <div className="max-w-2xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-accent">
              Free &amp; No Obligation
            </p>
            <h1
              id="consultation-heading"
              className="mb-4 font-display text-3xl font-semibold text-page sm:text-4xl"
            >
              Book a Consultation
            </h1>
            <p className="text-base leading-relaxed text-muted">
              Tell us about your solar, technology, or career interest and we
              will connect you with the right expert.{' '}
              <strong className="font-medium text-page">
                We respond within 1 business day.
              </strong>{' '}
              Your information is kept private and never shared without your
              consent.
            </p>
          </div>
        </div>
      </section>

      {/* ── Main content: form + trust signals ─────────────────────────── */}
      <section className="container-content py-12 sm:py-16">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:gap-16 xl:gap-24">
          {/* ── Left: consultation form island ─────────────────────────── */}
          <div>
            <div
              className="rounded-2xl border border-default bg-surface p-6 shadow-[var(--shadow-md)] sm:p-8"
            >
              <h2 className="mb-6 font-display text-xl font-semibold text-page">
                Your Details
              </h2>
              {/* Client island */}
              <ConsultationForm />
            </div>
          </div>

          {/* ── Right: trust signals ────────────────────────────────────── */}
          <aside aria-label="Why book with us" className="flex flex-col gap-6 lg:pt-4">
            <div>
              <h2 className="mb-4 font-display text-xl font-semibold text-page">
                What to Expect
              </h2>
              <p className="text-sm leading-relaxed text-muted">
                Our consultations are a relaxed conversation with no pressure to
                buy. We will listen to your needs, answer your questions, and
                outline how we can help.
              </p>
            </div>

            {/* Trust callout cards */}
            <ul className="flex flex-col gap-4" role="list">
              {TRUST_SIGNALS.map(({ icon: Icon, title, body }) => (
                <li
                  key={title}
                  className="flex gap-4 rounded-xl border border-default bg-subtle p-4"
                >
                  <div
                    className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--accent-light)]"
                    aria-hidden="true"
                  >
                    <Icon
                      className="h-5 w-5 text-accent"
                      strokeWidth={1.75}
                    />
                  </div>
                  <div>
                    <p className="mb-1 text-sm font-semibold text-page">{title}</p>
                    <p className="text-xs leading-relaxed text-muted">{body}</p>
                  </div>
                </li>
              ))}
            </ul>

            {/* Privacy & SLA reassurance */}
            <div className="rounded-xl border border-[var(--border)] bg-[var(--accent-light)] px-5 py-4">
              <p className="text-sm text-[var(--accent)]">
                <strong>🔒 Privacy promise:</strong> Your contact details are
                only used to respond to your enquiry. We respond within{' '}
                <strong>1 business day</strong>.
              </p>
            </div>
          </aside>
        </div>
      </section>

      {/* ── Navigation Sections: Relevant Links ────────────────────────── */}
      <section aria-labelledby="nav-sections-heading" className="container-content py-16 sm:py-20 border-t border-default">
        <h2 id="nav-sections-heading" className="mb-12 font-display text-2xl font-semibold text-page text-center">
          Explore Our Offerings
        </h2>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">

          {/* Column 1 — Company */}
          <div className="rounded-2xl border border-default bg-surface p-6 sm:p-8">
            <h3 className="mb-4 font-display text-lg font-semibold text-page uppercase tracking-wider">
              Company
            </h3>
            <ul className="space-y-3 list-none p-0 m-0">
              <li>
                <Link
                  href="/about"
                  className="group inline-flex items-center text-sm font-medium text-accent hover:text-[var(--accent-hover)] transition-colors"
                >
                  About
                  <ArrowRight className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
                </Link>
              </li>
              <li>
                <Link
                  href="/careers"
                  className="group inline-flex items-center text-sm font-medium text-accent hover:text-[var(--accent-hover)] transition-colors"
                >
                  Careers
                  <ArrowRight className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="group inline-flex items-center text-sm font-medium text-accent hover:text-[var(--accent-hover)] transition-colors"
                >
                  Contact
                  <ArrowRight className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2 — Solutions */}
          <div className="rounded-2xl border border-default bg-surface p-6 sm:p-8">
            <h3 className="mb-4 font-display text-lg font-semibold text-page uppercase tracking-wider">
              Solutions
            </h3>
            <ul className="space-y-3 list-none p-0 m-0">
              <li>
                <Link
                  href="/solar"
                  className="group inline-flex items-center text-sm font-medium text-accent hover:text-[var(--accent-hover)] transition-colors"
                >
                  Solar
                  <ArrowRight className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
                </Link>
              </li>
              <li>
                <Link
                  href="/products"
                  className="group inline-flex items-center text-sm font-medium text-accent hover:text-[var(--accent-hover)] transition-colors"
                >
                  Products
                  <ArrowRight className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
                </Link>
              </li>
              <li>
                <Link
                  href="/future-technologies"
                  className="group inline-flex items-center text-sm font-medium text-accent hover:text-[var(--accent-hover)] transition-colors"
                >
                  Future Tech
                  <ArrowRight className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
                </Link>
              </li>
              <li>
                <Link
                  href="/solar/calculator"
                  className="group inline-flex items-center text-sm font-medium text-accent hover:text-[var(--accent-hover)] transition-colors"
                >
                  Calculator
                  <ArrowRight className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3 — Resources */}
          <div className="rounded-2xl border border-default bg-surface p-6 sm:p-8">
            <h3 className="mb-4 font-display text-lg font-semibold text-page uppercase tracking-wider">
              Resources
            </h3>
            <ul className="space-y-3 list-none p-0 m-0">
              <li>
                <Link
                  href="/blog"
                  className="group inline-flex items-center text-sm font-medium text-accent hover:text-[var(--accent-hover)] transition-colors"
                >
                  Blog
                  <ArrowRight className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
                </Link>
              </li>
              <li>
                <Link
                  href="/knowledge"
                  className="group inline-flex items-center text-sm font-medium text-accent hover:text-[var(--accent-hover)] transition-colors"
                >
                  Knowledge
                  <ArrowRight className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
                </Link>
              </li>
              <li>
                <Link
                  href="/support"
                  className="group inline-flex items-center text-sm font-medium text-accent hover:text-[var(--accent-hover)] transition-colors"
                >
                  Support
                  <ArrowRight className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
                </Link>
              </li>
              <li>
                <Link
                  href="/support/faq"
                  className="group inline-flex items-center text-sm font-medium text-accent hover:text-[var(--accent-hover)] transition-colors"
                >
                  FAQ
                  <ArrowRight className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4 — Legal */}
          <div className="rounded-2xl border border-default bg-surface p-6 sm:p-8">
            <h3 className="mb-4 font-display text-lg font-semibold text-page uppercase tracking-wider">
              Legal &amp; Info
            </h3>
            <ul className="space-y-3 list-none p-0 m-0">
              <li>
                <Link
                  href="/legal/privacy"
                  className="group inline-flex items-center text-sm font-medium text-accent hover:text-[var(--accent-hover)] transition-colors"
                >
                  Privacy
                  <ArrowRight className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
                </Link>
              </li>
              <li>
                <Link
                  href="/legal/terms"
                  className="group inline-flex items-center text-sm font-medium text-accent hover:text-[var(--accent-hover)] transition-colors"
                >
                  Terms
                  <ArrowRight className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
                </Link>
              </li>
              <li>
                <Link
                  href="/legal/cookies"
                  className="group inline-flex items-center text-sm font-medium text-accent hover:text-[var(--accent-hover)] transition-colors"
                >
                  Cookies
                  <ArrowRight className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
