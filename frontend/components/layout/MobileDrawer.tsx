'use client';

import * as Dialog from '@radix-ui/react-dialog';
import Link from 'next/link';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

/* ─────────────────────────────────────────────────────────────────────────────
   All nav items including Solar sub-links (expanded inline)
───────────────────────────────────────────────────────────────────────────── */
const primaryNavItems = [
  { label: 'Products', href: '/products' },
  { label: 'Future Technologies', href: '/future-technologies' },
  { label: 'Knowledge', href: '/knowledge' },
  { label: 'Blog', href: '/blog' },
  { label: 'Company', href: '/about' },
] as const;

const solarSubItems = [
  { label: 'Solar Overview', href: '/solar' },
  { label: 'Learning Hub', href: '/solar/learn' },
  { label: 'Calculator', href: '/solar/calculator' },
  { label: 'Consultation', href: '/consultation' },
] as const;

interface MobileDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The trigger element ref — focus returns here when drawer closes */
  triggerRef?: React.RefObject<HTMLButtonElement | null>;
}

export default function MobileDrawer({ open, onOpenChange }: MobileDrawerProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        {/* Overlay */}
        <Dialog.Overlay
          className={cn(
            'fixed inset-0 z-[190]',
            'bg-[var(--ink-700)]/60 backdrop-blur-sm',
            'data-[state=open]:animate-in data-[state=open]:fade-in-0',
            'data-[state=closed]:animate-out data-[state=closed]:fade-out-0',
            'duration-200',
          )}
        />

        {/* Drawer panel — full-screen on mobile */}
        <Dialog.Content
          aria-label="Navigation menu"
          className={cn(
            'fixed inset-0 z-[200]',
            'flex flex-col',
            'bg-[var(--bg)] overflow-y-auto',
            'data-[state=open]:animate-in data-[state=open]:slide-in-from-right',
            'data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right',
            'duration-300 ease-out',
            'focus:outline-none',
          )}
        >
          {/* Header row */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
            <Link
              href="/"
              onClick={() => onOpenChange(false)}
              className={cn(
                'font-display font-semibold text-lg text-[var(--fg)]',
                'focus-visible:outline-none focus-visible:ring-2',
                'focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2',
                'focus-visible:ring-offset-[var(--bg)] rounded-sm',
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
                'focus-visible:outline-none focus-visible:ring-2',
                'focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2',
                'focus-visible:ring-offset-[var(--bg)]',
              )}
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </Dialog.Close>
          </div>

          {/* Navigation links */}
          <nav aria-label="Mobile navigation" className="flex-1 px-6 py-6">
            <ul className="list-none m-0 p-0 space-y-1">
              {/* Solar — expanded inline with sub-links */}
              <li>
                <span className="block px-3 py-2 text-xs font-semibold uppercase tracking-wider text-[var(--fg-subtle)]">
                  Solar
                </span>
                <ul className="list-none m-0 p-0 pl-3 space-y-0.5 border-l-2 border-[var(--accent-light)] ml-3">
                  {solarSubItems.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => onOpenChange(false)}
                        className={cn(
                          'block px-3 py-2 rounded-md text-sm font-medium text-[var(--fg-muted)]',
                          'hover:text-[var(--fg)] hover:bg-[var(--bg-muted)]',
                          'transition-colors duration-150',
                          'focus-visible:outline-none focus-visible:ring-2',
                          'focus-visible:ring-[var(--ring)] focus-visible:ring-offset-1',
                          'focus-visible:ring-offset-[var(--bg)]',
                        )}
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>

              {/* Primary nav items */}
              {primaryNavItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => onOpenChange(false)}
                    className={cn(
                      'block px-3 py-2 rounded-md text-base font-medium text-[var(--fg)]',
                      'hover:text-[var(--accent)] hover:bg-[var(--bg-muted)]',
                      'transition-colors duration-150',
                      'focus-visible:outline-none focus-visible:ring-2',
                      'focus-visible:ring-[var(--ring)] focus-visible:ring-offset-1',
                      'focus-visible:ring-offset-[var(--bg)]',
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Bottom CTA section */}
          <div className="px-6 py-6 border-t border-[var(--border)] space-y-3">
            <Link
              href="/contact"
              onClick={() => onOpenChange(false)}
              className={cn(
                'flex items-center justify-center w-full h-11 rounded-md',
                'text-sm font-semibold text-[var(--fg)]',
                'border border-[var(--border)] bg-[var(--btn-secondary-bg)]',
                'hover:bg-[var(--btn-secondary-hover)] transition-colors duration-150',
                'focus-visible:outline-none focus-visible:ring-2',
                'focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2',
                'focus-visible:ring-offset-[var(--bg)]',
              )}
            >
              Contact
            </Link>
            <Link
              href="/consultation"
              onClick={() => onOpenChange(false)}
              className={cn(
                'flex items-center justify-center w-full h-11 rounded-md',
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
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
