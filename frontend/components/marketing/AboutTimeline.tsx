'use client';

/**
 * AboutTimeline — animated vertical timeline with IntersectionObserver
 * reveal. Each entry animates in as it enters the viewport.
 * Fully accessible (semantic <ol>, <time>, no motion-only information).
 * Respects prefers-reduced-motion.
 */

import { useEffect, useRef, useState } from 'react';

interface TimelineEntry {
  year: string;
  quarter?: string;
  title: string;
  body: string;
  accent?: boolean;
}

const entries: TimelineEntry[] = [
  {
    year: '2026',
    quarter: 'Q1',
    title: 'Tribhuban Concepts Founded',
    body: 'The company was established with a focused thesis: clean energy and intelligent technology must work together. We set out to build the infrastructure that makes that possible.',
    accent: true,
  },
  {
    year: '2026',
    quarter: 'Q2',
    title: 'Solar Engineering Division Launched',
    body: 'Our first operational vertical — designing, engineering, and commissioning rooftop solar systems for residential and commercial clients across India.',
  },
  {
    year: '2026',
    quarter: 'Q3',
    title: 'Digital Infrastructure Practice Formed',
    body: 'Recognising that solar alone is not enough, we began building the technology layer — platforms that connect assets, automate reporting, and make energy data actionable.',
  },
  {
    year: '2026',
    quarter: 'Q4',
    title: 'First Client Consultations',
    body: 'Our consultation platform went live — giving prospects a direct path to speak with our engineering team and receive tailored solar and technology assessments.',
  },
  {
    year: '2027',
    quarter: 'Ahead',
    title: 'Scale & Expand',
    body: 'Growing our team, expanding our geographic reach, and deepening our technology capabilities. The journey has only begun.',
    accent: true,
  },
];

function TimelineItem({ entry, index }: { entry: TimelineEntry; index: number }) {
  const ref = useRef<HTMLLIElement>(null);
  const [visible, setVisible] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    if (mq.matches) { setVisible(true); return; }

    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.2 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const isLeft = index % 2 === 0;

  return (
    <li
      ref={ref}
      className={`about-tl__item ${isLeft ? 'about-tl__item--left' : 'about-tl__item--right'} ${visible ? 'about-tl__item--visible' : ''}`}
      style={{ transitionDelay: reduced ? '0ms' : `${index * 80}ms` }}
    >
      {/* Dot on the spine */}
      <span className={`about-tl__dot ${entry.accent ? 'about-tl__dot--accent' : ''}`} aria-hidden="true" />

      <div className={`about-tl__card ${entry.accent ? 'about-tl__card--accent' : ''}`}>
        <div className="about-tl__meta">
          <time dateTime={entry.year} className="about-tl__year">{entry.year}</time>
          {entry.quarter && <span className="about-tl__quarter">{entry.quarter}</span>}
        </div>
        <h3 className="about-tl__title">{entry.title}</h3>
        <p className="about-tl__body">{entry.body}</p>
      </div>
    </li>
  );
}

export default function AboutTimeline() {
  return (
    <section aria-label="Company journey timeline" className="about-tl">
      <ol className="about-tl__list">
        {entries.map((entry, i) => (
          <TimelineItem key={i} entry={entry} index={i} />
        ))}
      </ol>
    </section>
  );
}
