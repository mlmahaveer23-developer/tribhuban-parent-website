'use client';

/**
 * AboutCounters — animates numeric statistics up from zero when scrolled into view.
 * Uses IntersectionObserver + requestAnimationFrame. No extra dependencies.
 * Fully respects prefers-reduced-motion (shows final value instantly).
 */

import { useEffect, useRef, useState } from 'react';

interface Stat {
  value: number;
  suffix: string;
  label: string;
}

const stats: Stat[] = [
  { value: 2026, suffix: '', label: 'Year Founded' },
  { value: 3,    suffix: '+', label: 'Core Domains' },
  { value: 100,  suffix: '%', label: 'Commitment' },
  { value: 0,    suffix: 'CO₂', label: 'Compromise on Sustainability' },
];

function useCountUp(target: number, duration = 1400, active = false, reduced = false) {
  const [count, setCount] = useState(reduced ? target : 0);

  useEffect(() => {
    if (!active || reduced) { setCount(target); return; }
    if (target === 0) { setCount(0); return; }
    let start: number | null = null;
    const step = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
      else setCount(target);
    };
    const id = requestAnimationFrame(step);
    return () => cancelAnimationFrame(id);
  }, [active, target, duration, reduced]);

  return count;
}

function CounterItem({ stat, active, reduced }: { stat: Stat; active: boolean; reduced: boolean }) {
  const count = useCountUp(stat.value, 1600, active, reduced);
  return (
    <div className="about-counter__item">
      <div className="about-counter__number" aria-live="polite">
        <span>{count}</span>
        <span className="about-counter__suffix">{stat.suffix}</span>
      </div>
      <p className="about-counter__label">{stat.label}</p>
    </div>
  );
}

export default function AboutCounters() {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setActive(true); obs.disconnect(); } },
      { threshold: 0.3 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className="about-counter__grid">
      {stats.map((stat) => (
        <CounterItem key={stat.label} stat={stat} active={active} reduced={reduced} />
      ))}
    </div>
  );
}
