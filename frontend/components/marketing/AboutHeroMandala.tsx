'use client';

/**
 * AboutHeroMandala — Animated SVG mandala that slowly rotates in the hero.
 * Uses CSS animation only. Respects prefers-reduced-motion (stops rotation).
 * Pure decorative element — aria-hidden.
 */

export default function AboutHeroMandala() {
  return (
    <div className="about-hero-mandala" aria-hidden="true">
      <svg
        viewBox="0 0 480 480"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="about-hero-mandala__svg"
      >
        {/* Outer ring */}
        <circle cx="240" cy="240" r="230" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 8" opacity="0.25" />
        {/* Mid ring */}
        <circle cx="240" cy="240" r="180" stroke="currentColor" strokeWidth="0.5" opacity="0.18" />
        {/* Inner ring */}
        <circle cx="240" cy="240" r="130" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 6" opacity="0.22" />
        {/* Core ring */}
        <circle cx="240" cy="240" r="80" stroke="currentColor" strokeWidth="0.75" opacity="0.28" />
        {/* Radial spokes — 12 */}
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i * 30 * Math.PI) / 180;
          const x1 = 240 + 85 * Math.cos(angle);
          const y1 = 240 + 85 * Math.sin(angle);
          const x2 = 240 + 225 * Math.cos(angle);
          const y2 = 240 + 225 * Math.sin(angle);
          return (
            <line
              key={i}
              x1={x1} y1={y1} x2={x2} y2={y2}
              stroke="currentColor"
              strokeWidth="0.5"
              opacity="0.12"
            />
          );
        })}
        {/* Petal ring at 180px */}
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i * 45 * Math.PI) / 180;
          const cx = 240 + 180 * Math.cos(angle);
          const cy = 240 + 180 * Math.sin(angle);
          return (
            <circle
              key={i}
              cx={cx} cy={cy} r="10"
              stroke="currentColor"
              strokeWidth="0.75"
              opacity="0.2"
              fill="none"
            />
          );
        })}
        {/* Diamond accents at 130px */}
        {Array.from({ length: 4 }).map((_, i) => {
          const angle = (i * 90 * Math.PI) / 180;
          const cx = 240 + 130 * Math.cos(angle);
          const cy = 240 + 130 * Math.sin(angle);
          const s = 7;
          return (
            <polygon
              key={i}
              points={`${cx},${cy - s} ${cx + s},${cy} ${cx},${cy + s} ${cx - s},${cy}`}
              stroke="currentColor"
              strokeWidth="0.75"
              opacity="0.25"
              fill="none"
            />
          );
        })}
        {/* Centre dot */}
        <circle cx="240" cy="240" r="4" fill="currentColor" opacity="0.3" />
      </svg>
    </div>
  );
}
