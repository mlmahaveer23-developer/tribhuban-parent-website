import type { Metadata } from 'next';
import Link from 'next/link';
import SearchBox from '@/components/content/SearchBox';

export const metadata: Metadata = {
  title: 'Page Not Found — Tribhuban Concepts',
  description: 'The page you are looking for could not be found.',
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="container-content py-24 text-center">
      {/* Accent "404" number */}
      <p
        className="text-8xl font-bold mb-4 select-none text-accent"
        style={{ fontFamily: 'var(--font-display)' }}
        aria-hidden="true"
      >
        404
      </p>

      <h1
        className="text-4xl font-semibold mb-4 text-page"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        Page Not Found
      </h1>

      <p className="text-lg mb-10 max-w-lg mx-auto text-muted">
        We could not find what you were looking for. Try searching or explore our main sections
        below.
      </p>

      {/* Search box — client component */}
      <div className="max-w-xl mx-auto mb-10">
        <SearchBox placeholder="Search articles, solar, knowledge, jobs…" />
      </div>

      {/* Book Consultation CTA */}
      <div className="mb-10">
        <Link
          href="/consultation"
          className="inline-flex items-center px-8 py-3 rounded-md text-sm font-semibold transition-colors"
          style={{ backgroundColor: 'var(--accent)', color: 'var(--btn-primary-fg)' }}
        >
          Book a Consultation
        </Link>
      </div>

      {/* Top navigation links */}
      <nav aria-label="Top links">
        <ul className="flex flex-wrap justify-center gap-x-8 gap-y-2 list-none p-0 m-0">
          {[
            { href: '/', label: 'Home' },
            { href: '/solar', label: 'Solar' },
            { href: '/blog', label: 'Blog' },
            { href: '/contact', label: 'Contact' },
            { href: '/consultation', label: 'Consultation' },
          ].map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className="text-sm font-medium text-muted hover:text-accent transition-colors hover:underline"
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
