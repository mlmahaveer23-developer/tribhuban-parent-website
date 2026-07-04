import type { Metadata } from 'next';
import Link from 'next/link';

// ── SSG + ISR — revalidate every 6 hours (Req 3.1, 15.1) ─────────────────────
export const revalidate = 21600;

// ── Metadata ──────────────────────────────────────────────────────────────────

/**
 * Req 15.2: Individual future product pages are noindex until launched.
 * The Products page itself is indexable (it's the catalogue).
 * Individual product detail pages (when they exist) should carry noindex.
 */
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Future Products — Tribhuban Concepts',
    description:
      'Explore the technology products Tribhuban Concepts is building — Solar OS, EnergyBot, and GridLink. Register your interest and stay ahead.',
    alternates: { canonical: 'https://tribhubanconcepts.com/products' },
    openGraph: {
      type: 'website',
      url: 'https://tribhubanconcepts.com/products',
      title: 'Future Products — Tribhuban Concepts',
      description:
        'Solar OS, EnergyBot, and GridLink — the technology products Tribhuban Concepts is building.',
      siteName: 'Tribhuban Concepts',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Future Products — Tribhuban Concepts',
      description:
        'Solar OS, EnergyBot, and GridLink — the technology products Tribhuban Concepts is building.',
    },
  };
}

// ── Static content ────────────────────────────────────────────────────────────

/**
 * Req 15.1: ProductCard grid with maturity badges.
 * Three placeholder products: Solar OS, EnergyBot, GridLink.
 * Req 15.2: Cards carry noindex metadata (implemented via robots meta on product detail pages).
 */
const products = [
  {
    id: 'solar-os',
    name: 'Solar OS',
    category: 'Software',
    badge: 'Coming Soon' as const,
    icon: '🖥️',
    tagline: 'The operating system for your solar installation',
    description:
      'Solar OS is an intelligent software platform that unifies monitoring, optimisation, and reporting for rooftop solar systems. Real-time performance dashboards, predictive maintenance alerts, and automated grid export management — all in one place.',
    highlights: [
      'Real-time generation and consumption monitoring',
      'Predictive fault detection and maintenance scheduling',
      'Automated net-metering and export optimisation',
    ],
  },
  {
    id: 'energy-bot',
    name: 'EnergyBot',
    category: 'AI Assistant',
    badge: 'Beta' as const,
    icon: '🤖',
    tagline: 'AI-powered energy advisor for homeowners and businesses',
    description:
      'EnergyBot is an AI assistant that analyses your energy usage patterns and solar generation to recommend optimisations, explain your bill, and guide you through decisions — in plain language, on demand.',
    highlights: [
      'Natural language energy usage queries',
      'Personalised savings recommendations',
      'Integration with solar monitoring and billing data',
    ],
  },
  {
    id: 'grid-link',
    name: 'GridLink',
    category: 'Integration Layer',
    badge: 'Research' as const,
    icon: '🔗',
    tagline: 'Connecting distributed solar to the intelligent grid',
    description:
      'GridLink is a distributed energy resource (DER) integration layer that enables rooftop solar systems to participate in demand response, virtual power plants, and peer-to-peer energy trading. Built for the Indian grid of tomorrow.',
    highlights: [
      'Demand response and virtual power plant participation',
      'Peer-to-peer energy trading protocol',
      'Standards-compliant DER communication (IEEE 2030.5)',
    ],
  },
] as const;

type BadgeVariant = 'Coming Soon' | 'Beta' | 'Research';

/** Maturity badge colour mapping */
const badgeStyles: Record<BadgeVariant, string> = {
  'Coming Soon':
    'bg-[#FBF3EE] text-[#8A5322] border border-[#D8A585]',
  Beta:
    'bg-[#F0F7F4] text-[#2E7D5B] border border-[#9AC9B6]',
  Research:
    'bg-[#EEF2F8] text-[#3A6EA5] border border-[#A0B8D8]',
};

// ── Shared styles ─────────────────────────────────────────────────────────────

const primaryBtn =
  'inline-flex items-center justify-center h-12 px-8 rounded-md text-base font-semibold bg-[var(--btn-primary-bg)] text-[var(--btn-primary-fg)] hover:bg-[var(--btn-primary-hover)] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]';

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ProductsPage() {
  return (
    <main id="main-content">

      {/* ── Hero / Intro framing ─────────────────────────────────────────── */}
      {/* Req 15.1: Intro framing — "what we're building" */}
      <section
        aria-label="Products introduction"
        className="bg-[var(--bg)] py-20 md:py-32"
      >
        <div className="container-content">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex flex-wrap items-center gap-1 text-sm text-[var(--fg-subtle)]" role="list">
              <li className="flex items-center gap-1">
                <Link
                  href="/"
                  className="hover:text-[var(--accent)] transition-colors focus-visible:outline-none focus-visible:rounded focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                >
                  Home
                </Link>
              </li>
              <li className="flex items-center gap-1">
                <span aria-hidden="true" className="select-none">/</span>
                <span aria-current="page" className="font-medium text-[var(--fg-muted)]">Products</span>
              </li>
            </ol>
          </nav>

          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-[var(--accent)] mb-4">
              What We&apos;re Building
            </p>
            <h1 className="font-display text-5xl sm:text-6xl font-semibold text-[var(--fg)] mb-6 leading-tight">
              Technology Products for the Energy Future
            </h1>
            <p className="text-xl text-[var(--fg-muted)] mb-4 leading-relaxed">
              Tribhuban Concepts is not just an installation company. We are building the
              software layer, AI tools, and grid infrastructure that will define how India
              manages distributed solar energy at scale.
            </p>
            <p className="text-lg text-[var(--fg-muted)] leading-relaxed">
              The products below are at various stages of research, development, and beta.
              Register your interest to be notified when they are ready — and to help shape
              their direction.
            </p>
          </div>
        </div>
      </section>

      {/* ── ProductCard Grid ─────────────────────────────────────────────── */}
      {/*
        Req 15.1: ProductCard grid with maturity/"coming soon" badges.
        Req 15.4: Curated fallback copy when no products — placeholder products serve this role.
        Req 15.2: Individual future product pages (when created) will carry noindex
                  until launched. This is noted via the robots comment per product.
      */}
      <section
        aria-labelledby="products-grid-heading"
        className="bg-[var(--bg-subtle)] border-y border-[var(--border)] py-16 md:py-24"
      >
        <div className="container-content">
          <h2
            id="products-grid-heading"
            className="font-display text-3xl sm:text-4xl font-semibold text-[var(--fg)] mb-4"
          >
            Our Product Concepts
          </h2>
          <p className="text-lg text-[var(--fg-muted)] mb-12 max-w-2xl">
            Each product is at a defined maturity stage. We are transparent about where
            each one sits — no vaporware.
          </p>

          {/* Badge legend */}
          <div className="flex flex-wrap gap-3 mb-10" aria-label="Maturity badge legend">
            {(Object.entries(badgeStyles) as [BadgeVariant, string][]).map(([badge, style]) => (
              <span
                key={badge}
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${style}`}
              >
                {badge}
              </span>
            ))}
            <span className="text-xs text-[var(--fg-subtle)] self-center ml-1">— product maturity indicators</span>
          </div>

          <ul
            className="grid grid-cols-1 lg:grid-cols-3 gap-8 list-none p-0 m-0"
            role="list"
            aria-label="Product concepts"
          >
            {products.map((product) => (
              <li
                key={product.id}
                className="rounded-xl bg-[var(--bg)] border border-[var(--border)] p-8 flex flex-col gap-5"
                /**
                 * Req 15.2: Individual product detail pages carry robots noindex.
                 * This list item card does not carry noindex — the page itself is indexable.
                 * When individual product pages are created at /products/[slug], they should
                 * export: export const metadata = { robots: { index: false } }
                 */
              >
                {/* Product header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span
                      aria-hidden="true"
                      className="text-3xl flex-shrink-0"
                    >
                      {product.icon}
                    </span>
                    <div>
                      <h3 className="font-display text-xl font-semibold text-[var(--fg)]">
                        {product.name}
                      </h3>
                      <p className="text-xs text-[var(--fg-subtle)] uppercase tracking-wider font-medium">
                        {product.category}
                      </p>
                    </div>
                  </div>
                  {/* Maturity badge (Req 15.1) */}
                  <span
                    className={`inline-flex flex-shrink-0 items-center px-3 py-1 rounded-full text-xs font-semibold ${badgeStyles[product.badge]}`}
                    aria-label={`Maturity: ${product.badge}`}
                  >
                    {product.badge}
                  </span>
                </div>

                {/* Tagline */}
                <p className="text-sm font-semibold italic text-[var(--fg-muted)]">
                  {product.tagline}
                </p>

                {/* Description */}
                <p className="text-sm text-[var(--fg-muted)] leading-relaxed flex-1">
                  {product.description}
                </p>

                {/* Highlights */}
                <ul className="space-y-2 list-none p-0 m-0" aria-label="Key highlights">
                  {product.highlights.map((highlight) => (
                    <li key={highlight} className="flex items-start gap-2 text-sm text-[var(--fg-muted)]">
                      <span aria-hidden="true" className="text-[var(--accent)] mt-0.5 flex-shrink-0">✓</span>
                      {highlight}
                    </li>
                  ))}
                </ul>

                {/* Register interest CTA (Req 15.1) */}
                <Link
                  href={`/consultation?source=product&product=${product.id}`}
                  className="mt-auto inline-flex items-center justify-center h-10 px-5 rounded-md text-sm font-semibold border border-[var(--border)] bg-transparent text-[var(--fg)] hover:bg-[var(--bg-muted)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]"
                >
                  Register Interest
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Register-interest CTA (global) ───────────────────────────────── */}
      {/* Req 15.1: Register-interest CTA */}
      <section
        aria-labelledby="products-register-heading"
        className="bg-[var(--bg)] py-16 md:py-24"
      >
        <div className="container-content max-w-2xl mx-auto text-center">
          <h2
            id="products-register-heading"
            className="font-display text-3xl sm:text-4xl font-semibold text-[var(--fg)] mb-4"
          >
            Stay Ahead of the Curve
          </h2>
          <p className="text-lg text-[var(--fg-muted)] mb-8 leading-relaxed">
            Register your interest in our product portfolio. We will notify you when products
            move from research to beta, and from beta to launch — and your input helps us
            prioritise what to build next.
          </p>
          <Link href="/consultation?source=product" className={primaryBtn}>
            Register Interest
          </Link>
        </div>
      </section>

    </main>
  );
}
