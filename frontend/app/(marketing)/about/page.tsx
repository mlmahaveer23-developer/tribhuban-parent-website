import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE_URL } from '@/lib/siteConfig';
import ScrollReveal from '@/components/motion/ScrollReveal';

// ── JSON-LD structured data ───────────────────────────────────────────────────

const aboutPageJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  name: 'About Tribhuban Concepts',
  url: `${SITE_URL}/about`,
  description:
    'Learn about Tribhuban Concepts — an Indian technology and energy startup founded in 2026. Our mission, values, leadership, and sustainability commitment.',
};

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Tribhuban Concepts',
  url: SITE_URL,
  foundingDate: '2026',
  description:
    'Indian technology startup building innovative solutions across renewable energy, digital infrastructure, engineering, and future-focused technologies.',
};

// ── Leadership Person structured data (AEO / SEO) ─────────────────────────────

const leaders = [
  {
    initials: 'CEO',
    name: 'Pithabas Bindhani',
    role: 'CEO & CMD',
    bio: 'Leads Tribhuban Concepts with a vision to build technology-driven solutions that create long-term value for people, businesses, and communities. He focuses on innovation, responsible growth, and advancing renewable energy through practical engineering.',
    // Social links: missing – update here when available
  },
  {
    initials: 'COO',
    name: 'Sachindra Nath Mundaluhari',
    role: 'Chief Operating Officer',
    bio: 'Oversees operations, execution, and project coordination across the organization. His focus is on building efficient processes, maintaining quality standards, and ensuring every initiative is delivered with consistency and accountability.',
    // Social links: missing
  },
  {
    initials: 'CFO',
    name: 'Amit Tyagi',
    role: 'Chief Financial Officer',
    bio: 'Leads financial planning and organizational sustainability, supporting responsible decision-making and long-term growth while helping build a strong financial foundation for the company.',
    // Social links: missing
  },
] as const;

const personsJsonLd = {
  '@context': 'https://schema.org',
  '@graph': leaders.map((leader) => ({
    '@type': 'Person',
    name: leader.name,
    jobTitle: leader.role,
    worksFor: {
      '@type': 'Organization',
      name: 'Tribhuban Concepts',
      url: SITE_URL,
    },
    // sameAs: []  // TODO: add social profile URLs when available
  })),
};

// ── Metadata ──────────────────────────────────────────────────────────────────

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'About — Tribhuban Concepts',
    description:
      'Learn about Tribhuban Concepts — an Indian technology and energy startup founded in 2026. Our mission, values, leadership, and sustainability commitment.',
    alternates: { canonical: `${SITE_URL}/about` },
    openGraph: {
      type: 'website',
      url: `${SITE_URL}/about`,
      title: 'About — Tribhuban Concepts',
      description:
        'Learn about Tribhuban Concepts — our mission, values, leadership, and sustainability commitment.',
      siteName: 'Tribhuban Concepts',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'About — Tribhuban Concepts',
      description:
        'Learn about Tribhuban Concepts — our mission, values, leadership, and sustainability commitment.',
    },
  };
}

// SSG — fully static, no ISR needed
export const revalidate = false;

// ── Static content ────────────────────────────────────────────────────────────

const values = [
  {
    icon: '🔗',
    title: 'Integration',
    description:
      'We bring together technology, renewable energy, engineering, and operations to create connected solutions that solve real-world challenges.',
  },
  {
    icon: '💡',
    title: 'Innovation',
    description:
      'We continuously explore better ways to solve problems through thoughtful engineering, modern technologies, and a culture of continuous learning.',
  },
  {
    icon: '🎯',
    title: 'Integrity',
    description:
      'We build trust through honesty, accountability, and responsible decision-making. Every relationship is founded on transparency and long-term commitment.',
  },
] as const;

const milestone = {
  year: '2026',
  title: 'Founded',
  description:
    'Tribhuban Concepts was founded to develop innovative solutions in renewable energy, engineering, and digital technologies. From day one, our focus has been on creating meaningful impact through responsible innovation and customer-centric thinking.',
} as const;

// ── Reusable PersonCard ───────────────────────────────────────────────────────

function PersonCard({
  initials,
  name,
  role,
  bio,
}: {
  initials: string;
  name: string;
  role: string;
  bio: string;
}) {
  return (
    <article className="rounded-xl bg-[var(--bg-subtle)] border border-[var(--border)] p-6 flex flex-col gap-4">
      {/* Avatar placeholder – modern typographic style */}
      <div
        aria-hidden="true"
        className="w-16 h-16 rounded-xl bg-gradient-to-br from-[var(--accent)]/20 to-[var(--accent-light)]/20 flex items-center justify-center"
      >
        <span className="text-3xl font-bold bg-gradient-to-br from-[var(--accent)] to-[var(--accent-light)] bg-clip-text text-transparent">
          {initials}
        </span>
      </div>
      <div>
        <h3 className="font-display text-lg font-semibold text-[var(--fg)]">{name}</h3>
        <p className="text-sm text-[var(--accent)] font-medium mt-0.5">{role}</p>
      </div>
      <p className="text-sm text-[var(--fg-muted)] leading-relaxed">{bio}</p>
      {/* Social links placeholder – intentionally left empty until real URLs are available */}
    </article>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AboutPage() {
  return (
    <>
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutPageJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personsJsonLd) }}
      />

      <main id="main-content">
        {/* ── 1. Brand story ───────────────────────────────────────────────── */}
        <section
          aria-label="Our story"
          className="bg-[var(--bg)] py-20 md:py-32"
        >
          <div className="container-content max-w-3xl mx-auto text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-[var(--accent)] mb-4">
              Our Story
            </p>
            <h1 className="font-display text-5xl sm:text-6xl font-semibold text-[var(--fg)] mb-6 leading-tight">
              Technology That Reaches Everywhere
            </h1>
            <p className="text-xl text-[var(--fg-muted)] mb-8 leading-relaxed">
              &ldquo;Tribhuban&rdquo; means the three realms — Swarga (Heaven), Martya
              (Earth), and Patala (the Underworld). Together they represent everything,
              everywhere.
            </p>
            <p className="text-lg text-[var(--fg-muted)] leading-relaxed">
              For us, it represents the ambition to build technology that creates
              meaningful impact across every level of society. Beginning with renewable
              energy and digital innovation, we are developing practical solutions that
              help individuals, businesses, and communities embrace a more sustainable
              and technology-enabled future.
            </p>
          </div>
        </section>

        {/* ── 2. Mission & values ──────────────────────────────────────────── */}
        <section
          aria-label="Mission and values"
          className="bg-[var(--bg-subtle)] border-y border-[var(--border)] py-16 md:py-24"
        >
          <div className="container-content">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[var(--fg)] mb-4">
                Mission &amp; Values
              </h2>
              <p className="text-lg text-[var(--fg-muted)] max-w-2xl mx-auto">
                Our mission is to develop reliable technology and renewable energy
                solutions that empower individuals, businesses, and communities across
                India. We believe innovation should be practical, accessible, and built
                on transparency, engineering excellence, and long-term trust.
              </p>
            </div>
            <ul
              className="grid grid-cols-1 md:grid-cols-3 gap-8 list-none p-0 m-0"
              role="list"
            >
              {values.map((value) => (
                <li
                  key={value.title}
                  className="rounded-xl bg-[var(--bg)] border border-[var(--border)] p-8 text-center"
                >
                  <span aria-hidden="true" className="text-4xl block mb-4">
                    {value.icon}
                  </span>
                  <h3 className="font-display text-xl font-semibold text-[var(--fg)] mb-3">
                    {value.title}
                  </h3>
                  <p className="text-sm text-[var(--fg-muted)] leading-relaxed">
                    {value.description}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── 3. Our beginning (single milestone) ──────────────────────────── */}
        <section
          aria-label="Our beginning"
          className="bg-[var(--bg)] py-16 md:py-24"
        >
          <div className="container-content">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[var(--fg)] mb-4">
                Where We Started
              </h2>
              <p className="text-lg text-[var(--fg-muted)] max-w-xl mx-auto">
                Every great journey begins with a single step. Here’s ours.
              </p>
            </div>
            <div className="flex justify-center">
              <div className="relative pl-8 md:pl-8 ml-4 md:ml-0 border-l border-[var(--border)] max-w-lg">
                <span
                  aria-hidden="true"
                  className="absolute -left-3 top-1.5 w-5 h-5 rounded-full bg-[var(--accent)] border-4 border-[var(--bg)] block"
                />
                <time
                  dateTime={milestone.year}
                  className="text-sm font-bold uppercase tracking-wider text-[var(--accent)] block mb-1"
                >
                  {milestone.year}
                </time>
                <h3 className="font-display text-xl font-semibold text-[var(--fg)] mb-2">
                  {milestone.title}
                </h3>
                <p className="text-[var(--fg-muted)] leading-relaxed">
                  {milestone.description}
                </p>
              </div>
            </div>
            <p className="text-center text-[var(--fg-muted)] mt-10 max-w-xl mx-auto">
              Our journey has just begun. As we grow, we remain committed to building
              trusted solutions, strong partnerships, and technologies that create
              lasting value for future generations.
            </p>
          </div>
        </section>

        {/* ── 4. Leadership grid with reveal animation ─────────────────────── */}
        <section
          aria-label="Leadership"
          className="bg-[var(--bg-subtle)] border-y border-[var(--border)] py-16 md:py-24"
        >
          <div className="container-content">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[var(--fg)] mb-4">
                Our Leadership
              </h2>
              <p className="text-lg text-[var(--fg-muted)] max-w-xl mx-auto">
                A leadership team committed to building an organization driven by
                innovation, responsibility, and long-term impact.
              </p>
            </div>
            <ul
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-4xl mx-auto list-none p-0 m-0"
              role="list"
            >
              {leaders.map((leader, index) => (
                <li key={leader.role}>
                  <ScrollReveal variant="fadeUp" delay={index * 0.1} duration={0.55}>
                    <PersonCard
                      initials={leader.initials}
                      name={leader.name}
                      role={leader.role}
                      bio={leader.bio}
                    />
                  </ScrollReveal>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── 5. Sustainability commitment ─────────────────────────────────── */}
        <section
          aria-label="Sustainability commitment"
          className="bg-[var(--bg)] py-16 md:py-24"
        >
          <div className="container-content max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <span aria-hidden="true" className="text-4xl block mb-4">
                🌿
              </span>
              <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[var(--fg)] mb-4">
                Our Commitment to Sustainability
              </h2>
            </div>
            <p className="text-lg text-[var(--fg-muted)] leading-relaxed mb-6 text-center">
              Sustainability is one of the principles guiding how we design products,
              deliver solutions, and make decisions. As we grow, we aim to reduce
              environmental impact through responsible engineering, efficient resource
              utilization, and continuous improvement.
            </p>
            <p className="text-lg text-[var(--fg-muted)] leading-relaxed text-center">
              We believe sustainability is achieved through consistent actions rather
              than promises. Our goal is to adopt responsible practices, encourage
              innovation, and contribute to a cleaner, more sustainable future as our
              capabilities continue to expand.
            </p>
          </div>
        </section>

        {/* ── 6. Careers CTA ───────────────────────────────────────────────── */}
        <section
          aria-label="Join our team"
          className="bg-[var(--bg-subtle)] border-t border-[var(--border)] py-16 md:py-24"
        >
          <div className="container-content text-center max-w-2xl mx-auto">
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[var(--fg)] mb-4">
              Join the Team
            </h2>
            <p className="text-lg text-[var(--fg-muted)] mb-8">
              As Tribhuban Concepts grows, we look forward to welcoming passionate
              engineers, designers, innovators, and problem solvers who want to build
              technology that creates meaningful impact. Explore future opportunities
              to grow with us.
            </p>
            <Link
              href="/careers"
              className="inline-flex items-center justify-center h-12 px-8 rounded-md text-base font-semibold bg-[var(--btn-primary-bg)] text-[var(--btn-primary-fg)] hover:bg-[var(--btn-primary-hover)] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]"
            >
              View Open Roles
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
