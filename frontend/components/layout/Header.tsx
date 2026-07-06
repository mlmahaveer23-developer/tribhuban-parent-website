'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Menu } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import Nav from './Nav';
import MobileDrawer from './MobileDrawer';

/*
 * Header — sticky, animated, full-width mega menu support.
 *
 * MEGA MENU FIX:
 * The NavigationMenu.Viewport must escape the header's max-width container
 * and span the full viewport width. We achieve this by:
 *   1. Making the <header> itself position:relative (sticky already implies this).
 *   2. Placing the Viewport in a div that is a direct child of <header>
 *      (NOT inside .container-content), positioned absolute top-full left-0
 *      with w-full — so it spans the full header width = 100vw.
 *
 * The NavigationMenu.Root in MegaMenu renders its Viewport into the Radix
 * default position (relative to Root). We override this by passing a
 * forwardedRef so Radix attaches the Viewport to our full-width container.
 *
 * Alternative approach used here (simpler): override the Viewport container
 * with fixed positioning on the header element itself.
 */

export default function Header() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const hamburgerRef = useRef<HTMLButtonElement>(null);

  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const delta = y - lastScrollY.current;
      if (y > 120 && delta > 6) setHidden(true);
      else if (delta < -4) setHidden(false);
      setScrolled(y > 80);
      lastScrollY.current = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <motion.header
        role="banner"
        animate={{ y: hidden ? '-100%' : '0%' }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          'sticky top-0 z-[100] w-full',
          // overflow-visible is CRITICAL — allows the mega menu panel to
          // visually overflow below the header
          'overflow-visible',
          'border-b border-[var(--nav-border)]',
          'transition-shadow duration-300',
          scrolled && 'shadow-[0_2px_16px_rgba(46,39,31,0.08)]',
        )}
        style={{
          backgroundColor: scrolled ? 'var(--nav-bg)' : 'rgba(254,253,251,0.75)',
          backdropFilter: scrolled ? 'blur(14px)' : 'blur(6px)',
          WebkitBackdropFilter: scrolled ? 'blur(14px)' : 'blur(6px)',
          transition: 'background-color 0.4s ease, backdrop-filter 0.4s ease',
        }}
      >
        {/* ── Nav bar row ─────────────────────────────────────────────────── */}
        <div className="container-content flex items-center justify-between h-16">

          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          >
            <Link
              href="/"
              className={cn(
                'font-display font-semibold text-lg text-[var(--fg)] shrink-0',
                'hover:text-[var(--accent)] transition-colors duration-200',
                'focus-visible:outline-none focus-visible:ring-2',
                'focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2',
                'focus-visible:ring-offset-[var(--bg)] rounded-sm',
              )}
            >
              Tribhuban Concepts
            </Link>
          </motion.div>

          {/* Desktop nav — spans full width so MegaMenu Viewport aligns correctly */}
          <div className="hidden md:flex items-center flex-1 justify-center">
            <Nav />
          </div>

          {/* Desktop right actions */}
          <div className="hidden md:flex items-center gap-2">
            <Link
              href="/login"
              className={cn(
                'text-sm font-medium text-[var(--fg)] px-2.5 py-1.5 rounded-sm',
                'hover:text-[var(--accent)] transition-colors duration-150',
                'focus-visible:outline-none focus-visible:ring-2',
                'focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2',
                'focus-visible:ring-offset-[var(--bg)]',
              )}
            >
              Login
            </Link>

            <motion.div
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            >
              <Link
                href="/consultation"
                className={cn(
                  'relative inline-flex items-center justify-center overflow-hidden',
                  'h-9 px-4 rounded-md text-sm font-semibold',
                  'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-fg)]',
                  'hover:bg-[var(--btn-primary-hover)] transition-colors duration-150',
                  'focus-visible:outline-none focus-visible:ring-2',
                  'focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2',
                  'focus-visible:ring-offset-[var(--bg)] group',
                )}
              >
                <span className="relative z-10">Book Consultation</span>
                <motion.span
                  className="absolute inset-0 bg-white/10"
                  initial={{ x: '-100%', skewX: -15 }}
                  whileHover={{ x: '200%' }}
                  transition={{ duration: 0.5, ease: 'easeInOut' }}
                  aria-hidden="true"
                />
              </Link>
            </motion.div>
          </div>

          {/* Mobile hamburger */}
          <motion.button
            ref={hamburgerRef}
            type="button"
            aria-label="Open navigation menu"
            aria-expanded={drawerOpen}
            aria-controls="mobile-nav-drawer"
            onClick={() => setDrawerOpen(true)}
            whileTap={{ scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            className={cn(
              'flex md:hidden items-center justify-center h-10 w-10 rounded-md',
              'text-[var(--fg)] hover:bg-[var(--bg-muted)] transition-colors duration-150',
              'focus-visible:outline-none focus-visible:ring-2',
              'focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2',
              'focus-visible:ring-offset-[var(--bg)]',
            )}
          >
            <motion.div
              animate={drawerOpen ? { rotate: 90, opacity: 0 } : { rotate: 0, opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </motion.div>
          </motion.button>
        </div>

      </motion.header>

      <MobileDrawer
        open={drawerOpen}
        onOpenChange={(open) => {
          setDrawerOpen(open);
          if (!open) requestAnimationFrame(() => hamburgerRef.current?.focus());
        }}
        triggerRef={hamburgerRef}
      />
    </>
  );
}
