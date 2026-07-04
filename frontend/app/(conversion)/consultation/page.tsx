/**
 * /consultation — static shell page for consultation booking.
 *
 * Server Component — mounts ConsultationForm as a client island.
 * Design: copper/gold/ivory, two-col layout on lg (form left, trust right).
 *
 * Requirements: 7.2, 7.9, 24.4
 */

import type { Metadata } from 'next';
import { Shield, Users, Zap } from 'lucide-react';

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
    </main>
  );
}
