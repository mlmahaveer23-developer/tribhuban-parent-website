/**
 * KnowledgeCard.tsx — reusable card for knowledge center items.
 *
 * Displays: doc_type badge (guide/reference/research), title, excerpt, reading time.
 * Links to /knowledge/[slug].
 *
 * Design: bg-[var(--surface)], border, shadow-sm on hover
 * Requirements: 10.3, 10.5
 */

import Link from 'next/link';
import { Clock, BookOpen, Bookmark, FlaskConical } from 'lucide-react';

import { cn } from '@/lib/utils/cn';
import type { KnowledgeItemSummary, KnowledgeDocType } from '@/lib/api/content';

// ── Doc-type meta ─────────────────────────────────────────────────────────────

const DOC_TYPE_META: Record<
  KnowledgeDocType,
  { label: string; icon: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean | 'true' | 'false' }> }
> = {
  guide:     { label: 'Guide',     icon: BookOpen },
  reference: { label: 'Reference', icon: Bookmark },
  research:  { label: 'Research',  icon: FlaskConical },
};

interface KnowledgeCardProps {
  item: KnowledgeItemSummary;
  className?: string;
}

export default function KnowledgeCard({ item, className }: KnowledgeCardProps) {
  const meta = DOC_TYPE_META[item.doc_type] ?? DOC_TYPE_META.guide;
  const Icon = meta.icon;

  return (
    <article
      className={cn(
        'group flex flex-col rounded-lg border border-[var(--border)]',
        'bg-[var(--surface)] overflow-hidden p-5',
        'transition-shadow duration-200 hover:shadow-md',
        className,
      )}
    >
      {/* Doc-type badge */}
      <div className="mb-3">
        <span
          className={cn(
            'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-pill text-xs font-semibold',
            'bg-[var(--accent-light)] text-[var(--accent)]',
          )}
        >
          <Icon className="h-3.5 w-3.5" aria-hidden="true" />
          {meta.label}
        </span>
      </div>

      {/* Title */}
      <h2 className="font-display text-base font-semibold leading-snug text-[var(--fg)] group-hover:text-[var(--accent)] transition-colors mb-2">
        <Link
          href={`/knowledge/${item.slug}`}
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] rounded-sm"
        >
          {item.title}
        </Link>
      </h2>

      {/* Excerpt */}
      {item.excerpt && (
        <p className="text-small text-[var(--fg-muted)] line-clamp-3 flex-1 mb-4">
          {item.excerpt}
        </p>
      )}

      {/* Reading time */}
      <div className="mt-auto flex items-center gap-1 text-xs text-[var(--fg-subtle)]">
        <Clock className="h-3 w-3 shrink-0" aria-hidden="true" />
        <span aria-label={`${item.reading_time_minutes} min read`}>
          {item.reading_time_minutes} min read
        </span>
      </div>
    </article>
  );
}
