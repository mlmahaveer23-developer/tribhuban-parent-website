import type { Metadata } from 'next';
import Link from 'next/link';
import { solarBlogPosts } from '@/lib/content/solar-blogs';

export const metadata: Metadata = {
  title: 'Knowledge Centre — Guides, Documentation & Resources',
  description: 'Step-by-step solar guides, technical documentation, datasheets, FAQs and downloadable resources from Tribhuban Concepts.',
  alternates: { canonical: 'https://tribhubanconcepts.com/knowledge' },
};

export const revalidate = 3600;

const guides = [
  { icon: '☀️', title: 'Complete Rooftop Solar Guide (Odisha 2026)', desc: 'Subsidies, ALMM compliance, ELBO regulations, net metering, and the full application process.', href: '/blog/complete-guide-rooftop-solar-odisha-2026', tag: 'Solar' },
  { icon: '🏛️', title: 'PM Surya Ghar & OASBY Subsidy Guide', desc: 'Detailed eligibility criteria, exact subsidy slabs, application walkthrough and KYC requirements.', href: '/blog/pm-surya-ghar-oasby-subsidy-guide', tag: 'Subsidies' },
  { icon: '💰', title: 'Solar ROI Calculator Guide', desc: 'How to interpret your ROI estimate, understand payback period, and model 25-year savings.', href: '/blog/rooftop-solar-roi-costs-savings-payback', tag: 'Finance' },
  { icon: '🔋', title: 'BESS & Hybrid Inverters: OERC 2026 Mandate', desc: 'When BESS is required, minimum capacities, cost impact, and how to size for peak-hour resilience.', href: '/blog/complete-guide-rooftop-solar-odisha-2026', tag: 'Technology' },
  { icon: '⚡', title: 'Net Metering in Odisha Explained', desc: 'DISCOM settlement, APPC rates, Group and Virtual Net Metering, and the annual year-end settlement.', href: '/blog/complete-guide-rooftop-solar-odisha-2026', tag: 'Regulations' },
  { icon: '🧮', title: 'How to Use the Solar ROI Calculator', desc: 'Step-by-step walkthrough of all inputs — customer category, bill, area, DISCOM, BESS and tariff.', href: '/solar/calculator', tag: 'Tools' },
];

const docs = [
  { icon: '📋', title: 'MNRE ALMM List-II — Solar Cell Compliance', desc: 'Understanding the June 2026 domestic cell mandate and how to verify module compliance.', tag: 'Compliance' },
  { icon: '📄', title: 'OERC Tariff Schedule FY 2026–27', desc: 'Full residential telescopic tariff slabs, fixed charges, and electricity duty rates for Odisha.', tag: 'Tariffs' },
  { icon: '📑', title: 'ELBO Contractor Licensing Requirements', desc: 'License categories, required equipment, personnel certifications, and renewal process.', tag: 'Licensing' },
  { icon: '🗂️', title: 'PM Surya Ghar Application Checklist', desc: 'Step-by-step documentation checklist to avoid KYC mismatches and subsidy rejection.', tag: 'Process' },
];

const downloads = [
  { icon: '📥', title: 'Solar Savings Brochure (PDF)', desc: 'Consumer-friendly guide to rooftop solar savings in Odisha. Share with homeowners.', tag: 'Brochure' },
  { icon: '📊', title: 'Subsidy Comparison Datasheet', desc: 'One-page comparison of PM Surya Ghar vs. OASBY slabs for 1 kW–5 kW+ systems.', tag: 'Datasheet' },
  { icon: '📐', title: 'System Sizing Quick Reference', desc: '1-page calculator reference card: bill → units → kW → area → cost → subsidy → payback.', tag: 'Reference' },
];

const faqSnippets = [
  { q: 'Who qualifies for the ₹1.38 Lakh combined subsidy?', href: '/support/faq' },
  { q: 'Is BESS mandatory for my rooftop solar system?', href: '/support/faq' },
  { q: 'How long does the full installation process take in Odisha?', href: '/support/faq' },
  { q: 'Can I use imported panels and still claim subsidies?', href: '/support/faq' },
  { q: 'What is net metering and how are year-end credits paid?', href: '/support/faq' },
];

export default function KnowledgePage() {
  return (
    <main id="main-content" className="bg-[var(--bg)]">

      {/* Hero */}
      <section className="bg-[var(--bg-subtle)] border-b border-[var(--border)] py-14 md:py-20">
        <div className="container-content">
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex items-center gap-1 text-sm text-[var(--fg-subtle)]" role="list">
              <li><Link href="/" className="hover:text-[var(--accent)] transition-colors">Home</Link></li>
              <li><span aria-hidden="true" className="mx-1">/</span><span aria-current="page" className="font-medium text-[var(--fg-muted)]">Knowledge Centre</span></li>
            </ol>
          </nav>
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-[var(--accent)] mb-3">📚 Resources</span>
            <h1 className="font-display text-4xl sm:text-5xl font-semibold text-[var(--fg)] mb-4">Knowledge Centre</h1>
            <p className="text-lg text-[var(--fg-muted)] leading-relaxed">
              Guides, documentation, datasheets, FAQs and downloadable resources — everything you need to make informed decisions about rooftop solar and Tribhuban Concepts products.
            </p>
          </div>
          {/* Quick nav */}
          <div className="flex flex-wrap gap-3 mt-8">
            {[
              { label: 'Guides', href: '#guides', icon: '📖' },
              { label: 'Documentation', href: '#docs', icon: '📋' },
              { label: 'FAQs', href: '/support/faq', icon: '❓' },
              { label: 'Downloads', href: '#downloads', icon: '📥' },
              { label: 'Blog', href: '/blog', icon: '✍️' },
            ].map(item => (
              <Link key={item.label} href={item.href} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border border-[var(--border)] bg-[var(--bg)] text-[var(--fg-muted)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all duration-150">
                <span aria-hidden="true">{item.icon}</span>{item.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Guides */}
      <section id="guides" className="container-content py-14 md:py-16" aria-labelledby="guides-heading">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 id="guides-heading" className="font-display text-2xl font-semibold text-[var(--fg)]">Guides</h2>
            <p className="text-sm text-[var(--fg-muted)] mt-1">Step-by-step guides for homeowners, businesses, and installers.</p>
          </div>
          <Link href="/blog" className="text-sm font-semibold text-[var(--accent)] hover:underline">View all blog →</Link>
        </div>
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 list-none p-0 m-0" role="list">
          {guides.map(guide => (
            <li key={guide.title}>
              <Link href={guide.href} className="group block rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] p-6 h-full flex flex-col gap-3 hover:border-[var(--accent)]/40 hover:shadow-[var(--shadow-md)] transition-all duration-200">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-2xl" aria-hidden="true">{guide.icon}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ background: 'rgba(180,83,9,0.08)', color: '#B45309', border: '1px solid rgba(180,83,9,0.15)' }}>{guide.tag}</span>
                </div>
                <h3 className="font-display text-sm font-semibold text-[var(--fg)] leading-snug group-hover:text-[var(--accent)] transition-colors">{guide.title}</h3>
                <p className="text-xs text-[var(--fg-muted)] leading-relaxed flex-1">{guide.desc}</p>
                <span className="text-xs font-semibold text-[var(--accent)]">Read guide →</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Documentation */}
      <section id="docs" className="bg-[var(--bg-subtle)] border-y border-[var(--border)] py-14 md:py-16" aria-labelledby="docs-heading">
        <div className="container-content">
          <div className="mb-8">
            <h2 id="docs-heading" className="font-display text-2xl font-semibold text-[var(--fg)]">Documentation</h2>
            <p className="text-sm text-[var(--fg-muted)] mt-1">Technical references, regulatory documents, and compliance guides.</p>
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 list-none p-0 m-0" role="list">
            {docs.map(doc => (
              <li key={doc.title} className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-6 flex gap-4 items-start">
                <span className="text-2xl shrink-0 mt-0.5" aria-hidden="true">{doc.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-display text-sm font-semibold text-[var(--fg)]">{doc.title}</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-[var(--bg-muted)] text-[var(--fg-subtle)]">{doc.tag}</span>
                  </div>
                  <p className="text-xs text-[var(--fg-muted)] leading-relaxed">{doc.desc}</p>
                  <Link href="/solar" className="inline-block mt-2 text-xs font-semibold text-[var(--accent)] hover:underline">View details →</Link>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* FAQs preview */}
      <section className="container-content py-14 md:py-16" aria-labelledby="faq-preview-heading">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 id="faq-preview-heading" className="font-display text-2xl font-semibold text-[var(--fg)]">Frequently Asked Questions</h2>
            <p className="text-sm text-[var(--fg-muted)] mt-1">Quick answers to the most common questions.</p>
          </div>
          <Link href="/support/faq" className="text-sm font-semibold text-[var(--accent)] hover:underline">View all FAQs →</Link>
        </div>
        <ul className="space-y-2 list-none p-0 m-0" role="list">
          {faqSnippets.map(faq => (
            <li key={faq.q}>
              <Link href={faq.href} className="flex items-center justify-between gap-4 rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] px-5 py-4 hover:border-[var(--accent)]/40 hover:bg-[var(--bg)] transition-all duration-150 group">
                <span className="text-sm font-medium text-[var(--fg)] group-hover:text-[var(--accent)] transition-colors">{faq.q}</span>
                <span className="shrink-0 text-[var(--accent)] text-lg" aria-hidden="true">→</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Downloads */}
      <section id="downloads" className="bg-[var(--bg-subtle)] border-y border-[var(--border)] py-14 md:py-16" aria-labelledby="downloads-heading">
        <div className="container-content">
          <div className="mb-8">
            <h2 id="downloads-heading" className="font-display text-2xl font-semibold text-[var(--fg)]">Downloads</h2>
            <p className="text-sm text-[var(--fg-muted)] mt-1">Brochures, datasheets, and quick-reference materials.</p>
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-3 gap-5 list-none p-0 m-0" role="list">
            {downloads.map(dl => (
              <li key={dl.title} className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-6 flex flex-col gap-3 text-center hover:border-[var(--accent)]/40 hover:shadow-[var(--shadow-sm)] transition-all duration-200">
                <span className="text-3xl mx-auto" aria-hidden="true">{dl.icon}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold self-center bg-[var(--bg-muted)] text-[var(--fg-subtle)]">{dl.tag}</span>
                <h3 className="font-display text-sm font-semibold text-[var(--fg)]">{dl.title}</h3>
                <p className="text-xs text-[var(--fg-muted)] leading-relaxed">{dl.desc}</p>
                <Link href="/consultation" className="mt-auto text-xs font-semibold text-[var(--accent)] hover:underline">Request via consultation →</Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Latest from blog */}
      <section className="container-content py-14 md:py-16" aria-labelledby="latest-heading">
        <div className="flex items-center justify-between mb-8">
          <h2 id="latest-heading" className="font-display text-2xl font-semibold text-[var(--fg)]">Latest from the Blog</h2>
          <Link href="/blog" className="text-sm font-semibold text-[var(--accent)] hover:underline">View all →</Link>
        </div>
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 list-none p-0 m-0" role="list">
          {solarBlogPosts.map(post => (
            <li key={post.slug}>
              <Link href={`/blog/${post.slug}`} className="group block rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] p-5 h-full flex flex-col gap-2 hover:shadow-[var(--shadow-md)] hover:-translate-y-0.5 transition-all duration-200">
                <div className="flex flex-wrap gap-1.5">
                  {post.tags.slice(0, 2).map(tag => <span key={tag} className="text-[10px] font-semibold text-[var(--accent)] uppercase tracking-wider">{tag}</span>)}
                </div>
                <h3 className="font-display text-sm font-semibold text-[var(--fg)] leading-snug group-hover:text-[var(--accent)] transition-colors">{post.title}</h3>
                <p className="text-xs text-[var(--fg-muted)] flex-1 leading-relaxed line-clamp-2">{post.excerpt}</p>
                <span className="text-xs text-[var(--fg-subtle)]">{post.readTime} min read</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* CTA */}
      <section className="bg-[var(--bg-subtle)] border-t border-[var(--border)] py-12 md:py-16">
        <div className="container-content text-center max-w-xl mx-auto">
          <h2 className="font-display text-2xl font-semibold text-[var(--fg)] mb-3">Ready to go solar?</h2>
          <p className="text-[var(--fg-muted)] mb-6">Use our calculator for an instant estimate, or book a free consultation with our engineers.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/solar/calculator" className="inline-flex items-center justify-center h-11 px-6 rounded-lg text-sm font-semibold bg-[var(--btn-primary-bg)] text-[var(--btn-primary-fg)] hover:bg-[var(--btn-primary-hover)] transition-colors">Try Solar Calculator</Link>
            <Link href="/consultation" className="inline-flex items-center justify-center h-11 px-6 rounded-lg text-sm font-semibold border border-[var(--border)] text-[var(--fg)] hover:bg-[var(--bg-muted)] transition-colors">Book Free Consultation</Link>
          </div>
        </div>
      </section>

    </main>
  );
}
