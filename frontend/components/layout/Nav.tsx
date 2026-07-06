'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { cn } from '@/lib/utils/cn';
import MegaMenu from './MegaMenu';

interface NavProps {
  /** Passed from Header — full-width div that receives the mega menu Viewport */
  viewportContainerRef: React.RefObject<HTMLDivElement | null>;
}

export default function Nav({ viewportContainerRef }: NavProps) {
  const pathname = usePathname();
  const isContactActive = pathname === '/contact';
  const [hoveredContact, setHoveredContact] = useState(false);

  return (
    <nav aria-label="Primary navigation" className="flex items-center gap-0">
      {/* Mega menu — Businesses, Products, Resources, Partners, About */}
      <MegaMenu viewportContainerRef={viewportContainerRef} />

      {/* Contact — plain animated link */}
      <Link
        href="/contact"
        aria-current={isContactActive ? 'page' : undefined}
        onMouseEnter={() => setHoveredContact(true)}
        onMouseLeave={() => setHoveredContact(false)}
        className={cn(
          'relative inline-flex items-center px-2.5 py-1.5 rounded-sm ml-1',
          'text-sm font-medium transition-colors duration-150',
          'focus-visible:outline-none focus-visible:ring-2',
          'focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]',
          isContactActive ? 'text-[var(--accent)]' : 'text-[var(--fg)]',
        )}
      >
        Contact
        <AnimatePresence>
          {(hoveredContact || isContactActive) && (
            <motion.span
              className="absolute bottom-0.5 left-2.5 right-2.5 h-[1.5px] rounded-full"
              style={{ backgroundColor: isContactActive ? 'var(--accent)' : 'var(--fg-subtle)' }}
              initial={{ scaleX: 0, originX: 0 }}
              animate={{ scaleX: 1 }}
              exit={{ scaleX: 0, originX: 1 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              aria-hidden="true"
            />
          )}
        </AnimatePresence>
      </Link>
    </nav>
  );
}
