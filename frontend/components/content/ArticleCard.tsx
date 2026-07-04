/**
 * ArticleCard.tsx — reusable card for blog articles.
 *
 * Displays: hero image placeholder, category badge, title, excerpt,
 * author avatar/name, reading time, tags.
 * Links to /blog/[slug].
 *
 * Design: bg-[var(--surface)], border, shadow-sm on hover (§7.9)
 * Requirements: 10.3
 */

import Link from 'next/link';
import { Clock, User } from 'lucide-react';

import { cn } from '@/lib/utils/cn';
import type { ArticleSummary } from '@/lib/api/content';

interface ArticleCardProps {
  article: ArticleSummary;
  className?: string;
}

export default function ArticleCard({ article, className }: ArticleCardProps) {
  return (
    <article
      className={cn(
        'group flex flex-col rounded-lg border border-[var(--border)]',
        'bg-[var(--surface)] overflow-hidden',
        'transition-shadow duration-200 hover:shadow-md',
        className,
      )}
    >
      {/* Hero image / placeholder */}
      <Link
        href={`/blog/${article.slug}`}
        aria-hidden="true"
        tabIndex={-1}
        className="block shrink-0"
      >
        {article.hero_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={article.hero_image_url}
            alt=""
            className="h-44 w-full object-cover"
          />
        ) : (
          <div
            className="h-44 w-full bg-[var(--bg-muted)] flex items-center justify-center"
            aria-hidden="true"
          >
            <span className="text-3xl opacity-20">📄</span>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="flex flex-col flex-1 gap-3 p-5">
        {/* Category badge */}
        <div className="flex items-center gap-2">
          <Link
            href={`/blog/category/${article.category.slug}`}
            className={cn(
              'inline-block px-2 py-0.5 rounded-pill text-xs font-semibold',
              'bg-[var(--accent-light)] text-[var(--accent)]',
              'hover:opacity-80 transition-opacity',
            )}
          >
            {article.category.name}
          </Link>
        </div>

        {/* Title */}
        <h2 className="font-display text-base font-semibold leading-snug text-[var(--fg)] group-hover:text-[var(--accent)] transition-colors">
          <Link href={`/blog/${article.slug}`} className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] rounded-sm">
            {article.title}
          </Link>
        </h2>

        {/* Excerpt */}
        {article.excerpt && (
          <p className="text-small text-[var(--fg-muted)] line-clamp-2 flex-1">
            {article.excerpt}
          </p>
        )}

        {/* Tags */}
        {article.tags.length > 0 && (
          <div className="flex flex-wrap gap-1" aria-label="Tags">
            {article.tags.slice(0, 3).map((tag) => (
              <span
                key={tag.id}
                className="inline-block px-2 py-0.5 rounded-md text-xs bg-[var(--bg-muted)] text-[var(--fg-subtle)]"
              >
                {tag.name}
              </span>
            ))}
          </div>
        )}

        {/* Meta row */}
        <div className="mt-auto flex items-center gap-3 text-xs text-[var(--fg-subtle)]">
          {/* Author */}
          <span className="flex items-center gap-1.5">
            {article.author.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={article.author.avatar_url}
                alt=""
                className="h-5 w-5 rounded-full object-cover shrink-0"
              />
            ) : (
              <User className="h-4 w-4 shrink-0" aria-hidden="true" />
            )}
            <span>{article.author.name}</span>
          </span>

          {/* Reading time */}
          <span className="flex items-center gap-1" aria-label={`${article.reading_time_minutes} min read`}>
            <Clock className="h-3 w-3 shrink-0" aria-hidden="true" />
            {article.reading_time_minutes} min
          </span>
        </div>
      </div>
    </article>
  );
}
