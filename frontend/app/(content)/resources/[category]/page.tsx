import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { RESOURCES, resourceHref, SITE_URL } from '@/lib/siteConfig';

export const revalidate = 3600;

interface Props {
  params: Promise<{ category: string }>;
}

export async function generateStaticParams() {
  return RESOURCES.map((r) => ({ category: r.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const resource = RESOURCES.find((r) => r.slug === category);
  if (!resource) return {};
  return {
    title: `${resource.title} — Resources — Tribhuban Concepts`,
    description: resource.description,
    alternates: { canonical: `${SITE_URL}${resourceHref(category)}` },
  };
}

export default async function ResourceCategoryPage({ params }: Props) {
  const { category } = await params;
  const resource = RESOURCES.find((r) => r.slug === category);
  if (!resource) notFound();

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'Resources', item: `${SITE_URL}/resources` },
      { '@type': 'ListItem', position: 3, name: resource.title, item: `${SITE_URL}${resourceHref(category)}` },
    ],
  };

  // Map each resource slug to the legacy content component or a placeholder.
  const ContentComponent = RESOURCE_CONTENT_MAP[category];

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
                  <Link href="/resources" className="hover:text-[var(--accent)] transition-colors">Resources</Link>
                </li>
                <li><span aria-hidden="true" className="mx-1">/</span>
                  <span aria-current="page" className="text-[var(--fg-muted)]">{resource.title}</span>
                </li>
              </ol>
            </nav>
            <div className="max-w-2xl">
              <span className="text-4xl block mb-3" aria-hidden="true">{resource.icon}</span>
              <h1 className="mb-4 font-display text-3xl font-semibold text-[var(--fg)] sm:text-4xl">
                {resource.title}
              </h1>
              <p className="text-base leading-relaxed text-[var(--fg-muted)]">{resource.description}</p>
            </div>
          </div>
        </section>

        {/* Category-specific content */}
        <section className="container-content py-12 sm:py-16">
          {ContentComponent ? (
            <ContentComponent />
          ) : (
            <div className="text-center py-16 text-[var(--fg-muted)]">
              <p className="text-5xl mb-4" aria-hidden="true">{resource.icon}</p>
              <p className="mb-6">Content for <strong>{resource.title}</strong> is coming soon.</p>
              <Link
                href="/resources"
                className="text-sm font-semibold text-[var(--accent)] hover:underline"
              >
                ← Back to Resources
              </Link>
            </div>
          )}
        </section>
      </main>
    </>
  );
}

// ── Content component map — add a component per slug ─────────────────────────
// Each value is a React server component that renders the full category content.
// "blogs" delegates to the existing BlogPage content, "faqs" to FAQs, etc.

import BlogContent from '@/components/resources/BlogContent';
import GuidesContent from '@/components/resources/GuidesContent';
import DocsContent from '@/components/resources/DocsContent';
import FaqsContent from '@/components/resources/FaqsContent';
import DownloadsContent from '@/components/resources/DownloadsContent';

const RESOURCE_CONTENT_MAP: Record<string, React.ComponentType> = {
  blogs: BlogContent,
  guides: GuidesContent,
  documentation: DocsContent,
  faqs: FaqsContent,
  downloads: DownloadsContent,
};
