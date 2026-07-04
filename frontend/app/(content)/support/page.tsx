/**
 * /support — Support hub page.
 *
 * ISR 1 hour. No backend dependency — fully static.
 * Sections: search, help categories, popular articles, contact channels.
 *
 * Requirements: 14.1
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { Search, Mail, Phone, MessageCircle } from 'lucide-react';

// ── ISR ───────────────────────────────────────────────────────────────────────

export const revalidate = 3600; // 1 hour

// ── Metadata ──────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: 'Support — Tribhuban Concepts',
  description:
    'Get help with Tribhuban Concepts solar systems, products, billing, and more. Browse categories, popular articles, or contact our team.',
  alternates: { canonical: 'https://tribhubanconcepts.com/support' },
  openGraph: {
    title: 'Support — Tribhuban Concepts',
    description:
      'Browse support resources and contact us for solar systems, products, billing, and more.',
    type: 'website',
  },
};

// ── Static data ───────────────────────────────────────────────────────────────

const HELP_CATEGORIES = [
  {
    icon: '☀️',
    title: 'Solar Systems',
    description: 'Installation, maintenance, monitoring, and troubleshooting for your solar system.',
    href: '/support/faq#solar-basics',
  },
  {
    icon: '📦',
    title: 'Products & Software',
    description: 'Questions about our hardware products, firmware updates, and software tools.',
    href: '/support/faq#technical',
  },
  {
    icon: '💳',
    title: 'Billing & Payments',
    description: 'Invoices, payment methods, subsidy claims, and account-related queries.',
    href: '/support/faq#pricing-finance',
  },
  {
    icon: '💬',
    title: 'Other',
    description: 'General inquiries, partnerships, media, and anything else on your mind.',
    href: '/contact',
  },
] as const;

const POPULAR_ARTICLES = [
  {
    title: 'How to read your solar generation report',
    href: '/blog',
    category: 'Solar Systems',
  },
  {
    title: 'What is net metering and how do I claim it?',
    href: '/blog',
    category: 'Solar Systems',
  },
  {
    title: 'Understanding your first invoice after installation',
    href: '/blog',
    category: 'Billing & Payments',
  },
  {
    title: 'Why has my system generation dropped this month?',
    href: '/blog',
    category: 'Solar Systems',
  },
  {
    title: 'Warranty coverage: what is and is not included',
    href: '/blog',
    category: 'Products & Software',
  },
] as const;

const CONTACT_CHANNELS = [
  {
    icon: Mail,
    label: 'Email Support',
    description: 'We respond within 1 business day.',
    action: 'support@tribhubanconcepts.com',
    href: 'mailto:support@tribhubanconcepts.com',
  },
  {
    icon: Phone,
    label: 'Phone Support',
    description: 'Mon–Fri, 9 AM – 6 PM IST.',
    action: '+91 [placeholder]',
    href: 'tel:+91',
  },
  {
    icon: MessageCircle,
    label: 'Contact Form',
    description: 'Use our contact form for detailed enquiries.',
    action: 'Open contact form',
    href: '/contact',
  },
] as const;

// ── Page ──────────────────────────────────────────────────────────────────────

export default function SupportPage() {
  return (
    <main id="main-content" className="bg-page">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section
        aria-labelledby="support-heading"
        className="bg-[var(--bg-subtle)] border-b border-[var(--border)] py-14 sm:py-20"
      >
        <div className="container-content text-center max-w-2xl mx-auto">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[var(--accent)]">
            Help Centre
          </p>
          <h1
            id="support-heading"
            className="mb-4 font-display text-3xl font-semibold text-[var(--fg)] sm:text-4xl"
          >
            How can we help?
          </h1>
          <p className="mb-8 text-base leading-relaxed text-[var(--fg-muted)]">
            Browse our support resources or contact us directly. We&apos;re here to help
            you get the most from your Tribhuban Concepts solar system.
          </p>

          {/* Search box — links to /search?q= */}
          <form
            role="search"
            aria-label="Support search"
            action="/search"
            method="GET"
            className="relative max-w-lg mx-auto"
          >
            <label htmlFor="support-search" className="sr-only">
              Search support articles
            </label>
            <div
              className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4"
              aria-hidden="true"
            >
              <Search className="h-5 w-5 text-[var(--fg-subtle)]" />
            </div>
            <input
              id="support-search"
              name="q"
              type="search"
              placeholder="Search support articles…"
              className="block w-full rounded-xl border border-[var(--border-input)] bg-[var(--surface)] py-3.5 pl-11 pr-4 text-sm text-[var(--fg)] placeholder:text-[var(--fg-subtle)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] transition-colors duration-150"
            />
          </form>
        </div>
      </section>

      {/* ── Help categories ──────────────────────────────────────────────── */}
      <section
        aria-labelledby="categories-heading"
        className="container-content py-14 sm:py-16"
      >
        <h2
          id="categories-heading"
          className="mb-8 text-center font-display text-2xl font-semibold text-[var(--fg)]"
        >
          Browse by Category
        </h2>
        <ul
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 list-none p-0 m-0"
          role="list"
        >
          {HELP_CATEGORIES.map((cat) => (
            <li key={cat.title}>
              <Link
                href={cat.href}
                className="group flex h-full flex-col rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 transition-shadow duration-200 hover:shadow-[var(--shadow-md)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
              >
                <span aria-hidden="true" className="mb-3 block text-3xl">
                  {cat.icon}
                </span>
                <h3 className="mb-2 font-display text-base font-semibold text-[var(--fg)] group-hover:text-[var(--accent)] transition-colors duration-150">
                  {cat.title}
                </h3>
                <p className="text-sm leading-relaxed text-[var(--fg-muted)]">
                  {cat.description}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* ── Popular articles ─────────────────────────────────────────────── */}
      <section
        aria-labelledby="popular-heading"
        className="border-t border-[var(--border)] bg-[var(--bg-subtle)] py-14 sm:py-16"
      >
        <div className="container-content max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2
              id="popular-heading"
              className="font-display text-2xl font-semibold text-[var(--fg)]"
            >
              Popular Articles
            </h2>
            <Link
              href="/blog"
              className="text-sm font-semibold text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] rounded-sm"
            >
              View all →
            </Link>
          </div>
          <ul className="divide-y divide-[var(--border)] rounded-xl border border-[var(--border)] overflow-hidden list-none p-0 m-0" role="list">
            {POPULAR_ARTICLES.map((article) => (
              <li key={article.title}>
                <Link
                  href={article.href}
                  className="flex items-center justify-between gap-4 bg-[var(--surface)] px-5 py-4 text-sm hover:bg-[var(--bg-subtle)] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-inset focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                >
                  <span className="font-medium text-[var(--fg)]">
                    {article.title}
                  </span>
                  <span className="shrink-0 text-xs text-[var(--fg-subtle)]">
                    {article.category}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Contact channels ─────────────────────────────────────────────── */}
      <section
        aria-labelledby="contact-heading"
        className="container-content py-14 sm:py-16"
      >
        <h2
          id="contact-heading"
          className="mb-8 text-center font-display text-2xl font-semibold text-[var(--fg)]"
        >
          Still Need Help?
        </h2>
        <ul
          className="grid grid-cols-1 gap-4 sm:grid-cols-3 max-w-3xl mx-auto list-none p-0 m-0"
          role="list"
        >
          {CONTACT_CHANNELS.map(({ icon: Icon, label, description, action, href }) => (
            <li
              key={label}
              className="flex flex-col rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 text-center"
            >
              <div
                className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--accent-light)]"
                aria-hidden="true"
              >
                <Icon className="h-6 w-6 text-[var(--accent)]" strokeWidth={1.75} />
              </div>
              <h3 className="mb-1 font-display text-sm font-semibold text-[var(--fg)]">
                {label}
              </h3>
              <p className="mb-4 text-xs text-[var(--fg-muted)]">{description}</p>
              <a
                href={href}
                className="mt-auto text-sm font-semibold text-[var(--accent)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] rounded-sm"
              >
                {action}
              </a>
            </li>
          ))}
        </ul>
      </section>

    </main>
  );
}
