'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { Menu } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import Nav from './Nav';
import MobileDrawer from './MobileDrawer';

/* ─────────────────────────────────────────────────────────────────────────────
   Header — sticky, backdrop-blur, full implementation.

   - Server component shell imports client Nav and MobileDrawer islands.
   - Uses "use client" here because we manage drawerOpen state + triggerRef.
   - Logo: "Tribhuban Concepts" as a Link using display font.
   - Nav: hidden on mobile (hidden md:flex), shown desktop.
   - Mobile hamburger: visible on mobile (flex md:hidden).
   - Persistent CTA "Book Consultation" + "Contact" always visible on desktop.
───────────────────────────────────────────────────────────────────────────── */
export default function Header() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const hamburgerRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <header
        role="banner"
        className={cn(
          'sticky top-0 z-[100] w-full',
          'border-b border-[var(--nav-border)]',
        )}
        style={{
          backgroundColor: 'var(--nav-bg)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}
      >
        <div className="container-content flex items-center justify-between h-16">
          {/* ── Brand / Logo ─────────────────────────────────────────────── */}
          <Link
            href="/"
            className={cn(
              'font-display font-semibold text-lg text-[var(--fg)]',
              'hover:text-[var(--accent)] transition-colors duration-150',
              'focus-visible:outline-none focus-visible:ring-2',
              'focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2',
              'focus-visible:ring-offset-[var(--bg)] rounded-sm',
              'shrink-0',
            )}
          >
            Tribhuban Concepts
          </Link>

          {/* ── Desktop primary nav — hidden on mobile ───────────────────── */}
          <div className="hidden md:flex items-center">
            <Nav />
          </div>

          {/* ── Desktop actions — hidden on mobile ───────────────────────── */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/contact"
              className={cn(
                'text-sm font-medium text-[var(--fg)]',
                'hover:text-[var(--accent)] transition-colors duration-150',
                'focus-visible:outline-none focus-visible:ring-2',
                'focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2',
                'focus-visible:ring-offset-[var(--bg)] rounded-sm px-2 py-1',
              )}
            >
              Contact
            </Link>
            <Link
              href="/consultation"
              className={cn(
                'inline-flex items-center justify-center',
                'h-9 px-4 rounded-md',
                'text-sm font-semibold',
                'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-fg)]',
                'hover:bg-[var(--btn-primary-hover)] transition-colors duration-150',
                'focus-visible:outline-none focus-visible:ring-2',
                'focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2',
                'focus-visible:ring-offset-[var(--bg)]',
              )}
            >
              Book Consultation
            </Link>
          </div>

          {/* ── Mobile hamburger — visible on mobile only ─────────────────── */}
          <button
            ref={hamburgerRef}
            type="button"
            aria-label="Open navigation menu"
            aria-expanded={drawerOpen}
            aria-controls="mobile-nav-drawer"
            onClick={() => setDrawerOpen(true)}
            className={cn(
              'flex md:hidden items-center justify-center',
              'h-10 w-10 rounded-md',
              'text-[var(--fg)] hover:bg-[var(--bg-muted)]',
              'transition-colors duration-150',
              'focus-visible:outline-none focus-visible:ring-2',
              'focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2',
              'focus-visible:ring-offset-[var(--bg)]',
            )}
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </header>

      {/* ── Mobile drawer — rendered outside header for correct stacking ── */}
      <MobileDrawer
        open={drawerOpen}
        onOpenChange={(open) => {
          setDrawerOpen(open);
          // Return focus to hamburger trigger when drawer closes
          if (!open) {
            requestAnimationFrame(() => hamburgerRef.current?.focus());
          }
        }}
        triggerRef={hamburgerRef}
      />
    </>
  );
}
