'use client';

/**
 * HeroContent
 *
 * Animated hero text overlay that sits above the HeroWaveBackground canvas.
 * Uses Framer Motion for entrance animations; respects prefers-reduced-motion
 * via useMotionVariants from lib/utils/motion.
 *
 * Typography:
 *   - H1: Playfair Display, 64–88px, warm ink (#1C1815), tight leading
 *   - Subheading: Inter, 18–20px, muted warm stone (#5A4E3F)
 *   - Tagline chip: Inter, 13px, copper accent, pill badge
 *   - CTAs: copper primary + ghost outline
 */

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useMotionVariants } from '@/lib/utils/motion';

// ── Animation variants ────────────────────────────────────────────────────────

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.13, delayChildren: 0.1 },
  },
};

const fadeUpVariant = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
};

const fadeInVariant = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.55, ease: 'easeOut' },
  },
};

const chipVariant = {
  hidden: { opacity: 0, scale: 0.88 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
};

const buttonGroupVariant = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

// ── Styles ────────────────────────────────────────────────────────────────────

const primaryBtn =
  'inline-flex items-center justify-center h-13 px-9 rounded-full text-base font-semibold ' +
  'bg-[#B45309] text-[#FEF9EE] shadow-md shadow-[#B45309]/20 ' +
  'hover:bg-[#92400E] hover:shadow-lg hover:shadow-[#92400E]/30 ' +
  'active:scale-[0.97] ' +
  'transition-all duration-200 ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A227] focus-visible:ring-offset-2 focus-visible:ring-offset-[#fcfaf5]';

const ghostBtn =
  'inline-flex items-center justify-center h-13 px-9 rounded-full text-base font-semibold ' +
  'border-2 border-[#B45309]/40 text-[#5A4E3F] bg-transparent ' +
  'hover:border-[#B45309] hover:text-[#B45309] hover:bg-[#B45309]/5 ' +
  'active:scale-[0.97] ' +
  'transition-all duration-200 ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A227] focus-visible:ring-offset-2 focus-visible:ring-offset-[#fcfaf5]';

// ── Component ─────────────────────────────────────────────────────────────────

export default function HeroContent() {
  const container = useMotionVariants(containerVariants);
  const fadeUp = useMotionVariants(fadeUpVariant);
  const fadeIn = useMotionVariants(fadeInVariant);
  const chip = useMotionVariants(chipVariant);
  const btnGroup = useMotionVariants(buttonGroupVariant);

  return (
    /* Pointer-events: none on the wrapper — the wave canvas behind it handles
       mouse tracking. Individual interactive elements (links, buttons) get
       pointer-events back via their own default styles. */
    <div className="relative z-10 w-full pointer-events-none">
      <div className="container-content flex flex-col items-center text-center py-24 md:py-36 px-4">

        <motion.div
          variants={container}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center gap-6 max-w-4xl mx-auto"
        >

          {/* Tagline chip */}
          <motion.div variants={chip} className="pointer-events-auto">
            <span
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest"
              style={{
                background: 'rgba(180,83,9,0.08)',
                color: '#B45309',
                border: '1px solid rgba(180,83,9,0.18)',
              }}
            >
              <span className="text-base leading-none">☀</span>
              Swarga · Martya · Patala
            </span>
          </motion.div>

          {/* H1 — split into two lines for visual rhythm */}
          <motion.h1
            variants={fadeUp}
            className="font-display font-semibold leading-[1.08] tracking-tight"
            style={{
              fontSize: 'clamp(2.6rem, 6.5vw, 5.25rem)',
              color: '#1C1815',
            }}
          >
            Technology That{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #B45309 0%, #C9A227 55%, #B45309 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Reaches Everywhere
            </span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            variants={fadeIn}
            className="text-lg md:text-xl leading-relaxed max-w-2xl"
            style={{ color: '#5A4E3F' }}
          >
            Tribhuban Concepts is an Indian technology and engineering company
            bringing precision-engineered solar energy and future technologies
            to every home and business — rooted in heritage, built for tomorrow.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            variants={btnGroup}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-2 pointer-events-auto"
          >
            <Link href="/consultation" className={primaryBtn}>
              Book a Consultation
            </Link>
            <Link href="/solar" className={ghostBtn}>
              Explore Solar ↗
            </Link>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            variants={fadeIn}
            className="mt-10 flex flex-col items-center gap-2 pointer-events-none"
            aria-hidden="true"
          >
            <span className="text-xs uppercase tracking-widest" style={{ color: 'rgba(90,78,63,0.5)' }}>
              Scroll to explore
            </span>
            <motion.div
              animate={{ y: [0, 7, 0] }}
              transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
              className="w-5 h-5 flex items-center justify-center"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 3v10M4 9l4 4 4-4" stroke="#B45309" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
              </svg>
            </motion.div>
          </motion.div>

        </motion.div>
      </div>
    </div>
  );
}
