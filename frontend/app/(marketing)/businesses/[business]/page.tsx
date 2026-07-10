import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { BUSINESSES, businessHref, productHref, SITE_URL } from '@/lib/siteConfig';

export const revalidate = 21600;

interface Props {
  params: Promise<{ business: string }>;
}

export async function generateStaticParams() {
  return BUSINESSES.map((b) => ({ business: b.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { business: slug } = await params;
  const biz = BUSINESSES.find((b) => b.slug === slug);
  if (!biz) return {};
  return {
    title: `${biz.title} — Tribhuban Concepts`,
    description: biz.description,
    alternates: { canonical: `${SITE_URL}${businessHref(slug)}` },
  };
}

export default async function BusinessPage({ params }: Props) {
  const { business: slug } = await params;
  const biz = BUSINESSES.find((b) => b.slug === slug);
  if (!biz) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: biz.title,
    description: biz.description,
    provider: { '@type': 'Organization', name: 'Tribhuban Concepts', url: SITE_URL },
    url: `${SITE_URL}${businessHref(slug)}`,
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'Businesses', item: `${SITE_URL}/businesses` },
      { '@type': 'ListItem', position: 3, name: biz.title, item: `${SITE_URL}${businessHref(slug)}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <main id="main-content">
        {/* Hero */}
        <section className="bg-[var(--bg-subtle)] border-b border-[var(--border)] py-14 sm:py-20">
          <div className="container-content">
            <nav aria-label="Breadcrumb" className="mb-6">
              <ol className="flex items-center gap-1 text-sm text-[var(--fg-subtle)] list-none p-0 m-0">
                <li><Link href="/" className="hover:text-[var(--accent)] transition-colors">Home</Link></li>
                <li><span aria-hidden="true" className="mx-1">/</span>
                  <Link href="/businesses" className="hover:text-[var(--accent)] transition-colors">Businesses</Link>
                </li>
                <li><span aria-hidden="true" className="mx-1">/</span>
                  <span aria-current="page" className="text-[var(--fg-muted)]">{biz.title}</span>
                </li>
              </ol>
            </nav>
            <div className="flex items-start gap-5 max-w-3xl">
              <span className="text-5xl shrink-0" aria-hidden="true">{biz.icon}</span>
              <div>
                <h1 className="mb-3 font-display text-3xl font-semibold text-[var(--fg)] sm:text-4xl">
                  {biz.title}
                </h1>
                <p className="text-lg leading-relaxed text-[var(--fg-muted)]">{biz.description}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Products */}
        {biz.products.length > 0 && (
          <section className="container-content py-16 sm:py-20">
            <h2 className="font-display text-2xl font-semibold text-[var(--fg)] mb-8">Products &amp; Tools</h2>
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 list-none p-0 m-0">
              {biz.products.map((p) => (
                <li key={p.slug} className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-7 flex flex-col gap-4 hover:border-[var(--accent)]/40 hover:shadow-[var(--shadow-md)] transition-all duration-300">
                  <span className="text-3xl" aria-hidden="true">{p.icon}</span>
                  <div>
                    <h3 className="font-display text-lg font-semibold text-[var(--fg)] mb-1">{p.title}</h3>
                    {p.description && <p className="text-sm text-[var(--fg-muted)] leading-relaxed">{p.description}</p>}
                  </div>
                  <Link
                    href={productHref(biz.slug, p.slug)}
                    className="mt-auto inline-flex items-center text-sm font-semibold text-[var(--accent)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] rounded-sm"
                  >
                    Open tool →
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* CTA */}
        <section className="bg-[var(--bg-subtle)] border-t border-[var(--border)] py-14">
          <div className="container-content text-center max-w-xl mx-auto">
            <h2 className="font-display text-2xl font-semibold text-[var(--fg)] mb-3">
              Want to learn more?
            </h2>
            <p className="text-[var(--fg-muted)] mb-8 leading-relaxed">
              Book a free consultation with our experts — no obligation, just answers.
            </p>
            <Link
              href="/consultation"
              className="inline-flex items-center justify-center h-12 px-8 rounded-md text-base font-semibold bg-[var(--btn-primary-bg)] text-[var(--btn-primary-fg)] hover:bg-[var(--btn-primary-hover)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
            >
              Book Free Consultation
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
