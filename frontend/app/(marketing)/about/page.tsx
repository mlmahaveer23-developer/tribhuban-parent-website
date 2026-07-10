import type { Metadata } from 'next';
import Link from 'next/link';

// ── JSON-LD structured data ───────────────────────────────────────────────────

const aboutPageJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  name: 'About Tribhuban Concepts',
  url: '${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://tribhuban-parent-website.vercel.app'}/about',
  description:
    'Learn about Tribhuban Concepts — our mission, values, timeline, leadership, and sustainability commitment.',
};

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Tribhuban Concepts',
  url: '${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://tribhuban-parent-website.vercel.app'}',
  foundingDate: '2014',
  description:
    'Indian technology and engineering company specialising in solar energy and future technologies',
};

// ── Metadata ──────────────────────────────────────────────────────────────────

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'About — Tribhuban Concepts',
    description:
      'Learn about Tribhuban Concepts — an Indian technology and engineering company. Our mission, values, milestones, and the meaning of "Tribhuban".',
    alternates: { canonical: '${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://tribhuban-parent-website.vercel.app'}/about' },
    openGraph: {
      type: 'website',
      url: '${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://tribhuban-parent-website.vercel.app'}/about',
      title: 'About — Tribhuban Concepts',
      description:
        'Learn about Tribhuban Concepts — our mission, values, milestones, leadership, and sustainability commitment.',
      siteName: 'Tribhuban Concepts',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'About — Tribhuban Concepts',
      description:
        'Learn about Tribhuban Concepts — our mission, values, milestones, leadership, and sustainability commitment.',
    },
  };
}

// SSG — fully static, no ISR needed (Req 3.1)
export const revalidate = false;

// ── Static content ────────────────────────────────────────────────────────────

const values = [
  {
    icon: '🔗',
    title: 'Integration',
    description:
      'We connect solar, technology, and engineering into unified solutions — bridging domains that others treat in isolation.',
  },
  {
    icon: '💡',
    title: 'Innovation',
    description:
      'Every project is an opportunity to apply the latest engineering knowledge. We push the boundaries of what is possible today.',
  },
  {
    icon: '🎯',
    title: 'Integrity',
    description:
      'We say what we will do, and we do what we say. Our clients trust us with their homes, businesses, and energy futures.',
  },
] as const;

const milestones = [
  {
    year: '2014',
    title: 'Founded',
    description:
      'Tribhuban Concepts was established with a mission to make clean energy engineering accessible across India.',
  },
  {
    year: '2017',
    title: 'First Solar Project',
    description:
      'Commissioned our first rooftop solar installation, laying the foundation for a 500+ project portfolio.',
  },
  {
    year: '2021',
    title: 'Future Tech Division',
    description:
      'Launched a dedicated R&D division to explore energy storage, AI-driven grid management, and next-generation materials.',
  },
  {
    year: '2024',
    title: 'AI Integration',
    description:
      'Integrated AI-powered solar estimation and energy optimisation tools into our core offering, serving residential and commercial clients.',
  },
] as const;

// PersonCard placeholder data
const leaders = [
  {
    initials: 'TC',
    name: 'Founder & CEO',
    role: 'Founder & Chief Executive Officer',
    bio: 'A mechanical engineer with 10+ years of experience in renewable energy systems across India. Leads Tribhuban Concepts with a focus on sustainable growth and engineering excellence.',
  },
  {
    initials: 'CTO',
    name: 'Chief Technology Officer',
    role: 'Chief Technology Officer',
    bio: 'Drives the technology vision for solar engineering and future technologies. Specialist in AI-driven energy systems and grid optimisation at scale.',
  },
] as const;

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
      {/* Avatar placeholder */}
      <div
        aria-hidden="true"
        className="w-16 h-16 rounded-full bg-[var(--bg-muted)] flex items-center justify-center"
        style={{
          background: 'linear-gradient(135deg, var(--accent-light) 0%, var(--bg-muted) 100%)',
        }}
      >
        <span className="text-sm font-bold text-[var(--accent)]">{initials}</span>
      </div>
      <div>
        <h3 className="font-display text-lg font-semibold text-[var(--fg)]">{name}</h3>
        <p className="text-sm text-[var(--accent)] font-medium mt-0.5">{role}</p>
      </div>
      <p className="text-sm text-[var(--fg-muted)] leading-relaxed">{bio}</p>
    </article>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AboutPage() {
  return (
    <>
      {/* JSON-LD structured data (Req 23.1, 23.2) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutPageJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />

      <main id="main-content">

        {/* ── 1. Brand story ───────────────────────────────────────────────── */}
        {/* Req 1.2a: Brand story — meaning of "Tribhuban" */}
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
              For us, it is a statement of intent. We build technology that reaches
              every tier of society — from the rooftop of a Mumbai apartment block to
              the grid infrastructure connecting rural India. Solar energy, future
              technologies, and engineering excellence, delivered without compromise.
            </p>
          </div>
        </section>

        {/* ── 2. Mission & values ──────────────────────────────────────────── */}
        {/* Req 1.2b: Mission & values — 3 values */}
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
                Our mission is to make clean, intelligent energy infrastructure available
                to every Indian home and business — and to do it with integrity.
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

        {/* ── 3. Timeline ──────────────────────────────────────────────────── */}
        {/* Req 1.2c: Timeline — 4 milestones */}
        <section
          aria-label="Our milestones"
          className="bg-[var(--bg)] py-16 md:py-24"
        >
          <div className="container-content">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[var(--fg)] mb-4">
                Our Journey
              </h2>
              <p className="text-lg text-[var(--fg-muted)] max-w-xl mx-auto">
                From a single installation to an integrated engineering company —
                ten years of building what matters.
              </p>
            </div>
            <ol
              className="relative border-l border-[var(--border)] ml-4 md:ml-8 space-y-10 list-none p-0 m-0"
              aria-label="Company milestones timeline"
            >
              {milestones.map((milestone) => (
                <li key={milestone.year} className="pl-8 relative">
                  {/* Timeline dot */}
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
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── 4. Leadership grid ───────────────────────────────────────────── */}
        {/* Req 1.2d: Leadership grid — 2 placeholder PersonCards */}
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
                The team behind the engineering.
              </p>
            </div>
            <ul
              className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-2xl mx-auto list-none p-0 m-0"
              role="list"
            >
              {leaders.map((leader) => (
                <li key={leader.role}>
                  <PersonCard
                    initials={leader.initials}
                    name={leader.name}
                    role={leader.role}
                    bio={leader.bio}
                  />
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── 5. Sustainability commitment ─────────────────────────────────── */}
        {/* Req 1.2e: Sustainability commitment */}
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
              Every Tribhuban Concepts project is designed with environmental impact
              as a first-order constraint, not an afterthought. Our solar installations
              have collectively offset thousands of tonnes of CO₂ — and we measure,
              publish, and continuously improve that figure.
            </p>
            <p className="text-lg text-[var(--fg-muted)] leading-relaxed text-center">
              We are committed to responsible sourcing, minimal-waste installation
              practices, and full end-of-life recycling pathways for every system we
              commission. Sustainability is not a marketing claim — it is an engineering
              specification.
            </p>
          </div>
        </section>

        {/* ── 6. Careers CTA ───────────────────────────────────────────────── */}
        {/* Req 1.2f: Careers CTA → /careers */}
        <section
          aria-label="Join our team"
          className="bg-[var(--bg-subtle)] border-t border-[var(--border)] py-16 md:py-24"
        >
          <div className="container-content text-center max-w-2xl mx-auto">
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[var(--fg)] mb-4">
              Join the Team
            </h2>
            <p className="text-lg text-[var(--fg-muted)] mb-8">
              We are always looking for engineers, technologists, and operators who
              share our passion for clean energy and innovation. See what
              opportunities are open.
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
