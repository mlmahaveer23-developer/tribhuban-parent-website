/**
 * motion.ts
 *
 * Utilities for Framer Motion that respect the visitor's
 * `prefers-reduced-motion: reduce` OS setting (Req 24.5).
 *
 * Usage:
 *   const variants = useMotionVariants(fadeUp);
 *   <motion.div variants={variants} initial="hidden" animate="visible" />
 *
 * When reduced-motion is active every variant is replaced with an
 * opacity-only or instant transition so no spatial movement occurs.
 */

'use client';

import { useReducedMotion as useFramerReducedMotion } from 'framer-motion';
import type { Variants, Transition, MotionProps } from 'framer-motion';

/* ─────────────────────────────────────────────────────────────────────────────
   Hook: useReducedMotion
   Wraps Framer Motion's built-in hook and returns a boolean.
   Components can use this to conditionally apply motion.
───────────────────────────────────────────────────────────────────────────── */
export function useReducedMotion(): boolean {
  // Framer Motion reads prefers-reduced-motion and returns true when the user
  // has requested reduced motion. Returns null during SSR — treat as false.
  const prefersReduced = useFramerReducedMotion();
  return prefersReduced ?? false;
}

/* ─────────────────────────────────────────────────────────────────────────────
   Types
───────────────────────────────────────────────────────────────────────────── */

export type MotionVariants = Variants;

/* ─────────────────────────────────────────────────────────────────────────────
   Reduced-motion fallback builder
   Strips all x/y/scale transforms — keeps only opacity transitions,
   and sets duration to 0.15 s (nearly instant but still a valid transition).
───────────────────────────────────────────────────────────────────────────── */

const REDUCED_TRANSITION: Transition = { duration: 0.15, ease: 'linear' };

function stripMotion(variant: Record<string, unknown>): Record<string, unknown> {
  const { x: _x, y: _y, scale: _s, rotate: _r, skew: _sk, ...rest } = variant as Record<string, unknown>;
  return {
    ...rest,
    transition: REDUCED_TRANSITION,
  };
}

/**
 * useMotionVariants
 *
 * Takes a `Variants` object and returns it unchanged when the user has no
 * motion preference. When `prefers-reduced-motion: reduce` is set, every
 * variant is stripped of spatial transforms — only opacity changes remain.
 *
 * @param variants  The full animation variants to use on capable devices.
 * @returns Variants safe to pass directly to a <motion.*> component.
 */
export function useMotionVariants(variants: Variants): Variants {
  const reduced = useReducedMotion();
  if (!reduced) return variants;

  const reducedVariants: Variants = {};
  for (const [key, variant] of Object.entries(variants)) {
    if (typeof variant === 'function') {
      // Dynamic (resolver) variant — pass through unchanged in reduced mode.
      // The component author should use motionProps() instead for full control.
      reducedVariants[key] = variant;
    } else if (variant && typeof variant === 'object') {
      // Cast through unknown to satisfy Framer Motion's strict TargetAndTransition type
      reducedVariants[key] = stripMotion(variant as Record<string, unknown>) as unknown as typeof variant;
    } else {
      reducedVariants[key] = variant;
    }
  }
  return reducedVariants;
}

/* ─────────────────────────────────────────────────────────────────────────────
   Common pre-built variant presets
   Use these (via useMotionVariants) across the site for consistency.
───────────────────────────────────────────────────────────────────────────── */

/** Fade up — the standard entry animation for sections and cards */
export const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
};

/** Fade in — for overlays, modals, dropdowns */
export const fadeInVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2, ease: 'easeIn' },
  },
};

/** Slide in from the right — for drawers and side panels */
export const slideInRightVariants: Variants = {
  hidden: { opacity: 0, x: '100%' },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    x: '100%',
    transition: { duration: 0.25, ease: 'easeIn' },
  },
};

/** Scale pop — for tooltips and small popovers */
export const scalePopVariants: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    scale: 0.92,
    transition: { duration: 0.15, ease: 'easeIn' },
  },
};

/** Stagger container — triggers staggered children entrance */
export const staggerContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

/* ─────────────────────────────────────────────────────────────────────────────
   Required named exports (aliases + helpers matching spec §22.1 interface)
───────────────────────────────────────────────────────────────────────────── */

/**
 * fadeVariants — fade in/out with optional Y offset.
 * Collapses to { opacity: 1 } (instant) when reduced motion is active.
 */
export const fadeVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.35, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2, ease: 'easeIn' },
  },
};

/**
 * slideVariants — slides in from below with fade.
 * Collapses to { opacity: 1 } / instant when reduced motion is active.
 */
export const slideVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    y: 20,
    transition: { duration: 0.25, ease: 'easeIn' },
  },
};

/**
 * motionProps — convenience helper that returns a `MotionProps`-compatible
 * object ready to spread onto a `<motion.*>` element.
 *
 * When `reduceMotion` is true the variants are stripped of spatial transforms
 * so only opacity changes remain (instant feel, no layout shift).
 *
 * @param variants      Full Framer Motion Variants object.
 * @param reduceMotion  Pass the value returned by `useReducedMotion()`.
 * @returns             Props spread-able onto any `<motion.*>` component.
 *
 * @example
 * const reduce = useReducedMotion();
 * <motion.div {...motionProps(fadeVariants, reduce)} initial="hidden" animate="visible" />
 */
export function motionProps(
  variants: Variants,
  reduceMotion: boolean,
): Pick<MotionProps, 'variants' | 'transition'> {
  if (!reduceMotion) {
    return { variants };
  }

  // Build reduced variants: strip x/y/scale, keep opacity, instant transition
  const reducedVariants: Variants = {};
  for (const [key, variant] of Object.entries(variants)) {
    if (typeof variant === 'function') {
      reducedVariants[key] = variant;
    } else if (variant && typeof variant === 'object') {
      const { x: _x, y: _y, scale: _s, rotate: _r, ...rest } = variant as Record<string, unknown>;
      reducedVariants[key] = {
        ...rest,
        transition: { duration: 0.01, ease: 'linear' },
      };
    } else {
      reducedVariants[key] = variant;
    }
  }

  return {
    variants: reducedVariants,
    transition: { duration: 0.01 },
  };
}
