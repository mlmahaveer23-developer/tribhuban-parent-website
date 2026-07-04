'use client';

/**
 * FAQAccordion.tsx — client-side searchable, filterable FAQ accordion.
 *
 * Uses @radix-ui/react-accordion for accessible expand/collapse.
 * Supports category filter tabs and a search input that filters by
 * question text client-side.
 *
 * Requirements: 14.3
 */

import { useState, useMemo } from 'react';
import * as Accordion from '@radix-ui/react-accordion';
import { ChevronDown, Search } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface FAQ {
  question: string;
  answer: string;
}

export interface FAQCategory {
  name: string;
  slug: string;
  faqs: FAQ[];
}

interface FAQAccordionProps {
  categories: FAQCategory[];
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function FAQAccordion({ categories }: FAQAccordionProps) {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filter categories + FAQs based on active tab and search query
  const filteredCategories = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return categories
      .filter((cat) => activeCategory === 'all' || cat.slug === activeCategory)
      .map((cat) => ({
        ...cat,
        faqs: cat.faqs.filter(
          (faq) => query === '' || faq.question.toLowerCase().includes(query),
        ),
      }))
      .filter((cat) => cat.faqs.length > 0);
  }, [categories, activeCategory, searchQuery]);

  const totalVisible = filteredCategories.reduce(
    (sum, cat) => sum + cat.faqs.length,
    0,
  );

  return (
    <div className="space-y-8">
      {/* ── Search input ──────────────────────────────────────────────── */}
      <div className="relative">
        <label htmlFor="faq-search" className="sr-only">
          Search FAQs
        </label>
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <Search
            className="h-4 w-4 text-[var(--fg-subtle)]"
            aria-hidden="true"
          />
        </div>
        <input
          id="faq-search"
          type="search"
          placeholder="Search questions…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={cn(
            'block w-full rounded-lg border border-[var(--border-input)]',
            'bg-[var(--bg)] text-[var(--fg)] placeholder:text-[var(--fg-subtle)]',
            'py-2.5 pl-9 pr-4 text-sm',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]',
            'transition-colors duration-150',
          )}
          aria-label="Search frequently asked questions"
        />
      </div>

      {/* ── Category filter tabs ──────────────────────────────────────── */}
      <div
        role="tablist"
        aria-label="FAQ categories"
        className="flex flex-wrap gap-2"
      >
        {/* "All" tab */}
        <button
          role="tab"
          aria-selected={activeCategory === 'all'}
          onClick={() => setActiveCategory('all')}
          className={cn(
            'rounded-full px-4 py-1.5 text-sm font-medium transition-colors duration-150',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]',
            activeCategory === 'all'
              ? 'bg-[var(--accent)] text-[var(--btn-primary-fg)]'
              : 'bg-[var(--bg-muted)] text-[var(--fg-muted)] hover:bg-[var(--bg-subtle)] hover:text-[var(--fg)]',
          )}
        >
          All
        </button>

        {categories.map((cat) => (
          <button
            key={cat.slug}
            role="tab"
            aria-selected={activeCategory === cat.slug}
            onClick={() => setActiveCategory(cat.slug)}
            className={cn(
              'rounded-full px-4 py-1.5 text-sm font-medium transition-colors duration-150',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]',
              activeCategory === cat.slug
                ? 'bg-[var(--accent)] text-[var(--btn-primary-fg)]'
                : 'bg-[var(--bg-muted)] text-[var(--fg-muted)] hover:bg-[var(--bg-subtle)] hover:text-[var(--fg)]',
            )}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* ── Empty state ───────────────────────────────────────────────── */}
      {totalVisible === 0 && (
        <div
          role="status"
          aria-live="polite"
          className="rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] px-6 py-12 text-center"
        >
          <p className="text-base font-medium text-[var(--fg-muted)]">
            No FAQs match your search
          </p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="mt-3 text-sm text-[var(--accent)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] rounded-sm"
            >
              Clear search
            </button>
          )}
        </div>
      )}

      {/* ── Accordion grouped by category ────────────────────────────── */}
      {filteredCategories.map((cat) => (
        <section key={cat.slug} aria-labelledby={`faq-cat-${cat.slug}`}>
          <h2
            id={`faq-cat-${cat.slug}`}
            className="mb-4 font-display text-lg font-semibold text-[var(--fg)]"
          >
            {cat.name}
          </h2>

          <Accordion.Root
            type="single"
            collapsible
            className="divide-y divide-[var(--border)] rounded-xl border border-[var(--border)] overflow-hidden"
          >
            {cat.faqs.map((faq, idx) => {
              const itemValue = `${cat.slug}-${idx}`;
              return (
                <Accordion.Item key={itemValue} value={itemValue}>
                  <Accordion.Header>
                    <Accordion.Trigger
                      className={cn(
                        'group flex w-full items-center justify-between gap-4',
                        'bg-[var(--surface)] px-5 py-4 text-left',
                        'text-sm font-medium text-[var(--fg)]',
                        'hover:bg-[var(--bg-subtle)] transition-colors duration-150',
                        'focus-visible:outline-none focus-visible:ring-inset focus-visible:ring-2 focus-visible:ring-[var(--ring)]',
                        // data-[state=open] styles applied via CSS attribute selector below
                        'data-[state=open]:bg-[var(--bg-subtle)]',
                      )}
                    >
                      <span>{faq.question}</span>
                      {/* ChevronDown rotates 180° when open */}
                      <ChevronDown
                        className={cn(
                          'h-4 w-4 shrink-0 text-[var(--fg-subtle)]',
                          'transition-transform duration-200',
                          'group-data-[state=open]:rotate-180',
                        )}
                        aria-hidden="true"
                      />
                    </Accordion.Trigger>
                  </Accordion.Header>

                  <Accordion.Content
                    className="overflow-hidden bg-[var(--bg-subtle)]"
                  >
                    <div className="px-5 py-4 text-sm leading-relaxed text-[var(--fg-muted)]">
                      {faq.answer}
                    </div>
                  </Accordion.Content>
                </Accordion.Item>
              );
            })}
          </Accordion.Root>
        </section>
      ))}
    </div>
  );
}
