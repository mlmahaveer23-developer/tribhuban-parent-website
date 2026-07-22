import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE_URL } from '@/lib/siteConfig';
import LeadershipCylinder from '@/components/motion/LeadershipCylinder';
import ScrollReveal from '@/components/motion/ScrollReveal';
import StaggerGroup from '@/components/motion/StaggerGroup';
import AboutCounters from '@/components/marketing/AboutCounters';

// ── JSON-LD ───────────────────────────────────────────────────────────────────

const aboutPageJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  name: 'About Tribhuban Concepts',
  url: `${SITE_URL}/about`,
  description:
    'Learn about Tribhuban Concepts — an Indian technology and energy startup founded in 2026.',
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

const leaders = [
  {
    initials: 'CEO',
    name: 'Pithabas Bindhani',
    role: 'CEO & CMD',
    bio: 'Leads Tribhuban Concepts with a vision to build technology-driven solutions that create long-term value for people, businesses, and communities.',
  },
  {
    initials: 'COO',
    name: 'Sachindra Nath Mundaluhari',
    role: 'Chief Operating Officer',
    bio: 'Oversees operations, execution, and project coordination across the organization, ensuring every initiative is delivered with consistency and accountability.',
  },
  {
    initials: 'CFO',
    name: 'Amit Tyagi',
    role: 'Chief Financial Officer',
    bio: 'Leads financial planning and organizational sustainability, supporting responsible decision-making and building a strong financial foundation for the company.',
  },
] as const;

const personsJsonLd = {
  '@context': 'https://schema.org',
  '@graph': leaders.map((l) => ({
    '@type': 'Person',
    name: l.name,
    jobTitle: l.role,
    worksFor: { '@type': 'Organization', name: 'Tribhuban Concepts', url: SITE_URL },
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
      description: 'Our mission, values, leadership, and sustainability commitment.',
      siteName: 'Tribhuban Concepts',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'About — Tribhuban Concepts',
      description: 'Our mission, values, leadership, and sustainability commitment.',
    },
  };
}

export const revalidate = false;

// ── Static data ───────────────────────────────────────────────────────────────

const pillars = [
  {
    number: '01',
    title: 'Integration',
    body: 'We unite solar energy, digital infrastructure, and engineering into a single, coherent system — removing the silos that slow progress.',
  },
  {
    number: '02',
    title: 'Innovation',
    body: 'Every challenge is a design problem. We apply rigorous engineering thinking and emerging technology to find solutions that last.',
  },
  {
    number: '03',
    title: 'Integrity',
    body: 'Trust is built through consistent delivery. We say what we will do, do what we say, and take responsibility when things need to change.',
  },
] as const;

const domains = [
  {
    tag: 'Energy',
    headline: 'Solar & Renewables',
    detail:
      'From rooftop solar for homes to commercial-scale installations, we design, engineer, and commission clean energy systems built to last decades.',
  },
  {
    tag: 'Technology',
    headline: 'Digital Infrastructure',
    detail:
      'Intelligent platforms that connect energy assets, automate reporting, and make clean-energy data useful — for operators, investors, and end users.',
  },
  {
    tag: 'Engineering',
    headline: 'Systems Engineering',
    detail:
      'Rigorous mechanical and electrical engineering underpins everything we build. Reliability is not a feature — it is the baseline.',
  },
] as const;

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AboutPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutPageJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personsJsonLd) }} />

      <main id="main-content" className="about-page">

        {/* ════════════════════════════════════════════════════════════════════
            §1  HERO — full-viewport, scroll-invite
        ════════════════════════════════════════════════════════════════════ */}
        <section aria-label="About hero" className="about-hero">
          {/* Decorative radial glow */}
          <div className="about-hero__glow" aria-hidden="true" />

          <div className="container-content about-hero__inner">
            <ScrollReveal variant="clipUp" duration={0.7}>
              <p className="about-hero__eyebrow">About Tribhuban Concepts</p>
            </ScrollReveal>

            <ScrollReveal variant="fadeUp" delay={0.08} duration={0.75}>
              <h1 className="about-hero__title">
                Technology<br />
                <em className="about-hero__title-em">That Reaches</em><br />
                Everywhere
              </h1>
            </ScrollReveal>

            <ScrollReveal variant="fadeUp" delay={0.18} duration={0.65}>
              <p className="about-hero__sub">
                &ldquo;Tribhuban&rdquo; — Swarga, Martya, Patala. Heaven, Earth,
                Underworld. Together, everything. Our name is our ambition.
              </p>
            </ScrollReveal>

            <ScrollReveal variant="fadeUp" delay={0.28} duration={0.55}>
              <div className="about-hero__actions">
                <Link href="/consultation" className="btn-primary">
                  Book a Consultation
                </Link>
                <Link href="/solar" className="btn-ghost">
                  Explore Solar
                </Link>
              </div>
            </ScrollReveal>
          </div>

          {/* Scroll cue */}
          <div className="about-hero__scroll-cue" aria-hidden="true">
            <span className="about-hero__scroll-line" />
            <span className="about-hero__scroll-label">Scroll</span>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════════
            §2  ORIGIN STATEMENT — large editorial text
        ════════════════════════════════════════════════════════════════════ */}
        <section aria-label="Our origin" className="about-origin">
          <div className="container-content about-origin__inner">
            <ScrollReveal variant="fadeLeft" duration={0.6}>
              <span className="about-origin__label">The Idea</span>
            </ScrollReveal>
            <ScrollReveal variant="fadeUp" delay={0.1} duration={0.7}>
              <blockquote className="about-origin__quote">
                We started with a simple conviction: clean energy and intelligent
                technology should work together, not in parallel — and every Indian
                home and business deserves access to both.
              </blockquote>
            </ScrollReveal>
            <ScrollReveal variant="fadeUp" delay={0.2} duration={0.6}>
              <p className="about-origin__body">
                Founded in 2026, Tribhuban Concepts began as an engineering practice
                with a focused thesis — that the renewable energy transition in India
                would only succeed if supported by equally strong digital and
                operational infrastructure. We set out to build exactly that.
              </p>
            </ScrollReveal>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════════
            §3  COUNTERS — animated proof points
        ════════════════════════════════════════════════════════════════════ */}
        <section aria-label="Key numbers" className="about-stats">
          <div className="container-content">
            <AboutCounters />
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════════
            §4  PILLARS — scroll-staggered cards, horizontal reveal
        ════════════════════════════════════════════════════════════════════ */}
        <section aria-label="Our values" className="about-pillars">
          <div className="container-content">
            <ScrollReveal variant="fadeUp">
              <div className="about-section-header">
                <span className="about-section-tag">Values</span>
                <h2 className="about-section-title">Built on three principles</h2>
              </div>
            </ScrollReveal>

            <StaggerGroup
              as="ul"
              variant="fadeUp"
              stagger={0.12}
              delay={0.1}
              className="about-pillars__grid"
            >
              {pillars.map((p) => (
                <li key={p.number} className="about-pillar-card">
                  <span className="about-pillar-card__number" aria-hidden="true">{p.number}</span>
                  <h3 className="about-pillar-card__title">{p.title}</h3>
                  <p className="about-pillar-card__body">{p.body}</p>
                  {/* Hover accent line */}
                  <span className="about-pillar-card__line" aria-hidden="true" />
                </li>
              ))}
            </StaggerGroup>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════════
            §5  DOMAINS — sticky scroll narrative panels
        ════════════════════════════════════════════════════════════════════ */}
        <section aria-label="What we do" className="about-domains">
          <div className="container-content about-domains__inner">
            {/* Left: sticky heading */}
            <div className="about-domains__anchor">
              <ScrollReveal variant="fadeLeft" threshold={0.05}>
                <span className="about-section-tag">What We Do</span>
                <h2 className="about-section-title about-domains__headline">
                  Three domains.<br />One vision.
                </h2>
                <p className="about-domains__sub">
                  Each domain reinforces the others. Solar needs technology.
                  Technology needs engineering. Engineering needs purpose.
                </p>
              </ScrollReveal>
            </div>

            {/* Right: scrolling panels */}
            <div className="about-domains__panels">
              {domains.map((d, i) => (
                <ScrollReveal
                  key={d.tag}
                  variant="fadeUp"
                  delay={i * 0.1}
                  threshold={0.15}
                  className="about-domain-panel"
                >
                  <span className="about-domain-panel__tag">{d.tag}</span>
                  <h3 className="about-domain-panel__title">{d.headline}</h3>
                  <p className="about-domain-panel__body">{d.detail}</p>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════════
            §6  LEADERSHIP — 3D carousel
        ════════════════════════════════════════════════════════════════════ */}
        <section aria-label="Leadership" className="about-leadership">
          <div className="container-content">
            <ScrollReveal variant="fadeUp">
              <div className="about-section-header about-section-header--center">
                <span className="about-section-tag">People</span>
                <h2 className="about-section-title">The team behind the work</h2>
                <p className="about-leadership__sub">
                  A small, senior leadership team committed to building with
                  purpose. Click or use arrow keys to meet them.
                </p>
              </div>
            </ScrollReveal>
            <LeadershipCylinder leaders={leaders} />
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════════
            §7  SUSTAINABILITY — split layout
        ════════════════════════════════════════════════════════════════════ */}
        <section aria-label="Sustainability" className="about-sustain">
          <div className="container-content about-sustain__inner">
            <ScrollReveal variant="fadeLeft" className="about-sustain__text">
              <span className="about-section-tag">Sustainability</span>
              <h2 className="about-section-title">
                Responsibility is not optional
              </h2>
              <p className="about-sustain__body">
                Every system we design begins with an environmental constraint.
                We measure the impact of our work, publish what we find, and
                continuously raise the bar — because building clean energy
                infrastructure with a dirty footprint is a contradiction we
                refuse to accept.
              </p>
              <p className="about-sustain__body">
                Responsible sourcing, minimal-waste installation, and full
                end-of-life recycling pathways are not extras. They are
                engineering specifications.
              </p>
            </ScrollReveal>

            {/* Decorative accent block */}
            <ScrollReveal variant="scale" delay={0.15} className="about-sustain__visual" threshold={0.2}>
              <div className="about-sustain__card" aria-hidden="true">
                <div className="about-sustain__card-inner">
                  <span className="about-sustain__icon">🌿</span>
                  <p className="about-sustain__card-label">Net-positive design</p>
                  <p className="about-sustain__card-sub">Every watt counts</p>
                </div>
                {/* Radial ring decoration */}
                <div className="about-sustain__ring about-sustain__ring--1" />
                <div className="about-sustain__ring about-sustain__ring--2" />
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════════
            §8  CAREERS CTA — full-width, warm closing beat
        ════════════════════════════════════════════════════════════════════ */}
        <section aria-label="Join our team" className="about-cta">
          <div className="about-cta__glow" aria-hidden="true" />
          <div className="container-content about-cta__inner">
            <ScrollReveal variant="fadeUp" duration={0.65}>
              <h2 className="about-cta__title">
                Build the future<br />
                <em className="about-cta__title-em">with us.</em>
              </h2>
              <p className="about-cta__body">
                We are building a company where engineers, innovators, and
                operators can do the best work of their careers. If that
                resonates, let&apos;s talk.
              </p>
              <div className="about-cta__actions">
                <Link href="/careers" className="btn-primary">
                  View Open Roles
                </Link>
                <Link href="/contact" className="btn-ghost">
                  Get in Touch
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </section>

      </main>
    </>
  );
}
