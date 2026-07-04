'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import MegaMenu from './MegaMenu';

const navItems = [
  { label: 'Products', href: '/products' },
  { label: 'Future Technologies', href: '/future-technologies' },
  { label: 'Knowledge', href: '/knowledge' },
  { label: 'Blog', href: '/blog' },
  { label: 'Company', href: '/about' },
] as const;

/* ─────────────────────────────────────────────────────────────────────────────
   Nav — desktop primary navigation with:
   - Animated hover underline (slides in/out)
   - Active page indicator (persistent copper underline)
   - Smooth colour transitions
───────────────────────────────────────────────────────────────────────────── */
export default function Nav() {
  const pathname = usePathname();
  const [hoveredHref, setHoveredHref] = useState<string | null>(null);

  return (
    <nav aria-label="Primary navigation">
      <ul
        className="flex items-center gap-1 list-none m-0 p-0"
        onMouseLeave={() => setHoveredHref(null)}
      >
        {/* Solar — MegaMenu */}
        <li>
          <MegaMenu />
        </li>

        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const isHovered = hoveredHref === item.href;

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                onMouseEnter={() => setHoveredHref(item.href)}
                className={cn(
                  'relative inline-flex items-center px-3 py-2 rounded-sm',
                  'text-sm font-medium transition-colors duration-150',
                  'focus-visible:outline-none focus-visible:ring-2',
                  'focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2',
                  'focus-visible:ring-offset-[var(--bg)]',
                  isActive ? 'text-[var(--accent)]' : 'text-[var(--fg)]',
                )}
              >
                {item.label}

                {/* Hover underline — slides in from left */}
                <AnimatePresence>
                  {(isHovered || isActive) && (
                    <motion.span
                      className="absolute bottom-0.5 left-3 right-3 h-[1.5px] rounded-full"
                      style={{
                        backgroundColor: isActive
                          ? 'var(--accent)'
                          : 'var(--fg-subtle)',
                      }}
                      initial={{ scaleX: 0, originX: 0 }}
                      animate={{ scaleX: 1 }}
                      exit={{ scaleX: 0, originX: 1 }}
                      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                      aria-hidden="true"
                    />
                  )}
                </AnimatePresence>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
