'use client';

/**
 * HeroContent — animated hero text overlay
 *
 * Changes per spec:
 * - "Book Consultation" removed (lives in nav only)
 * - Replaced with "Sign In" + "Sign Up" (equal-size pill buttons)
 * - "Explore Solar" kept as primary CTA
 * - Content positioned closer to nav (reduced top padding)
 * - All touch targets ≥ 44×44 px for mobile
 * - Stagger animation with reduced-motion support
 */

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useMotionVariants } from '@/lib/utils/motion';

// ── Animation variants ────────────────────────────────────────────────────────

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.11, delayChildren: 0.05 } },
};

const fadeUpVariant = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
};

const fadeInVariant = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5, ease: 'easeOut' } },
};

const chipVariant = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1, scale: 1,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
};

const btnGroupVariant = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
};

// ── Button styles — min 44×44px touch targets ─────────────────────────────────

// Primary: Explore Solar — copper filled pill
const primaryBtn =
  'inline-flex items-center justify-center min-h-[52px] min-w-[44px] px-8 sm:px-10 ' +
  'rounded-full text-base sm:text-lg font-semibold ' +
  'bg-[#B45309] text-[#FEF9EE] shadow-md shadow-[#B45309]/20 ' +
  'hover:bg-[#92400E] hover:shadow-lg hover:shadow-[#92400E]/25 ' +
  'active:scale-[0.97] transition-all duration-200 ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A227] ' +
  'focus-visible:ring-offset-2 focus-visible:ring-offset-[#fcfaf5]';

// Secondary: Sign Up — copper ghost pill
const secondaryBtn =
  'inline-flex items-center justify-center min-h-[52px] min-w-[44px] px-8 sm:px-10 ' +
  'rounded-full text-base sm:text-lg font-semibold ' +
  'border-2 border-[#B45309]/45 text-[#5A4E3F] bg-transparent ' +
  'hover:border-[#B45309] hover:text-[#B45309] hover:bg-[#B45309]/6 ' +
  'active:scale-[0.97] transition-all duration-200 ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A227] ' +
  'focus-visible:ring-offset-2 focus-visible:ring-offset-[#fcfaf5]';

// Tertiary removed — hero has only 2 CTAs per spec


// ── Component ─────────────────────────────────────────────────────────────────

export default function HeroContent() {
  const container = useMotionVariants(containerVariants);
  const fadeUp    = useMotionVariants(fadeUpVariant);
  const fadeIn    = useMotionVariants(fadeInVariant);
  const chip      = useMotionVariants(chipVariant);
  const btnGroup  = useMotionVariants(btnGroupVariant);

  return (
    /*
     * pointer-events-none on wrapper so the wave canvas behind picks up mouse.
     * Interactive children (buttons/links) get pointer-events back automatically.
     */
    <div className="relative z-10 w-full pointer-events-none">
      {/*
        pt-16 on mobile (nav height), pt-20 md — positions content just below nav.
        pb-16 gives breathing room before the next section.
        Removed the large py-24 / md:py-36 that pushed content to mid-viewport.
      */}
      <div className="container-content flex flex-col items-center text-center pt-16 pb-14 sm:pt-20 sm:pb-16 md:pt-24 md:pb-20 px-4">

        <motion.div
          variants={container}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center gap-5 sm:gap-6 max-w-3xl mx-auto w-full"
        >

          {/* Tagline chip */}
          <motion.div variants={chip} className="pointer-events-auto">
            <span
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full
                         text-xs font-semibold uppercase tracking-widest"
              style={{
                background: 'rgba(180,83,9,0.08)',
                color: '#B45309',
                border: '1px solid rgba(180,83,9,0.20)',
              }}
            >
              <span className="text-sm leading-none" aria-hidden="true">☀</span>
              Swarga · Martya · Patala
            </span>
          </motion.div>

          {/* H1 */}
          <motion.h1
            variants={fadeUp}
            className="font-display font-semibold leading-[1.08] tracking-tight"
            style={{ fontSize: 'clamp(2.4rem, 6vw, 5rem)', color: '#1C1815' }}
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
            className="text-base sm:text-lg md:text-xl leading-relaxed max-w-xl"
            style={{ color: '#5A4E3F' }}
          >
            Tribhuban Concepts is an Indian technology and engineering company
            bringing precision-engineered solar energy and future technologies
            to every home and business — rooted in heritage, built for tomorrow.
          </motion.p>

          {/* CTA buttons — stacked on mobile, row on sm+ */}
          <motion.div
            variants={btnGroup}
            className="flex flex-col sm:flex-row items-center justify-center
                       gap-3 sm:gap-4 mt-1 w-full sm:w-auto pointer-events-auto"
          >
            {/* Primary: Explore Solar */}
            <Link href="/solar" className={`${primaryBtn} w-full sm:w-auto`}>
              Explore Solar
            </Link>

            {/* Secondary: Start for Free → signup */}
            <Link href="/signup" className={`${secondaryBtn} w-full sm:w-auto`}>
              Start for Free
            </Link>
          </motion.div>

          {/* Scroll indicator — hidden on very small screens to save space */}
          <motion.div
            variants={fadeIn}
            className="hidden sm:flex mt-6 flex-col items-center gap-1.5 pointer-events-none"
            aria-hidden="true"
          >
            <span
              className="text-[11px] uppercase tracking-widest"
              style={{ color: 'rgba(90,78,63,0.45)' }}
            >
              Scroll to explore
            </span>
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M8 3v10M4 9l4 4 4-4"
                  stroke="#B45309"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.55"
                />
              </svg>
            </motion.div>
          </motion.div>

        </motion.div>
      </div>
    </div>
  );
}
