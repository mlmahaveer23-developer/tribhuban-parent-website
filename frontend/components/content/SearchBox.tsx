'use client';

/**
 * SearchBox.tsx — accessible search input that updates the URL ?q= param.
 *
 * - role="search" landmark with aria-label
 * - Label linked to input via htmlFor / id
 * - Submit on Enter keydown or button click
 * - Uses useRouter to push ?q=... into the URL (shallow navigation)
 *
 * Requirements: 13.7
 */

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

import { cn } from '@/lib/utils/cn';

interface SearchBoxProps {
  /** Initial/controlled value for the input */
  defaultValue?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Extra className for the outer wrapper */
  className?: string;
}

export default function SearchBox({
  defaultValue = '',
  placeholder = 'Search articles, knowledge, FAQ, jobs…',
  className,
}: SearchBoxProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState(defaultValue);

  function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  }

  return (
    <form
      role="search"
      aria-label="Site search"
      onSubmit={handleSubmit}
      className={cn('relative flex items-center w-full', className)}
    >
      {/* Visually-hidden label — screen readers announce "Search" */}
      <label htmlFor="search-input" className="sr-only">
        Search
      </label>

      {/* Magnifier icon decorative */}
      <Search
        className="absolute left-4 h-5 w-5 text-[var(--fg-subtle)] pointer-events-none"
        aria-hidden="true"
      />

      <input
        id="search-input"
        ref={inputRef}
        type="search"
        name="q"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        className={cn(
          'w-full rounded-lg border border-[var(--border)]',
          'bg-[var(--surface)] text-[var(--fg)] placeholder:text-[var(--fg-subtle)]',
          'py-3 pl-12 pr-24 text-base',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:border-transparent',
          'transition-shadow duration-150',
        )}
      />

      <button
        type="submit"
        aria-label="Submit search"
        className={cn(
          'absolute right-2 px-4 py-2 rounded-md',
          'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-fg)]',
          'text-sm font-semibold',
          'hover:bg-[var(--btn-primary-hover)] transition-colors duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]',
        )}
      >
        Search
      </button>
    </form>
  );
}
