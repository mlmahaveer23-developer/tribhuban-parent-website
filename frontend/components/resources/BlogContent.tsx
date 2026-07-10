/**
 * BlogContent — rendered inside /resources/blogs.
 * Contains the full blog listing: featured article + all articles grid.
 */
import Link from 'next/link';
import { solarBlogPosts } from '@/lib/content/solar-blogs';

const featuredCategories = [
  { label: 'Solar',               href: '/resources/blogs?category=solar',    icon: '☀️' },
  { label: 'Finance & ROI',       href: '/resources/blogs?category=finance',  icon: '💰' },
  { label: 'Technology',          href: '/resources/blogs?category=technology', icon: '⚡' },
  { label: 'Policy & Regulations',href: '/resources/blogs?category=policy',   icon: '🏛️' },
  { label: 'Guides',              href: '/resources/guides',                  icon: '📖' },
];

export default function BlogContent() {
  return (
    <div>
      {/* Category filter row */}
      <div className="flex flex-wrap gap-2 mb-10" role="list" aria-label="Blog categories">
        {featuredCategories.map((cat) => (
          <Link
            key={cat.label}
            href={cat.href}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border border-[var(--border)] bg-[var(--bg)] text-[var(--fg-muted)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all duration-150"
          >
            <span aria-hidden="true">{cat.icon}</span>{cat.label}
          </Link>
        ))}
      </div>

      {/* Featured article */}
      {solarBlogPosts[0] && (
        <section className="mb-14" aria-labelledby="featured-heading">
          <h2 id="featured-heading" className="text-xs font-semibold uppercase tracking-widest text-[var(--accent)] mb-6">
            Featured Article
          </h2>
          <Link
            href={`/resources/blogs/${solarBlogPosts[0].slug}`}
            className="group block rounded-2xl border border-[var(--border)] bg-[var(--bg-subtle)] overflow-hidden hover:shadow-[var(--shadow-lg)] hover:-translate-y-1 transition-all duration-300"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
              <div
                className="h-56 md:h-auto flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, rgba(180,83,9,0.12), rgba(201,162,39,0.1))' }}
              >
                <span className="text-6xl" aria-hidden="true">☀️</span>
              </div>
              <div className="p-8 md:p-10 flex flex-col justify-center gap-3">
                <div className="flex flex-wrap gap-2">
                  {solarBlogPosts[0].tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2.5 py-1 rounded-full font-semibold"
                      style={{ background: 'rgba(180,83,9,0.08)', color: '#B45309', border: '1px solid rgba(180,83,9,0.15)' }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <h3 className="font-display text-2xl font-semibold text-[var(--fg)] group-hover:text-[var(--accent)] transition-colors leading-snug">
                  {solarBlogPosts[0].title}
                </h3>
                <p className="text-[var(--fg-muted)] leading-relaxed">{solarBlogPosts[0].excerpt}</p>
                <div className="flex items-center gap-3 text-xs text-[var(--fg-subtle)] mt-1">
                  <span>{solarBlogPosts[0].date}</span>
                  <span>·</span>
                  <span>{solarBlogPosts[0].readTime} min read</span>
                </div>
              </div>
            </div>
          </Link>
        </section>
      )}

      {/* All articles grid */}
      <section aria-labelledby="all-articles-heading">
        <h2 id="all-articles-heading" className="font-display text-2xl font-semibold text-[var(--fg)] mb-8">
          All Articles
        </h2>
        {solarBlogPosts.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-[var(--border)] py-20 text-center">
            <span className="text-4xl mb-4 block" aria-hidden="true">📄</span>
            <p className="text-[var(--fg-muted)] font-medium">No articles yet — check back soon.</p>
          </div>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 list-none p-0 m-0" role="list">
            {solarBlogPosts.map((post) => (
              <li key={post.slug}>
                <Link
                  href={`/resources/blogs/${post.slug}`}
                  className="group block rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] overflow-hidden hover:shadow-[var(--shadow-md)] hover:-translate-y-1 transition-all duration-300 h-full flex flex-col"
                >
                  <div
                    className="h-40 flex items-center justify-center shrink-0"
                    style={{ background: 'linear-gradient(135deg, rgba(180,83,9,0.07), rgba(201,162,39,0.07))' }}
                  >
                    <span className="text-4xl" aria-hidden="true">📖</span>
                  </div>
                  <div className="p-5 flex flex-col gap-2 flex-1">
                    <div className="flex flex-wrap gap-1.5">
                      {post.tags.slice(0, 2).map((tag) => (
                        <span key={tag} className="text-[10px] font-semibold uppercase tracking-wider text-[var(--accent)]">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <h3 className="font-display text-base font-semibold text-[var(--fg)] leading-snug group-hover:text-[var(--accent)] transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-sm text-[var(--fg-muted)] leading-relaxed flex-1 line-clamp-3">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-[var(--fg-subtle)] mt-1">
                      <span>{post.date}</span><span>·</span><span>{post.readTime} min read</span>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* CTA */}
      <div className="mt-16 rounded-2xl border border-[var(--border)] bg-[var(--bg-subtle)] py-12 text-center max-w-xl mx-auto">
        <h2 className="font-display text-2xl font-semibold text-[var(--fg)] mb-3">
          Looking for guides or documentation?
        </h2>
        <p className="text-[var(--fg-muted)] mb-6">
          Browse our full Knowledge Hub for step-by-step guides, technical docs, FAQs, and downloads.
        </p>
        <Link
          href="/resources/guides"
          className="inline-flex items-center justify-center h-11 px-6 rounded-lg text-sm font-semibold bg-[var(--btn-primary-bg)] text-[var(--btn-primary-fg)] hover:bg-[var(--btn-primary-hover)] transition-colors"
        >
          Visit Guides →
        </Link>
      </div>
    </div>
  );
}
