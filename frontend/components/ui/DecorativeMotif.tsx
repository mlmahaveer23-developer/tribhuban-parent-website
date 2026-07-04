/**
 * DecorativeMotif — Optimised inline SVG decorative patterns
 *
 * Replaces raster gradient placeholders with zero-byte, crisp-at-all-sizes
 * inline SVG geometry inspired by Indian mandala / temple proportions.
 * Per §5.5: decorative motifs are SVG (not raster) to align with premium
 * aesthetics and performance goals.
 *
 * All elements are marked aria-hidden and role="img" is omitted so screen
 * readers skip them entirely — they are purely decorative.
 */

import React from 'react';

export type MotifVariant = 'solar' | 'tech' | 'article' | 'default';

interface DecorativeMotifProps {
  /** Visual variant — chooses the mandala/geometric pattern */
  variant?: MotifVariant;
  /** Additional className for sizing and positioning */
  className?: string;
}

// ── SVG pattern definitions ────────────────────────────────────────────────────

/**
 * Concentric-ring mandala with 8-fold symmetry — used for Solar sections.
 * Evokes the sun and circular solar panels.
 */
function SolarMotif() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 320 240"
      aria-hidden="true"
      focusable="false"
      preserveAspectRatio="xMidYMid slice"
      style={{ width: '100%', height: '100%' }}
    >
      <defs>
        <radialGradient id="solar-bg" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stopColor="var(--accent-light, #fef3c7)" />
          <stop offset="100%" stopColor="var(--bg-muted, #f5f0e8)" />
        </radialGradient>
        <radialGradient id="solar-ring" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--accent, #b45309)" stopOpacity="0.15" />
          <stop offset="100%" stopColor="var(--accent, #b45309)" stopOpacity="0.05" />
        </radialGradient>
      </defs>

      {/* Background fill */}
      <rect width="320" height="240" fill="url(#solar-bg)" />

      {/* Outer decorative rings */}
      {[96, 80, 64, 48, 32].map((r, i) => (
        <circle
          key={r}
          cx="160"
          cy="120"
          r={r}
          fill="none"
          stroke="var(--accent, #b45309)"
          strokeWidth={i === 0 ? 0.5 : 0.75}
          strokeOpacity={0.2 - i * 0.03}
        />
      ))}

      {/* 8-fold symmetry rays */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i * Math.PI) / 4;
        const x2 = 160 + Math.cos(angle) * 100;
        const y2 = 120 + Math.sin(angle) * 100;
        return (
          <line
            key={i}
            x1="160"
            y1="120"
            x2={x2}
            y2={y2}
            stroke="var(--accent, #b45309)"
            strokeWidth="0.5"
            strokeOpacity="0.15"
          />
        );
      })}

      {/* Inner mandala petal shapes (16-fold) */}
      {Array.from({ length: 16 }).map((_, i) => {
        const angle = (i * Math.PI * 2) / 16;
        const pr = 40;
        const x = 160 + Math.cos(angle) * pr;
        const y = 120 + Math.sin(angle) * pr;
        return (
          <ellipse
            key={i}
            cx={x}
            cy={y}
            rx="6"
            ry="3"
            fill="var(--accent, #b45309)"
            fillOpacity="0.1"
            transform={`rotate(${(i * 360) / 16 + 90}, ${x}, ${y})`}
          />
        );
      })}

      {/* Centre sun disc */}
      <circle cx="160" cy="120" r="12" fill="url(#solar-ring)" />
      <circle cx="160" cy="120" r="6" fill="var(--accent, #b45309)" fillOpacity="0.25" />
    </svg>
  );
}

/**
 * Geometric lattice — used for Technology/Future-Tech sections.
 * Evokes circuit patterns and precision engineering.
 */
function TechMotif() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 320 240"
      aria-hidden="true"
      focusable="false"
      preserveAspectRatio="xMidYMid slice"
      style={{ width: '100%', height: '100%' }}
    >
      <defs>
        <linearGradient id="tech-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--bg-muted, #f5f0e8)" />
          <stop offset="100%" stopColor="var(--accent-light, #fef3c7)" />
        </linearGradient>
        <pattern
          id="tech-grid"
          x="0"
          y="0"
          width="40"
          height="40"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M 40 0 L 0 0 0 40"
            fill="none"
            stroke="var(--accent, #b45309)"
            strokeWidth="0.4"
            strokeOpacity="0.15"
          />
        </pattern>
      </defs>

      <rect width="320" height="240" fill="url(#tech-bg)" />
      <rect width="320" height="240" fill="url(#tech-grid)" />

      {/* Centred diamond / yantra shape */}
      {[80, 60, 40, 20].map((r, i) => (
        <polygon
          key={r}
          points={`160,${120 - r} ${160 + r},120 160,${120 + r} ${160 - r},120`}
          fill="none"
          stroke="var(--accent, #b45309)"
          strokeWidth={i % 2 === 0 ? 0.75 : 0.4}
          strokeOpacity={0.25 - i * 0.04}
          transform={`rotate(${i * 15}, 160, 120)`}
        />
      ))}

      {/* Corner accent dots */}
      {[
        [40, 40],
        [280, 40],
        [40, 200],
        [280, 200],
      ].map(([cx, cy], i) => (
        <circle
          key={i}
          cx={cx}
          cy={cy}
          r="4"
          fill="var(--accent, #b45309)"
          fillOpacity="0.12"
        />
      ))}

      {/* Centre dot */}
      <circle cx="160" cy="120" r="6" fill="var(--accent, #b45309)" fillOpacity="0.2" />
    </svg>
  );
}

/**
 * Wave/ripple pattern — used for article/content card placeholders.
 * Lightweight, elegant, content-neutral.
 */
function ArticleMotif() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 320 176"
      aria-hidden="true"
      focusable="false"
      preserveAspectRatio="xMidYMid slice"
      style={{ width: '100%', height: '100%' }}
    >
      <defs>
        <linearGradient id="article-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--bg-muted, #f5f0e8)" />
          <stop offset="100%" stopColor="var(--accent-light, #fef3c7)" />
        </linearGradient>
      </defs>

      <rect width="320" height="176" fill="url(#article-bg)" />

      {/* Concentric arcs — ripple effect */}
      {[160, 140, 120, 100, 80, 60].map((r, i) => (
        <path
          key={r}
          d={`M ${160 - r} 88 A ${r} ${r} 0 0 1 ${160 + r} 88`}
          fill="none"
          stroke="var(--accent, #b45309)"
          strokeWidth="0.75"
          strokeOpacity={0.12 - i * 0.015}
        />
      ))}

      {/* Horizontal rule trio */}
      {[130, 140, 150].map((y) => (
        <line
          key={y}
          x1="110"
          y1={y}
          x2="210"
          y2={y}
          stroke="var(--accent, #b45309)"
          strokeWidth="0.5"
          strokeOpacity="0.1"
        />
      ))}

      {/* Centre motif */}
      <circle cx="160" cy="88" r="16" fill="none" stroke="var(--accent, #b45309)" strokeWidth="0.5" strokeOpacity="0.2" />
      <circle cx="160" cy="88" r="5" fill="var(--accent, #b45309)" fillOpacity="0.18" />
    </svg>
  );
}

/**
 * Default mandala — a universal fallback.
 */
function DefaultMotif() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 320 240"
      aria-hidden="true"
      focusable="false"
      preserveAspectRatio="xMidYMid slice"
      style={{ width: '100%', height: '100%' }}
    >
      <defs>
        <radialGradient id="default-bg" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stopColor="var(--bg-muted, #f5f0e8)" />
          <stop offset="100%" stopColor="var(--accent-light, #fef3c7)" />
        </radialGradient>
      </defs>

      <rect width="320" height="240" fill="url(#default-bg)" />

      {/* Simple concentric circles */}
      {[100, 80, 60, 40, 20].map((r) => (
        <circle
          key={r}
          cx="160"
          cy="120"
          r={r}
          fill="none"
          stroke="var(--accent, #b45309)"
          strokeWidth="0.6"
          strokeOpacity={0.08 + (100 - r) * 0.001}
        />
      ))}

      {/* 12-fold symmetry lines */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i * Math.PI * 2) / 12;
        return (
          <line
            key={i}
            x1="160"
            y1="120"
            x2={160 + Math.cos(angle) * 100}
            y2={120 + Math.sin(angle) * 100}
            stroke="var(--accent, #b45309)"
            strokeWidth="0.4"
            strokeOpacity="0.1"
          />
        );
      })}

      <circle cx="160" cy="120" r="8" fill="var(--accent, #b45309)" fillOpacity="0.15" />
    </svg>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function DecorativeMotif({
  variant = 'default',
  className,
}: DecorativeMotifProps) {
  const motif =
    variant === 'solar' ? <SolarMotif /> :
    variant === 'tech'  ? <TechMotif />  :
    variant === 'article' ? <ArticleMotif /> :
    <DefaultMotif />;

  return (
    <div
      aria-hidden="true"
      role="presentation"
      className={className}
      style={{ overflow: 'hidden' }}
    >
      {motif}
    </div>
  );
}
