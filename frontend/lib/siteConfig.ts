/**
 * siteConfig.ts — Single source of truth for all navigation, routes, and
 * site-wide constants. Add a business, product, or resource category here
 * and it automatically appears in MegaMenu, MobileDrawer, Footer,
 * breadcrumbs, sitemap, and redirects — no other file needs to change.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export interface BusinessItem {
  slug: string;            // e.g. "rooftop-solar"
  title: string;
  description: string;
  icon: string;
  products: ProductItem[];
}

export interface ProductItem {
  slug: string;            // e.g. "solar-calculator"
  title: string;
  description?: string;
  icon: string;
  /** fully-resolved href — computed from business slug + product slug */
  href?: string;
}

export interface ResourceItem {
  slug: string;            // e.g. "blogs"
  title: string;
  description: string;
  icon: string;
}

export interface PartnerItem {
  href: string;
  title: string;
  description: string;
}

export interface AboutLink {
  href: string;
  title: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Canonical href for a business landing page */
export const businessHref = (businessSlug: string) =>
  `/businesses/${businessSlug}`;

/** Canonical href for a product page (nested under its business) */
export const productHref = (businessSlug: string, productSlug: string) =>
  `/businesses/${businessSlug}/${productSlug}`;

/** Canonical href for a resource category */
export const resourceHref = (resourceSlug: string) =>
  `/resources/${resourceSlug}`;

// ── Businesses & their products ───────────────────────────────────────────────

export const BUSINESSES: BusinessItem[] = [
  {
    slug: 'rooftop-solar',
    title: 'Rooftop Solar',
    description: 'End-to-end residential & commercial solar installation.',
    icon: '☀️',
    products: [
      {
        slug: 'solar-calculator',
        title: 'Solar Calculator',
        description: 'Subsidy, savings & ROI calculator.',
        icon: '🧮',
      },
      {
        slug: 'subsidy-calculator',
        title: 'Subsidy Calculator',
        description: 'PM Surya Ghar + OASBY subsidy estimator.',
        icon: '🏛️',
      },
      {
        slug: 'roi-calculator',
        title: 'ROI Calculator',
        description: '25-year return-on-investment projection.',
        icon: '📈',
      },
    ],
  },
  {
    slug: 'fmcg-distribution',
    title: 'FMCG Online Distribution',
    description: 'Digital-first FMCG supply chain and e-commerce.',
    icon: '📦',
    products: [],
  },
  {
    slug: 'hrds',
    title: 'HRDS',
    description: 'Home to Homeless — housing & livelihood solutions.',
    icon: '🏠',
    products: [],
  },
  {
    slug: 'pink-moon-vision',
    title: 'Pink Moon Vision',
    description: 'Creative technology and media ventures.',
    icon: '🌙',
    products: [],
  },
  {
    slug: 'entrepreneur-funding',
    title: 'Entrepreneur Funding',
    description: 'Mentorship and funding for early-stage founders.',
    icon: '🚀',
    products: [],
  },
];

// ── Resources (central knowledge hub) ────────────────────────────────────────

export const RESOURCES: ResourceItem[] = [
  {
    slug: 'blogs',
    title: 'Blog',
    description: 'Insights on solar, tech & sustainability.',
    icon: '✍️',
  },
  {
    slug: 'guides',
    title: 'Guides',
    description: 'Step-by-step guides for every journey.',
    icon: '📖',
  },
  {
    slug: 'documentation',
    title: 'Documentation',
    description: 'Technical docs and references.',
    icon: '📄',
  },
  {
    slug: 'faqs',
    title: 'FAQs',
    description: 'Answers to common questions.',
    icon: '❓',
  },
  {
    slug: 'downloads',
    title: 'Downloads',
    description: 'Brochures, datasheets and resources.',
    icon: '⬇️',
  },
];

// ── Partners ──────────────────────────────────────────────────────────────────

export const PARTNERS: PartnerItem[] = [
  {
    href: '/partners/become',
    title: 'Become a Partner',
    description: 'Join our partner ecosystem.',
  },
  {
    href: '/partners/franchise',
    title: 'Franchise Opportunities',
    description: 'Own a Tribhuban franchise.',
  },
  {
    href: '/partners/csr',
    title: 'CSR & NGO Collaboration',
    description: 'Collaborate for social impact.',
  },
];

// ── About links ───────────────────────────────────────────────────────────────

export const ABOUT_LINKS: AboutLink[] = [
  { href: '/about', title: 'Our Story' },
  { href: '/about#vision', title: 'Vision & Mission' },
  { href: '/about#leadership', title: 'Leadership' },
  { href: '/about#values', title: 'Core Values' },
];

// ── Legacy redirect map (old route → new route, 301) ─────────────────────────
// Used by middleware to permanently redirect old URLs to the new structure.

export const LEGACY_REDIRECTS: Record<string, string> = {
  '/solar':                               '/businesses/rooftop-solar',
  '/solar/calculator':                    '/businesses/rooftop-solar/solar-calculator',
  '/solar/learn':                         '/businesses/rooftop-solar',
  '/products':                            '/businesses',
  '/products/unit-converter':             '/businesses',
  '/products/productivity-tools':         '/businesses',
  '/products/ai-assistants':             '/businesses',
  '/products/future-apps':               '/businesses',
  '/products/web-applications':          '/businesses',
  '/products/mobile-applications':       '/businesses',
  '/blog':                                '/resources/blogs',
  '/knowledge':                           '/resources/guides',
  '/knowledge/guides':                    '/resources/guides',
  '/knowledge/docs':                      '/resources/documentation',
  '/knowledge/downloads':                 '/resources/downloads',
  '/support/faq':                         '/resources/faqs',
};

// ── Site base URL ─────────────────────────────────────────────────────────────
// Reads from NEXT_PUBLIC_SITE_URL env var at build time.
// On Vercel without a custom domain, set this to your .vercel.app URL.
// When you purchase a domain, update the env var — nothing else changes.

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? 'https://tribhuban-parent-website.vercel.app';
