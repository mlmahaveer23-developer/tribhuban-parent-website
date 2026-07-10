import type { Metadata } from 'next';
import Link from 'next/link';

// ── SSG + ISR — revalidate every 6 hours (Req 3.1, 15.3) ─────────────────────
export const revalidate = 21600;

// ── Metadata ──────────────────────────────────────────────────────────────────

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Future Technologies — Tribhuban Concepts',
    description:
      'Discover Tribhuban Concepts\'s R&D vision — AI & Energy, Advanced Materials, Grid Intelligence, and Sustainable Infrastructure. Engineering the future today.',
    alternates: { canonical: 'https://tribhubanconcepts.com/future-technologies' },
    openGraph: {
      type: 'website',
      url: 'https://tribhubanconcepts.com/future-technologies',
      title: 'Future Technologies — Tribhuban Concepts',
      description:
        'AI & Energy, Advanced Materials, Grid Intelligence, and Sustainable Infrastructure — our R&D vision.',
      siteName: 'Tribhuban Concepts',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Future Technologies — Tribhuban Concepts',
      description:
        'AI & Energy, Advanced Materials, Grid Intelligence, and Sustainable Infrastructure — our R&D vision.',
    },
  };
}

// ── Static content ────────────────────────────────────────────────────────────

/**
 * Req 15.3: Focus areas FeatureGrid — 4 focus areas.
 */
const focusAreas = [
  {
    icon: '🤖',
    title: 'AI & Energy',
    description:
      'Machine learning models that predict solar generation, optimise battery dispatch, and detect performance degradation before it impacts output. We are building AI that makes every watt count.',
    status: 'Active R&D',
  },
  {
    icon: '🧪',
    title: 'Advanced Materials',
    description:
      'Research into perovskite-silicon tandem cells, bifacial modules optimised for Indian diffuse irradiance conditions, and thermally stable encapsulants for high-temperature rooftop environments.',
    status: 'Research Phase',
  },
  {
    icon: '🌐',
    title: 'Grid Intelligence',
    description:
      'Distributed energy resource management systems (DERMS) that enable rooftop solar to participate in demand response, frequency regulation, and eventually peer-to-peer energy trading at scale.',
    status: 'Active R&D',
  },
  {
    icon: '🌿',
    title: 'Sustainable Infrastructure',
    description:
      'Low-carbon mounting systems, circular economy approaches to panel end-of-life, and lifecycle carbon analysis tools that give project owners a complete environmental picture from installation to decommission.',
    status: 'Pilot Projects',
  },
] as const;

type StatusVariant = 'Active R&D' | 'Research Phase' | 'Pilot Projects';

const statusStyles: Record<StatusVariant, string> = {
  'Active R&D':
    'bg-[#F0F7F4] text-[#2E7D5B] border border-[#9AC9B6]',
  'Research Phase':
    'bg-[#EEF2F8] text-[#3A6EA5] border border-[#A0B8D8]',
  'Pilot Projects':
    'bg-[#FBF3EE] text-[#8A5322] border border-[#D8A585]',
};

const philosophyPrinciples = [
  {
    number: '01',
    title: 'Problems Before Solutions',
    description:
      'We start with the hardest unsolved problems in Indian energy infrastructure and work backwards to the technology. Solutions in search of problems do not get funded here.',
  },
  {
    number: '02',
    title: 'Engineering First, Narrative Second',
    description:
      'Every research direction must pass a rigorous technical gate before it becomes a product line or a marketing story. We build credibility with results, not with roadmaps.',
  },
  {
    number: '03',
    title: 'Open by Default',
    description:
      'Where possible, we publish our research, open-source our tools, and contribute to the standards bodies that will define the grid of tomorrow. A rising tide lifts all boats.',
  },
  {
    number: '04',
    title: 'Patient Capital',
    description:
      'Breakthrough technology takes time. We invest in multi-year research programmes because the compounding returns of genuine innovation outweigh the short-term returns of incremental improvement.',
  },
] as const;

// ── Shared styles ─────────────────────────────────────────────────────────────

const primaryBtn =
  'inline-flex items-center justify-center h-12 px-8 rounded-md text-base font-semibold bg-[var(--btn-primary-bg)] text-[var(--btn-primary-fg)] hover:bg-[var(--btn-primary-hover)] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]';

const ghostBtn =
  'inline-flex items-center justify-center h-12 px-8 rounded-md text-base font-semibold border border-[var(--border)] bg-transparent text-[var(--fg)] hover:bg-[var(--bg-muted)] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]';

// ── Page ──────────────────────────────────────────────────────────────────────

export default function FutureTechnologiesPage() {
  return (
    <main id="main-content">

      {/* ── 1. Vision Statement ──────────────────────────────────────────── */}
      {/* Req 15.3: Vision statement section */}
      <section
        aria-label="Future technologies vision"
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
                <span aria-current="page" className="font-medium text-[var(--fg-muted)]">Future Technologies</span>
              </li>
            </ol>
          </nav>

          <div className="max-w-3xl mx-auto text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-[var(--accent)] mb-4">
              Future Technologies
            </p>
            <h1 className="font-display text-5xl sm:text-6xl font-semibold text-[var(--fg)] mb-8 leading-tight">
              Engineering the Technologies India Will Run On
            </h1>
            <p className="text-xl text-[var(--fg-muted)] mb-6 leading-relaxed">
              Solar is what we do today. It is not the limit of what we are building. Tribhuban
              Concepts invests in the foundational technologies — AI, advanced materials, grid
              intelligence, and sustainable infrastructure — that will define the next generation
              of Indian energy systems.
            </p>
            <p className="text-lg text-[var(--fg-muted)] leading-relaxed">
              We believe that the companies that win in energy will be the ones that understand
              both the physics and the software. We are one of those companies.
            </p>
          </div>
        </div>
      </section>

      {/* ── 2. Focus Areas — FeatureGrid ─────────────────────────────────── */}
      {/* Req 15.3: Focus areas FeatureGrid */}
      <section
        aria-labelledby="focus-areas-heading"
        className="bg-[var(--bg-subtle)] border-y border-[var(--border)] py-16 md:py-24"
      >
        <div className="container-content">
          <div className="text-center mb-12">
            <h2
              id="focus-areas-heading"
              className="font-display text-3xl sm:text-4xl font-semibold text-[var(--fg)] mb-4"
            >
              Our Focus Areas
            </h2>
            <p className="text-lg text-[var(--fg-muted)] max-w-2xl mx-auto">
              Four research and development vectors, each targeting a different layer of the
              future energy stack.
            </p>
          </div>

          <ul
            className="grid grid-cols-1 sm:grid-cols-2 gap-8 list-none p-0 m-0"
            role="list"
            aria-label="R&D focus areas"
          >
            {focusAreas.map((area) => (
              <li
                key={area.title}
                className="rounded-xl bg-[var(--bg)] border border-[var(--border)] p-8 flex flex-col gap-4"
              >
                {/* Header row */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span
                      aria-hidden="true"
                      className="text-4xl flex-shrink-0"
                    >
                      {area.icon}
                    </span>
                    <h3 className="font-display text-xl font-semibold text-[var(--fg)]">
                      {area.title}
                    </h3>
                  </div>
                  <span
                    className={`inline-flex flex-shrink-0 items-center px-3 py-1 rounded-full text-xs font-semibold ${statusStyles[area.status]}`}
                    aria-label={`Status: ${area.status}`}
                  >
                    {area.status}
                  </span>
                </div>

                <p className="text-sm text-[var(--fg-muted)] leading-relaxed">
                  {area.description}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── 3. R&D Philosophy ────────────────────────────────────────────── */}
      {/* Req 15.3: R&D philosophy section */}
      <section
        aria-labelledby="philosophy-heading"
        className="bg-[var(--bg)] py-16 md:py-24"
      >
        <div className="container-content">
          <div className="text-center mb-12">
            <h2
              id="philosophy-heading"
              className="font-display text-3xl sm:text-4xl font-semibold text-[var(--fg)] mb-4"
            >
              Our R&amp;D Philosophy
            </h2>
            <p className="text-lg text-[var(--fg-muted)] max-w-2xl mx-auto">
              How we decide what to research, and why.
            </p>
          </div>

          <ol
            className="grid grid-cols-1 md:grid-cols-2 gap-8 list-none p-0 m-0"
            aria-label="R&D philosophy principles"
          >
            {philosophyPrinciples.map((principle) => (
              <li
                key={principle.number}
                className="rounded-xl bg-[var(--bg-subtle)] border border-[var(--border)] p-8 flex flex-col gap-3"
              >
                <span
                  aria-hidden="true"
                  className="font-display text-4xl font-bold text-[var(--accent)] opacity-30"
                >
                  {principle.number}
                </span>
                <h3 className="font-display text-xl font-semibold text-[var(--fg)]">
                  {principle.title}
                </h3>
                <p className="text-sm text-[var(--fg-muted)] leading-relaxed">
                  {principle.description}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── 4. CTA to Products and Consultation ──────────────────────────── */}
      {/* Req 15.3: CTA to products and consultation */}
      <section
        aria-labelledby="future-tech-cta-heading"
        className="bg-[var(--bg-subtle)] border-t border-[var(--border)] py-16 md:py-24"
      >
        <div className="container-content">
          <div className="text-center mb-12">
            <h2
              id="future-tech-cta-heading"
              className="font-display text-3xl sm:text-4xl font-semibold text-[var(--fg)] mb-4"
            >
              Interested in What We Are Building?
            </h2>
            <p className="text-lg text-[var(--fg-muted)] max-w-xl mx-auto">
              Explore our product concepts, register your interest, or speak with our team
              about how our research might apply to your organisation.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <div className="text-center">
              <Link href="/businesses" className={primaryBtn}>
                View Our Businesses
              </Link>
              <p className="mt-2 text-xs text-[var(--fg-subtle)]">
                Rooftop Solar · FMCG · HRDS
              </p>
            </div>
            <div className="text-center">
              <Link href="/consultation" className={ghostBtn}>
                Book Consultation
              </Link>
              <p className="mt-2 text-xs text-[var(--fg-subtle)]">
                Free, no-obligation
              </p>
            </div>
          </div>

          {/* Knowledge Centre link */}
          <div className="mt-12 text-center">
            <p className="text-sm text-[var(--fg-muted)] mb-3">
              Want to go deeper on the technical fundamentals?
            </p>
            <Link
              href="/resources"
              className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] rounded-sm"
            >
              Explore Resources →
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
}
