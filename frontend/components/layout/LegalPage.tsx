/**
 * LegalPage — shared layout wrapper for Privacy, Terms, and Cookie pages.
 *
 * Mobile-first optimizations:
 * - Proper horizontal padding at all breakpoints (no text overflow)
 * - Font sizes fluid and readable on small screens
 * - Generous line-height for body copy
 * - Explicit color tokens so text is always visible in both themes
 * - Max-width only on wide screens (not constrained on mobile)
 * - Section anchors for internal navigation
 * - Sticky table of contents on desktop, hidden on mobile
 */

import Link from 'next/link';

interface LegalSection {
  id: string;
  number: string;
  title: string;
  content: React.ReactNode;
}

interface LegalPageProps {
  title: string;
  lastUpdated: string;
  description: string;
  sections: LegalSection[];
}

// ── Shared text styles ────────────────────────────────────────────────────────

export const legal = {
  // Outer wrapper
  wrapper: 'bg-[var(--bg)] min-h-screen',
  // Hero band
  hero: 'bg-[var(--bg-subtle)] border-b border-[var(--border)] px-4 sm:px-6 py-12 md:py-16',
  heroInner: 'max-w-3xl mx-auto',
  // Content area
  content: 'max-w-3xl mx-auto px-4 sm:px-6 py-10 md:py-14',
  // Section
  section: 'mb-10 md:mb-12',
  // Headings
  h2: 'font-display text-xl sm:text-2xl font-semibold text-[var(--fg)] mb-3 mt-0 leading-snug',
  h3: 'font-display text-base sm:text-lg font-semibold text-[var(--fg)] mb-2 mt-5 leading-snug',
  // Body
  p: 'text-base text-[var(--fg-muted)] leading-relaxed mb-4',
  // Lists
  ul: 'list-disc pl-5 sm:pl-6 space-y-2 mb-4',
  li: 'text-base text-[var(--fg-muted)] leading-relaxed',
  // Inline code
  code: 'font-mono text-sm bg-[var(--bg-muted)] text-[var(--fg)] px-1.5 py-0.5 rounded',
  // Links
  a: 'text-[var(--accent)] underline underline-offset-2 hover:text-[var(--accent-hover)] transition-colors break-words',
  // Address
  address: 'not-italic space-y-1.5 text-base text-[var(--fg-muted)] bg-[var(--bg-subtle)] border border-[var(--border)] rounded-xl p-5 my-4',
  // Divider
  divider: 'border-t border-[var(--border)] my-8',
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function LegalPage({ title, lastUpdated, description, sections }: LegalPageProps) {
  const otherPages = [
    { label: 'Privacy Policy', href: '/legal/privacy' },
    { label: 'Terms of Service', href: '/legal/terms' },
    { label: 'Cookie Policy', href: '/legal/cookies' },
  ].filter(p => !p.label.toLowerCase().includes(title.toLowerCase().split(' ')[0].toLowerCase()));

  return (
    <div className={legal.wrapper}>

      {/* Hero header */}
      <header className={legal.hero}>
        <div className={legal.heroInner}>
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-5">
            <ol className="flex flex-wrap items-center gap-1 text-sm text-[var(--fg-subtle)]" role="list">
              <li><Link href="/" className="hover:text-[var(--accent)] transition-colors">Home</Link></li>
              <li><span aria-hidden="true" className="mx-1">/</span></li>
              <li><Link href="/legal/privacy" className="hover:text-[var(--accent)] transition-colors">Legal</Link></li>
              <li><span aria-hidden="true" className="mx-1">/</span></li>
              <li><span aria-current="page" className="font-medium text-[var(--fg-muted)] break-words">{title}</span></li>
            </ol>
          </nav>

          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-[var(--accent)] mb-3">Legal</span>
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold text-[var(--fg)] leading-tight mb-3">{title}</h1>
          <p className="text-sm text-[var(--fg-subtle)] mb-4">Last updated: {lastUpdated}</p>
          <p className="text-base sm:text-lg text-[var(--fg-muted)] leading-relaxed max-w-2xl">{description}</p>

          {/* Jump links */}
          <nav aria-label="Page sections" className="mt-6 hidden sm:block">
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--fg-subtle)] mb-2">Jump to section</p>
            <div className="flex flex-wrap gap-2">
              {sections.map(s => (
                <a key={s.id} href={`#${s.id}`}
                  className="text-xs px-3 py-1.5 rounded-full border border-[var(--border)] text-[var(--fg-muted)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all duration-150">
                  {s.number}. {s.title}
                </a>
              ))}
            </div>
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main id="main-content">
        <article className={legal.content}>
          {sections.map((section, i) => (
            <section key={section.id} id={section.id} className={legal.section} aria-labelledby={`heading-${section.id}`}>
              {i > 0 && <div className={legal.divider} aria-hidden="true" />}
              <h2 id={`heading-${section.id}`} className={legal.h2}>
                <span className="text-[var(--accent)] mr-2" aria-hidden="true">{section.number}.</span>
                {section.title}
              </h2>
              {section.content}
            </section>
          ))}

          {/* Related legal pages */}
          <div className={legal.divider} />
          <nav aria-label="Other legal documents" className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--fg-subtle)] mb-3">Related documents</p>
            <div className="flex flex-wrap gap-3">
              {otherPages.map(p => (
                <Link key={p.href} href={p.href}
                  className="text-sm font-medium text-[var(--fg-muted)] hover:text-[var(--accent)] underline underline-offset-2 transition-colors">
                  {p.label}
                </Link>
              ))}
              <Link href="/contact"
                className="text-sm font-medium text-[var(--fg-muted)] hover:text-[var(--accent)] underline underline-offset-2 transition-colors">
                Contact Us
              </Link>
            </div>
          </nav>
        </article>
      </main>
    </div>
  );
}
