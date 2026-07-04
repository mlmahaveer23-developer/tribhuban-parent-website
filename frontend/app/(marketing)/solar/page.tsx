import type { Metadata } from 'next';
import Link from 'next/link';

// ── SSG + ISR — revalidate every 6 hours (Req 3.1, 4.1) ──────────────────────
export const revalidate = 21600;

// ── JSON-LD structured data ───────────────────────────────────────────────────

const serviceJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Rooftop Solar Energy Solutions',
  provider: {
    '@type': 'Organization',
    name: 'Tribhuban Concepts',
    url: 'https://tribhubanconcepts.com',
  },
  description:
    'Precision-engineered rooftop solar systems for residential and commercial properties across India — designed, supplied, and commissioned.',
  url: 'https://tribhubanconcepts.com/solar',
  areaServed: {
    '@type': 'Country',
    name: 'India',
  },
  serviceType: 'Solar Energy Installation',
};

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: 'https://tribhubanconcepts.com/',
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Solar',
      item: 'https://tribhubanconcepts.com/solar',
    },
  ],
};

// ── Metadata ──────────────────────────────────────────────────────────────────

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Solar Energy Solutions — Tribhuban Concepts',
    description:
      'Power your home or business with precision-engineered rooftop solar. Explore how solar works, the installation process, benefits, and start your savings estimate.',
    alternates: { canonical: 'https://tribhubanconcepts.com/solar' },
    openGraph: {
      type: 'website',
      url: 'https://tribhubanconcepts.com/solar',
      title: 'Solar Energy Solutions — Tribhuban Concepts',
      description:
        'Precision-engineered rooftop solar systems for residential and commercial properties across India.',
      siteName: 'Tribhuban Concepts',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Solar Energy Solutions — Tribhuban Concepts',
      description:
        'Precision-engineered rooftop solar systems for residential and commercial properties across India.',
    },
  };
}

// ── Static content ────────────────────────────────────────────────────────────

const howSolarWorksSteps = [
  {
    step: '01',
    title: 'Sunlight to DC Power',
    description:
      'Solar panels (photovoltaic cells) convert sunlight directly into direct current (DC) electricity. The more sunlight that hits your panels, the more power they generate.',
  },
  {
    step: '02',
    title: 'DC to AC Conversion',
    description:
      'An inverter converts the DC electricity into alternating current (AC) — the standard form your home or business appliances and the grid use. Modern inverters are highly efficient.',
  },
  {
    step: '03',
    title: 'Power Your Load, Feed the Grid',
    description:
      'Your solar system powers your premises first. Any surplus is exported to the grid (net metering), earning you credits and reducing your bill to near zero on sunny days.',
  },
] as const;

const benefits = [
  {
    icon: '💰',
    title: 'Cut Your Electricity Bill',
    description:
      'Most residential systems achieve payback in 4–7 years. After that, power is effectively free for the remaining 20+ year lifespan of the panels.',
  },
  {
    icon: '🌍',
    title: 'Reduce Carbon Footprint',
    description:
      'A typical 5 kW system offsets around 4 tonnes of CO₂ per year — equivalent to planting 180 trees annually.',
  },
  {
    icon: '📈',
    title: 'Increase Property Value',
    description:
      'Properties with solar installations command higher resale and rental values. Solar is now a standard expectation in premium real estate.',
  },
  {
    icon: '⚡',
    title: 'Energy Independence',
    description:
      'Reduce dependence on grid outages and tariff hikes. With battery storage, you can power critical loads through the night.',
  },
] as const;

const processSteps = [
  {
    number: 1,
    title: 'Free Consultation',
    description:
      'Our engineers assess your site, usage profile, and roof orientation. You receive a personalised savings estimate — no obligation.',
  },
  {
    number: 2,
    title: 'System Design',
    description:
      'We design a system sized exactly for your load, using CAD tools and irradiance data for your specific location in India.',
  },
  {
    number: 3,
    title: 'Permits & Approvals',
    description:
      'We handle all discom applications, net-metering approvals, and structural sign-offs on your behalf.',
  },
  {
    number: 4,
    title: 'Installation',
    description:
      'Our certified technicians complete the installation in 1–3 days for residential systems, with zero disruption to your daily routine.',
  },
  {
    number: 5,
    title: 'Commissioning & Monitoring',
    description:
      'We commission the system, test every component, and hand you a monitoring dashboard so you can track generation and savings in real time.',
  },
] as const;

const solarStats = [
  { value: '500+', label: 'Installations Completed' },
  { value: '₹2 Cr+', label: 'Customer Savings Generated' },
  { value: '4,000+', label: 'Tonnes CO₂ Offset' },
] as const;

// ── Shared button styles ──────────────────────────────────────────────────────

const primaryBtn =
  'inline-flex items-center justify-center h-12 px-8 rounded-md text-base font-semibold bg-[var(--btn-primary-bg)] text-[var(--btn-primary-fg)] hover:bg-[var(--btn-primary-hover)] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]';

const ghostBtn =
  'inline-flex items-center justify-center h-12 px-8 rounded-md text-base font-semibold border border-[var(--border)] bg-transparent text-[var(--fg)] hover:bg-[var(--bg-muted)] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]';

// ── Page ──────────────────────────────────────────────────────────────────────

export default function SolarPage() {
  return (
    <>
      {/* JSON-LD structured data (Req 23.2) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <main id="main-content">

        {/* ── 1. Hero ──────────────────────────────────────────────────────── */}
        {/* Req 4.1: Solar overview hero */}
        <section
          aria-label="Solar energy hero"
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
                  <span aria-hidden="true" className="select-none text-[var(--fg-subtle)]">/</span>
                  <span aria-current="page" className="font-medium text-[var(--fg-muted)]">Solar</span>
                </li>
              </ol>
            </nav>

            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-wider text-[var(--accent)] mb-4">
                Solar Energy Solutions
              </p>
              <h1 className="font-display text-5xl sm:text-6xl font-semibold text-[var(--fg)] mb-6 leading-tight">
                Power Your Home with Solar
              </h1>
              <p className="text-xl text-[var(--fg-muted)] mb-10 leading-relaxed max-w-2xl">
                Precision-engineered rooftop solar systems that cut your electricity bill
                from day one. Designed, supplied, and commissioned by Tribhuban Concepts engineers
                — with transparent assumptions and a personalised savings estimate before you commit.
              </p>
              <div className="flex flex-col sm:flex-row items-start gap-4">
                <Link href="/consultation" className={primaryBtn}>
                  Book Free Consultation
                </Link>
                <Link href="/solar/calculator" className={ghostBtn}>
                  Calculate My Savings
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── 2. How Solar Works ───────────────────────────────────────────── */}
        {/* Req 4.1: How solar works section — 3 steps */}
        <section
          aria-labelledby="how-solar-works-heading"
          className="bg-[var(--bg-subtle)] border-y border-[var(--border)] py-16 md:py-24"
        >
          <div className="container-content">
            <div className="text-center mb-12">
              <h2
                id="how-solar-works-heading"
                className="font-display text-3xl sm:text-4xl font-semibold text-[var(--fg)] mb-4"
              >
                How Solar Works
              </h2>
              <p className="text-lg text-[var(--fg-muted)] max-w-2xl mx-auto">
                From sunlight to savings in three straightforward steps.
              </p>
            </div>
            <ol
              className="grid grid-cols-1 md:grid-cols-3 gap-8 list-none p-0 m-0"
              aria-label="How solar works steps"
            >
              {howSolarWorksSteps.map((step) => (
                <li
                  key={step.step}
                  className="rounded-xl bg-[var(--bg)] border border-[var(--border)] p-8 flex flex-col gap-4"
                >
                  <span
                    aria-hidden="true"
                    className="font-display text-4xl font-bold text-[var(--accent)] opacity-40"
                  >
                    {step.step}
                  </span>
                  <h3 className="font-display text-xl font-semibold text-[var(--fg)]">
                    {step.title}
                  </h3>
                  <p className="text-sm text-[var(--fg-muted)] leading-relaxed">
                    {step.description}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── 3. Benefits ──────────────────────────────────────────────────── */}
        {/* Req 4.1: Benefits section — 4 benefits with icons */}
        <section
          aria-labelledby="benefits-heading"
          className="bg-[var(--bg)] py-16 md:py-24"
        >
          <div className="container-content">
            <div className="text-center mb-12">
              <h2
                id="benefits-heading"
                className="font-display text-3xl sm:text-4xl font-semibold text-[var(--fg)] mb-4"
              >
                Why Go Solar
              </h2>
              <p className="text-lg text-[var(--fg-muted)] max-w-2xl mx-auto">
                Solar is the highest-return home improvement most Indian property owners can make right now.
              </p>
            </div>
            <ul
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 list-none p-0 m-0"
              role="list"
            >
              {benefits.map((benefit) => (
                <li
                  key={benefit.title}
                  className="rounded-xl bg-[var(--bg-subtle)] border border-[var(--border)] p-6 flex flex-col gap-3"
                >
                  <span aria-hidden="true" className="text-3xl">
                    {benefit.icon}
                  </span>
                  <h3 className="font-display text-lg font-semibold text-[var(--fg)]">
                    {benefit.title}
                  </h3>
                  <p className="text-sm text-[var(--fg-muted)] leading-relaxed">
                    {benefit.description}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── 4. Installation Process Steps ────────────────────────────────── */}
        {/* Req 4.1: ProcessSteps section */}
        <section
          aria-labelledby="process-heading"
          className="bg-[var(--bg-subtle)] border-y border-[var(--border)] py-16 md:py-24"
        >
          <div className="container-content">
            <div className="text-center mb-12">
              <h2
                id="process-heading"
                className="font-display text-3xl sm:text-4xl font-semibold text-[var(--fg)] mb-4"
              >
                Our Installation Process
              </h2>
              <p className="text-lg text-[var(--fg-muted)] max-w-2xl mx-auto">
                From first call to live system — a transparent, end-to-end process
                that puts you in control at every stage.
              </p>
            </div>
            <ol
              className="relative border-l border-[var(--border)] ml-4 md:ml-8 space-y-10 list-none p-0 m-0"
              aria-label="Installation process steps"
            >
              {processSteps.map((step) => (
                <li key={step.number} className="pl-10 relative">
                  {/* Step dot */}
                  <span
                    aria-hidden="true"
                    className="absolute -left-4 top-1 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent)] text-[var(--btn-primary-fg)] text-sm font-bold border-4 border-[var(--bg-subtle)]"
                  >
                    {step.number}
                  </span>
                  <h3 className="font-display text-xl font-semibold text-[var(--fg)] mb-2">
                    {step.title}
                  </h3>
                  <p className="text-[var(--fg-muted)] leading-relaxed">
                    {step.description}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── 5. Stat Band ─────────────────────────────────────────────────── */}
        {/* Req 4.1: StatBand — 3 solar stats */}
        <section
          aria-label="Solar statistics"
          className="bg-[var(--bg)] py-12 md:py-16"
        >
          <div className="container-content">
            <dl className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
              {solarStats.map((stat) => (
                <div key={stat.label}>
                  <dt className="sr-only">{stat.label}</dt>
                  <dd>
                    <span className="block font-display text-4xl font-semibold text-[var(--accent)]">
                      {stat.value}
                    </span>
                    <span className="block text-sm text-[var(--fg-muted)] mt-1">
                      {stat.label}
                    </span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* ── 6. Learning Hub & Calculator links ───────────────────────────── */}
        {/* Req 4.1: Links to Hub (/solar/learn) and Calculator (/solar/calculator) */}
        <section
          aria-labelledby="explore-heading"
          className="bg-[var(--bg-subtle)] border-y border-[var(--border)] py-16 md:py-24"
        >
          <div className="container-content">
            <div className="text-center mb-12">
              <h2
                id="explore-heading"
                className="font-display text-3xl sm:text-4xl font-semibold text-[var(--fg)] mb-4"
              >
                Go Deeper
              </h2>
              <p className="text-lg text-[var(--fg-muted)] max-w-xl mx-auto">
                Use our free calculator to get an instant estimate, or explore the Learning Hub
                to understand the fundamentals before you decide.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
              {/* Learning Hub card */}
              <div className="rounded-xl bg-[var(--bg)] border border-[var(--border)] p-8 flex flex-col gap-4">
                <span aria-hidden="true" className="text-4xl">📚</span>
                <h3 className="font-display text-2xl font-semibold text-[var(--fg)]">
                  Solar Learning Hub
                </h3>
                <p className="text-[var(--fg-muted)] leading-relaxed flex-1">
                  Deep dives on solar basics, economics, technology, and maintenance —
                  written by engineers for homeowners and business owners.
                </p>
                <Link
                  href="/solar/learn"
                  className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] rounded-sm"
                >
                  Explore the Hub →
                </Link>
              </div>
              {/* Calculator card */}
              <div className="rounded-xl bg-[var(--bg)] border border-[var(--border)] p-8 flex flex-col gap-4">
                <span aria-hidden="true" className="text-4xl">🔢</span>
                <h3 className="font-display text-2xl font-semibold text-[var(--fg)]">
                  Savings Calculator
                </h3>
                <p className="text-[var(--fg-muted)] leading-relaxed flex-1">
                  Enter your electricity bill or consumption, pick your state, and get an
                  instant estimate for system size, annual savings, and payback period.
                </p>
                <Link
                  href="/solar/calculator"
                  className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] rounded-sm"
                >
                  Calculate My Savings →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── 7. Consultation CTA ──────────────────────────────────────────── */}
        {/* Req 4.1: Final Consultation CTA */}
        <section
          aria-labelledby="solar-cta-heading"
          className="bg-[var(--bg)] py-16 md:py-24 border-t border-[var(--border)]"
        >
          <div className="container-content text-center max-w-2xl mx-auto">
            <h2
              id="solar-cta-heading"
              className="font-display text-3xl sm:text-4xl font-semibold text-[var(--fg)] mb-4"
            >
              Ready for Your Free Consultation?
            </h2>
            <p className="text-lg text-[var(--fg-muted)] mb-8 leading-relaxed">
              Our engineers will survey your rooftop, review your electricity usage, and
              deliver a site-specific proposal — with no obligation and no pressure.
            </p>
            <Link href="/consultation" className={primaryBtn}>
              Book Consultation
            </Link>
          </div>
        </section>

      </main>
    </>
  );
}
