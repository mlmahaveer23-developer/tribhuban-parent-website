'use client';

/**
 * SearchPageClient.tsx — fully dynamic search experience.
 *
 * States:
 *   idle    — no ?q= param
 *   loading — skeleton cards while fetching
 *   results — list of SearchResultCard
 *   empty   — zero results + up to 5 content suggestions
 *   error   — fetch failure
 *
 * Requirements: 13.7, 13.9
 */

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { cn } from '@/lib/utils/cn';
import { searchContent, type SearchHit, type SearchResult } from '@/lib/api/search';
import SearchBox from '@/components/content/SearchBox';
import SearchResultCard from '@/components/content/SearchResultCard';

// ── Type filter options ───────────────────────────────────────────────────────

type ContentFilter = 'all' | 'article' | 'knowledge' | 'faq' | 'job';

const FILTER_LABELS: Record<ContentFilter, string> = {
  all:       'All',
  article:   'Articles',
  knowledge: 'Knowledge',
  faq:       'FAQ',
  job:       'Jobs',
};

const FILTERS: ContentFilter[] = ['all', 'article', 'knowledge', 'faq', 'job'];

// ── Skeleton card ─────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div
      className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 space-y-3 animate-pulse"
      aria-hidden="true"
    >
      <div className="flex items-center gap-2">
        <div className="h-5 w-16 rounded-pill bg-[var(--bg-muted)]" />
        <div className="h-4 w-20 rounded bg-[var(--bg-muted)] ml-auto" />
      </div>
      <div className="h-5 w-4/5 rounded bg-[var(--bg-muted)]" />
      <div className="h-4 w-full rounded bg-[var(--bg-muted)]" />
      <div className="h-4 w-3/4 rounded bg-[var(--bg-muted)]" />
    </div>
  );
}

// ── Content suggestions for empty state ──────────────────────────────────────

const CONTENT_SUGGESTIONS: { href: string; label: string }[] = [
  { href: '/blog',           label: 'Browse all blog articles' },
  { href: '/knowledge',      label: 'Explore the knowledge center' },
  { href: '/support/faq',    label: 'View frequently asked questions' },
  { href: '/careers',        label: 'See open positions' },
  { href: '/solar',          label: 'Learn about solar solutions' },
];

// ── Main component ────────────────────────────────────────────────────────────

export default function SearchPageClient() {
  const searchParams = useSearchParams();
  const q = searchParams.get('q') ?? '';

  const [activeFilter, setActiveFilter] = useState<ContentFilter>('all');
  const [page, setPage] = useState(1);

  type State =
    | { status: 'idle' }
    | { status: 'loading' }
    | { status: 'results'; result: SearchResult }
    | { status: 'empty';   query: string }
    | { status: 'error';   message: string };

  const [state, setState] = useState<State>({ status: 'idle' });

  const runSearch = useCallback(
    async (query: string, filter: ContentFilter, pg: number) => {
      if (!query.trim()) {
        setState({ status: 'idle' });
        return;
      }
      setState({ status: 'loading' });
      try {
        const types = filter === 'all' ? undefined : [filter];
        const result = await searchContent(query, pg, 10, types);
        if (result.data.length === 0) {
          setState({ status: 'empty', query });
        } else {
          setState({ status: 'results', result });
        }
      } catch (err) {
        setState({
          status: 'error',
          message: err instanceof Error ? err.message : 'Something went wrong.',
        });
      }
    },
    [],
  );

  // Re-run whenever q, filter, or page changes
  useEffect(() => {
    setPage(1); // reset page when q or filter changes
  }, [q, activeFilter]);

  useEffect(() => {
    runSearch(q, activeFilter, page);
  }, [q, activeFilter, page, runSearch]);

  const totalPages =
    state.status === 'results' ? state.result.meta.totalPages : 0;

  // ── Derived heading for results ─────────────────────────────────────────────
  const resultHeading =
    state.status === 'results'
      ? `${state.result.meta.total} result${state.result.meta.total !== 1 ? 's' : ''} for "${q}"`
      : null;

  return (
    <div className="container-content py-12 md:py-16">
      {/* ── Page heading ─────────────────────────────────────────────────── */}
      <h1 className="font-display text-4xl font-semibold text-[var(--fg)] mb-8">
        Search
      </h1>

      {/* ── Search box ───────────────────────────────────────────────────── */}
      <SearchBox
        defaultValue={q}
        className="mb-6 max-w-2xl"
      />

      {/* ── Type filter bar ──────────────────────────────────────────────── */}
      <div
        role="group"
        aria-label="Filter by content type"
        className="flex flex-wrap gap-2 mb-8"
      >
        {FILTERS.map((filter) => (
          <button
            key={filter}
            onClick={() => {
              setActiveFilter(filter);
              setPage(1);
            }}
            aria-pressed={activeFilter === filter}
            className={cn(
              'px-4 py-1.5 rounded-pill text-sm font-medium transition-colors',
              activeFilter === filter
                ? 'bg-[var(--accent)] text-[var(--btn-primary-fg)]'
                : 'bg-[var(--bg-muted)] text-[var(--fg-muted)] hover:bg-[var(--border)]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]',
            )}
          >
            {FILTER_LABELS[filter]}
          </button>
        ))}
      </div>

      {/* ── Results heading (for screen readers / sighted users) ─────────── */}
      {resultHeading && (
        <p className="text-sm text-[var(--fg-muted)] mb-4" aria-live="polite">
          {resultHeading}
        </p>
      )}

      {/* ── Main content area ────────────────────────────────────────────── */}

      {/* Idle — no query yet */}
      {state.status === 'idle' && (
        <p className="text-[var(--fg-muted)]">
          Enter a search term above to find articles, knowledge items, FAQs, and jobs.
        </p>
      )}

      {/* Loading — skeleton cards */}
      {state.status === 'loading' && (
        <div
          role="status"
          aria-label="Loading search results"
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {/* Results list */}
      {state.status === 'results' && (
        <>
          {/* aria-live region announces result count */}
          <div aria-live="polite" aria-atomic="true" className="sr-only">
            {resultHeading}
          </div>

          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 list-none p-0 m-0">
            {state.result.data.map((hit: SearchHit) => (
              <li key={hit.id}>
                <SearchResultCard hit={hit} />
              </li>
            ))}
          </ul>

          {/* Pagination */}
          {totalPages > 1 && (
            <nav
              aria-label="Search results pagination"
              className="flex items-center justify-center gap-4 mt-10"
            >
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                aria-label="Previous page"
                className={cn(
                  'flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium',
                  'border border-[var(--border)] transition-colors',
                  page <= 1
                    ? 'opacity-40 cursor-not-allowed'
                    : 'hover:bg-[var(--bg-muted)]',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]',
                )}
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                Prev
              </button>

              <span className="text-sm text-[var(--fg-muted)]" aria-current="page">
                Page {page} of {totalPages}
              </span>

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                aria-label="Next page"
                className={cn(
                  'flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium',
                  'border border-[var(--border)] transition-colors',
                  page >= totalPages
                    ? 'opacity-40 cursor-not-allowed'
                    : 'hover:bg-[var(--bg-muted)]',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]',
                )}
              >
                Next
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </nav>
          )}
        </>
      )}

      {/* Empty state */}
      {state.status === 'empty' && (
        <div aria-live="polite">
          <p className="text-[var(--fg-muted)] mb-6">
            No results for &ldquo;<strong className="text-[var(--fg)]">{state.query}</strong>&rdquo;.
            Try different keywords or browse the suggestions below.
          </p>

          <h2 className="font-display text-lg font-semibold text-[var(--fg)] mb-3">
            You might find these helpful
          </h2>
          <ul className="space-y-2 list-none p-0 m-0">
            {CONTENT_SUGGESTIONS.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    'text-[var(--accent)] underline-offset-2 hover:underline text-sm',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] rounded-sm',
                  )}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Error state */}
      {state.status === 'error' && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-5 text-red-700"
        >
          <p className="font-semibold mb-1">Search unavailable</p>
          <p className="text-sm">{state.message}</p>
          <button
            onClick={() => runSearch(q, activeFilter, page)}
            className="mt-3 text-sm underline underline-offset-2 hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded-sm"
          >
            Try again
          </button>
        </div>
      )}
    </div>
  );
}
