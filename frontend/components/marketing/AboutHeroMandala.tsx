'use client';

/**
 * AboutHeroMandala — Clearly visible animated SVG mandala.
 * - High stroke widths + opacity so it's unmistakably visible
 * - Slow counter-rotate inner ring for layered motion feel
 * - Mobile: positioned as a background layer behind text (z-index: 0)
 * - Desktop: right-side decorative element
 * - Respects prefers-reduced-motion (freezes animation, stays visible)
 */

export default function AboutHeroMandala() {
  const cx = 240;
  const cy = 240;

  return (
    <div className="ab-mandala" aria-hidden="true">
      <svg
        viewBox="0 0 480 480"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="ab-mandala__svg"
      >
        {/* ── Outer dashed ring ── */}
        <circle
          cx={cx} cy={cy} r="228"
          stroke="currentColor" strokeWidth="1.5"
          strokeDasharray="6 10"
          opacity="0.55"
        />

        {/* ── Second ring ── */}
        <circle
          cx={cx} cy={cy} r="192"
          stroke="currentColor" strokeWidth="1"
          opacity="0.45"
        />

        {/* ── Third ring with fill tint ── */}
        <circle
          cx={cx} cy={cy} r="152"
          stroke="currentColor" strokeWidth="1.5"
          strokeDasharray="3 8"
          opacity="0.5"
        />

        {/* ── Core ring ── */}
        <circle
          cx={cx} cy={cy} r="108"
          stroke="currentColor" strokeWidth="2"
          opacity="0.6"
        />

        {/* ── Inner ring (counter-rotates via CSS class) ── */}
        <g className="ab-mandala__inner-spin">
          <circle
            cx={cx} cy={cy} r="68"
            stroke="currentColor" strokeWidth="1.5"
            strokeDasharray="5 7"
            opacity="0.55"
          />
        </g>

        {/* ── 12 radial spokes ── */}
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i * 30 * Math.PI) / 180;
          const x1 = cx + 112 * Math.cos(angle);
          const y1 = cy + 112 * Math.sin(angle);
          const x2 = cx + 224 * Math.cos(angle);
          const y2 = cy + 224 * Math.sin(angle);
          return (
            <line
              key={i}
              x1={x1} y1={y1} x2={x2} y2={y2}
              stroke="currentColor"
              strokeWidth="0.75"
              opacity="0.35"
            />
          );
        })}

        {/* ── 8 petal circles at r=192 ── */}
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i * 45 * Math.PI) / 180;
          const pcx = cx + 192 * Math.cos(angle);
          const pcy = cy + 192 * Math.sin(angle);
          return (
            <circle
              key={i}
              cx={pcx} cy={pcy} r="14"
              stroke="currentColor" strokeWidth="1.25"
              opacity="0.5"
              fill="none"
            />
          );
        })}

        {/* ── 8 small accent dots at r=152 ── */}
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = ((i * 45 + 22.5) * Math.PI) / 180;
          const dcx = cx + 152 * Math.cos(angle);
          const dcy = cy + 152 * Math.sin(angle);
          return (
            <circle
              key={i}
              cx={dcx} cy={dcy} r="4"
              fill="currentColor"
              opacity="0.45"
            />
          );
        })}

        {/* ── 4 diamonds at r=108 ── */}
        {Array.from({ length: 4 }).map((_, i) => {
          const angle = (i * 90 * Math.PI) / 180;
          const dcx = cx + 108 * Math.cos(angle);
          const dcy = cy + 108 * Math.sin(angle);
          const s = 9;
          return (
            <polygon
              key={i}
              points={`${dcx},${dcy - s} ${dcx + s},${dcy} ${dcx},${dcy + s} ${dcx - s},${dcy}`}
              stroke="currentColor" strokeWidth="1.25"
              opacity="0.55"
              fill="none"
            />
          );
        })}

        {/* ── Centre cross ── */}
        <line x1={cx - 16} y1={cy} x2={cx + 16} y2={cy} stroke="currentColor" strokeWidth="1.5" opacity="0.7" />
        <line x1={cx} y1={cy - 16} x2={cx} y2={cy + 16} stroke="currentColor" strokeWidth="1.5" opacity="0.7" />

        {/* ── Centre dot ── */}
        <circle cx={cx} cy={cy} r="5" fill="currentColor" opacity="0.8" />
      </svg>
    </div>
  );
}
