'use client';

/**
 * ScrollReveal — viewport-triggered entrance animation wrapper.
 *
 * Wraps any content and animates it in when it enters the viewport.
 * Supports 6 distinct animation styles to avoid repetition across sections.
 * All animations respect prefers-reduced-motion.
 *
 * Usage:
 *   <ScrollReveal variant="fadeUp">
 *     <YourComponent />
 *   </ScrollReveal>
 */

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useReducedMotion } from '@/lib/utils/motion';

export type RevealVariant =
  | 'fadeUp'      // standard — fades in rising from below
  | 'fadeLeft'    // slides in from left
  | 'fadeRight'   // slides in from right
  | 'scale'       // soft scale from 96% to 100%
  | 'blur'        // blur-to-sharp (filter)
  | 'clipUp';     // clip-path curtain reveal from bottom

interface ScrollRevealProps {
  children: React.ReactNode;
  variant?: RevealVariant;
  delay?: number;       // seconds
  duration?: number;    // seconds
  className?: string;
  once?: boolean;       // animate only once (default true)
  threshold?: number;   // 0–1 viewport fraction before triggering
}

// ── Variant definitions ───────────────────────────────────────────────────────

function getVariants(variant: RevealVariant, duration: number) {
  const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];

  const base = { transition: { duration, ease } };

  switch (variant) {
    case 'fadeUp':
      return {
        hidden: { opacity: 0, y: 32 },
        visible: { opacity: 1, y: 0, ...base },
      };
    case 'fadeLeft':
      return {
        hidden: { opacity: 0, x: -32 },
        visible: { opacity: 1, x: 0, ...base },
      };
    case 'fadeRight':
      return {
        hidden: { opacity: 0, x: 32 },
        visible: { opacity: 1, x: 0, ...base },
      };
    case 'scale':
      return {
        hidden: { opacity: 0, scale: 0.94 },
        visible: { opacity: 1, scale: 1, ...base },
      };
    case 'blur':
      return {
        hidden: { opacity: 0, filter: 'blur(8px)' },
        visible: { opacity: 1, filter: 'blur(0px)', ...base },
      };
    case 'clipUp':
      return {
        hidden: { clipPath: 'inset(100% 0 0 0)', opacity: 0 },
        visible: { clipPath: 'inset(0% 0 0 0)', opacity: 1, ...base },
      };
    default:
      return {
        hidden: { opacity: 0 },
        visible: { opacity: 1, ...base },
      };
  }
}

// Reduced-motion fallback — just fade
const reducedVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.25 } },
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function ScrollReveal({
  children,
  variant = 'fadeUp',
  delay = 0,
  duration = 0.55,
  className,
  once = true,
  threshold = 0.12,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, amount: threshold });
  const reduced = useReducedMotion();

  const variants = reduced ? reducedVariants : getVariants(variant, duration);

  return (
    <motion.div
      ref={ref}
      variants={variants}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      transition={{ delay: reduced ? 0 : delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
