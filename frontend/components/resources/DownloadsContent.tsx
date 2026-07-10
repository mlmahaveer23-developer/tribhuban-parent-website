/**
 * DownloadsContent — rendered inside /resources/downloads.
 */
import Link from 'next/link';

const downloads = [
  {
    icon: '📥',
    title: 'Solar Savings Brochure (PDF)',
    desc: 'Consumer-friendly guide to rooftop solar savings in Odisha. Covers PM Surya Ghar + OASBY subsidies, typical payback, and the installation process. Share with homeowners.',
    tag: 'Brochure',
    format: 'PDF · 2 pages',
  },
  {
    icon: '📊',
    title: 'Subsidy Comparison Datasheet',
    desc: 'One-page comparison of PM Surya Ghar vs. OASBY subsidy slabs for 1 kW–5 kW+ systems. Includes eligibility criteria and application timeline.',
    tag: 'Datasheet',
    format: 'PDF · 1 page',
  },
  {
    icon: '📐',
    title: 'System Sizing Quick Reference',
    desc: '1-page calculator reference card: bill → units → kW → area → cost → subsidy → payback. Keep it beside the Solar Calculator for a complete picture.',
    tag: 'Reference',
    format: 'PDF · 1 page',
  },
  {
    icon: '🏗️',
    title: 'Installation Process Flowchart',
    desc: 'Visual end-to-end flowchart: portal registration → DISCOM approval → procurement → installation → inspection → net meter → DBT subsidy. Estimated timelines at each step.',
    tag: 'Process',
    format: 'PDF · 1 page',
  },
  {
    icon: '⚡',
    title: 'OERC Tariff Quick Reference Card',
    desc: 'FY 2026–27 telescopic residential tariff slabs, commercial HT rates, fixed charges, and electricity duty — all on a single laminated-style reference card.',
    tag: 'Tariffs',
    format: 'PDF · 1 page',
  },
  {
    icon: '🔋',
    title: 'BESS Sizing Guide',
    desc: 'Decision matrix for battery storage: when BESS is mandatory, minimum capacities under OERC, cost impact per kW, and recommended configurations for 5 kW–50 kW systems.',
    tag: 'Technical',
    format: 'PDF · 3 pages',
  },
];

const tagColors: Record<string, string> = {
  Brochure:  'bg-amber-50  text-amber-700  border-amber-200',
  Datasheet: 'bg-blue-50   text-blue-700   border-blue-200',
  Reference: 'bg-green-50  text-green-700  border-green-200',
  Process:   'bg-purple-50 text-purple-700 border-purple-200',
  Tariffs:   'bg-orange-50 text-orange-700 border-orange-200',
  Technical: 'bg-cyan-50   text-cyan-700   border-cyan-200',
};

export default function DownloadsContent() {
  return (
    <div>
      <p className="text-[var(--fg-muted)] mb-10 text-lg">
        Brochures, datasheets, and quick-reference materials for rooftop solar projects.
        All downloads are available free of charge — request them through a consultation.
      </p>

      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 list-none p-0 m-0 mb-12" role="list">
        {downloads.map((dl) => (
          <li
            key={dl.title}
            className="rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] p-6 flex flex-col gap-3 hover:border-[var(--accent)]/40 hover:shadow-[var(--shadow-sm)] transition-all duration-200"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="text-3xl" aria-hidden="true">{dl.icon}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${tagColors[dl.tag] ?? 'bg-[var(--bg-muted)] text-[var(--fg-subtle)] border-[var(--border)]'}`}>
                {dl.tag}
              </span>
            </div>
            <h3 className="font-display text-sm font-semibold text-[var(--fg)]">{dl.title}</h3>
            <p className="text-xs text-[var(--fg-muted)] leading-relaxed flex-1">{dl.desc}</p>
            <div className="flex items-center justify-between mt-auto pt-2">
              <span className="text-[10px] text-[var(--fg-subtle)]">{dl.format}</span>
              <Link href="/consultation" className="text-xs font-semibold text-[var(--accent)] hover:underline">
                Request →
              </Link>
            </div>
          </li>
        ))}
      </ul>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-subtle)] py-10 text-center max-w-xl mx-auto">
        <p className="text-[var(--fg-muted)] mb-4 text-sm">
          Need a custom datasheet, technical specification, or bulk print order?
        </p>
        <Link
          href="/consultation"
          className="inline-flex items-center justify-center h-11 px-6 rounded-lg text-sm font-semibold bg-[var(--btn-primary-bg)] text-[var(--btn-primary-fg)] hover:bg-[var(--btn-primary-hover)] transition-colors"
        >
          Request via Consultation
        </Link>
      </div>
    </div>
  );
}
