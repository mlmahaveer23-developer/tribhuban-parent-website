import type { Metadata } from 'next';
import Link from 'next/link';
import { BUSINESSES, businessHref, productHref, SITE_URL } from '@/lib/siteConfig';

export const revalidate = 21600;

export const metadata: Metadata = {
  title: 'Our Businesses — Tribhuban Concepts',
  description:
    'Explore all Tribhuban Concepts business verticals — Rooftop Solar, FMCG Distribution, HRDS, Pink Moon Vision, and Entrepreneur Funding.',
  alternates: { canonical: `${SITE_URL}/businesses` },
};

// ─── Accent colour per business ───────────────────────────────────────────────
const BUSINESS_ACCENTS: Record<string, { from: string; to: string; text: string; border: string }> = {
  'rooftop-solar':        { from: '#f5a623', to: '#C9A227', text: '#7a4f00', border: 'rgba(201,162,39,0.3)' },
  'fmcg-distribution':    { from: '#3b82f6', to: '#1d4ed8', text: '#1e3a8a', border: 'rgba(59,130,246,0.25)' },
  'hrds':                 { from: '#22c55e', to: '#15803d', text: '#14532d', border: 'rgba(34,197,94,0.25)' },
  'pink-moon-vision':     { from: '#ec4899', to: '#be185d', text: '#831843', border: 'rgba(236,72,153,0.25)' },
  'entrepreneur-funding': { from: '#f97316', to: '#c2410c', text: '#7c2d12', border: 'rgba(249,115,22,0.25)' },
};

const DEFAULT_ACCENT = { from: '#B87333', to: '#8A5322', text: '#5C3616', border: 'rgba(184,115,51,0.25)' };

export default function BusinessesPage() {
  return (
    <main id="main-content">

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="bg-[var(--bg-subtle)] border-b border-[var(--border)] py-16 sm:py-24">
        <div className="container-content">
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex items-center gap-1 text-sm text-[var(--fg-subtle)] list-none p-0 m-0">
              <li><Link href="/" className="hover:text-[var(--accent)] transition-colors">Home</Link></li>
              <li><span aria-hidden="true" className="mx-1">/</span>
                <span aria-current="page" className="text-[var(--fg-muted)]">Businesses</span>
              </li>
            </ol>
          </nav>
          <div className="max-w-3xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[var(--accent)]">
              Our Verticals
            </p>
            <h1 className="mb-5 font-display text-4xl font-semibold text-[var(--fg)] sm:text-5xl leading-tight">
              Where We Work
            </h1>
            <p className="text-lg leading-relaxed text-[var(--fg-muted)] max-w-2xl">
              Five business verticals. Each solves a distinct problem — from clean energy to social housing
              to creative media. Together they form a portfolio engineered to reach every layer of India.
            </p>
          </div>
        </div>
      </section>

      {/* ── BUSINESSES — alternating layout ─────────────────────────────── */}
      <section className="py-8 sm:py-12" aria-label="Business verticals">
        {BUSINESSES.map((biz, i) => {
          const accent = BUSINESS_ACCENTS[biz.slug] ?? DEFAULT_ACCENT;
          const isEven = i % 2 === 0;

          return (
            <div
              key={biz.slug}
              className="border-b border-[var(--border)] last:border-0"
            >
              <div className="container-content py-16 sm:py-20">
                <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center ${isEven ? '' : 'lg:[&>*:first-child]:order-2'}`}>

                  {/* ── Text ────────────────────────────────────────────── */}
                  <div>
                    {/* Number + icon row */}
                    <div className="flex items-center gap-4 mb-6">
                      <span
                        className="font-display text-7xl font-bold leading-none select-none"
                        style={{
                          background: `linear-gradient(135deg, ${accent.from}, ${accent.to})`,
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text',
                          opacity: 0.18,
                        }}
                        aria-hidden="true"
                      >
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="text-5xl" aria-hidden="true">{biz.icon}</span>
                    </div>

                    <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[var(--fg)] mb-4 leading-tight">
                      {biz.title}
                    </h2>
                    <p className="text-lg text-[var(--fg-muted)] leading-relaxed mb-8">
                      {biz.description}
                    </p>

                    {/* Products — horizontal pill strip (not boxes) */}
                    {biz.products.length > 0 && (
                      <div className="mb-8">
                        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--fg-subtle)] mb-3">
                          Tools &amp; Products
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {biz.products.map((p) => (
                            <Link
                              key={p.slug}
                              href={productHref(biz.slug, p.slug)}
                              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                              style={{
                                background: `linear-gradient(135deg, ${accent.from}18, ${accent.to}12)`,
                                color: accent.text,
                                border: `1px solid ${accent.border}`,
                              }}
                            >
                              <span aria-hidden="true">{p.icon}</span>
                              {p.title}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    <Link
                      href={businessHref(biz.slug)}
                      className="inline-flex items-center gap-2 text-sm font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] rounded-sm group"
                      style={{ color: accent.text }}
                    >
                      Explore {biz.title}
                      <span className="transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true">→</span>
                    </Link>
                  </div>

                  {/* ── Visual panel ────────────────────────────────────── */}
                  <div
                    className="relative rounded-3xl overflow-hidden min-h-[280px] sm:min-h-[360px] flex items-center justify-center"
                    style={{
                      background: `linear-gradient(135deg, ${accent.from}14 0%, ${accent.to}0a 60%, transparent 100%)`,
                      border: `1px solid ${accent.border}`,
                    }}
                    aria-hidden="true"
                  >
                    {/* Large decorative icon */}
                    <span
                      className="text-[9rem] sm:text-[12rem] select-none leading-none"
                      style={{ opacity: 0.12 }}
                    >
                      {biz.icon}
                    </span>

                    {/* Floating accent pill */}
                    <div
                      className="absolute top-6 right-6 px-3 py-1.5 rounded-full text-xs font-semibold"
                      style={{
                        background: `linear-gradient(135deg, ${accent.from}, ${accent.to})`,
                        color: '#fff',
                        boxShadow: `0 4px 14px ${accent.from}40`,
                      }}
                    >
                      {biz.products.length > 0
                        ? `${biz.products.length} tool${biz.products.length > 1 ? 's' : ''}`
                        : 'Active'}
                    </div>

                    {/* Corner accent line */}
                    <div
                      className="absolute bottom-0 left-0 right-0 h-1 rounded-b-3xl"
                      style={{
                        background: `linear-gradient(90deg, ${accent.from}, ${accent.to})`,
                        opacity: 0.5,
                      }}
                    />
                  </div>

                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* ── BOTTOM CTA ───────────────────────────────────────────────────── */}
      <section
        className="py-16 sm:py-24"
        style={{
          background: 'linear-gradient(135deg, rgba(184,115,51,0.06) 0%, rgba(201,162,39,0.04) 100%)',
          borderTop: '1px solid var(--border)',
        }}
      >
        <div className="container-content text-center max-w-2xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--accent)] mb-4">
            Get Started
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[var(--fg)] mb-5">
            Not sure where to begin?
          </h2>
          <p className="text-lg text-[var(--fg-muted)] leading-relaxed mb-10">
            Book a free consultation. Our team will listen to your goals and point you
            toward the right business vertical and tools for your situation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/consultation"
              className="inline-flex items-center justify-center h-12 px-8 rounded-md text-base font-semibold bg-[var(--btn-primary-bg)] text-[var(--btn-primary-fg)] hover:bg-[var(--btn-primary-hover)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
            >
              Book Free Consultation
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center h-12 px-8 rounded-md text-base font-semibold border border-[var(--border)] text-[var(--fg)] hover:bg-[var(--bg-muted)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
}
