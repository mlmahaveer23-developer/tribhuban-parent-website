import type { Metadata } from 'next';
import Link from 'next/link';
import { BUSINESSES, businessHref, productHref, SITE_URL } from '@/lib/siteConfig';

export const revalidate = 21600;

export const metadata: Metadata = {
  title: 'Our Businesses — Tribhuban Concepts',
  description:
    'Explore all Tribhuban Concepts business verticals — Rooftop Solar, FMCG Distribution, HRDS, Pink Moon Vision, and Entrepreneur Funding.',
  alternates: { canonical: `${SITE_URL}/businesses` },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Tribhuban Concepts Business Verticals',
  itemListElement: BUSINESSES.map((b, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: b.title,
    url: `${SITE_URL}${businessHref(b.slug)}`,
  })),
};

export default function BusinessesPage() {
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
                <li><span aria-hidden="true" className="mx-1">/</span><span aria-current="page" className="text-[var(--fg-muted)]">Businesses</span></li>
              </ol>
            </nav>
            <div className="max-w-2xl">
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[var(--accent)]">Our Verticals</p>
              <h1 className="mb-4 font-display text-3xl font-semibold text-[var(--fg)] sm:text-4xl">
                Our Businesses
              </h1>
              <p className="text-base leading-relaxed text-[var(--fg-muted)]">
                Tribhuban Concepts operates across five business verticals — each solving a distinct challenge
                with engineering precision and long-term vision.
              </p>
            </div>
          </div>
        </section>

        {/* Business cards */}
        <section className="container-content py-16 sm:py-20">
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 list-none p-0 m-0">
            {BUSINESSES.map((b) => (
              <li key={b.slug} className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-7 flex flex-col gap-5 hover:border-[var(--accent)]/40 hover:shadow-[var(--shadow-md)] transition-all duration-300 group">
                <span className="text-4xl" aria-hidden="true">{b.icon}</span>
                <div>
                  <h2 className="font-display text-xl font-semibold text-[var(--fg)] mb-1">{b.title}</h2>
                  <p className="text-sm text-[var(--fg-muted)] leading-relaxed">{b.description}</p>
                </div>
                {b.products.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-[var(--fg-subtle)] mb-2">Products</p>
                    <ul className="space-y-1 list-none p-0 m-0">
                      {b.products.map((p) => (
                        <li key={p.slug}>
                          <Link
                            href={productHref(b.slug, p.slug)}
                            className="text-sm text-[var(--fg-muted)] hover:text-[var(--accent)] transition-colors"
                          >
                            {p.icon} {p.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="mt-auto">
                  <Link
                    href={businessHref(b.slug)}
                    className="inline-flex items-center text-sm font-semibold text-[var(--accent)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] rounded-sm"
                  >
                    Learn more →
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </>
  );
}
