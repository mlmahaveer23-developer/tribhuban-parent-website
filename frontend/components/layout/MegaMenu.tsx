'use client';

import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

/* ─────────────────────────────────────────────────────────────────────────────
   Solar MegaMenu sub-links
───────────────────────────────────────────────────────────────────────────── */
const solarLinks = [
  {
    href: '/solar',
    title: 'Overview',
    description: 'Learn about our end-to-end solar solutions for homes and businesses.',
  },
  {
    href: '/solar/learn',
    title: 'Learning Hub',
    description: 'Explore guides, articles and resources about solar energy.',
  },
  {
    href: '/solar/calculator',
    title: 'Calculator',
    description: 'Estimate your rooftop solar savings with our free calculator.',
  },
  {
    href: '/consultation',
    title: 'Consultation',
    description: 'Book a free consultation with our solar engineering team.',
  },
] as const;

/* ─────────────────────────────────────────────────────────────────────────────
   MegaMenu — Solar dropdown panel using Radix NavigationMenu primitives.
   Keyboard-accessible: arrow keys navigate between items, Escape closes panel.
───────────────────────────────────────────────────────────────────────────── */
export default function MegaMenu() {
  return (
    <NavigationMenu.Root className="relative z-[100]">
      <NavigationMenu.List className="flex list-none m-0 p-0">
        <NavigationMenu.Item>
          {/* Trigger — styled to match other nav links */}
          <NavigationMenu.Trigger
            className={cn(
              'group inline-flex items-center gap-1',
              'text-sm font-medium text-[var(--fg)]',
              'hover:text-[var(--accent)] transition-colors duration-150',
              'bg-transparent border-none cursor-pointer p-0',
              'focus-visible:outline-none focus-visible:ring-2',
              'focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2',
              'focus-visible:ring-offset-[var(--bg)] rounded-sm',
            )}
          >
            Solar
            <ChevronDown
              aria-hidden="true"
              className={cn(
                'h-3.5 w-3.5 transition-transform duration-200',
                'group-data-[state=open]:rotate-180',
              )}
            />
          </NavigationMenu.Trigger>

          <NavigationMenu.Content
            className={cn(
              'absolute top-full left-0 mt-2',
              'w-[480px]',
              'rounded-lg border border-[var(--border)]',
              'bg-[var(--surface)] shadow-lg',
              'p-4',
              // Radix enter/exit animations via data attributes
              'data-[motion=from-start]:animate-enterFromLeft',
              'data-[motion=from-end]:animate-enterFromRight',
              'data-[motion=to-start]:animate-exitToLeft',
              'data-[motion=to-end]:animate-exitToRight',
            )}
          >
            <ul className="grid grid-cols-2 gap-2 list-none m-0 p-0">
              {solarLinks.map((link) => (
                <li key={link.href}>
                  <NavigationMenu.Link asChild>
                    <Link
                      href={link.href}
                      className={cn(
                        'block rounded-md p-3',
                        'hover:bg-[var(--accent-light)] transition-colors duration-150',
                        'focus-visible:outline-none focus-visible:ring-2',
                        'focus-visible:ring-[var(--ring)] focus-visible:ring-offset-1',
                        'focus-visible:ring-offset-[var(--surface)]',
                        'group/link',
                      )}
                    >
                      <p className="text-sm font-semibold text-[var(--fg)] group-hover/link:text-[var(--accent)] transition-colors duration-150 mb-0.5">
                        {link.title}
                      </p>
                      <p className="text-xs text-[var(--fg-muted)] leading-snug">
                        {link.description}
                      </p>
                    </Link>
                  </NavigationMenu.Link>
                </li>
              ))}
            </ul>
          </NavigationMenu.Content>
        </NavigationMenu.Item>
      </NavigationMenu.List>

      {/* Viewport portal — required by Radix for correct positioning */}
      <div className="absolute top-full left-0 w-full perspective-[2000px]">
        <NavigationMenu.Viewport
          className={cn(
            'relative mt-0 h-[var(--radix-navigation-menu-viewport-height)]',
            'w-full overflow-hidden rounded-lg',
            'origin-[top_center] transition-[width,height] duration-300',
          )}
        />
      </div>
    </NavigationMenu.Root>
  );
}
