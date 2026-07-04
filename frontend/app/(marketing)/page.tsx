import type { Metadata } from 'next';
import Link from 'next/link';
import NewsletterForm from '@/components/forms/NewsletterForm';
import DecorativeMotif from '@/components/ui/DecorativeMotif';

// ── JSON-LD structured data ───────────────────────────────────────────────────

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Tribhuban Concepts',
  url: 'https://tribhubanconcepts.com',
  description:
    'Indian technology and engineering company specialising in solar energy and future technologies',
};

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Tribhuban Concepts',
  url: 'https://tribhubanconcepts.com',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://tribhubanconcepts.com/search?q={search_term_string}',
    },
    'query-input': 'required name=search_term_string',
  },
};

// ── Metadata ──────────────────────────────────────────────────────────────────

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Tribhuban Concepts — Technology That Reaches Everywhere',
    description:
      'Tribhuban Concepts is an Indian technology and engineering company specialising in solar energy and future technologies.',
    alternates: { canonical: 'https://tribhubanconcepts.com' },
    openGraph: {
      type: 'website',
      url: 'https://tribhubanconcepts.com',
      title: 'Tribhuban Concepts — Technology That Reaches Everywhere',
      description:
        'Indian technology and engineering company specialising in solar energy and future technologies.',
      siteName: 'Tribhuban Concepts',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Tribhuban Concepts — Technology That Reaches Everywhere',
      description:
        'Indian technology and engineering company specialising in solar energy and future technologies.',
    },
  };
}

// SSG + ISR — revalidate every hour (Req 3.1)
export const revalidate = 3600;

// ── Static content ────────────────────────────────────────────────────────────

const stats = [
  { value: '10+', label: 'Years Experience' },
  { value: '500+', label: 'Solar Installations' },
  { value: '₹2Cr+', label: 'Savings Generated' },
] as const;

const features = [
  {
    icon: '☀️',
    title: 'Solar Engineering',
    description:
      'Precision-engineered rooftop solar systems sized exactly for your energy needs — residential and commercial.',
  },
  {
    icon: '🔬',
    title: 'AI & Future Tech',
    description:
      "Investing in tomorrow's energy, AI, and sustainability breakthroughs before they become mainstream.",
  },
  {
    icon: '🏛️',
    title: 'Heritage + Innovation',
    description:
      'Five thousand years of Indian engineering tradition meeting modern computational design.',
  },
  {
    icon: '🌿',
    title: 'Sustainability',
    description:
      'Every project is measured against its carbon impact — we build green by default, not by exception.',
  },
] as const;

// Static placeholder articles for the featured content section (Req 1.5)
// When backend integration is live these will be fetched with a 5 s timeout.
const placeholderArticles = [
  {
    id: 1,
    tag: 'Solar',
    title: 'How Rooftop Solar Cuts Your Electricity Bill from Day One',
    excerpt:
      'A practical walkthrough of how grid-tied solar works, what a typical payback period looks like, and what to ask your installer.',
    href: '/blog',
  },
  {
    id: 2,
    tag: 'Future Tech',
    title: "AI in Energy Management: What's Possible Today",
    excerpt:
      "Machine learning is already optimising energy dispatch in commercial buildings. Here's how small businesses can benefit now.",
    href: '/blog',
  },
  {
    id: 3,
    tag: 'Sustainability',
    title: 'The Carbon Math Behind 500 Solar Installations',
    excerpt:
      'Aggregated data from our project portfolio shows that a single 5 kW residential system offsets around 4 tonnes of CO₂ per year.',
    href: '/blog',
  },
] as const;

// ── Shared button classes ─────────────────────────────────────────────────────

const primaryBtn =
  'inline-flex items-center justify-center h-12 px-8 rounded-md text-base font-semibold bg-[var(--btn-primary-bg)] text-[var(--btn-primary-fg)] hover:bg-[var(--btn-primary-hover)] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]';

const ghostBtn =
  'inline-flex items-center justify-center h-12 px-8 rounded-md text-base font-semibold border border-[var(--border)] bg-transparent text-[var(--fg)] hover:bg-[var(--bg-muted)] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]';

// ── Page ──────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <>
      {/* JSON-LD structured data (Req 23.1, 23.2) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />

      <main id="main-content">

        {/* ── 1. Hero ──────────────────────────────────────────────────────── */}
        {/* Req 1.1a: Hero — H1, subheading, two CTAs */}
        <section
          aria-label="Hero"
          className="bg-[var(--bg)] py-20 md:py-32"
        >
          <div className="container-content text-center">
            <h1 className="font-display text-5xl sm:text-6xl font-semibold text-[var(--fg)] mb-6 max-w-3xl mx-auto leading-tight">
              Technology That Reaches Everywhere
            </h1>
            <p className="text-lg text-[var(--fg-muted)] max-w-2xl mx-auto mb-10">
              Tribhuban Concepts is an Indian technology and engineering company
              bringing solar energy and future technologies to every home and business.
              Swarga. Martya. Patala.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {/* Primary CTA */}
              <Link href="/consultation" className={primaryBtn}>
                Book Consultation
              </Link>
              {/* Secondary ghost button CTA */}
              <Link href="/solar" className={ghostBtn}>
                Explore Solar
              </Link>
            </div>
          </div>
        </section>

        {/* ── 2. Trust / Stat band ─────────────────────────────────────────── */}
        {/* Req 1.1b: 3 stats */}
        <section
          aria-label="Key statistics"
          className="bg-[var(--bg-subtle)] border-y border-[var(--border)] py-12"
        >
          <div className="container-content">
            <dl className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
              {stats.map((stat) => (
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

        {/* ── 3. Solar highlight ───────────────────────────────────────────── */}
        {/* Req 1.1c: "Clean Energy, Clear Savings" section */}
        <section
          aria-label="Solar energy solutions"
          className="bg-[var(--bg)] py-16 md:py-24"
        >
          <div className="container-content grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[var(--fg)] mb-4">
                Clean Energy, Clear Savings
              </h2>
              <p className="text-lg text-[var(--fg-muted)] mb-6">
                We design, supply, and commission rooftop solar systems that cut
                your electricity bill from day one. With 500+ installations across
                India, our engineers size every system exactly for your load profile
                — and our calculator shows you the numbers before you commit.
              </p>
              <Link
                href="/solar"
                className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] rounded-sm"
              >
                Explore Solar →
              </Link>
            </div>
            {/* SVG decorative motif (§5.5 — replaces raster gradient placeholder) */}
            <DecorativeMotif
              variant="solar"
              className="rounded-xl h-64 md:h-80"
            />
          </div>
        </section>

        {/* ── 4. Future Technologies teaser ───────────────────────────────── */}
        {/* Req 1.1d: "Building What's Next" */}
        <section
          aria-label="Future technologies"
          className="bg-[var(--bg-subtle)] py-16 md:py-24"
        >
          <div className="container-content grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* SVG decorative motif (§5.5 — replaces raster gradient placeholder) */}
            <DecorativeMotif
              variant="tech"
              className="rounded-xl h-64 md:h-80 order-last md:order-first"
            />
            <div>
              <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[var(--fg)] mb-4">
                Building What&apos;s Next
              </h2>
              <p className="text-lg text-[var(--fg-muted)] mb-6">
                Beyond solar, our R&amp;D teams are pioneering energy storage, AI-driven
                grid optimisation, and sustainable materials. These are the technologies
                that will define the next decade of Indian infrastructure.
              </p>
              <Link
                href="/future-technologies"
                className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] rounded-sm"
              >
                Discover Future Technologies →
              </Link>
            </div>
          </div>
        </section>

        {/* ── 5. Why Tribhuban feature grid ───────────────────────────────── */}
        {/* Req 1.1e: 4 feature cards */}
        <section
          aria-label="Why Tribhuban Concepts"
          className="bg-[var(--bg)] py-16 md:py-24"
        >
          <div className="container-content">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[var(--fg)] mb-3">
                Why Tribhuban Concepts
              </h2>
              <p className="text-lg text-[var(--fg-muted)] max-w-xl mx-auto">
                Engineering excellence grounded in Indian heritage, driven by global ambition.
              </p>
            </div>
            <ul
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 list-none p-0 m-0"
              role="list"
            >
              {features.map((feature) => (
                <li
                  key={feature.title}
                  className="rounded-xl bg-[var(--bg-subtle)] border border-[var(--border)] p-6"
                >
                  <span aria-hidden="true" className="text-3xl mb-4 block">
                    {feature.icon}
                  </span>
                  <h3 className="font-display text-lg font-semibold text-[var(--fg)] mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-[var(--fg-muted)] leading-relaxed">
                    {feature.description}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── 6. Featured content section ─────────────────────────────────── */}
        {/*
          Req 1.1f & 1.5: "Latest Insights" — 3 static placeholder article cards
          linking to /blog. If fetch fails or times out, section is omitted.
          Currently uses static placeholder data since backend isn't integrated yet.
        */}
        <section
          aria-label="Latest insights"
          className="bg-[var(--bg-subtle)] py-16 md:py-24"
        >
          <div className="container-content">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-display text-3xl font-semibold text-[var(--fg)]">
                Latest Insights
              </h2>
              <Link
                href="/blog"
                className="text-sm font-semibold text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] rounded-sm"
              >
                View all →
              </Link>
            </div>
            <ul
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 list-none p-0 m-0"
              role="list"
            >
              {placeholderArticles.map((article) => (
                <li
                  key={article.id}
                  className="rounded-xl bg-[var(--bg)] border border-[var(--border)] overflow-hidden flex flex-col"
                >
                  {/* SVG decorative motif (§5.5 — article card placeholder) */}
                  <DecorativeMotif
                    variant="article"
                    className="h-44"
                  />
                  <div className="p-5 flex flex-col flex-1">
                    <span className="inline-block text-xs font-semibold uppercase tracking-wider text-[var(--accent)] mb-3">
                      {article.tag}
                    </span>
                    <h3 className="font-display text-base font-semibold text-[var(--fg)] mb-2 leading-snug">
                      {article.title}
                    </h3>
                    <p className="text-sm text-[var(--fg-muted)] leading-relaxed mb-4 flex-1">
                      {article.excerpt}
                    </p>
                    <Link
                      href={article.href}
                      className="text-sm font-semibold text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] rounded-sm"
                    >
                      Read more →
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── 7. Final CTA + Newsletter ────────────────────────────────────── */}
        {/* Req 1.1g: "Ready to get started?" with NewsletterForm */}
        <section
          aria-label="Get started"
          className="bg-[var(--bg)] py-16 md:py-24 border-t border-[var(--border)]"
        >
          <div className="container-content text-center max-w-2xl mx-auto">
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[var(--fg)] mb-4">
              Ready to get started?
            </h2>
            <p className="text-lg text-[var(--fg-muted)] mb-8">
              Book a free consultation with our engineers or subscribe to our newsletter
              for insights on solar, sustainability, and the technologies shaping tomorrow.
            </p>

            {/* Primary CTA */}
            <div className="mb-10">
              <Link href="/consultation" className={primaryBtn}>
                Book Consultation
              </Link>
            </div>

            {/* Divider */}
            <div className="relative my-8">
              <div aria-hidden="true" className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[var(--border)]" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-[var(--bg)] px-4 text-sm text-[var(--fg-subtle)]">
                  or stay in the loop
                </span>
              </div>
            </div>

            {/* Newsletter form */}
            <div className="max-w-sm mx-auto">
              <p className="text-sm font-semibold text-[var(--fg-muted)] mb-3">
                Get solar tips and technology updates
              </p>
              <NewsletterForm source="home_cta" />
            </div>
          </div>
        </section>

      </main>
    </>
  );
}
