import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Clock, Calendar } from 'lucide-react';
import { solarBlogPosts, type BlogPost } from '@/lib/content/solar-blogs';
import { SITE_URL } from '@/lib/siteConfig';

interface Props { params: Promise<{ slug: string }>; }

export async function generateStaticParams() {
  return solarBlogPosts.map(post => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = solarBlogPosts.find(p => p.slug === slug);
  if (!post) return { title: 'Article Not Found' };
  return {
    title: `${post.title} — Tribhuban Concepts`,
    description: post.excerpt,
    alternates: { canonical: `${SITE_URL}/resources/blogs/${post.slug}` },
    openGraph: { type: 'article', title: post.title, description: post.excerpt, siteName: 'Tribhuban Concepts' },
  };
}

export const revalidate = 3600;

export default async function BlogArticlePage({ params }: Props) {
  const { slug } = await params;
  const post = solarBlogPosts.find(p => p.slug === slug);
  if (!post) notFound();

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    author: { '@type': 'Organization', name: 'Tribhuban Concepts' },
    publisher: { '@type': 'Organization', name: 'Tribhuban Concepts' },
    datePublished: post.date,
    url: `${SITE_URL}/resources/blogs/${post.slug}`,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <main id="main-content">
        <article>
          {/* Hero */}
          <header className="bg-[var(--bg-subtle)] border-b border-[var(--border)] py-12 md:py-16">
            <div className="container-content max-w-3xl">
              <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm text-[var(--fg-muted)] hover:text-[var(--accent)] transition-colors mb-6">
                <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" /> Back to Blog
              </Link>
              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.map(tag => (
                  <span key={tag} className="text-xs px-3 py-1 rounded-full font-semibold" style={{ background: 'rgba(180,83,9,0.08)', color: '#B45309', border: '1px solid rgba(180,83,9,0.15)' }}>{tag}</span>
                ))}
              </div>
              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold text-[var(--fg)] leading-tight mb-5">{post.title}</h1>
              <p className="text-lg text-[var(--fg-muted)] leading-relaxed mb-6">{post.excerpt}</p>
              <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--fg-subtle)]">
                <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" aria-hidden="true" />{post.date}</span>
                <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" aria-hidden="true" />{post.readTime} min read</span>
              </div>
            </div>
          </header>

          {/* Content */}
          <div className="py-12 md:py-16">
            <div className="container-content grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_280px] gap-12">
              {/* Article body */}
              <div className="prose-content max-w-none">
                <div className="font-sans text-[var(--fg)]">
                  <ArticleContent post={post} />
                </div>
                {/* CTA box */}
                <div className="mt-12 rounded-2xl border border-[var(--accent)]/30 p-8 text-center" style={{ background: 'linear-gradient(135deg, rgba(180,83,9,0.05), rgba(201,162,39,0.05))' }}>
                  <h2 className="font-display text-2xl font-semibold text-[var(--fg)] mb-3">Ready to calculate your savings?</h2>
                  <p className="text-[var(--fg-muted)] mb-5">Use our Odisha-specific ROI calculator to get an instant estimate with real OERC tariff data and PM Surya Ghar subsidies.</p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link href="/solar/calculator" className="inline-flex items-center justify-center h-11 px-6 rounded-lg text-sm font-semibold bg-[var(--btn-primary-bg)] text-[var(--btn-primary-fg)] hover:bg-[var(--btn-primary-hover)] transition-colors">Try Solar Calculator</Link>
                    <Link href="/consultation" className="inline-flex items-center justify-center h-11 px-6 rounded-lg text-sm font-semibold border border-[var(--border)] text-[var(--fg)] hover:bg-[var(--bg-muted)] transition-colors">Book Free Consultation</Link>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <aside>
                <div className="sticky top-24 space-y-6">
                  {/* Related articles */}
                  <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] p-5">
                    <h3 className="font-display text-sm font-semibold text-[var(--fg-muted)] uppercase tracking-wider mb-4">Related Articles</h3>
                    <div className="space-y-3">
                      {solarBlogPosts.filter(p => p.slug !== post.slug).map(related => (
                        <Link key={related.slug} href={`/blog/${related.slug}`} className="block text-sm font-medium text-[var(--fg)] hover:text-[var(--accent)] transition-colors leading-snug">{related.title}</Link>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-xl border border-[var(--accent)]/20 bg-[var(--accent-light)] p-5">
                    <p className="text-sm font-semibold text-[var(--fg)] mb-2">Get a Free Consultation</p>
                    <p className="text-xs text-[var(--fg-muted)] mb-4">Our engineers will assess your rooftop and handle all subsidy paperwork.</p>
                    <Link href="/consultation" className="block w-full text-center h-9 leading-9 rounded-lg text-xs font-semibold bg-[var(--btn-primary-bg)] text-[var(--btn-primary-fg)] hover:bg-[var(--btn-primary-hover)] transition-colors">Book Now</Link>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </article>
      </main>
    </>
  );
}

function ArticleContent({ post }: { post: BlogPost }) {
  return (
    <div className="space-y-6 text-base leading-relaxed text-[var(--fg)]">
      {post.sections.map((section, i) => (
        <div key={i}>
          {section.heading && <h2 className="font-display text-2xl font-semibold text-[var(--fg)] mt-10 mb-4 pb-2 border-b border-[var(--border)]">{section.heading}</h2>}
          {section.subheading && <h3 className="font-display text-lg font-semibold text-[var(--fg)] mt-6 mb-2">{section.subheading}</h3>}
          {section.text && <p className="text-[var(--fg-muted)] leading-relaxed">{section.text}</p>}
          {section.table && (
            <div className="overflow-x-auto rounded-xl border border-[var(--border)] my-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[var(--bg-subtle)]">
                    {section.table.headers.map(h => <th key={h} className="text-left px-4 py-3 font-semibold text-[var(--fg-muted)] border-b border-[var(--border)]">{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {section.table.rows.map((row, ri) => (
                    <tr key={ri} className={ri % 2 === 0 ? 'bg-[var(--bg)]' : 'bg-[var(--bg-subtle)]'}>
                      {row.map((cell, ci) => <td key={ci} className={`px-4 py-3 ${ci === 0 ? 'font-medium text-[var(--fg)]' : 'text-[var(--fg-muted)]'} ${ci === row.length - 1 && section.table?.accentLast ? 'font-bold text-[var(--accent)]' : ''}`}>{cell}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {section.bullets && (
            <ul className="space-y-2 my-4">
              {section.bullets.map((bullet, bi) => (
                <li key={bi} className="flex items-start gap-2.5 text-[var(--fg-muted)]">
                  <span className="text-[var(--accent)] mt-0.5 shrink-0">•</span>{bullet}
                </li>
              ))}
            </ul>
          )}
          {section.callout && (
            <div className="rounded-xl border border-[var(--accent)]/25 bg-[var(--accent-light)] px-6 py-4 my-4">
              <p className="text-sm font-semibold text-[var(--accent)] mb-1">{section.callout.title}</p>
              <p className="text-sm text-[var(--fg-muted)]">{section.callout.body}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
