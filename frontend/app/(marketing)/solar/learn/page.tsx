import type { Metadata } from 'next';
import Link from 'next/link';

// ── SSG + ISR — revalidate every 1 hour (Req 3.1, 4.2) ───────────────────────
export const revalidate = 3600;

// ── Metadata ──────────────────────────────────────────────────────────────────

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Solar Learning Hub — Tribhuban Concepts',
    description:
      'In-depth articles on solar energy — Basics, Economics, Technology, and Maintenance. Written by engineers for homeowners and businesses.',
    alternates: { canonical: 'https://tribhubanconcepts.com/solar/learn' },
    openGraph: {
      type: 'website',
      url: 'https://tribhubanconcepts.com/solar/learn',
      title: 'Solar Learning Hub — Tribhuban Concepts',
      description:
        'In-depth articles on solar energy — Basics, Economics, Technology, and Maintenance.',
      siteName: 'Tribhuban Concepts',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Solar Learning Hub — Tribhuban Concepts',
      description:
        'In-depth articles on solar energy — Basics, Economics, Technology, and Maintenance.',
    },
  };
}

// ── Static content ────────────────────────────────────────────────────────────

/**
 * Placeholder topic cards grouped by theme (Req 4.2, 4.5).
 * When no real topics exist, editorial placeholders are shown instead of an empty list.
 */
const topicGroups = [
  {
    theme: 'Basics',
    description: 'Understand how solar works before you decide.',
    icon: '☀️',
    topics: [
      {
        slug: 'how-rooftop-solar-works',
        title: 'How Rooftop Solar Works',
        excerpt:
          'A jargon-free walkthrough of the photovoltaic effect, inverters, net metering, and what happens on a cloudy day.',
        readTime: '5 min',
      },
    ],
  },
  {
    theme: 'Economics',
    description: 'The numbers behind the decision.',
    icon: '💰',
    topics: [
      {
        slug: 'solar-payback-period-explained',
        title: 'Solar Payback Period Explained',
        excerpt:
          'How to calculate your payback period, what factors move it, and why 4–7 years is typical for Indian residential installations.',
        readTime: '6 min',
      },
    ],
  },
  {
    theme: 'Technology',
    description: 'Panels, inverters, and storage — the engineering.',
    icon: '🔬',
    topics: [
      {
        slug: 'monocrystalline-vs-polycrystalline-panels',
        title: 'Monocrystalline vs Polycrystalline Panels',
        excerpt:
          'A practical comparison of the two dominant panel technologies: efficiency, cost, longevity, and which suits Indian rooftops.',
        readTime: '7 min',
      },
    ],
  },
  {
    theme: 'Maintenance',
    description: 'Keep your system performing at its best.',
    icon: '🔧',
    topics: [
      {
        slug: 'how-to-clean-solar-panels',
        title: 'How to Clean Solar Panels',
        excerpt:
          'Dust reduces output by up to 30% in Indian conditions. Here is the safe, effective cleaning routine that protects your warranty.',
        readTime: '4 min',
      },
    ],
  },
] as const;

// ── Shared link style ─────────────────────────────────────────────────────────

const accentLink =
  'inline-flex items-center gap-1 text-sm font-semibold text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] rounded-sm';

// ── Page ──────────────────────────────────────────────────────────────────────

export default function SolarLearnPage() {
  return (
    <main id="main-content">

      {/* ── Hero / Hub intro ─────────────────────────────────────────────── */}
      {/* Req 4.2: Hub intro */}
      <section
        aria-label="Solar Learning Hub introduction"
        className="bg-[var(--bg)] py-16 md:py-24"
      >
        <div className="container-content">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex flex-wrap items-center gap-1 text-sm text-[var(--fg-subtle)]" role="list">
              <li className="flex items-center gap-1">
                <Link
                  href="/"
                  className="hover:text-[var(--accent)] transition-colors focus-visible:outline-none focus-visible:rounded focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                >
                  Home
                </Link>
              </li>
              <li className="flex items-center gap-1">
                <span aria-hidden="true" className="select-none">/</span>
                <Link
                  href="/solar"
                  className="hover:text-[var(--accent)] transition-colors focus-visible:outline-none focus-visible:rounded focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                >
                  Solar
                </Link>
              </li>
              <li className="flex items-center gap-1">
                <span aria-hidden="true" className="select-none">/</span>
                <span aria-current="page" className="font-medium text-[var(--fg-muted)]">
                  Learning Hub
                </span>
              </li>
            </ol>
          </nav>

          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-[var(--accent)] mb-4">
              Solar Learning Hub
            </p>
            <h1 className="font-display text-5xl sm:text-6xl font-semibold text-[var(--fg)] mb-6 leading-tight">
              Everything You Need to Know About Solar
            </h1>
            <p className="text-xl text-[var(--fg-muted)] leading-relaxed">
              Whether you are researching solar for the first time or comparing system
              options, our Learning Hub has you covered. Topics are written by engineers,
              for decision-makers — practical, honest, and jargon-free.
            </p>
          </div>
        </div>
      </section>

      {/* ── Topic Grid — grouped by theme ────────────────────────────────── */}
      {/*
        Req 4.2: Topic grid grouped by theme.
        Req 4.5: Editorial placeholder when no real topics are published.
        These are editorial placeholder topics that reflect real forthcoming content.
      */}
      <section
        aria-labelledby="topics-heading"
        className="bg-[var(--bg-subtle)] border-y border-[var(--border)] py-16 md:py-24"
      >
        <div className="container-content">
          <h2
            id="topics-heading"
            className="font-display text-3xl sm:text-4xl font-semibold text-[var(--fg)] mb-4"
          >
            Browse by Theme
          </h2>
          <p className="text-lg text-[var(--fg-muted)] mb-12 max-w-2xl">
            Topics are organised into four themes. Start anywhere — each article stands alone.
          </p>

          {/* Editorial placeholder notice (Req 4.5) */}
          <div
            role="status"
            aria-live="polite"
            className="mb-10 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-6 py-5 text-sm text-[var(--fg-muted)]"
          >
            <strong className="text-[var(--fg)]">Coming soon:</strong> Our full library of solar
            education articles is currently being authored by our engineering team. The topics below
            are a preview of what is on the way. Check back soon, or{' '}
            <Link href="/newsletter" className="text-[var(--accent)] hover:text-[var(--accent-hover)] font-medium">
              subscribe to our newsletter
            </Link>{' '}
            to be notified when new content is published.
          </div>

          <div className="space-y-16">
            {topicGroups.map((group) => (
              <div key={group.theme}>
                {/* Theme header */}
                <div className="flex items-center gap-3 mb-6">
                  <span aria-hidden="true" className="text-2xl">{group.icon}</span>
                  <div>
                    <h3 className="font-display text-2xl font-semibold text-[var(--fg)]">
                      {group.theme}
                    </h3>
                    <p className="text-sm text-[var(--fg-muted)]">{group.description}</p>
                  </div>
                </div>

                {/* Topic cards */}
                <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 list-none p-0 m-0" role="list">
                  {group.topics.map((topic) => (
                    <li
                      key={topic.slug}
                      className="rounded-xl bg-[var(--bg)] border border-[var(--border)] p-6 flex flex-col gap-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="inline-block text-xs font-semibold uppercase tracking-wider text-[var(--accent)]">
                          {group.theme}
                        </span>
                        <span className="text-xs text-[var(--fg-subtle)]">{topic.readTime} read</span>
                      </div>
                      <h4 className="font-display text-lg font-semibold text-[var(--fg)] leading-snug">
                        {topic.title}
                      </h4>
                      <p className="text-sm text-[var(--fg-muted)] leading-relaxed flex-1">
                        {topic.excerpt}
                      </p>
                      <Link
                        href={`/solar/learn/${topic.slug}`}
                        className={accentLink}
                      >
                        Read article →
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Topic CTA ───────────────────────────────────────────── */}
      <section
        aria-labelledby="featured-topic-heading"
        className="bg-[var(--bg)] py-16 md:py-24"
      >
        <div className="container-content max-w-3xl mx-auto text-center">
          <h2
            id="featured-topic-heading"
            className="font-display text-3xl sm:text-4xl font-semibold text-[var(--fg)] mb-4"
          >
            Start Here: How Rooftop Solar Works
          </h2>
          <p className="text-lg text-[var(--fg-muted)] mb-8 leading-relaxed">
            New to solar? Our most-read article explains the whole system in plain language —
            from panel to grid, including what happens when the sun goes down.
          </p>
          <Link
            href="/solar/learn/how-rooftop-solar-works"
            className="inline-flex items-center justify-center h-12 px-8 rounded-md text-base font-semibold bg-[var(--btn-primary-bg)] text-[var(--btn-primary-fg)] hover:bg-[var(--btn-primary-hover)] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]"
          >
            Read the Article
          </Link>
        </div>
      </section>

      {/* ── Links to Calculator & Consultation ───────────────────────────── */}
      <section
        aria-labelledby="hub-cta-heading"
        className="bg-[var(--bg-subtle)] border-t border-[var(--border)] py-16 md:py-24"
      >
        <div className="container-content">
          <h2
            id="hub-cta-heading"
            className="font-display text-2xl sm:text-3xl font-semibold text-[var(--fg)] mb-8 text-center"
          >
            Ready to Take the Next Step?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            <div className="rounded-xl bg-[var(--bg)] border border-[var(--border)] p-6 flex flex-col gap-3">
              <span aria-hidden="true" className="text-3xl">🔢</span>
              <h3 className="font-display text-xl font-semibold text-[var(--fg)]">
                Run the Calculator
              </h3>
              <p className="text-sm text-[var(--fg-muted)] leading-relaxed flex-1">
                Get an instant estimate for your system size, annual savings, and payback period.
              </p>
              <Link href="/solar/calculator" className={accentLink}>
                Calculate My Savings →
              </Link>
            </div>
            <div className="rounded-xl bg-[var(--bg)] border border-[var(--border)] p-6 flex flex-col gap-3">
              <span aria-hidden="true" className="text-3xl">📞</span>
              <h3 className="font-display text-xl font-semibold text-[var(--fg)]">
                Book a Consultation
              </h3>
              <p className="text-sm text-[var(--fg-muted)] leading-relaxed flex-1">
                Speak with our engineers for a site-specific assessment and no-obligation proposal.
              </p>
              <Link href="/consultation" className={accentLink}>
                Book Free Consultation →
              </Link>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}
