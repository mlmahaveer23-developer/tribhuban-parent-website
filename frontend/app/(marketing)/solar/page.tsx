import type { Metadata } from 'next';
import Link from 'next/link';
import ScrollReveal from '@/components/motion/ScrollReveal';
import StaggerGroup from '@/components/motion/StaggerGroup';
import SolarCalculatorPreview from '@/components/solar/SolarCalculatorPreview';
import SolarHeroVideo from '@/components/solar/SolarHeroVideo';

export const revalidate = 21600;

// ── JSON-LD ───────────────────────────────────────────────────────────────────

const serviceJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Rooftop Solar Energy Solutions',
  provider: { '@type': 'Organization', name: 'Tribhuban Concepts', url: 'https://tribhubanconcepts.com' },
  description: 'Precision-engineered rooftop solar systems for residential and commercial properties across India.',
  url: 'https://tribhubanconcepts.com/businesses/rooftop-solar',
  areaServed: { '@type': 'Country', name: 'India' },
  serviceType: 'Solar Energy Installation',
};

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://tribhubanconcepts.com/' },
    { '@type': 'ListItem', position: 2, name: 'Businesses', item: 'https://tribhubanconcepts.com/businesses' },
    { '@type': 'ListItem', position: 3, name: 'Rooftop Solar', item: 'https://tribhubanconcepts.com/businesses/rooftop-solar' },
  ],
};

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'What subsidies are available for rooftop solar in Odisha?', acceptedAnswer: { '@type': 'Answer', text: 'In Odisha, residential consumers can stack central PM Surya Ghar subsidies (up to ₹78,000) with state OASBY subsidies (up to ₹60,000), giving a maximum combined subsidy of ₹1,38,000 for a 3 kW system.' } },
    { '@type': 'Question', name: 'What is the payback period for rooftop solar?', acceptedAnswer: { '@type': 'Answer', text: 'With dual subsidies in Odisha, a 3 kW system can have a payback period as low as 2.5–3 years on a net investment of ₹42,000–₹57,000.' } },
    { '@type': 'Question', name: 'Can commercial consumers get solar subsidies?', acceptedAnswer: { '@type': 'Answer', text: 'PM Surya Ghar and OASBY subsidies apply exclusively to residential (LT-domestic) consumers. Commercial and industrial consumers are ineligible but benefit from 40% Year-1 accelerated depreciation and lower LCOE versus grid tariffs.' } },
  ],
};

// ── Metadata ──────────────────────────────────────────────────────────────────

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Rooftop Solar Energy Solutions — Tribhuban Concepts',
    description: 'Complete guide to rooftop solar in Odisha & India. PM Surya Ghar subsidies, OASBY top-up, ROI calculator, and free consultation from certified EPC engineers.',
    alternates: { canonical: 'https://tribhubanconcepts.com/businesses/rooftop-solar' },
    openGraph: {
      type: 'website', url: 'https://tribhubanconcepts.com/businesses/rooftop-solar',
      title: 'Rooftop Solar Energy Solutions — Tribhuban Concepts',
      description: 'Precision-engineered rooftop solar systems. Central + State subsidies up to ₹1.38 Lakh. Payback in under 3 years.',
      siteName: 'Tribhuban Concepts',
    },
    twitter: { card: 'summary_large_image', title: 'Rooftop Solar — Tribhuban Concepts', description: 'Central + State subsidies up to ₹1.38 Lakh. Payback in under 3 years.' },
  };
}

// ── Static data ───────────────────────────────────────────────────────────────

const howSolarWorksSteps = [
  { step: '01', icon: '🌤️', title: 'Sunlight to DC Power', description: 'Photovoltaic cells in your solar panels convert sunlight directly into DC electricity. India receives 4–7 peak sun hours per day — Odisha averages ~4.8 hours, making it excellent for solar.' },
  { step: '02', icon: '⚡', title: 'DC to AC Conversion', description: 'A grid-tied inverter converts DC into AC — the form your appliances use. For systems 5 kW+, OERC now mandates hybrid inverters with Battery Energy Storage Systems (BESS) for peak-hour resilience.' },
  { step: '03', icon: '🔄', title: 'Power Your Load, Export the Rest', description: 'Your system powers your premises first. Surplus is exported to the grid via net metering. Monthly credits carry forward; annual surpluses are paid at APPC rate (₹3.25–₹3.75/unit in Odisha).' },
] as const;

const customerCategories = [
  {
    type: 'Residential',
    emoji: '🏠',
    headline: 'Maximum subsidies, fastest payback',
    points: [
      'Central PM Surya Ghar subsidy: up to ₹78,000',
      'Odisha OASBY top-up: up to ₹60,000',
      'Combined maximum: ₹1,38,000',
      '3 kW system net investment: as low as ₹42,000',
      'Payback period: 2.5–3 years',
      'Collateral-free bank loans at ~7% for systems up to 3 kW',
    ],
    cta: { label: 'Calculate Residential Savings', href: '/businesses/rooftop-solar/solar-calculator?type=residential' },
    highlight: true,
  },
  {
    type: 'Commercial',
    emoji: '🏢',
    headline: 'Tax optimisation + LCOE savings',
    points: [
      'No DBT subsidies (PM Surya Ghar is residential only)',
      '40% Year-1 accelerated depreciation tax shield',
      'LCOE vs DISCOM grid: significant margin on HT tariff (₹5.85/kVAh)',
      'Non-DCR imported panels permissible',
      'Higher-wattage bifacial modules available',
    ],
    cta: { label: 'Commercial ROI Calculator', href: '/businesses/rooftop-solar/roi-calculator?type=commercial' },
    highlight: false,
  },
  {
    type: 'Industrial',
    emoji: '🏭',
    headline: 'Peak shaving + demand management',
    points: [
      'OERC HT tariff: 585 paise/kVAh (load factor < 60%)',
      'Heavy rebates for 80%+ monthly load factors',
      'Tri-Partite Agreements for overdrawal flexibility',
      'Solar hours incremental rate: ₹4.30/kVAh',
      'Custom BESS sizing for demand management',
    ],
    cta: { label: 'Industrial Assessment', href: '/consultation' },
    highlight: false,
  },
] as const;

const subsidyTable = [
  { capacity: '1 kW', central: '₹30,000', state: '₹25,000', combined: '₹55,000' },
  { capacity: '2 kW', central: '₹60,000', state: '₹50,000', combined: '₹1,10,000' },
  { capacity: '3 kW', central: '₹78,000', state: '₹60,000', combined: '₹1,38,000' },
  { capacity: '5 kW+', central: '₹78,000 (capped)', state: '₹60,000 (capped)', combined: '₹1,38,000' },
] as const;

const installationProcess = [
  { number: 1, title: 'Portal Registration', description: 'Consumer registers on pmsuryaghar.gov.in, linking Aadhaar and DISCOM consumer number. Critical: name on Aadhaar must exactly match electricity bill to avoid DBT rejection.' },
  { number: 2, title: 'Feasibility Approval', description: 'DISCOM approves the application. Odisha waived technical feasibility studies for systems up to 10 kW (July 2024), dramatically accelerating this phase.' },
  { number: 3, title: 'System Design & Procurement', description: 'Our engineers design your system using precise CAD tools and local irradiance data. All panels must be ALMM List-II compliant (domestic cell mandate from June 1, 2026).' },
  { number: 4, title: 'Installation by ELBO-Licensed Team', description: 'Our ELBO-licensed technicians complete installation in 1–3 days. Odisha strictly enforces ELBO regulations — we maintain all HT contractor licenses, SCC certifications, and IS 3043 earthing standards.' },
  { number: 5, title: 'DISCOM Inspection & Net Meter', description: 'DISCOM physically inspects the site, verifying ALMM serial numbers, cable sizing, and earthing documentation. Bi-directional net meter installed upon approval. System stays de-energized until meter is installed.' },
  { number: 6, title: 'Subsidy Disbursement (DBT)', description: 'DISCOM uploads commissioning certificate to the portal. Consumer provides a cancelled cheque. Subsidy deposited directly to Aadhaar-linked bank account via DBT. End-to-end timeline: 45–90 days.' },
] as const;

const netMeteringFacts = [
  { icon: '⚡', label: 'System range', value: '1 kWp – 500 kWp' },
  { icon: '📅', label: 'Billing cycle', value: 'Monthly settlement' },
  { icon: '🏦', label: 'Annual payout rate', value: '₹3.25–₹3.75 per unit (APPC)' },
  { icon: '🔋', label: 'BESS mandate', value: '5 kW+ systems (2 hrs storage)' },
  { icon: '🏗️', label: 'Group net metering', value: 'Same DISCOM area' },
  { icon: '🏢', label: 'Virtual net metering', value: 'Apartment complex sharing' },
] as const;

const successMetrics = [
  { value: '₹1.38L', label: 'Max combined subsidy (Odisha)', sub: 'PM Surya Ghar + OASBY' },
  { value: '2.6 Yrs', label: 'Typical payback (3 kW, Odisha)', sub: 'Based on ₹1,800/month bill' },
  { value: '25 Yrs', label: 'Panel operational lifespan', sub: 'With 0.5% annual degradation' },
  { value: '4.8 hrs', label: 'Avg peak sun hours', sub: 'Odisha irradiance profile' },
] as const;

const faqs = [
  { q: 'Who is eligible for PM Surya Ghar subsidies?', a: 'Individual residential households on LT-domestic connection. Group Housing Societies and RWAs are also eligible for common facility loads up to 500 kW (₹18,000/kW, capped at 3 kW per house). Commercial, industrial, and institutional consumers are not eligible.' },
  { q: 'What is the ALMM List-II mandate?', a: 'From June 1, 2026, all systems claiming PM Surya Ghar subsidies must use solar panels manufactured with domestically produced cells certified under MNRE\'s ALMM List-II. Using non-compliant panels results in immediate subsidy rejection — costing the consumer up to ₹1.38 Lakh.' },
  { q: 'Is BESS mandatory for all systems?', a: 'OERC mandates Battery Energy Storage Systems for Distributed Renewable Energy Systems of 5 kW and above. Systems up to 4 kW are standard on-grid. For 5–10 kW, a minimum 1 kW / 2 kWh BESS plus hybrid inverter is required.' },
  { q: 'How does net metering work in Odisha?', a: 'Excess solar power exported to TPWODL/TPSODL/TPCODL/TPNODL is credited monthly. Surplus units carry forward. At year-end (March 31), accumulated credits are monetised at the APPC rate (₹3.25–₹3.75/unit).' },
  { q: 'What is the "Give It Up" option?', a: 'Consumers who voluntarily forgo the central subsidy via the portal can use non-DCR (imported) panels. This is valid until March 31, 2027, and is useful for high-net-worth consumers wanting premium N-Type TOPCon or HJT modules or those facing DCR module supply delays.' },
] as const;

const solarBlogs = [
  { slug: 'complete-guide-rooftop-solar-odisha-2026', tag: 'Odisha Solar', title: 'Complete Guide to Rooftop Solar in Odisha (2026)', excerpt: 'Everything you need to know about solar installation in Odisha — subsidies, tariffs, ELBO compliance, ALMM List-II, and step-by-step application process.', readTime: 12, href: '/resources/blogs' },
  { slug: 'pm-surya-ghar-oasby-subsidy-guide', tag: 'Subsidies', title: 'PM Surya Ghar & Odisha OASBY: Subsidies, Eligibility & Application Guide', excerpt: 'Detailed breakdown of the dual-subsidy architecture — central DBT and state OASBY — with exact slabs, eligibility criteria, and application walkthrough.', readTime: 10, href: '/resources/blogs' },
  { slug: 'rooftop-solar-roi-costs-savings-payback', tag: 'Finance', title: 'Rooftop Solar ROI Explained: Costs, Savings & Long-Term Benefits', excerpt: 'Engineering-grade financial model: OERC telescopic tariffs, net investment after subsidies, payback calculation, 25-year savings projection, and CO₂ impact.', readTime: 9, href: '/resources/blogs' },
] as const;

const primaryBtn = 'inline-flex items-center justify-center h-12 px-8 rounded-md text-base font-semibold bg-[var(--btn-primary-bg)] text-[var(--btn-primary-fg)] hover:bg-[var(--btn-primary-hover)] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]';
const ghostBtn = 'inline-flex items-center justify-center h-12 px-8 rounded-md text-base font-semibold border border-[var(--border)] bg-transparent text-[var(--fg)] hover:bg-[var(--bg-muted)] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]';

// ── Page ──────────────────────────────────────────────────────────────────────

export default function SolarPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <main id="main-content">

        {/* ── HERO ─────────────────────────────────────────────────────────── */}
        {/*
          Background: autoplay muted looping mp4 video with WebP poster fallback.
          - object-fit: cover keeps video centered on all screen sizes
          - Dark gradient overlay ensures text readability over any video content
          - preload="none" defers network load until needed
          - playsInline enables inline playback on iOS (no fullscreen hijack)
          - All existing content, animations, and z-indexes are preserved
        */}
        <section
          aria-label="Solar hero"
          className="relative min-h-[60vh] md:min-h-[72vh] pt-16 pb-20 md:pt-24 md:pb-28 overflow-hidden bg-[#0e1a0e]"
        >
          {/* ── Video background ────────────────────────────────────────── */}
          <SolarHeroVideo />

          {/* ── Gradient overlay — text readability ──────────────────────── */}
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              zIndex: 1,
              background:
                'linear-gradient(to right, rgba(10,20,10,0.82) 0%, rgba(10,20,10,0.65) 55%, rgba(10,20,10,0.35) 100%)',
            }}
          />

          {/* ── Subtle vignette at bottom for section blending ───────────── */}
          <div
            aria-hidden="true"
            className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
            style={{
              zIndex: 2,
              background: 'linear-gradient(to bottom, transparent, rgba(10,20,10,0.4))',
            }}
          />

          {/* ── Page content — sits above video and overlays ─────────────── */}
          <div className="container-content relative" style={{ zIndex: 3 }}>
            <nav aria-label="Breadcrumb" className="mb-8">
              <ol className="flex flex-wrap items-center gap-1 text-sm text-white/60" role="list">
                <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
                <li><span aria-hidden="true" className="mx-1 text-white/40">/</span>
                  <Link href="/businesses" className="hover:text-white transition-colors">Businesses</Link>
                </li>
                <li><span aria-hidden="true" className="mx-1 text-white/40">/</span>
                  <span aria-current="page" className="font-medium text-white/80">Rooftop Solar</span>
                </li>
              </ol>
            </nav>
            <ScrollReveal variant="fadeUp">
              <div className="max-w-3xl">
                <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: '#C9A227' }}>
                  <span>☀️</span> Rooftop Solar Solutions
                </span>
                <h1 className="font-display text-5xl sm:text-6xl font-semibold text-white mb-6 leading-tight drop-shadow-sm">
                  Power Your Future with{' '}
                  <span style={{ background: 'linear-gradient(135deg, #f5a623, #C9A227)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                    Rooftop Solar
                  </span>
                </h1>
                <p className="text-xl text-white/80 mb-4 leading-relaxed max-w-2xl drop-shadow-sm">
                  India&apos;s most favourable solar subsidy window is open right now. In Odisha, a 3 kW residential system has a net investment of just ₹42,000–₹57,000 — with a payback period under 3 years and 25 years of near-free power ahead.
                </p>
                <p className="text-base text-white/60 mb-10 max-w-2xl">
                  Tribhuban Concepts engineers design, procure ALMM List-II compliant equipment, and commission every system — handling all DISCOM paperwork, ELBO compliance, and subsidy processing.
                </p>
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  <Link href="/consultation" className={primaryBtn}>Book Free Consultation</Link>
                  <Link
                    href="/businesses/rooftop-solar/solar-calculator"
                    className="inline-flex items-center justify-center h-12 px-8 rounded-md text-base font-semibold border border-white/40 bg-white/10 text-white hover:bg-white/20 hover:border-white/60 backdrop-blur-sm transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A227] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                  >
                    Calculate My Savings
                  </Link>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ── WHAT IS ROOFTOP SOLAR ─────────────────────────────────────────── */}
        <section aria-labelledby="what-is-solar-heading" className="bg-[var(--bg-subtle)] border-y border-[var(--border)] py-16 md:py-20">
          <div className="container-content">
            <ScrollReveal variant="fadeLeft">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 id="what-is-solar-heading" className="font-display text-3xl sm:text-4xl font-semibold text-[var(--fg)] mb-5">What is Rooftop Solar?</h2>
                  <p className="text-lg text-[var(--fg-muted)] leading-relaxed mb-4">
                    A rooftop solar system converts sunlight directly into electricity using photovoltaic panels mounted on your roof. Connected to the grid via an inverter, it powers your premises and exports any surplus — earning credits that reduce your bill to near zero.
                  </p>
                  <p className="text-base text-[var(--fg-muted)] leading-relaxed mb-6">
                    Unlike earlier solar installations that required enormous capital, today&apos;s dual-subsidy architecture — PM Surya Ghar (central) stacked with OASBY (Odisha state) — transforms rooftop solar from a long-term investment into an <strong>immediate utility expense reduction</strong>.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {['Grid-connected', 'Net metering', 'DBT subsidy', '25-yr lifespan', 'ALMM certified'].map((tag) => (
                      <span key={tag} className="text-xs px-3 py-1.5 rounded-full font-medium" style={{ background: 'rgba(180,83,9,0.08)', color: '#B45309', border: '1px solid rgba(180,83,9,0.15)' }}>{tag}</span>
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl p-8 space-y-4" style={{ background: 'linear-gradient(135deg, rgba(180,83,9,0.06) 0%, rgba(201,162,39,0.06) 100%)', border: '1px solid rgba(180,83,9,0.12)' }}>
                  <div className="text-sm font-semibold text-[var(--fg-subtle)] uppercase tracking-widest mb-2">Odisha Solar Economics (3 kW System)</div>
                  {[
                    { label: 'Gross Installation Cost', value: '₹1,95,000', note: '@ ₹65,000/kW benchmark' },
                    { label: 'Central Subsidy (PM Surya Ghar)', value: '− ₹78,000', accent: true },
                    { label: 'State Subsidy (OASBY)', value: '− ₹60,000', accent: true },
                    { label: 'Net Investment', value: '₹57,000', bold: true },
                    { label: 'Monthly Savings', value: '~₹1,800', note: 'at ₹600/month bill' },
                    { label: 'Payback Period', value: '2.64 years', bold: true },
                  ].map((row) => (
                    <div key={row.label} className="flex justify-between items-center py-2 border-b border-[var(--border)] last:border-0">
                      <span className="text-sm text-[var(--fg-muted)]">{row.label}{row.note && <span className="text-xs text-[var(--fg-subtle)] ml-1">({row.note})</span>}</span>
                      <span className={`text-sm font-semibold ${row.bold ? 'text-[var(--accent)] text-base' : row.accent ? 'text-green-600 dark:text-green-400' : 'text-[var(--fg)]'}`}>{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ── HOW SOLAR WORKS ──────────────────────────────────────────────── */}
        <section aria-labelledby="how-solar-works-heading" className="bg-[var(--bg)] py-16 md:py-24">
          <div className="container-content">
            <ScrollReveal variant="fadeUp">
              <div className="text-center mb-12">
                <h2 id="how-solar-works-heading" className="font-display text-3xl sm:text-4xl font-semibold text-[var(--fg)] mb-4">How Solar Works</h2>
                <p className="text-lg text-[var(--fg-muted)] max-w-2xl mx-auto">From sunlight to savings — three steps, explained simply.</p>
              </div>
            </ScrollReveal>
            <StaggerGroup variant="scale" stagger={0.1} className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {howSolarWorksSteps.map((step) => (
                <div key={step.step} className="rounded-xl bg-[var(--bg-subtle)] border border-[var(--border)] p-8 flex flex-col gap-4 group hover:border-[var(--accent)]/40 hover:shadow-[var(--shadow-md)] transition-all duration-300">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{step.icon}</span>
                    <span className="font-display text-3xl font-bold text-[var(--accent)] opacity-30">{step.step}</span>
                  </div>
                  <h3 className="font-display text-xl font-semibold text-[var(--fg)]">{step.title}</h3>
                  <p className="text-sm text-[var(--fg-muted)] leading-relaxed">{step.description}</p>
                </div>
              ))}
            </StaggerGroup>
          </div>
        </section>

        {/* ── BENEFITS BY CUSTOMER CATEGORY ────────────────────────────────── */}
        <section aria-labelledby="customer-category-heading" className="bg-[var(--bg-subtle)] border-y border-[var(--border)] py-16 md:py-24">
          <div className="container-content">
            <ScrollReveal variant="clipUp">
              <div className="text-center mb-12">
                <h2 id="customer-category-heading" className="font-display text-3xl sm:text-4xl font-semibold text-[var(--fg)] mb-4">Benefits by Customer Category</h2>
                <p className="text-lg text-[var(--fg-muted)] max-w-2xl mx-auto">Different economics apply to residential, commercial, and industrial consumers. Understand which model applies to you.</p>
              </div>
            </ScrollReveal>
            <StaggerGroup variant="fadeUp" stagger={0.08} className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {customerCategories.map((cat) => (
                <div key={cat.type} className={`rounded-xl border p-7 flex flex-col gap-5 ${cat.highlight ? 'border-[var(--accent)]/40 bg-[var(--bg)] shadow-[var(--shadow-md)]' : 'border-[var(--border)] bg-[var(--bg)]'}`}>
                  {cat.highlight && <span className="text-[10px] font-semibold uppercase tracking-widest px-2 py-1 rounded-full self-start" style={{ background: 'rgba(180,83,9,0.1)', color: '#B45309' }}>Most Popular</span>}
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{cat.emoji}</span>
                    <div>
                      <h3 className="font-display text-xl font-semibold text-[var(--fg)]">{cat.type}</h3>
                      <p className="text-xs text-[var(--fg-subtle)]">{cat.headline}</p>
                    </div>
                  </div>
                  <ul className="space-y-2.5 flex-1">
                    {cat.points.map((point) => (
                      <li key={point} className="flex items-start gap-2 text-sm text-[var(--fg-muted)]">
                        <span className="text-[var(--accent)] mt-0.5 shrink-0">✓</span>{point}
                      </li>
                    ))}
                  </ul>
                  <Link href={cat.cta.href} className="inline-flex items-center justify-center h-10 px-5 rounded-md text-sm font-semibold bg-[var(--btn-primary-bg)] text-[var(--btn-primary-fg)] hover:bg-[var(--btn-primary-hover)] transition-colors">{cat.cta.label}</Link>
                </div>
              ))}
            </StaggerGroup>
          </div>
        </section>

        {/* ── GOVERNMENT SUBSIDIES ─────────────────────────────────────────── */}
        <section aria-labelledby="subsidies-heading" className="bg-[var(--bg)] py-16 md:py-24">
          <div className="container-content">
            <ScrollReveal variant="fadeRight">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                <div>
                  <h2 id="subsidies-heading" className="font-display text-3xl sm:text-4xl font-semibold text-[var(--fg)] mb-5">Government Subsidies (2026–27)</h2>
                  <p className="text-lg text-[var(--fg-muted)] leading-relaxed mb-4">
                    Odisha offers one of India&apos;s most generous dual-subsidy structures. Central PM Surya Ghar funds are deposited directly to your bank via DBT. State OASBY adds a substantial top-up from OREDA&apos;s ₹495 crore annual allocation.
                  </p>
                  <div className="rounded-lg p-4 mb-5 text-sm" style={{ background: 'rgba(201,162,39,0.08)', border: '1px solid rgba(201,162,39,0.2)' }}>
                    <span className="font-semibold text-[var(--accent)]">⚠️ State fund advisory: </span>
                    <span className="text-[var(--fg-muted)]">OASBY funds operate on budgetary depletion. Always verify active OREDA disbursements before quoting state subsidy availability. Central subsidy is confirmed; state subsidy is subject to fund availability.</span>
                  </div>
                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-[var(--fg-muted)]">Collateral-free loans at ~7% for systems up to 3 kW via nationalized banks.</p>
                    <Link href="/solar/learn/subsidies" className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--accent)] hover:underline">Deep dive into subsidy eligibility →</Link>
                  </div>
                </div>
                <div className="overflow-x-auto rounded-xl border border-[var(--border)] shadow-[var(--shadow-sm)]">
                  <table className="w-full text-sm">
                    <caption className="sr-only">PM Surya Ghar and Odisha OASBY combined subsidy slabs (2026–27)</caption>
                    <thead>
                      <tr className="bg-[var(--bg-subtle)]">
                        <th className="text-left px-4 py-3 font-semibold text-[var(--fg-muted)] border-b border-[var(--border)]">System</th>
                        <th className="text-right px-4 py-3 font-semibold text-[var(--fg-muted)] border-b border-[var(--border)]">Central</th>
                        <th className="text-right px-4 py-3 font-semibold text-[var(--fg-muted)] border-b border-[var(--border)]">State (Odisha)</th>
                        <th className="text-right px-4 py-3 font-semibold text-[var(--accent)] border-b border-[var(--border)]">Combined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subsidyTable.map((row, i) => (
                        <tr key={row.capacity} className={i % 2 === 0 ? 'bg-[var(--bg)]' : 'bg-[var(--bg-subtle)]'}>
                          <td className="px-4 py-3 font-medium text-[var(--fg)]">{row.capacity}</td>
                          <td className="px-4 py-3 text-right text-[var(--fg-muted)]">{row.central}</td>
                          <td className="px-4 py-3 text-right text-[var(--fg-muted)]">{row.state}</td>
                          <td className="px-4 py-3 text-right font-bold text-[var(--accent)]">{row.combined}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ── INSTALLATION PROCESS ──────────────────────────────────────────── */}
        <section aria-labelledby="process-heading" className="bg-[var(--bg-subtle)] border-y border-[var(--border)] py-16 md:py-24">
          <div className="container-content">
            <ScrollReveal variant="fadeUp">
              <div className="text-center mb-12">
                <h2 id="process-heading" className="font-display text-3xl sm:text-4xl font-semibold text-[var(--fg)] mb-4">Solar Installation Process</h2>
                <p className="text-lg text-[var(--fg-muted)] max-w-2xl mx-auto">A transparent, end-to-end process. We handle everything — from portal registration to subsidy disbursement.</p>
              </div>
            </ScrollReveal>
            <ol className="relative border-l-2 border-[var(--border)] ml-5 md:ml-8 space-y-10 list-none p-0 m-0" aria-label="Installation process steps">
              {installationProcess.map((step, i) => (
                <ScrollReveal key={step.number} variant="fadeLeft" delay={i * 0.05}>
                  <li className="pl-10 relative">
                    <span aria-hidden="true" className="absolute -left-[21px] top-0 flex h-10 w-10 items-center justify-center rounded-full bg-[var(--accent)] text-[var(--btn-primary-fg)] text-sm font-bold border-4 border-[var(--bg-subtle)]">{step.number}</span>
                    <h3 className="font-display text-xl font-semibold text-[var(--fg)] mb-2">{step.title}</h3>
                    <p className="text-[var(--fg-muted)] leading-relaxed">{step.description}</p>
                  </li>
                </ScrollReveal>
              ))}
            </ol>
          </div>
        </section>

        {/* ── NET METERING ──────────────────────────────────────────────────── */}
        <section aria-labelledby="net-metering-heading" className="bg-[var(--bg)] py-16 md:py-20">
          <div className="container-content">
            <ScrollReveal variant="blur">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 id="net-metering-heading" className="font-display text-3xl sm:text-4xl font-semibold text-[var(--fg)] mb-5">Net Metering in Odisha</h2>
                  <p className="text-lg text-[var(--fg-muted)] leading-relaxed mb-4">When your system generates more than you consume, the surplus is exported to the grid and credited to your account. Monthly credits carry forward; at year-end any remaining credits are paid out at APPC rate.</p>
                  <p className="text-base text-[var(--fg-muted)] leading-relaxed mb-6">OERC&apos;s telescopic tariff structure makes sizing especially important — a solar system eliminates the <em>most expensive</em> top-tier units first (₹5.70–₹6.10/kWh), yielding disproportionately high returns for heavy consumers.</p>
                  <Link href="/solar/learn/net-metering" className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--accent)] hover:underline">Learn about net metering →</Link>
                </div>
                <StaggerGroup variant="scale" stagger={0.06} className="grid grid-cols-2 gap-4">
                  {netMeteringFacts.map((fact) => (
                    <div key={fact.label} className="rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] p-5 flex flex-col gap-2">
                      <span className="text-2xl">{fact.icon}</span>
                      <p className="text-xs font-semibold uppercase tracking-wider text-[var(--fg-subtle)]">{fact.label}</p>
                      <p className="text-sm font-semibold text-[var(--fg)]">{fact.value}</p>
                    </div>
                  ))}
                </StaggerGroup>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ── CALCULATOR PREVIEW ────────────────────────────────────────────── */}
        <section aria-labelledby="calculator-preview-heading" className="bg-[var(--bg-subtle)] border-y border-[var(--border)] py-16 md:py-24">
          <div className="container-content">
            <ScrollReveal variant="fadeUp">
              <div className="text-center mb-10">
                <h2 id="calculator-preview-heading" className="font-display text-3xl sm:text-4xl font-semibold text-[var(--fg)] mb-4">Try the Solar ROI Calculator</h2>
                <p className="text-lg text-[var(--fg-muted)] max-w-2xl mx-auto">Get an instant savings estimate based on Odisha&apos;s actual OERC tariffs, PM Surya Ghar subsidies, and real irradiance data.</p>
              </div>
            </ScrollReveal>
            <SolarCalculatorPreview />
          </div>
        </section>

        {/* ── SUCCESS METRICS ───────────────────────────────────────────────── */}
        <section aria-label="Solar impact metrics" className="bg-[var(--bg)] py-12 md:py-16">
          <div className="container-content">
            <StaggerGroup variant="scale" stagger={0.08} className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {successMetrics.map((metric) => (
                <div key={metric.label} className="text-center rounded-xl bg-[var(--bg-subtle)] border border-[var(--border)] p-6">
                  <span className="block font-display text-4xl font-bold text-[var(--accent)] mb-1">{metric.value}</span>
                  <span className="block text-sm font-semibold text-[var(--fg)] mb-0.5">{metric.label}</span>
                  <span className="block text-xs text-[var(--fg-subtle)]">{metric.sub}</span>
                </div>
              ))}
            </StaggerGroup>
          </div>
        </section>

        {/* ── FAQS ─────────────────────────────────────────────────────────── */}
        <section aria-labelledby="faq-heading" className="bg-[var(--bg-subtle)] border-y border-[var(--border)] py-16 md:py-20">
          <div className="container-content max-w-3xl mx-auto">
            <ScrollReveal variant="fadeUp">
              <h2 id="faq-heading" className="font-display text-3xl font-semibold text-[var(--fg)] mb-8 text-center">Frequently Asked Questions</h2>
            </ScrollReveal>
            <StaggerGroup variant="fadeUp" stagger={0.07} className="space-y-4">
              {faqs.map((faq) => (
                <details key={faq.q} className="rounded-xl border border-[var(--border)] bg-[var(--bg)] group" open={false}>
                  <summary className="flex items-center justify-between px-6 py-4 cursor-pointer font-semibold text-[var(--fg)] text-sm select-none hover:text-[var(--accent)] transition-colors list-none">
                    {faq.q}
                    <span className="ml-4 shrink-0 text-lg group-open:rotate-45 transition-transform duration-200 text-[var(--accent)]">+</span>
                  </summary>
                  <div className="px-6 pb-5 text-sm text-[var(--fg-muted)] leading-relaxed border-t border-[var(--border)] pt-4">{faq.a}</div>
                </details>
              ))}
            </StaggerGroup>
          </div>
        </section>

        {/* ── LATEST SOLAR BLOGS ───────────────────────────────────────────── */}
        <section aria-labelledby="solar-blogs-heading" className="bg-[var(--bg)] py-16 md:py-24">
          <div className="container-content">
            <ScrollReveal variant="clipUp">
              <div className="flex items-center justify-between mb-8">
                <h2 id="solar-blogs-heading" className="font-display text-3xl font-semibold text-[var(--fg)]">Solar Guides & Resources</h2>
                <Link href="/blog?category=solar" className="text-sm font-semibold text-[var(--accent)] hover:underline">View all →</Link>
              </div>
            </ScrollReveal>
            <StaggerGroup variant="fadeUp" stagger={0.1} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {solarBlogs.map((blog) => (
                <Link key={blog.slug} href={`/blog/${blog.slug}`} className="group rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] overflow-hidden hover:shadow-[var(--shadow-lg)] hover:-translate-y-1 transition-all duration-300 flex flex-col">
                  <div className="h-40 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(180,83,9,0.08), rgba(201,162,39,0.08))' }}>
                    <span className="text-4xl">📖</span>
                  </div>
                  <div className="p-5 flex flex-col gap-2 flex-1">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[var(--accent)]">{blog.tag}</span>
                    <h3 className="font-display text-base font-semibold text-[var(--fg)] leading-snug group-hover:text-[var(--accent)] transition-colors">{blog.title}</h3>
                    <p className="text-sm text-[var(--fg-muted)] leading-relaxed flex-1">{blog.excerpt}</p>
                    <span className="text-xs text-[var(--fg-subtle)] mt-1">{blog.readTime} min read</span>
                  </div>
                </Link>
              ))}
            </StaggerGroup>
          </div>
        </section>

        {/* ── CONSULTATION CTA ─────────────────────────────────────────────── */}
        <section aria-labelledby="solar-cta-heading" className="bg-[var(--bg-subtle)] border-t border-[var(--border)] py-16 md:py-24">
          <ScrollReveal variant="fadeUp">
            <div className="container-content text-center max-w-2xl mx-auto">
              <h2 id="solar-cta-heading" className="font-display text-3xl sm:text-4xl font-semibold text-[var(--fg)] mb-4">Ready for Your Free Solar Assessment?</h2>
              <p className="text-lg text-[var(--fg-muted)] mb-8 leading-relaxed">Our ELBO-licensed engineers will survey your rooftop, review your DISCOM bills, verify subsidy eligibility, and deliver a site-specific proposal — with no obligation and no pressure.</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/consultation" className={primaryBtn}>Book Free Consultation</Link>
                <Link href="/solar/calculator" className={ghostBtn}>Calculate First</Link>
              </div>
            </div>
          </ScrollReveal>
        </section>

      </main>
    </>
  );
}
