import type { MetadataRoute } from 'next';

// Static sitemap entries — dynamic content entries are added via revalidation.
// Excludes: /search, /api/*, /app, /dashboard, /portal, /partner, /customer
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://tribhubanconcepts.com';
  const now = new Date().toISOString();

  return [
    // ── Core marketing ───────────────────────────────────────────────────────
    {
      url: `${baseUrl}/`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },

    // ── Solar ─────────────────────────────────────────────────────────────────
    {
      url: `${baseUrl}/solar`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/solar/calculator`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/solar/learn`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },

    // ── Products & future tech ────────────────────────────────────────────────
    {
      url: `${baseUrl}/products`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/future-technologies`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    },

    // ── Content ───────────────────────────────────────────────────────────────
    {
      url: `${baseUrl}/blog`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/knowledge`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.8,
    },

    // ── Conversion ────────────────────────────────────────────────────────────
    {
      url: `${baseUrl}/careers`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/consultation`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 1.0,
    },

    // ── Support ───────────────────────────────────────────────────────────────
    {
      url: `${baseUrl}/support`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/support/faq`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },

    // ── Legal ─────────────────────────────────────────────────────────────────
    {
      url: `${baseUrl}/legal/privacy`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/legal/terms`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/legal/cookies`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];
}
