import type { Metadata } from 'next';
import Link from 'next/link';
import { RESOURCES, resourceHref, SITE_URL } from '@/lib/siteConfig';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Resources — Tribhuban Concepts',
  description:
    'The central knowledge hub for Tribhuban Concepts. Browse blogs, guides, documentation, FAQs, and downloads.',
  alternates: { canonical: `${SITE_URL}/resources` },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Resources — Tribhuban Concepts',
  description: 'Central knowledge hub with blogs, guides, docs, FAQs, and downloads.',
  url: `${SITE_URL}/resources`,
  hasPart: RESOURCES.map((r) => ({
    '@type': 'WebPage',
    name: r.title,
    url: `${SITE_URL}${resourceHref(r.slug)}`,
  })),
};

export default function ResourcesPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main id="main-content">
        {/* Hero */}
        <section className="bg-[var(--bg-subtle)] border-b border-[var(--border)] py-14 sm:py-20">
          <div className="container-content">
            <nav aria-label="Breadcrumb" className="mb-6">
              <ol className="flex items-center gap-1 text-sm text-[var(--fg-subtle)] list-none p-0 m-0">
                <li><Link href="/" className="hover:text-[var(--accent)] transition-colors">Home</Link></li>
                <li><span aria-hidden="true" className="mx-1">/</span>
                  <span aria-current="page" className="text-[var(--fg-muted)]">Resources</span>
                </li>
              </ol>
            </nav>
            <div className="max-w-2xl">
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[var(--accent)]">Knowledge Hub</p>
              <h1 className="mb-4 font-display text-3xl font-semibold text-[var(--fg)] sm:text-4xl">Resources</h1>
              <p className="text-base leading-relaxed text-[var(--fg-muted)]">
                Everything you need to research, decide, and act — all in one place.
              </p>
            </div>
          </div>
        </section>

        {/* Resource category cards */}
        <section className="container-content py-16 sm:py-20">
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 list-none p-0 m-0">
            {RESOURCES.map((r) => (
              <li key={r.slug} className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-7 flex flex-col gap-4 hover:border-[var(--accent)]/40 hover:shadow-[var(--shadow-md)] transition-all duration-300">
                <span className="text-4xl" aria-hidden="true">{r.icon}</span>
                <div>
                  <h2 className="font-display text-xl font-semibold text-[var(--fg)] mb-1">{r.title}</h2>
                  <p className="text-sm text-[var(--fg-muted)] leading-relaxed">{r.description}</p>
                </div>
                <Link
                  href={resourceHref(r.slug)}
                  className="mt-auto inline-flex items-center text-sm font-semibold text-[var(--accent)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] rounded-sm"
                >
                  Browse {r.title} →
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </>
  );
}
