import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { BUSINESSES, businessHref, productHref, SITE_URL } from '@/lib/siteConfig';

export const revalidate = 21600;

interface Props {
  params: Promise<{ business: string; product: string }>;
}

export async function generateStaticParams() {
  return BUSINESSES.flatMap((b) =>
    b.products.map((p) => ({ business: b.slug, product: p.slug }))
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { business: bizSlug, product: productSlug } = await params;
  const biz = BUSINESSES.find((b) => b.slug === bizSlug);
  const product = biz?.products.find((p) => p.slug === productSlug);
  if (!biz || !product) return {};
  return {
    title: `${product.title} — ${biz.title} — Tribhuban Concepts`,
    description: product.description ?? biz.description,
    alternates: { canonical: `${SITE_URL}${productHref(bizSlug, productSlug)}` },
  };
}

export default async function ProductPage({ params }: Props) {
  const { business: bizSlug, product: productSlug } = await params;
  const biz = BUSINESSES.find((b) => b.slug === bizSlug);
  const product = biz?.products.find((p) => p.slug === productSlug);
  if (!biz || !product) notFound();

  // Special case: Rooftop Solar calculators delegate to the
  // dedicated OdishaSolarCalculator island. Other products render a
  // placeholder until their own components are built.
  const isCalculator = ['solar-calculator', 'subsidy-calculator', 'roi-calculator'].includes(productSlug);

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'Businesses', item: `${SITE_URL}/businesses` },
      { '@type': 'ListItem', position: 3, name: biz.title, item: `${SITE_URL}${businessHref(bizSlug)}` },
      { '@type': 'ListItem', position: 4, name: product.title, item: `${SITE_URL}${productHref(bizSlug, productSlug)}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <main id="main-content">
        {/* Hero */}
        <section className="bg-[var(--bg-subtle)] border-b border-[var(--border)] py-14 sm:py-20">
          <div className="container-content">
            <nav aria-label="Breadcrumb" className="mb-6">
              <ol className="flex flex-wrap items-center gap-1 text-sm text-[var(--fg-subtle)] list-none p-0 m-0">
                <li><Link href="/" className="hover:text-[var(--accent)] transition-colors">Home</Link></li>
                <li><span aria-hidden="true" className="mx-1">/</span>
                  <Link href="/businesses" className="hover:text-[var(--accent)] transition-colors">Businesses</Link>
                </li>
                <li><span aria-hidden="true" className="mx-1">/</span>
                  <Link href={businessHref(bizSlug)} className="hover:text-[var(--accent)] transition-colors">{biz.title}</Link>
                </li>
                <li><span aria-hidden="true" className="mx-1">/</span>
                  <span aria-current="page" className="text-[var(--fg-muted)]">{product.title}</span>
                </li>
              </ol>
            </nav>
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-[var(--accent)] mb-3">
                {product.icon} {biz.title}
              </span>
              <h1 className="mb-4 font-display text-3xl font-semibold text-[var(--fg)] sm:text-4xl">
                {product.title}
              </h1>
              {product.description && (
                <p className="text-lg leading-relaxed text-[var(--fg-muted)]">{product.description}</p>
              )}
            </div>
          </div>
        </section>

        {/* Product content area */}
        <section className="bg-[var(--bg)] py-12 md:py-16">
          <div className="container-content">
            {isCalculator ? (
              /* Dynamic import keeps the heavy calculator off the initial bundle */
              <SolarCalculatorIsland bizSlug={bizSlug} productSlug={productSlug} />
            ) : (
              <div className="max-w-xl py-12 text-center mx-auto">
                <p className="text-6xl mb-6" aria-hidden="true">{product.icon}</p>
                <p className="text-[var(--fg-muted)] mb-8">
                  This product page is coming soon. In the meantime, book a free consultation
                  and our team will walk you through everything.
                </p>
                <Link
                  href="/consultation"
                  className="inline-flex items-center justify-center h-12 px-8 rounded-md text-base font-semibold bg-[var(--btn-primary-bg)] text-[var(--btn-primary-fg)] hover:bg-[var(--btn-primary-hover)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                >
                  Book Free Consultation
                </Link>
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  );
}

// ── Lazy calculator island (avoids bundle bloat on non-calculator pages) ──────

import { Suspense } from 'react';

function SolarCalculatorIsland({ bizSlug, productSlug }: { bizSlug: string; productSlug: string }) {
  // We import the calculator dynamically to keep other product pages lightweight.
  // The OdishaSolarCalculator is a "use client" component.
  const CalcMap: Record<string, React.ReactNode> = {};
  // Fallback: direct import from the same component used by the legacy page.
  // In a future iteration each slug maps to its own specialised calculator variant.
  return (
    <Suspense fallback={<div className="h-64 rounded-xl bg-[var(--bg-subtle)] animate-pulse" />}>
      <SolarCalcWrapper />
    </Suspense>
  );
}

// Thin wrapper that imports the calculator component
// (keeps the RSC page itself free of "use client")
import dynamic from 'next/dynamic';

const SolarCalcWrapper = dynamic(
  () => import('@/components/solar/OdishaSolarCalculator').then((m) => ({ default: m.OdishaSolarCalculator })),
  { ssr: false, loading: () => <div className="h-64 rounded-xl bg-[var(--bg-subtle)] animate-pulse" /> },
);
