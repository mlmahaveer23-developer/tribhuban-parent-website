'use client';

/**
 * Nav — desktop primary navigation.
 *
 * Order: [MegaMenu: Businesses | Products | Resources | Partners | About]  Contact
 *
 * MegaMenu handles Businesses, Products, Resources, Partners, About.
 * Contact is a simple plain link rendered here.
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { cn } from '@/lib/utils/cn';
import MegaMenu from './MegaMenu';

export default function Nav() {
  const pathname = usePathname();
  const [hoveredContact, setHoveredContact] = useState(false);
  const isContactActive = pathname === '/contact';

  return (
    <nav aria-label="Primary navigation" className="flex items-center">
      {/* Mega menu covers: Businesses, Products, Resources, Partners, About */}
      <MegaMenu />

      {/* Contact — plain link with hover underline */}
      <div className="ml-1">
        <Link
          href="/contact"
          aria-current={isContactActive ? 'page' : undefined}
          onMouseEnter={() => setHoveredContact(true)}
          onMouseLeave={() => setHoveredContact(false)}
          className={cn(
            'relative inline-flex items-center px-2.5 py-1.5 rounded-sm',
            'text-sm font-medium transition-colors duration-150',
            'focus-visible:outline-none focus-visible:ring-2',
            'focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2',
            'focus-visible:ring-offset-[var(--bg)]',
            isContactActive ? 'text-[var(--accent)]' : 'text-[var(--fg)]',
          )}
        >
          Contact
          <AnimatePresence>
            {(hoveredContact || isContactActive) && (
              <motion.span
                className="absolute bottom-0.5 left-2.5 right-2.5 h-[1.5px] rounded-full"
                style={{
                  backgroundColor: isContactActive
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
      </div>
    </nav>
  );
}
