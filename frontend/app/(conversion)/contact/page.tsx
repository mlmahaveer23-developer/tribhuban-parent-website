/**
 * /contact — static shell page for contact enquiries.
 *
 * Server Component — mounts ContactForm as a client island.
 * Two-column layout on lg: form left, direct channels right.
 *
 * Requirements: 8.1, 8.2, 8.3
 */

import type { Metadata } from 'next';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';

import { ContactForm } from '@/components/forms/ContactForm';

// ── Metadata ──────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: 'Contact Us — Tribhuban Concepts',
  description:
    'Get in touch with Tribhuban Concepts. Reach us for solar enquiries, product interest, careers, support, or any other question.',
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Contact Us — Tribhuban Concepts',
    description:
      'Get in touch with Tribhuban Concepts for solar enquiries, product interest, careers, or support.',
    type: 'website',
  },
};

// ── Direct channels ───────────────────────────────────────────────────────────

const CHANNELS = [
  {
    icon: Mail,
    label: 'Email',
    value: 'hello@tribhubanconcepts.com',
    href: 'mailto:hello@tribhubanconcepts.com',
  },
  {
    icon: Phone,
    label: 'Phone',
    value: '+91 [placeholder]',
    href: 'tel:+91',
  },
  {
    icon: MapPin,
    label: 'Location',
    value: 'India',
    href: undefined,
  },
  {
    icon: Clock,
    label: 'Office Hours',
    value: 'Mon–Fri, 9 AM – 6 PM IST',
    href: undefined,
  },
] as const;

// ── Page ─────────────────────────────────────────────────────────────────────

export default function ContactPage() {
  return (
    <main className="bg-page min-h-screen">
      {/* ── Hero section ───────────────────────────────────────────────── */}
      <section
        aria-labelledby="contact-heading"
        className="bg-subtle border-b border-default py-14 sm:py-20"
      >
        <div className="container-content">
          <div className="max-w-2xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-accent">
              We&apos;d Love to Hear from You
            </p>
            <h1
              id="contact-heading"
              className="mb-4 font-display text-3xl font-semibold text-page sm:text-4xl"
            >
              Contact Us
            </h1>
            <p className="text-base leading-relaxed text-muted">
              Have a question about solar, our products, or just want to say
              hello? Fill out the form and we will get back to you within{' '}
              <strong className="font-medium text-page">1 business day</strong>.
            </p>
          </div>
        </div>
      </section>

      {/* ── Main content: form + direct channels ───────────────────────── */}
      <section className="container-content py-12 sm:py-16">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:gap-16 xl:gap-24">
          {/* ── Left: contact form island ──────────────────────────────── */}
          <div>
            <div className="rounded-2xl border border-default bg-surface p-6 shadow-[var(--shadow-md)] sm:p-8">
              <h2 className="mb-6 font-display text-xl font-semibold text-page">
                Send Us a Message
              </h2>
              {/* Client island */}
              <ContactForm />
            </div>
          </div>

          {/* ── Right: direct channels ─────────────────────────────────── */}
          <aside
            aria-label="Direct contact channels"
            className="flex flex-col gap-8 lg:pt-4"
          >
            <div>
              <h2 className="mb-3 font-display text-xl font-semibold text-page">
                Direct Channels
              </h2>
              <p className="text-sm leading-relaxed text-muted">
                Prefer to reach us directly? Use any of the channels below.
              </p>
            </div>

            {/* Channel cards */}
            <ul className="flex flex-col gap-4" role="list">
              {CHANNELS.map(({ icon: Icon, label, value, href }) => (
                <li
                  key={label}
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
                    <p className="mb-0.5 text-xs font-semibold uppercase tracking-wide text-[var(--fg-subtle)]">
                      {label}
                    </p>
                    {href ? (
                      <a
                        href={href}
                        className="text-sm font-medium text-[var(--accent)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                      >
                        {value}
                      </a>
                    ) : (
                      <p className="text-sm font-medium text-page">{value}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>

            {/* Privacy reassurance */}
            <div className="rounded-xl border border-[var(--border)] bg-[var(--accent-light)] px-5 py-4">
              <p className="text-sm text-[var(--accent)]">
                <strong>🔒 Privacy promise:</strong> Your contact details are
                only used to respond to your enquiry and are never shared
                without your consent.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
