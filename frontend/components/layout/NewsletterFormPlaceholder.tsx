'use client';

import { cn } from '@/lib/utils/cn';

/**
 * NewsletterFormPlaceholder — minimal email + subscribe UI.
 * Fully replaced by NewsletterForm (task 8.2); present here for layout wiring.
 */
export default function NewsletterFormPlaceholder() {
  return (
    <form
      aria-label="Newsletter signup"
      onSubmit={(e) => e.preventDefault()}
      className="flex gap-2 flex-wrap"
    >
      <label htmlFor="footer-newsletter-email" className="sr-only">
        Email address
      </label>
      <input
        id="footer-newsletter-email"
        type="email"
        name="email"
        placeholder="your@email.com"
        autoComplete="email"
        required
        className={cn(
          'h-9 flex-1 min-w-[180px] px-3',
          'text-sm text-[var(--fg)] bg-[var(--bg)] rounded-md',
          'border border-[var(--border-input)]',
          'placeholder:text-[var(--fg-subtle)]',
          'focus-visible:outline-none focus-visible:ring-2',
          'focus-visible:ring-[var(--ring)] focus-visible:ring-offset-1',
          'focus-visible:ring-offset-[var(--bg)]',
        )}
      />
      <button
        type="submit"
        className={cn(
          'h-9 px-4 rounded-md',
          'text-sm font-semibold',
          'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-fg)]',
          'hover:bg-[var(--btn-primary-hover)] transition-colors duration-150',
          'focus-visible:outline-none focus-visible:ring-2',
          'focus-visible:ring-[var(--ring)] focus-visible:ring-offset-1',
          'focus-visible:ring-offset-[var(--bg)]',
        )}
      >
        Subscribe
      </button>
    </form>
  );
}
