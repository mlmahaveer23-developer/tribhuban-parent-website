'use client';

import dynamic from 'next/dynamic';

const OdishaSolarCalculator = dynamic(
  () =>
    import('@/components/solar/OdishaSolarCalculator').then(
      (m) => ({ default: m.OdishaSolarCalculator }),
    ),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 rounded-xl bg-[var(--bg-subtle)] animate-pulse" />
    ),
  },
);

export default function SolarCalcClient() {
  return <OdishaSolarCalculator />;
}
