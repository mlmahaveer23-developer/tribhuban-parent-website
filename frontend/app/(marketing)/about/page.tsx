import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE_URL } from '@/lib/siteConfig';
import ScrollReveal from '@/components/motion/ScrollReveal';
import StaggerGroup from '@/components/motion/StaggerGroup';
import LeadershipCylinder from '@/components/motion/LeadershipCylinder';
import AboutCounters from '@/components/marketing/AboutCounters';
import AboutHeroMandala from '@/components/marketing/AboutHeroMandala';
import AboutMarquee from '@/components/marketing/AboutMarquee';
import AboutTimeline from '@/components/marketing/AboutTimeline';

// ── Structured data ───────────────────────────────────────────────────────────

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
    bio: 'Oversees operations and project coordination across the organisation, ensuring every initiative is delivered with consistency and accountability.',
  },
  {
    initials: 'CFO',
    name: 'Amit Tyagi',
    role: 'Chief Financial Officer',
    bio: 'Leads financial planning and organisational sustainability, supporting responsible decision-making and a strong financial foundation.',
  },
] as const;

const jsonLd = {
  aboutPage: {
    '@context': 'https://schema.org', '@type': 'AboutPage',
    name: 'About Tribhuban Concepts', url: `${SITE_URL}/about`,
    description: 'Indian technology and energy startup founded in 2026. Mission, values, leadership, and sustainability.',
  },
  org: {
    '@context': 'https://schema.org', '@type': 'Organization',
    name: 'Tribhuban Concepts', url: SITE_URL, foundingDate: '2026',
    description: 'Building solutions across renewable energy, digital infrastructure, and engineering.',
  },
  persons: {
    '@context': 'https://schema.org',
    '@graph': leaders.map(l => ({
      '@type': 'Person', name: l.name, jobTitle: l.role,
      worksFor: { '@type': 'Organization', name: 'Tribhuban Concepts', url: SITE_URL },
    })),
  },
};

// ── Metadata ──────────────────────────────────────────────────────────────────

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'About — Tribhuban Concepts',
    description: 'Learn about Tribhuban Concepts — our mission, values, leadership, and sustainability commitment.',
    alternates: { canonical: `${SITE_URL}/about` },
    openGraph: {
      type: 'website', url: `${SITE_URL}/about`,
      title: 'About — Tribhuban Concepts',
      description: 'Our mission, values, leadership, and sustainability commitment.',
      siteName: 'Tribhuban Concepts',
    },
    twitter: {
      card: 'summary_large_image', title: 'About — Tribhuban Concepts',
      description: 'Our mission, values, leadership, and sustainability commitment.',
    },
  };
}

export const revalidate = false;

// ── Static content ────────────────────────────────────────────────────────────

const principles = [
  {
    num: '01', title: 'Integration',
    body: 'Solar energy, digital infrastructure, and systems engineering — unified into a single coherent solution. We eliminate the silos that slow progress.',
  },
  {
    num: '02', title: 'Innovation',
    body: 'Every challenge is a design problem. We apply rigorous engineering thinking and emerging technology to find solutions that stand the test of decades.',
  },
  {
    num: '03', title: 'Integrity',
    body: 'Trust is built through consistent delivery. We say what we will do, do what we say, and take responsibility when things need to change.',
  },
] as const;

const domains = [
  {
    tag: 'Domain 01', label: 'Solar & Renewables',
    headline: 'Clean energy systems built to last',
    body: 'From rooftop solar for homes to commercial-scale installations, we design, engineer, and commission clean energy systems with decades-long reliability as the baseline — not a bonus.',
    stat: '₹0 CO₂ compromise',
  },
  {
    tag: 'Domain 02', label: 'Digital Infrastructure',
    headline: 'Technology that makes energy data useful',
    body: 'Intelligent platforms that connect energy assets, automate reporting, and surface actionable insights — for operators, investors, and end users who need clarity, not complexity.',
    stat: 'Real-time visibility',
  },
  {
    tag: 'Domain 03', label: 'Systems Engineering',
    headline: 'Rigour at every level of the stack',
    body: 'Mechanical and electrical engineering underpins everything we build. Reliability is not a feature — it is the starting condition we refuse to compromise on.',
    stat: '100% specification-driven',
  },
] as const;

const beliefs = [
  { icon: '⚡', text: 'Clean energy is infrastructure, not a luxury product.' },
  { icon: '🔬', text: 'Rigorous engineering is the only shortcut that actually works.' },
  { icon: '🌐', text: 'Technology should serve people, not the other way around.' },
  { icon: '🤝', text: 'Long-term relationships outperform short-term transactions every time.' },
] as const;

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AboutPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd.aboutPage) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd.org) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd.persons) }} />

      <main id="main-content">

        {/* ══════════════════════════════════════════════════════════════════
            §1  HERO — full viewport, mandala, large editorial headline
        ══════════════════════════════════════════════════════════════════ */}
        <section aria-label="About Tribhuban Concepts" className="ab-hero">
          {/* Background grid lines */}
          <div className="ab-hero__grid" aria-hidden="true" />

          {/* Rotating mandala — right side */}
          <AboutHeroMandala />

          <div className="container-content ab-hero__inner">
            <ScrollReveal variant="clipUp" duration={0.65}>
              <p className="ab-eyebrow">
                <span className="ab-eyebrow__line" aria-hidden="true" />
                About Tribhuban Concepts
              </p>
            </ScrollReveal>

            <ScrollReveal variant="fadeUp" delay={0.07} duration={0.8}>
              <h1 className="ab-hero__title">
                Technology<br />
                <em className="ab-hero__title-em">that reaches</em><br />
                <span className="ab-hero__title-span">everywhere.</span>
              </h1>
            </ScrollReveal>

            <ScrollReveal variant="fadeUp" delay={0.17} duration={0.65}>
              <p className="ab-hero__desc">
                &ldquo;Tribhuban&rdquo; — three realms: Swarga, Martya, Patala.
                Heaven, Earth, Underworld. Together, everything.
                Our name is not a brand exercise — it is an engineering ambition.
              </p>
            </ScrollReveal>

            <ScrollReveal variant="fadeUp" delay={0.27} duration={0.55}>
              <div className="ab-hero__ctas">
                <Link href="/consultation" className="ab-btn-primary">
                  Book a Consultation
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </Link>
                <Link href="/solar" className="ab-btn-ghost">Explore Solar</Link>
              </div>
            </ScrollReveal>
          </div>

          {/* Scroll indicator */}
          <div className="ab-hero__scroll" aria-hidden="true">
            <span className="ab-hero__scroll-track">
              <span className="ab-hero__scroll-thumb" />
            </span>
            <span className="ab-hero__scroll-text">Scroll</span>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            §2  MARQUEE — kinetic brand strip
        ══════════════════════════════════════════════════════════════════ */}
        <AboutMarquee />

        {/* ══════════════════════════════════════════════════════════════════
            §3  CONVICTION — full-bleed editorial statement
        ══════════════════════════════════════════════════════════════════ */}
        <section aria-label="Our conviction" className="ab-conviction">
          <div className="container-content">
            <div className="ab-conviction__inner">
              <ScrollReveal variant="fadeLeft" duration={0.55} className="ab-conviction__label-wrap">
                <span className="ab-tag">The Conviction</span>
              </ScrollReveal>
              <ScrollReveal variant="clipUp" delay={0.1} duration={0.75}>
                <blockquote className="ab-conviction__quote">
                  Clean energy and intelligent technology should work together —
                  not in parallel silos. Every Indian home and business deserves
                  access to both. We set out to build exactly that.
                </blockquote>
              </ScrollReveal>
              <ScrollReveal variant="fadeUp" delay={0.2} duration={0.6}>
                <p className="ab-conviction__body">
                  Founded in 2026, Tribhuban Concepts began as a focused engineering
                  practice. We believed the renewable energy transition in India would
                  only succeed if supported by equally strong digital and operational
                  infrastructure. So we built the whole stack.
                </p>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            §4  COUNTERS — animated proof points
        ══════════════════════════════════════════════════════════════════ */}
        <section aria-label="By the numbers" className="ab-numbers">
          <div className="container-content">
            <ScrollReveal variant="fadeUp" className="ab-numbers__header">
              <span className="ab-tag">By the numbers</span>
              <h2 className="ab-section-title">Small team. High standards.</h2>
            </ScrollReveal>
            <AboutCounters />
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            §5  DOMAINS — three-domain split with hover depth
        ══════════════════════════════════════════════════════════════════ */}
        <section aria-label="What we do" className="ab-domains">
          <div className="container-content">
            <ScrollReveal variant="fadeUp" className="ab-domains__header">
              <span className="ab-tag">What We Do</span>
              <h2 className="ab-section-title">Three domains. One vision.</h2>
              <p className="ab-domains__sub">
                Each domain reinforces the others. Solar needs technology. Technology
                needs engineering. Engineering needs purpose.
              </p>
            </ScrollReveal>

            <div className="ab-domains__grid">
              {domains.map((d, i) => (
                <ScrollReveal key={d.tag} variant="fadeUp" delay={i * 0.1} threshold={0.12}>
                  <article className="ab-domain-card">
                    <div className="ab-domain-card__head">
                      <span className="ab-domain-card__tag">{d.tag}</span>
                      <span className="ab-domain-card__label">{d.label}</span>
                    </div>
                    <h3 className="ab-domain-card__title">{d.headline}</h3>
                    <p className="ab-domain-card__body">{d.body}</p>
                    <div className="ab-domain-card__foot">
                      <span className="ab-domain-card__stat">{d.stat}</span>
                      <span className="ab-domain-card__arrow" aria-hidden="true">→</span>
                    </div>
                    <span className="ab-domain-card__bar" aria-hidden="true" />
                  </article>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            §6  PRINCIPLES — numbered cards with bottom-line hover reveal
        ══════════════════════════════════════════════════════════════════ */}
        <section aria-label="Our principles" className="ab-principles">
          <div className="container-content">
            <ScrollReveal variant="fadeUp" className="ab-principles__header">
              <span className="ab-tag">Principles</span>
              <h2 className="ab-section-title">Built on three fundamentals</h2>
            </ScrollReveal>

            <StaggerGroup as="ul" variant="fadeUp" stagger={0.12} delay={0.1} className="ab-principles__grid">
              {principles.map((p) => (
                <li key={p.num} className="ab-principle-card">
                  <span className="ab-principle-card__num" aria-hidden="true">{p.num}</span>
                  <h3 className="ab-principle-card__title">{p.title}</h3>
                  <p className="ab-principle-card__body">{p.body}</p>
                  <span className="ab-principle-card__line" aria-hidden="true" />
                </li>
              ))}
            </StaggerGroup>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            §7  JOURNEY TIMELINE
        ══════════════════════════════════════════════════════════════════ */}
        <section aria-label="Our journey" className="ab-journey">
          <div className="container-content">
            <ScrollReveal variant="fadeUp" className="ab-journey__header">
              <span className="ab-tag">The Journey</span>
              <h2 className="ab-section-title">Where we&apos;ve been. Where we&apos;re going.</h2>
              <p className="ab-journey__sub">
                Every step since founding — building toward a company that matters.
              </p>
            </ScrollReveal>
            <AboutTimeline />
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            §8  BELIEFS — horizontal belief strip
        ══════════════════════════════════════════════════════════════════ */}
        <section aria-label="What we believe" className="ab-beliefs">
          <div className="container-content">
            <ScrollReveal variant="fadeUp" className="ab-beliefs__header">
              <span className="ab-tag">What We Believe</span>
              <h2 className="ab-section-title">Non-negotiables</h2>
            </ScrollReveal>
            <StaggerGroup as="ul" variant="scale" stagger={0.1} delay={0.1} className="ab-beliefs__list">
              {beliefs.map((b) => (
                <li key={b.text} className="ab-belief-item">
                  <span className="ab-belief-item__icon" aria-hidden="true">{b.icon}</span>
                  <p className="ab-belief-item__text">{b.text}</p>
                </li>
              ))}
            </StaggerGroup>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            §9  LEADERSHIP
        ══════════════════════════════════════════════════════════════════ */}
        <section aria-label="Leadership team" className="ab-leadership">
          <div className="container-content">
            <ScrollReveal variant="fadeUp" className="ab-leadership__header">
              <span className="ab-tag">People</span>
              <h2 className="ab-section-title">The team behind the work</h2>
              <p className="ab-leadership__sub">
                A senior, focused leadership team. Click cards or use arrow keys to explore.
              </p>
            </ScrollReveal>
            <LeadershipCylinder leaders={leaders} />
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            §10  SUSTAINABILITY — split with concentric rings
        ══════════════════════════════════════════════════════════════════ */}
        <section aria-label="Sustainability commitment" className="ab-sustain">
          <div className="container-content ab-sustain__inner">
            <ScrollReveal variant="fadeLeft" className="ab-sustain__text">
              <span className="ab-tag">Sustainability</span>
              <h2 className="ab-section-title">
                Responsibility is an<br />
                <em className="ab-sustain__em">engineering spec</em>
              </h2>
              <p className="ab-sustain__body">
                Every system we design begins with an environmental constraint — not
                as a marketing claim but as a first-order engineering requirement.
                We measure the impact of our work, publish what we find, and
                continuously raise the standard.
              </p>
              <p className="ab-sustain__body">
                Responsible sourcing, minimal-waste installation, and full end-of-life
                recycling pathways are built into the specification before the first
                drawing is made.
              </p>
              <Link href="/solar" className="ab-sustain__link">
                See our solar approach
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </Link>
            </ScrollReveal>

            <ScrollReveal variant="scale" delay={0.15} threshold={0.2} className="ab-sustain__visual">
              <div className="ab-sustain__orb" aria-hidden="true">
                <div className="ab-sustain__orb-core">
                  <span className="ab-sustain__orb-icon">🌿</span>
                  <p className="ab-sustain__orb-label">Net-positive<br />by design</p>
                </div>
                <div className="ab-sustain__ring ab-sustain__ring--1" />
                <div className="ab-sustain__ring ab-sustain__ring--2" />
                <div className="ab-sustain__ring ab-sustain__ring--3" />
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            §11  CLOSING CTA — full-bleed, warm
        ══════════════════════════════════════════════════════════════════ */}
        <section aria-label="Join our team" className="ab-cta">
          <div className="ab-cta__glow" aria-hidden="true" />
          <div className="ab-cta__grid-lines" aria-hidden="true" />
          <div className="container-content ab-cta__inner">
            <ScrollReveal variant="fadeUp" duration={0.7}>
              <p className="ab-eyebrow ab-eyebrow--center">
                <span className="ab-eyebrow__line" aria-hidden="true" />
                Join Us
                <span className="ab-eyebrow__line" aria-hidden="true" />
              </p>
              <h2 className="ab-cta__title">
                Build the future<br />
                <em className="ab-cta__title-em">with us.</em>
              </h2>
              <p className="ab-cta__body">
                We are building a company where engineers, innovators, and operators
                can do the best and most meaningful work of their careers. If that
                resonates, we want to hear from you.
              </p>
              <div className="ab-cta__actions">
                <Link href="/careers" className="ab-btn-primary">
                  View Open Roles
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </Link>
                <Link href="/contact" className="ab-btn-ghost">Get in Touch</Link>
              </div>
            </ScrollReveal>
          </div>
        </section>

      </main>
    </>
  );
}
