import type { MetadataRoute } from 'next';
import { BUSINESSES, RESOURCES, businessHref, productHref, resourceHref, SITE_URL } from '@/lib/siteConfig';

/**
 * sitemap.ts — auto-generated from siteConfig.ts.
 * Adding a new business, product, or resource category automatically
 * includes it in the sitemap without editing this file.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString();

  return [
    // ── Core ─────────────────────────────────────────────────────────────────
    { url: `${SITE_URL}/`,            lastModified: now, changeFrequency: 'daily',   priority: 1.0 },
    { url: `${SITE_URL}/about`,       lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/contact`,     lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/consultation`,lastModified: now, changeFrequency: 'monthly', priority: 1.0 },
    { url: `${SITE_URL}/careers`,     lastModified: now, changeFrequency: 'weekly',  priority: 0.7 },

    // ── Businesses index ──────────────────────────────────────────────────────
    { url: `${SITE_URL}/businesses`,  lastModified: now, changeFrequency: 'weekly',  priority: 0.9 },

    // ── Individual business pages (generated from config) ─────────────────────
    ...BUSINESSES.map((b) => ({
      url: `${SITE_URL}${businessHref(b.slug)}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.85,
    })),

    // ── Product pages nested under their business ─────────────────────────────
    ...BUSINESSES.flatMap((b) =>
      b.products.map((p) => ({
        url: `${SITE_URL}${productHref(b.slug, p.slug)}`,
        lastModified: now,
        changeFrequency: 'monthly' as const,
        priority: 0.8,
      }))
    ),

    // ── Resources hub ─────────────────────────────────────────────────────────
    { url: `${SITE_URL}/resources`,   lastModified: now, changeFrequency: 'daily',   priority: 0.8 },

    // ── Resource category pages (generated from config) ───────────────────────
    ...RESOURCES.map((r) => ({
      url: `${SITE_URL}${resourceHref(r.slug)}`,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 0.75,
    })),

    // ── Support ───────────────────────────────────────────────────────────────
    { url: `${SITE_URL}/support`,     lastModified: now, changeFrequency: 'monthly', priority: 0.6 },

    // ── Legal ─────────────────────────────────────────────────────────────────
    { url: `${SITE_URL}/legal/privacy`,  lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/legal/terms`,    lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/legal/cookies`,  lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ];
}
