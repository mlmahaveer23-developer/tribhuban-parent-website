'use client';

/**
 * StaggerGroup — staggered entrance for grouped items (cards, lists, grids).
 *
 * Wraps a list/grid container and staggers each direct child's entrance.
 * Children must accept className or be standard HTML elements.
 *
 * Usage:
 *   <StaggerGroup variant="fadeUp" stagger={0.08}>
 *     {items.map(item => <Card key={item.id} {...item} />)}
 *   </StaggerGroup>
 */

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useReducedMotion } from '@/lib/utils/motion';

interface StaggerGroupProps {
  children: React.ReactNode;
  variant?: 'fadeUp' | 'fadeIn' | 'scale';
  stagger?: number;   // seconds between each child
  delay?: number;     // initial delay before first child
  className?: string;
  once?: boolean;
  threshold?: number;
  as?: 'div' | 'ul' | 'ol' | 'section';
}

export default function StaggerGroup({
  children,
  variant = 'fadeUp',
  stagger = 0.08,
  delay = 0,
  className,
  once = true,
  threshold = 0.1,
  as = 'div',
}: StaggerGroupProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, amount: threshold });
  const reduced = useReducedMotion();

  const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: reduced ? 0 : stagger,
        delayChildren: reduced ? 0 : delay,
      },
    },
  };

  const childVariants = reduced
    ? { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.2 } } }
    : variant === 'fadeUp'
      ? { hidden: { opacity: 0, y: 28 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease } } }
      : variant === 'scale'
        ? { hidden: { opacity: 0, scale: 0.94 }, visible: { opacity: 1, scale: 1, transition: { duration: 0.45, ease } } }
        : { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.4 } } };

  const MotionComp = motion[as] as typeof motion.div;

  return (
    <MotionComp
      ref={ref as React.RefObject<HTMLDivElement>}
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      className={className}
    >
      {Array.isArray(children)
        ? children.map((child, i) => (
            <motion.div key={i} variants={childVariants}>
              {child}
            </motion.div>
          ))
        : <motion.div variants={childVariants}>{children}</motion.div>}
    </MotionComp>
  );
}
