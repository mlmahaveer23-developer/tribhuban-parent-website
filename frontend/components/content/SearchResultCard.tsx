/**
 * SearchResultCard.tsx — renders a single search hit.
 *
 * Shows: type badge, title (linked), excerpt, date.
 * Type labels: article→"Blog", knowledge→"Knowledge", faq→"FAQ", job→"Job"
 *
 * Requirements: 13.7
 */

import Link from 'next/link';

import { cn } from '@/lib/utils/cn';
import type { SearchHit } from '@/lib/api/search';

interface SearchResultCardProps {
  hit: SearchHit;
  className?: string;
}

const TYPE_LABEL: Record<SearchHit['type'], string> = {
  article: 'Blog',
  knowledge: 'Knowledge',
  faq: 'FAQ',
  job: 'Job',
};

const TYPE_COLORS: Record<SearchHit['type'], string> = {
  article:   'bg-[var(--accent-light)] text-[var(--accent)]',
  knowledge: 'bg-blue-50 text-blue-700',
  faq:       'bg-emerald-50 text-emerald-700',
  job:       'bg-amber-50 text-amber-700',
};

function formatDate(iso?: string): string | null {
  if (!iso) return null;
  try {
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(iso));
  } catch {
    return null;
  }
}

export default function SearchResultCard({ hit, className }: SearchResultCardProps) {
  const date = formatDate(hit.publishedAt);

  return (
    <article
      className={cn(
        'flex flex-col gap-2 p-5 rounded-lg border border-[var(--border)]',
        'bg-[var(--surface)] transition-shadow duration-150 hover:shadow-md',
        className,
      )}
    >
      {/* Type badge + date row */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <span
          className={cn(
            'inline-block px-2.5 py-0.5 rounded-pill text-xs font-semibold',
            TYPE_COLORS[hit.type],
          )}
        >
          {TYPE_LABEL[hit.type]}
        </span>

        {date && (
          <time
            dateTime={hit.publishedAt}
            className="text-xs text-[var(--fg-subtle)] shrink-0"
          >
            {date}
          </time>
        )}
      </div>

      {/* Title linked to the result */}
      <h2 className="font-display text-base font-semibold leading-snug text-[var(--fg)] hover:text-[var(--accent)] transition-colors">
        <Link
          href={hit.url}
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] rounded-sm"
        >
          {hit.title}
        </Link>
      </h2>

      {/* Excerpt */}
      {hit.excerpt && (
        <p className="text-sm text-[var(--fg-muted)] line-clamp-2">
          {hit.excerpt}
        </p>
      )}
    </article>
  );
}
