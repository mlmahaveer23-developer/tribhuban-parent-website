'use client';

/**
 * MegaMenu — full-width animated mega menu for desktop navigation.
 *
 * ROOT FIX for mega menu visibility:
 * The NavigationMenu.Root must be wrapped in a div that spans the FULL
 * header width (not just the nav items width). The Viewport is rendered
 * by Radix as a child of the Root, positioned absolute top-full left-0.
 * If Root is narrow (just the nav items), the Viewport offsets from there.
 *
 * Solution: NavigationMenu.Root gets `w-full` so the Viewport's `left-0`
 * aligns to the left edge of the full header. The Header passes this
 * component in a full-width flex row.
 *
 * Content panels have NO absolute/fixed positioning of their own —
 * Radix's Viewport handles all of that.
 */

import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

// ── Nav data ──────────────────────────────────────────────────────────────────

const businesses = [
  { href: '/businesses/rooftop-solar',        title: 'Rooftop Solar',               description: 'End-to-end residential & commercial solar installation.', icon: '☀️' },
  { href: '/businesses/fmcg-distribution',    title: 'FMCG Online Distribution',     description: 'Digital-first FMCG supply chain and e-commerce.', icon: '📦' },
  { href: '/businesses/hrds',                 title: 'HRDS',                         description: 'Home to Homeless — housing & livelihood solutions.', icon: '🏠' },
  { href: '/businesses/pink-moon-vision',     title: 'Pink Moon Vision',             description: 'Creative technology and media ventures.', icon: '🌙' },
  { href: '/businesses/entrepreneur-funding', title: 'Entrepreneur Funding',         description: 'Mentorship and funding for early-stage founders.', icon: '🚀' },
];

const productsSolar = [
  { href: '/solar/calculator', title: 'Solar Calculator', description: 'Subsidy calculator, savings estimator & ROI calculator.', icon: '🧮' },
];

const productsFuture = [
  { href: '/products/unit-converter',      title: 'Unit Converter',      icon: '⚖️' },
  { href: '/products/productivity-tools',  title: 'Productivity Tools',  icon: '⚡' },
  { href: '/products/ai-assistants',       title: 'AI Assistants',       icon: '🤖' },
  { href: '/products/future-apps',         title: 'Future Apps',         icon: '📱' },
  { href: '/products/web-applications',    title: 'Web Applications',    icon: '🌐' },
  { href: '/products/mobile-applications', title: 'Mobile Applications', icon: '📲' },
];

const resources = [
  { href: '/blog',         title: 'Blog',           description: 'Insights on solar, tech & sustainability.' },
  { href: '/knowledge',    title: 'Guides',          description: 'Step-by-step guides for every journey.' },
  { href: '/knowledge',    title: 'Documentation',   description: 'Technical docs and API references.' },
  { href: '/support/faq',  title: 'FAQs',            description: 'Answers to common questions.' },
  { href: '/knowledge',    title: 'Downloads',       description: 'Brochures, datasheets and resources.' },
];

const partners = [
  { href: '/partners/become',    title: 'Become a Partner',        description: 'Join our partner ecosystem.' },
  { href: '/partners/franchise', title: 'Franchise Opportunities',  description: 'Own a Tribhuban franchise.' },
  { href: '/partners/csr',       title: 'CSR & NGO Collaboration',  description: 'Collaborate for social impact.' },
];

const aboutLinks = [
  { href: '/about',             title: 'Our Story' },
  { href: '/about#vision',      title: 'Vision & Mission' },
  { href: '/about#leadership',  title: 'Leadership' },
  { href: '/about#values',      title: 'Core Values' },
];

// ── Trigger style ─────────────────────────────────────────────────────────────

const triggerBase = cn(
  'group inline-flex items-center gap-0.5 px-2.5 py-1.5 rounded-sm',
  'text-sm font-medium text-[var(--fg)]',
  'hover:text-[var(--accent)] transition-colors duration-150',
  'bg-transparent border-none cursor-pointer',
  'focus-visible:outline-none focus-visible:ring-2',
  'focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2',
  'focus-visible:ring-offset-[var(--bg)]',
  'data-[state=open]:text-[var(--accent)]',
);

// Content — NO positioning classes — Viewport handles placement
const contentPanel = cn(
  'w-screen bg-[var(--surface)] border-b border-[var(--border)]',
  'shadow-[0_8px_32px_rgba(46,39,31,0.10)]',
);

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--fg-subtle)] mb-3 px-1">
      {children}
    </p>
  );
}

function MenuItem({
  href, title, description, icon,
}: {
  href: string; title: string; description?: string; icon?: string;
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
          <span className="mt-0.5 text-xl shrink-0 transition-transform duration-200 group-hover/item:scale-110" aria-hidden="true">
            {icon}
          </span>
        )}
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[var(--fg)] group-hover/item:text-[var(--accent)] transition-colors duration-150 leading-snug">
            {title}
          </p>
          {description && (
            <p className="text-xs text-[var(--fg-muted)] mt-0.5 leading-snug">{description}</p>
          )}
        </div>
      </Link>
    </NavigationMenu.Link>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export default function MegaMenu() {
  return (
    /*
     * NavigationMenu.Root needs a positioning context that spans the full
     * header width so the Viewport's `left: 0` aligns to the header's left
     * edge — not just the nav items.
     *
     * The Header renders this inside a `w-full` absolute-positioned row,
     * so Root + Viewport both span 100% of the header = 100vw.
     */
    <NavigationMenu.Root
      delayDuration={100}
      className="relative z-[110] flex"
    >
      <NavigationMenu.List className="flex items-center list-none m-0 p-0 gap-0">

        {/* Businesses */}
        <NavigationMenu.Item value="businesses">
          <NavigationMenu.Trigger className={triggerBase}>
            Businesses
            <ChevronDown aria-hidden="true" className="h-3 w-3 transition-transform duration-200 group-data-[state=open]:rotate-180 opacity-60" />
          </NavigationMenu.Trigger>
          <NavigationMenu.Content className={contentPanel}>
            <div className="container-content py-7">
              <SectionLabel>Our Business Verticals</SectionLabel>
              <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 list-none p-0 m-0">
                {businesses.map((b) => <li key={b.href}><MenuItem {...b} /></li>)}
              </ul>
            </div>
          </NavigationMenu.Content>
        </NavigationMenu.Item>

        {/* Products */}
        <NavigationMenu.Item value="products">
          <NavigationMenu.Trigger className={triggerBase}>
            Products
            <ChevronDown aria-hidden="true" className="h-3 w-3 transition-transform duration-200 group-data-[state=open]:rotate-180 opacity-60" />
          </NavigationMenu.Trigger>
          <NavigationMenu.Content className={contentPanel}>
            <div className="container-content py-7 grid grid-cols-1 md:grid-cols-2 gap-10">
              <div>
                <SectionLabel>Solar</SectionLabel>
                <ul className="list-none p-0 m-0 space-y-1">
                  {productsSolar.map((p) => <li key={p.href}><MenuItem {...p} /></li>)}
                </ul>
                <div className="mt-3 flex flex-wrap gap-2 pl-1">
                  {['Subsidy Calculator', 'Savings Estimator', 'ROI Calculator'].map((tool) => (
                    <span key={tool} className="text-[11px] px-2.5 py-1 rounded-full font-medium"
                      style={{ background: 'rgba(180,83,9,0.08)', color: '#B45309', border: '1px solid rgba(180,83,9,0.15)' }}>
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <SectionLabel>Future Products</SectionLabel>
                <ul className="grid grid-cols-2 gap-1 list-none p-0 m-0">
                  {productsFuture.map((p) => (
                    <li key={p.href}>
                      <NavigationMenu.Link asChild>
                        <Link href={p.href} className={cn('group/fp flex items-center gap-2 rounded-lg px-3 py-2', 'hover:bg-[var(--accent-light)] transition-colors duration-150', 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]')}>
                          <span className="text-base" aria-hidden="true">{p.icon}</span>
                          <span className="text-sm font-medium text-[var(--fg)] group-hover/fp:text-[var(--accent)] transition-colors">{p.title}</span>
                        </Link>
                      </NavigationMenu.Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </NavigationMenu.Content>
        </NavigationMenu.Item>

        {/* Resources */}
        <NavigationMenu.Item value="resources">
          <NavigationMenu.Trigger className={triggerBase}>
            Resources
            <ChevronDown aria-hidden="true" className="h-3 w-3 transition-transform duration-200 group-data-[state=open]:rotate-180 opacity-60" />
          </NavigationMenu.Trigger>
          <NavigationMenu.Content className={contentPanel}>
            <div className="container-content py-7">
              <SectionLabel>Learn &amp; Discover</SectionLabel>
              <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 list-none p-0 m-0">
                {resources.map((r) => <li key={r.title}><MenuItem href={r.href} title={r.title} description={r.description} /></li>)}
              </ul>
            </div>
          </NavigationMenu.Content>
        </NavigationMenu.Item>

        {/* Partners */}
        <NavigationMenu.Item value="partners">
          <NavigationMenu.Trigger className={triggerBase}>
            Partners
            <ChevronDown aria-hidden="true" className="h-3 w-3 transition-transform duration-200 group-data-[state=open]:rotate-180 opacity-60" />
          </NavigationMenu.Trigger>
          <NavigationMenu.Content className={contentPanel}>
            <div className="container-content py-7">
              <SectionLabel>Work with us</SectionLabel>
              <ul className="grid grid-cols-1 sm:grid-cols-3 gap-2 list-none p-0 m-0 max-w-2xl">
                {partners.map((p) => <li key={p.href}><MenuItem href={p.href} title={p.title} description={p.description} /></li>)}
              </ul>
            </div>
          </NavigationMenu.Content>
        </NavigationMenu.Item>

        {/* About */}
        <NavigationMenu.Item value="about">
          <NavigationMenu.Trigger className={triggerBase}>
            About
            <ChevronDown aria-hidden="true" className="h-3 w-3 transition-transform duration-200 group-data-[state=open]:rotate-180 opacity-60" />
          </NavigationMenu.Trigger>
          <NavigationMenu.Content className={contentPanel}>
            <div className="container-content py-6">
              <ul className="flex gap-2 flex-wrap list-none p-0 m-0">
                {aboutLinks.map((a) => (
                  <li key={a.href + a.title}>
                    <NavigationMenu.Link asChild>
                      <Link href={a.href} className={cn('inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium', 'text-[var(--fg)] hover:text-[var(--accent)] hover:bg-[var(--accent-light)]', 'transition-colors duration-150', 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]')}>
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

      {/*
        Viewport — Radix renders panel content here.
        IMPORTANT: The outer div uses left-0 w-full so the panel spans
        the full width of the NavigationMenu.Root (which Header makes full-width).
        overflow-visible on Header ensures this is not clipped.
      */}
      <div className="absolute top-full left-0 w-full z-[99]">
        <NavigationMenu.Viewport
          className={cn(
            'relative overflow-hidden w-full',
            'origin-[top_center]',
            'data-[state=open]:animate-in data-[state=open]:fade-in-0',
            'data-[state=closed]:animate-out data-[state=closed]:fade-out-0',
            'duration-150 ease-out',
            'h-[var(--radix-navigation-menu-viewport-height)]',
            'transition-[height] duration-200',
          )}
        />
      </div>
    </NavigationMenu.Root>
  );
}
