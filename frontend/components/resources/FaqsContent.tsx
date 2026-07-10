/**
 * FaqsContent — rendered inside /resources/faqs.
 * Full FAQ page with the FAQAccordion client island + JSON-LD is
 * injected at the route level in [category]/page.tsx.
 */
import Link from 'next/link';
import FAQAccordion, { type FAQCategory } from '@/components/content/FAQAccordion';

const FAQ_CATEGORIES: FAQCategory[] = [
  {
    name: 'Solar Basics',
    slug: 'solar-basics',
    faqs: [
      {
        question: 'How does a rooftop solar system work?',
        answer: 'Rooftop solar panels convert sunlight into direct current (DC) electricity. An inverter converts this to alternating current (AC) for use in your home or business. Surplus power can be exported to the grid (net metering) or stored in a battery bank for later use.',
      },
      {
        question: 'How much roof area do I need for a 5 kW system?',
        answer: 'As a general rule, a grid-tied solar system requires approximately 10 square metres per kW of installed capacity, depending on panel efficiency and mounting angle. A 5 kW system therefore typically needs around 50 m² of unshaded roof space. Our calculator gives you a personalised estimate.',
      },
      {
        question: 'What is net metering and am I eligible?',
        answer: 'Net metering allows you to export surplus solar power to the grid and receive a credit on your electricity bill. Most residential and commercial consumers in India with a sanctioned load up to 500 kW are eligible. Our team will confirm your eligibility during the site assessment.',
      },
      {
        question: 'How long does a solar installation take?',
        answer: 'A residential rooftop installation typically takes 2–5 days from the start of civil work to grid synchronisation. The full timeline, including site survey, design approval, equipment procurement, and net-metering paperwork, is usually 4–8 weeks.',
      },
    ],
  },
  {
    name: 'Pricing & Finance',
    slug: 'pricing-finance',
    faqs: [
      {
        question: 'What does a typical rooftop solar system cost in India?',
        answer: 'System cost varies by capacity, panel brand, inverter type, and structural requirements. As a benchmark, grid-tied residential systems in India typically cost ₹50,000–₹75,000 per kW (installed) before subsidies. Use our Solar Calculator for a personalised estimate, and contact us for a detailed quote.',
      },
      {
        question: 'Are there government subsidies available?',
        answer: 'Yes. The PM Surya Ghar Muft Bijli Yojana scheme offers central subsidies for residential systems up to 3 kW, and state-level subsidies may stack on top. Commercial and industrial systems qualify for accelerated depreciation benefits. Our team will advise you on the latest applicable benefits.',
      },
      {
        question: 'What financing options are available?',
        answer: 'We assist with documentation for solar-specific loans available from nationalised banks, NBFCs, and DISCOMs under various central and state schemes. EMI tenures of 5–10 years are common, with many customers achieving positive cash flow from day one once their electricity bill savings exceed the EMI.',
      },
      {
        question: 'Who qualifies for the ₹1.38 Lakh combined subsidy in Odisha?',
        answer: 'Residential (LT-domestic) consumers in Odisha can stack the central PM Surya Ghar subsidy (up to ₹78,000) with the state OASBY top-up (up to ₹60,000) for a maximum combined subsidy of ₹1,38,000 on a 3 kW system. Commercial and industrial consumers are not eligible for either subsidy.',
      },
    ],
  },
  {
    name: 'Technical',
    slug: 'technical',
    faqs: [
      {
        question: 'What warranty do I get on panels and the inverter?',
        answer: 'Solar panels typically carry a 10-year product warranty and a 25–30 year performance warranty (guaranteeing at least 80% output at end of life). Inverters usually have a 5–10 year manufacturer warranty, extendable to 10 years. We supply only Tier-1 manufacturer products.',
      },
      {
        question: 'How do I monitor my system performance?',
        answer: 'Most inverters include a manufacturer app or web portal that shows real-time generation, consumption, and export data. Tribhuban installations include setup and walkthrough of the monitoring portal. If you experience a significant drop in generation, contact our support team — many issues can be diagnosed remotely.',
      },
      {
        question: 'What maintenance does a solar system require?',
        answer: 'Solar panels require minimal maintenance. In most Indian climates, cleaning panels every 1–3 months ensures optimal performance. Inverters are solid-state with no routine servicing requirement; our team checks connections and logs during annual health check visits.',
      },
      {
        question: 'Is BESS mandatory for my rooftop solar system?',
        answer: 'OERC mandates Battery Energy Storage Systems for distributed solar systems of 5 kW and above. Systems up to 4 kW are standard on-grid. For 5–10 kW, a minimum 1 kW / 2 kWh BESS plus hybrid inverter is required.',
      },
      {
        question: 'Can I use imported panels and still claim subsidies?',
        answer: 'From June 1, 2026, PM Surya Ghar subsidies require ALMM List-II compliant panels (domestically manufactured cells). You can opt out of the subsidy via the "Give It Up" portal option and use imported panels until March 31, 2027.',
      },
    ],
  },
];

export default function FaqsContent() {
  return (
    <div>
      <p className="text-[var(--fg-muted)] mb-10 text-lg">
        Browse answers to common questions about solar, pricing, and our products. Can&apos;t find what you need?{' '}
        <Link href="/contact" className="font-medium text-[var(--accent)] hover:underline">Contact us</Link>.
      </p>

      <FAQAccordion categories={FAQ_CATEGORIES} />

      {/* Bottom CTA */}
      <div className="mt-14 rounded-2xl border border-[var(--border)] bg-[var(--bg-subtle)] py-10 text-center max-w-xl mx-auto">
        <h2 className="mb-3 font-display text-xl font-semibold text-[var(--fg)]">
          Didn&apos;t find your answer?
        </h2>
        <p className="mb-6 text-sm text-[var(--fg-muted)]">
          Our support team is available Monday to Friday, 9 AM–6 PM IST and will respond within one business day.
        </p>
        <Link
          href="/contact"
          className="inline-flex items-center justify-center h-11 px-6 rounded-md text-sm font-semibold bg-[var(--btn-primary-bg)] text-[var(--btn-primary-fg)] hover:bg-[var(--btn-primary-hover)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
        >
          Contact Support
        </Link>
      </div>
    </div>
  );
}
