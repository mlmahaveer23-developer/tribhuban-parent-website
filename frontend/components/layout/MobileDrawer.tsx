'use client';

/**
 * MobileDrawer — full-screen slide-out navigation for mobile.
 *
 * Completely data-driven from siteConfig.ts.
 * Adding a new business, product, or resource only requires editing that file.
 *
 * Structure: Businesses | Products | Resources | Partners | About | Contact
 * Bottom row: Login + Book Consultation CTAs.
 */

import * as Dialog from '@radix-ui/react-dialog';
import Link from 'next/link';
import { X, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { cn } from '@/lib/utils/cn';
import {
  BUSINESSES,
  RESOURCES,
  PARTNERS,
  ABOUT_LINKS,
  businessHref,
  productHref,
  resourceHref,
} from '@/lib/siteConfig';

// ── Build nav sections from config ───────────────────────────────────────────

type NavItem = { href: string; label: string; desc: string };

const navSections: { id: string; label: string; items: NavItem[] }[] = [
  {
    id: 'businesses',
    label: 'Businesses',
    items: BUSINESSES.map((b) => ({
      href: businessHref(b.slug),
      label: b.title,
      desc: b.description,
    })),
  },
  {
    id: 'products',
    label: 'Products',
    items: BUSINESSES.flatMap((b) =>
      b.products.map((p) => ({
        href: productHref(b.slug, p.slug),
        label: `${p.title}`,
        desc: p.description ?? '',
      }))
    ),
  },
  {
    id: 'resources',
    label: 'Resources',
    items: RESOURCES.map((r) => ({
      href: resourceHref(r.slug),
      label: r.title,
      desc: r.description,
    })),
  },
  {
    id: 'partners',
    label: 'Partners',
    items: PARTNERS.map((p) => ({ href: p.href, label: p.title, desc: p.description })),
  },
  {
    id: 'about',
    label: 'About',
    items: ABOUT_LINKS.map((a) => ({ href: a.href, label: a.title, desc: '' })),
  },
];

// ── Types ─────────────────────────────────────────────────────────────────────

interface MobileDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  triggerRef?: React.RefObject<HTMLButtonElement | null>;
}

// ── Accordion section ─────────────────────────────────────────────────────────

function AccordionSection({
  id,
  label,
  items,
  isOpen,
  onToggle,
  onClose,
}: {
  id: string;
  label: string;
  items: NavItem[];
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}) {
  return (
    <li className="border-b border-[var(--border)]">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={`mobile-section-${id}`}
        onClick={onToggle}
        className={cn(
          'w-full flex items-center justify-between',
          'px-4 py-4 text-base font-semibold text-[var(--fg)]',
          'hover:text-[var(--accent)] hover:bg-[var(--bg-subtle)]',
          'transition-colors duration-150',
          'focus-visible:outline-none focus-visible:ring-inset focus-visible:ring-2',
          'focus-visible:ring-[var(--ring)]',
          'min-h-[52px]',
          isOpen && 'text-[var(--accent)] bg-[var(--bg-subtle)]',
        )}
      >
        {label}
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        >
          <ChevronDown className="h-4 w-4 opacity-60" aria-hidden="true" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={`mobile-section-${id}`}
            role="region"
            aria-label={label}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <ul className="list-none p-0 m-0 pb-2 pl-4 border-l-2 border-[var(--accent)]/20 ml-4">
              {items.map((item) => (
                <li key={item.href + item.label}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      'block px-4 py-3 rounded-lg',
                      'text-sm font-medium text-[var(--fg-muted)]',
                      'hover:text-[var(--accent)] hover:bg-[var(--accent-light)]',
                      'transition-colors duration-150',
                      'focus-visible:outline-none focus-visible:ring-2',
                      'focus-visible:ring-[var(--ring)] focus-visible:ring-inset',
                      'min-h-[44px] flex flex-col justify-center',
                    )}
                  >
                    <span className="font-semibold text-[var(--fg)]">{item.label}</span>
                    {item.desc && (
                      <span className="text-xs text-[var(--fg-subtle)] mt-0.5">{item.desc}</span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function MobileDrawer({ open, onOpenChange }: MobileDrawerProps) {
  const [openSection, setOpenSection] = useState<string | null>(null);

  const toggle = (id: string) =>
    setOpenSection((prev) => (prev === id ? null : id));

  const close = () => onOpenChange(false);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>

        {/* Backdrop */}
        <Dialog.Overlay
          className={cn(
            'fixed inset-0 z-[190] bg-black/40 backdrop-blur-sm',
            'data-[state=open]:animate-in data-[state=open]:fade-in-0',
            'data-[state=closed]:animate-out data-[state=closed]:fade-out-0',
            'duration-200',
          )}
        />

        {/* Drawer panel */}
        <Dialog.Content
          aria-label="Navigation menu"
          id="mobile-nav-drawer"
          className={cn(
            'fixed top-0 right-0 bottom-0 z-[200]',
            'w-full max-w-[360px] flex flex-col',
            'bg-[var(--bg)] shadow-[var(--shadow-lg)]',
            'data-[state=open]:animate-in data-[state=open]:slide-in-from-right',
            'data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right',
            'duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
            'focus:outline-none overflow-hidden',
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)] shrink-0">
            <Link
              href="/"
              onClick={close}
              className={cn(
                'font-display font-semibold text-lg text-[var(--fg)]',
                'hover:text-[var(--accent)] transition-colors duration-150',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] rounded-sm',
              )}
            >
              Tribhuban Concepts
            </Link>
            <Dialog.Close
              aria-label="Close navigation menu"
              className={cn(
                'flex items-center justify-center h-10 w-10 rounded-md',
                'text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--bg-muted)]',
                'transition-colors duration-150',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]',
              )}
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </Dialog.Close>
          </div>

          {/* Scrollable nav list */}
          <nav aria-label="Mobile navigation" className="flex-1 overflow-y-auto overscroll-contain">
            <ul className="list-none m-0 p-0">
              {navSections.map((section) => (
                <AccordionSection
                  key={section.id}
                  id={section.id}
                  label={section.label}
                  items={section.items}
                  isOpen={openSection === section.id}
                  onToggle={() => toggle(section.id)}
                  onClose={close}
                />
              ))}

              {/* Contact — plain link */}
              <li className="border-b border-[var(--border)]">
                <Link
                  href="/contact"
                  onClick={close}
                  className={cn(
                    'flex items-center px-4 py-4 min-h-[52px]',
                    'text-base font-semibold text-[var(--fg)]',
                    'hover:text-[var(--accent)] hover:bg-[var(--bg-subtle)]',
                    'transition-colors duration-150',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-inset',
                  )}
                >
                  Contact
                </Link>
              </li>
            </ul>
          </nav>

          {/* Bottom CTAs */}
          <div className="shrink-0 px-5 py-5 border-t border-[var(--border)] space-y-3 bg-[var(--bg-subtle)]">
            <Link
              href="/login"
              onClick={close}
              className={cn(
                'flex items-center justify-center w-full min-h-[48px] rounded-lg',
                'text-sm font-semibold text-[var(--fg)]',
                'border border-[var(--border)] bg-[var(--btn-secondary-bg)]',
                'hover:bg-[var(--btn-secondary-hover)] transition-colors duration-150',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]',
              )}
            >
              Login
            </Link>
            <Link
              href="/consultation"
              onClick={close}
              className={cn(
                'flex items-center justify-center w-full min-h-[48px] rounded-lg',
                'text-sm font-semibold',
                'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-fg)]',
                'hover:bg-[var(--btn-primary-hover)] transition-colors duration-150',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]',
              )}
            >
              Book Consultation
            </Link>
          </div>
        </Dialog.Content>

      </Dialog.Portal>
    </Dialog.Root>
  );
}
