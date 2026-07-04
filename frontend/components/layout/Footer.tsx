import Link from 'next/link';
import NewsletterForm from '@/components/forms/NewsletterForm';

/* ─────────────────────────────────────────────────────────────────────────────
   Footer — 4-column layout + utility row.
   Responsive: 1 col mobile → 2 col tablet → 4 col desktop.
   <footer role="contentinfo"> landmark per accessibility requirements.
───────────────────────────────────────────────────────────────────────────── */
export default function Footer() {
  return (
    <footer role="contentinfo" className="border-t border-[var(--border)] bg-[var(--bg-subtle)] mt-auto">
      <div className="container-content py-12 md:py-16">

        {/* ── 4-column grid ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">

          {/* Column 1 — Company */}
          <div>
            <h2 className="font-display font-semibold text-sm uppercase tracking-wider text-[var(--fg-subtle)] mb-4">
              Company
            </h2>
            <ul className="space-y-2 list-none p-0 m-0">
              <li>
                <Link
                  href="/about"
                  className="text-sm text-[var(--fg-muted)] hover:text-[var(--accent)] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] rounded-sm"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/careers"
                  className="text-sm text-[var(--fg-muted)] hover:text-[var(--accent)] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] rounded-sm"
                >
                  Careers
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-sm text-[var(--fg-muted)] hover:text-[var(--accent)] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] rounded-sm"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2 — Solutions */}
          <div>
            <h2 className="font-display font-semibold text-sm uppercase tracking-wider text-[var(--fg-subtle)] mb-4">
              Solutions
            </h2>
            <ul className="space-y-2 list-none p-0 m-0">
              <li>
                <Link
                  href="/solar"
                  className="text-sm text-[var(--fg-muted)] hover:text-[var(--accent)] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] rounded-sm"
                >
                  Solar
                </Link>
              </li>
              <li>
                <Link
                  href="/products"
                  className="text-sm text-[var(--fg-muted)] hover:text-[var(--accent)] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] rounded-sm"
                >
                  Products
                </Link>
              </li>
              <li>
                <Link
                  href="/future-technologies"
                  className="text-sm text-[var(--fg-muted)] hover:text-[var(--accent)] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] rounded-sm"
                >
                  Future Technologies
                </Link>
              </li>
              <li>
                <Link
                  href="/solar/calculator"
                  className="text-sm text-[var(--fg-muted)] hover:text-[var(--accent)] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] rounded-sm"
                >
                  Calculator
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3 — Resources */}
          <div>
            <h2 className="font-display font-semibold text-sm uppercase tracking-wider text-[var(--fg-subtle)] mb-4">
              Resources
            </h2>
            <ul className="space-y-2 list-none p-0 m-0">
              <li>
                <Link
                  href="/blog"
                  className="text-sm text-[var(--fg-muted)] hover:text-[var(--accent)] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] rounded-sm"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/knowledge"
                  className="text-sm text-[var(--fg-muted)] hover:text-[var(--accent)] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] rounded-sm"
                >
                  Knowledge Center
                </Link>
              </li>
              <li>
                <Link
                  href="/support"
                  className="text-sm text-[var(--fg-muted)] hover:text-[var(--accent)] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] rounded-sm"
                >
                  Support
                </Link>
              </li>
              <li>
                <Link
                  href="/support/faq"
                  className="text-sm text-[var(--fg-muted)] hover:text-[var(--accent)] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] rounded-sm"
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4 — Legal & Social */}
          <div>
            <h2 className="font-display font-semibold text-sm uppercase tracking-wider text-[var(--fg-subtle)] mb-4">
              Legal &amp; Social
            </h2>
            <ul className="space-y-2 list-none p-0 m-0">
              <li>
                <Link
                  href="/legal/privacy"
                  className="text-sm text-[var(--fg-muted)] hover:text-[var(--accent)] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] rounded-sm"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/legal/terms"
                  className="text-sm text-[var(--fg-muted)] hover:text-[var(--accent)] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] rounded-sm"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/legal/cookies"
                  className="text-sm text-[var(--fg-muted)] hover:text-[var(--accent)] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] rounded-sm"
                >
                  Cookie Policy
                </Link>
              </li>
              {/* Social link placeholders */}
              <li>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Tribhuban Concepts on LinkedIn"
                  className="text-sm text-[var(--fg-muted)] hover:text-[var(--accent)] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] rounded-sm"
                >
                  LinkedIn
                </a>
              </li>
              <li>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Tribhuban Concepts on Twitter / X"
                  className="text-sm text-[var(--fg-muted)] hover:text-[var(--accent)] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] rounded-sm"
                >
                  Twitter / X
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* ── Utility row ───────────────────────────────────────────────── */}
        <div className="border-t border-[var(--border)] pt-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-[var(--fg)]">Tribhuban Concepts</p>
            <p className="text-xs text-[var(--fg-subtle)]">
              &copy; {new Date().getFullYear()} Tribhuban Concepts. All rights reserved.
            </p>
            <p className="text-xs text-[var(--fg-subtle)]">
              Technology that reaches everywhere — Swarga, Martya, Patala.
            </p>
          </div>

          {/* Newsletter signup */}
          <div className="w-full md:w-auto md:max-w-sm">
            <p className="text-xs font-semibold text-[var(--fg-muted)] mb-2">
              Stay up to date
            </p>
            <NewsletterForm source="footer" />
          </div>
        </div>
      </div>
    </footer>
  );
}
