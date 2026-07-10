import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { buildLearningResourceJsonLd, buildBreadcrumbJsonLd } from './jsonld';

// ── SSG + ISR — revalidate every 1 hour (Req 3.1, 4.3) ───────────────────────
export const revalidate = 3600;

// ── Types ─────────────────────────────────────────────────────────────────────

interface Props {
  params: Promise<{ topic: string }>;
}

/**
 * No static topics yet — return empty array so Next.js will 404
 * on build and fall back to on-demand ISR when a topic is requested. (Req 4.3, 4.4)
 */
export async function generateStaticParams(): Promise<{ topic: string }[]> {
  return [];
}

// ── Metadata ──────────────────────────────────────────────────────────────────

/**
 * generateMetadata handles per-topic title/description for SEO.
 * LearningResource + BreadcrumbList JSON-LD injected in the page body. (Req 23.2)
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { topic } = await params;
  const title = formatTopicTitle(topic);

  return {
    title: `${title} — Solar Learning Hub — Tribhuban Concepts`,
    description: `Learn about ${title.toLowerCase()} in solar energy. Practical, engineer-written guide for homeowners and businesses.`,
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://tribhuban-parent-website.vercel.app'}/solar/learn/${topic}`,
    },
    openGraph: {
      type: 'article',
      url: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://tribhuban-parent-website.vercel.app'}/solar/learn/${topic}`,
      title: `${title} — Solar Learning Hub`,
      description: `Learn about ${title.toLowerCase()} in solar energy.`,
      siteName: 'Tribhuban Concepts',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} — Solar Learning Hub`,
      description: `Learn about ${title.toLowerCase()} in solar energy.`,
    },
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Convert a kebab-case slug to a display title. */
function formatTopicTitle(slug: string): string {
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Placeholder related topics — shown in sidebar when no real content is available.
 * These cross-link to other topics in the same hub. (Req 4.3)
 */
const relatedTopicPlaceholders = [
  { slug: 'how-rooftop-solar-works', title: 'How Rooftop Solar Works', theme: 'Basics' },
  { slug: 'solar-payback-period-explained', title: 'Solar Payback Period Explained', theme: 'Economics' },
  { slug: 'monocrystalline-vs-polycrystalline-panels', title: 'Monocrystalline vs Polycrystalline Panels', theme: 'Technology' },
  { slug: 'how-to-clean-solar-panels', title: 'How to Clean Solar Panels', theme: 'Maintenance' },
] as const;

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function SolarTopicPage({ params }: Props) {
  const { topic } = await params;

  // Req 4.4: If topic slug does not correspond to a published topic, return 404.
  // No topics are published yet — any request to this route returns 404.
  // When real topics are added to the content service, replace this guard with
  // a fetch call: const topicData = await fetchTopic(topic); if (!topicData) notFound();
  if (!topic || typeof topic !== 'string' || topic.trim() === '') {
    notFound();
  }

  // No published topics exist yet — every slug 404s (Req 4.4)
  notFound();
}

// ── Topic page layout (rendered once topics are published) ────────────────────

/**
 * This component represents the full page layout for a published topic.
 * It is defined here for completeness (Req 4.3) but is not rendered
 * until the notFound() guard above is replaced with a real content fetch.
 */
function TopicPageLayout({
  topic,
  title,
}: {
  topic: string;
  title: string;
}) {
  const filteredRelated = relatedTopicPlaceholders.filter((t) => t.slug !== topic);

  return (
    <>
      {/* JSON-LD: LearningResource + BreadcrumbList (Req 23.2) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildLearningResourceJsonLd(topic, title)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildBreadcrumbJsonLd(topic, title)),
        }}
      />

      <main id="main-content">
        {/* ── Breadcrumb trail (Req 4.3) ─────────────────────────────────── */}
        <div className="bg-[var(--bg)] pt-8 pb-0">
          <div className="container-content">
            <nav aria-label="Breadcrumb">
              <ol
                className="flex flex-wrap items-center gap-1 text-sm text-[var(--fg-subtle)]"
                role="list"
              >
                {[
                  { label: 'Home', href: '/' },
                  { label: 'Solar', href: '/solar' },
                  { label: 'Learning Hub', href: '/solar/learn' },
                  { label: title, href: null },
                ].map((crumb, index) => (
                  <li key={crumb.label} className="flex items-center gap-1">
                    {index > 0 && (
                      <span aria-hidden="true" className="select-none">/</span>
                    )}
                    {crumb.href ? (
                      <Link
                        href={crumb.href}
                        className="hover:text-[var(--accent)] transition-colors focus-visible:outline-none focus-visible:rounded focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                      >
                        {crumb.label}
                      </Link>
                    ) : (
                      <span aria-current="page" className="font-medium text-[var(--fg-muted)]">
                        {crumb.label}
                      </span>
                    )}
                  </li>
                ))}
              </ol>
            </nav>
          </div>
        </div>

        {/* ── Main layout: article body + sidebar ──────────────────────── */}
        <div className="bg-[var(--bg)] py-12">
          <div className="container-content">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-12 items-start">

              {/* Article body area (Req 4.3) */}
              <article aria-labelledby="topic-title">
                <header className="mb-8">
                  <h1
                    id="topic-title"
                    className="font-display text-4xl sm:text-5xl font-semibold text-[var(--fg)] leading-tight mb-4"
                  >
                    {title}
                  </h1>
                  <p className="text-lg text-[var(--fg-muted)] leading-relaxed">
                    This article is currently being authored by our engineering team.
                    Check back soon for the full content.
                  </p>
                </header>

                {/* Placeholder body content */}
                <div
                  className="prose-content text-[var(--fg-muted)] leading-relaxed space-y-6"
                  role="region"
                  aria-label="Article body"
                >
                  <p>
                    We are preparing a comprehensive, engineer-written guide on{' '}
                    <strong className="text-[var(--fg)]">{title.toLowerCase()}</strong>. Our
                    Learning Hub articles are authored from first principles — no filler,
                    no vendor spin.
                  </p>
                  <p>
                    In the meantime, our free solar calculator gives you an instant personalised
                    estimate, and our engineers are available for a no-obligation consultation
                    if you have specific questions.
                  </p>
                </div>

                {/* Contextual CTA (Req 4.3) */}
                <div className="mt-12 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border)] p-8">
                  <h2 className="font-display text-2xl font-semibold text-[var(--fg)] mb-3">
                    Have a Question About {title}?
                  </h2>
                  <p className="text-[var(--fg-muted)] mb-6 leading-relaxed">
                    Our engineers can walk you through this topic in a free consultation —
                    and give you a site-specific savings estimate while they are at it.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link
                      href="/consultation"
                      className="inline-flex items-center justify-center h-12 px-6 rounded-md text-sm font-semibold bg-[var(--btn-primary-bg)] text-[var(--btn-primary-fg)] hover:bg-[var(--btn-primary-hover)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-subtle)]"
                    >
                      Book Free Consultation
                    </Link>
                    <Link
                      href="/solar/calculator"
                      className="inline-flex items-center justify-center h-12 px-6 rounded-md text-sm font-semibold border border-[var(--border)] bg-transparent text-[var(--fg)] hover:bg-[var(--bg-muted)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-subtle)]"
                    >
                      Calculate My Savings
                    </Link>
                  </div>
                </div>
              </article>

              {/* Sidebar: Related topics (Req 4.3) */}
              <aside aria-labelledby="related-topics-heading" className="hidden lg:block">
                <h2
                  id="related-topics-heading"
                  className="font-display text-lg font-semibold text-[var(--fg)] mb-4"
                >
                  Related Topics
                </h2>
                <nav aria-label="Related solar topics">
                  <ul className="space-y-3 list-none p-0 m-0" role="list">
                    {filteredRelated.slice(0, 4).map((related) => (
                      <li key={related.slug}>
                        <Link
                          href={`/solar/learn/${related.slug}`}
                          className="group flex flex-col gap-0.5 rounded-lg border border-[var(--border)] bg-[var(--bg-subtle)] p-4 hover:border-[var(--accent)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                        >
                          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--accent)]">
                            {related.theme}
                          </span>
                          <span className="text-sm font-medium text-[var(--fg)] group-hover:text-[var(--accent)] transition-colors leading-snug">
                            {related.title}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>

                {/* Sidebar CTA */}
                <div className="mt-8 rounded-xl bg-[var(--accent-light)] border border-[var(--border)] p-6">
                  <p className="font-display text-base font-semibold text-[var(--fg)] mb-2">
                    Ready to go solar?
                  </p>
                  <p className="text-xs text-[var(--fg-muted)] mb-4 leading-relaxed">
                    Get a free, no-obligation consultation with our engineers.
                  </p>
                  <Link
                    href="/consultation"
                    className="block w-full text-center rounded-md bg-[var(--btn-primary-bg)] px-4 py-2.5 text-sm font-semibold text-[var(--btn-primary-fg)] hover:bg-[var(--btn-primary-hover)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                  >
                    Book Consultation
                  </Link>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

// Suppress unused variable warning — TopicPageLayout is intentionally scaffolded
// for when topics are published. It references internal helpers, keeping them live.
void TopicPageLayout;
