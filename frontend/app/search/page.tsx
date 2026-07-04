/**
 * Search page — /search
 *
 * Server component: exports generateMetadata with noindex directive (Req 13.9).
 * Client component (SearchPageClient) handles all query-driven interactivity.
 *
 * Requirements: 13.7, 13.9
 */

import type { Metadata } from 'next';
import { Suspense } from 'react';

import SearchPageClient from './SearchPageClient';

// ── Metadata ──────────────────────────────────────────────────────────────────

export function generateMetadata(): Metadata {
  return {
    title: 'Search — Tribhuban Concepts',
    description:
      'Search across blog articles, knowledge items, FAQs, and job listings on Tribhuban Concepts.',
    robots: {
      index: false,
      follow: true,
    },
  };
}

// Search is fully dynamic — disable all caching
export const dynamic = 'force-dynamic';

// ── Page ──────────────────────────────────────────────────────────────────────

/**
 * Suspense boundary is required because SearchPageClient calls useSearchParams(),
 * which opts the component into client-side rendering and needs a boundary
 * to avoid blocking the page during server pre-render.
 */
export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="container-content py-16">
          <h1 className="font-display text-4xl font-semibold text-[var(--fg)] mb-8">
            Search
          </h1>
          <div className="h-12 max-w-2xl rounded-lg bg-[var(--bg-muted)] animate-pulse" />
        </div>
      }
    >
      <SearchPageClient />
    </Suspense>
  );
}
