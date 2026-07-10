'use client';

/**
 * MegaMenu — full-width mega menu panels, data-driven from siteConfig.ts.
 *
 * Adding a new business, product, or resource only requires editing
 * lib/siteConfig.ts — this component never needs to change.
 *
 * Portal architecture (full-width fix):
 *   Header creates a ref div below the nav bar row and passes it here.
 *   The Radix Viewport is portalled into that div → spans 100vw.
 */

import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { useEffect, useState } from 'react';
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

// ── Styles ────────────────────────────────────────────────────────────────────

const triggerBase = cn(
  'group inline-flex items-center gap-0.5 px-2.5 py-1.5 rounded-sm',
  'text-sm font-medium text-[var(--fg)]',
  'hover:text-[var(--accent)] transition-colors duration-150',
  'bg-transparent border-none cursor-pointer',
  'focus-visible:outline-none focus-visible:ring-2',
  'focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]',
  'data-[state=open]:text-[var(--accent)]',
);

const contentPanel = cn(
  'bg-[var(--surface)] border-b border-[var(--border)]',
  'shadow-[0_8px_32px_rgba(46,39,31,0.10)]',
  'w-full',
);

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--fg-subtle)] mb-3">
      {children}
    </p>
  );
}

function MenuItem({
  href,
  title,
  description,
  icon,
}: {
  href: string;
  title: string;
  description?: string;
  icon?: string;
}) {
  return (
    <NavigationMenu.Link asChild>
      <Link
        href={href}
        className={cn(
          'group/item flex items-start gap-3 rounded-lg p-3',
          'hover:bg-[var(--accent-light)] transition-colors duration-150',
          'focus-visible:outline-none focus-visible:ring-2',
          'focus-visible:ring-[var(--ring)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--surface)]',
        )}
      >
        {icon && (
          <span
            className="mt-0.5 text-xl shrink-0 transition-transform duration-200 group-hover/item:scale-110"
            aria-hidden="true"
          >
            {icon}
          </span>
        )}
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[var(--fg)] group-hover/item:text-[var(--accent)] transition-colors leading-snug">
            {title}
          </p>
          {description && (
            <p className="text-xs text-[var(--fg-muted)] mt-0.5 leading-snug">
              {description}
            </p>
          )}
        </div>
      </Link>
    </NavigationMenu.Link>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

interface MegaMenuProps {
  viewportContainerRef: React.RefObject<HTMLDivElement | null>;
}

export default function MegaMenu({ viewportContainerRef }: MegaMenuProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  // Businesses that have at least one product
  const businessesWithProducts = BUSINESSES.filter((b) => b.products.length > 0);

  const viewport = (
    <NavigationMenu.Viewport
      className={cn(
        'relative overflow-hidden w-full',
        'h-[var(--radix-navigation-menu-viewport-height)]',
        'transition-[height] duration-200 ease-out',
        'data-[state=open]:animate-in data-[state=open]:fade-in-0',
        'data-[state=closed]:animate-out data-[state=closed]:fade-out-0',
        'duration-150',
      )}
    />
  );

  return (
    <NavigationMenu.Root delayDuration={100} className="relative z-[110] flex">
      <NavigationMenu.List className="flex items-center list-none m-0 p-0 gap-0">

        {/* ── Businesses ───────────────────────────────────────────────── */}
        <NavigationMenu.Item value="businesses">
          <NavigationMenu.Trigger className={triggerBase}>
            Businesses
            <ChevronDown
              aria-hidden="true"
              className="h-3 w-3 transition-transform duration-200 group-data-[state=open]:rotate-180 opacity-60"
            />
          </NavigationMenu.Trigger>
          <NavigationMenu.Content className={contentPanel}>
            <div className="container-content py-7">
              <SectionLabel>Our Business Verticals</SectionLabel>
              <ul className="grid grid-cols-2 lg:grid-cols-5 gap-2 list-none p-0 m-0">
                {BUSINESSES.map((b) => (
                  <li key={b.slug}>
                    <MenuItem
                      href={businessHref(b.slug)}
                      title={b.title}
                      description={b.description}
                      icon={b.icon}
                    />
                  </li>
                ))}
              </ul>
            </div>
          </NavigationMenu.Content>
        </NavigationMenu.Item>

        {/* ── Products (grouped by business) ───────────────────────────── */}
        <NavigationMenu.Item value="products">
          <NavigationMenu.Trigger className={triggerBase}>
            Products
            <ChevronDown
              aria-hidden="true"
              className="h-3 w-3 transition-transform duration-200 group-data-[state=open]:rotate-180 opacity-60"
            />
          </NavigationMenu.Trigger>
          <NavigationMenu.Content className={contentPanel}>
            <div
              className={cn(
                'container-content py-7',
                businessesWithProducts.length > 1
                  ? `grid grid-cols-1 md:grid-cols-${Math.min(businessesWithProducts.length, 3)} gap-10`
                  : 'max-w-md',
              )}
            >
              {businessesWithProducts.map((b) => (
                <div key={b.slug}>
                  <SectionLabel>{b.title}</SectionLabel>
                  <ul className="list-none p-0 m-0 space-y-1">
                    {b.products.map((p) => (
                      <li key={p.slug}>
                        <MenuItem
                          href={productHref(b.slug, p.slug)}
                          title={p.title}
                          description={p.description}
                          icon={p.icon}
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </NavigationMenu.Content>
        </NavigationMenu.Item>

        {/* ── Resources ────────────────────────────────────────────────── */}
        <NavigationMenu.Item value="resources">
          <NavigationMenu.Trigger className={triggerBase}>
            Resources
            <ChevronDown
              aria-hidden="true"
              className="h-3 w-3 transition-transform duration-200 group-data-[state=open]:rotate-180 opacity-60"
            />
          </NavigationMenu.Trigger>
          <NavigationMenu.Content className={contentPanel}>
            <div className="container-content py-7">
              <SectionLabel>Learn &amp; Discover</SectionLabel>
              <ul className="grid grid-cols-2 lg:grid-cols-5 gap-2 list-none p-0 m-0">
                {RESOURCES.map((r) => (
                  <li key={r.slug}>
                    <MenuItem
                      href={resourceHref(r.slug)}
                      title={r.title}
                      description={r.description}
                      icon={r.icon}
                    />
                  </li>
                ))}
              </ul>
            </div>
          </NavigationMenu.Content>
        </NavigationMenu.Item>

        {/* ── Partners ─────────────────────────────────────────────────── */}
        <NavigationMenu.Item value="partners">
          <NavigationMenu.Trigger className={triggerBase}>
            Partners
            <ChevronDown
              aria-hidden="true"
              className="h-3 w-3 transition-transform duration-200 group-data-[state=open]:rotate-180 opacity-60"
            />
          </NavigationMenu.Trigger>
          <NavigationMenu.Content className={contentPanel}>
            <div className="container-content py-7">
              <SectionLabel>Work with us</SectionLabel>
              <ul className="grid grid-cols-1 sm:grid-cols-3 gap-2 list-none p-0 m-0 max-w-3xl">
                {PARTNERS.map((p) => (
                  <li key={p.href}>
                    <MenuItem
                      href={p.href}
                      title={p.title}
                      description={p.description}
                    />
                  </li>
                ))}
              </ul>
            </div>
          </NavigationMenu.Content>
        </NavigationMenu.Item>

        {/* ── About ────────────────────────────────────────────────────── */}
        <NavigationMenu.Item value="about">
          <NavigationMenu.Trigger className={triggerBase}>
            About
            <ChevronDown
              aria-hidden="true"
              className="h-3 w-3 transition-transform duration-200 group-data-[state=open]:rotate-180 opacity-60"
            />
          </NavigationMenu.Trigger>
          <NavigationMenu.Content className={contentPanel}>
            <div className="container-content py-6">
              <ul className="flex gap-2 flex-wrap list-none p-0 m-0">
                {ABOUT_LINKS.map((a) => (
                  <li key={a.href + a.title}>
                    <NavigationMenu.Link asChild>
                      <Link
                        href={a.href}
                        className={cn(
                          'inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium',
                          'text-[var(--fg)] hover:text-[var(--accent)] hover:bg-[var(--accent-light)]',
                          'transition-colors',
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]',
                        )}
                      >
                        {a.title}
                      </Link>
                    </NavigationMenu.Link>
                  </li>
                ))}
              </ul>
            </div>
          </NavigationMenu.Content>
        </NavigationMenu.Item>

      </NavigationMenu.List>

      {mounted && viewportContainerRef.current
        ? createPortal(viewport, viewportContainerRef.current)
        : viewport}
    </NavigationMenu.Root>
  );
}
