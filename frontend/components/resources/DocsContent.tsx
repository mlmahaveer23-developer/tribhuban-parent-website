/**
 * DocsContent — rendered inside /resources/documentation.
 */
import Link from 'next/link';

const docs = [
  { icon: '📋', title: 'MNRE ALMM List-II — Solar Cell Compliance',  desc: 'Understanding the June 2026 domestic cell mandate and how to verify module compliance before purchase.', tag: 'Compliance', href: '/businesses/rooftop-solar' },
  { icon: '📄', title: 'OERC Tariff Schedule FY 2026–27',             desc: 'Full residential telescopic tariff slabs (₹2.90–₹6.10/kWh), fixed charges, and electricity duty for Odisha.', tag: 'Tariffs', href: '/businesses/rooftop-solar' },
  { icon: '📑', title: 'ELBO Contractor Licensing Requirements',       desc: 'License categories, required equipment, personnel certifications, and renewal process for solar EPC contractors.', tag: 'Licensing', href: '/businesses/rooftop-solar' },
  { icon: '🗂️', title: 'PM Surya Ghar Application Checklist',         desc: 'Step-by-step documentation checklist to avoid KYC mismatches and prevent subsidy rejection via DBT.', tag: 'Process', href: '/businesses/rooftop-solar' },
  { icon: '🔌', title: 'Net Metering Agreement Template',              desc: 'Standard bi-directional metering agreement format for TPWODL/TPSODL/TPCODL/TPNODL consumers.', tag: 'Grid', href: '/businesses/rooftop-solar' },
  { icon: '🏗️', title: 'Structural Load Assessment Guide',             desc: 'Minimum dead-load and wind-load calculations required for DISCOM inspection sign-off.', tag: 'Engineering', href: '/businesses/rooftop-solar' },
];

const tagColors: Record<string, string> = {
  Compliance: 'bg-blue-50 text-blue-700 border-blue-200',
  Tariffs:    'bg-amber-50 text-amber-700 border-amber-200',
  Licensing:  'bg-purple-50 text-purple-700 border-purple-200',
  Process:    'bg-green-50 text-green-700 border-green-200',
  Grid:       'bg-cyan-50 text-cyan-700 border-cyan-200',
  Engineering:'bg-orange-50 text-orange-700 border-orange-200',
};

export default function DocsContent() {
  return (
    <div>
      <p className="text-[var(--fg-muted)] mb-10 text-lg">
        Technical references, regulatory documents, and compliance guides for rooftop solar projects in India.
      </p>

      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-5 list-none p-0 m-0 mb-12" role="list">
        {docs.map((doc) => (
          <li key={doc.title} className="rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] p-6 flex gap-4 items-start hover:border-[var(--accent)]/40 hover:shadow-[var(--shadow-sm)] transition-all duration-200">
            <span className="text-2xl shrink-0 mt-0.5" aria-hidden="true">{doc.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <h3 className="font-display text-sm font-semibold text-[var(--fg)]">{doc.title}</h3>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${tagColors[doc.tag] ?? 'bg-[var(--bg-muted)] text-[var(--fg-subtle)] border-[var(--border)]'}`}>
                  {doc.tag}
                </span>
              </div>
              <p className="text-xs text-[var(--fg-muted)] leading-relaxed mb-2">{doc.desc}</p>
              <Link href={doc.href} className="text-xs font-semibold text-[var(--accent)] hover:underline">View details →</Link>
            </div>
          </li>
        ))}
      </ul>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-subtle)] py-10 text-center max-w-lg mx-auto">
        <p className="text-[var(--fg-muted)] mb-4">Need a specific document or custom datasheet?</p>
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
