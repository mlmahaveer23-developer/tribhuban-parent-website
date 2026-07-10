import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? 'https://tribhuban-parent-website.vercel.app';

  return {
    rules: [
      // ── Default: allow all public pages ─────────────────────────────────────
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/search',
          '/api',
          '/api/internal',
          '/app',
          '/dashboard',
          '/portal',
          '/partner',
          '/customer',
        ],
      },

      // ── Explicitly allow known AI crawlers ──────────────────────────────────
      // GPTBot (OpenAI)
      {
        userAgent: 'GPTBot',
        allow: '/',
        disallow: ['/api', '/search'],
      },
      // ChatGPT-User (OpenAI browsing)
      {
        userAgent: 'ChatGPT-User',
        allow: '/',
        disallow: ['/api', '/search'],
      },
      // Google-Extended (Bard / Gemini training)
      {
        userAgent: 'Google-Extended',
        allow: '/',
        disallow: ['/api', '/search'],
      },
      // Anthropic AI crawler
      {
        userAgent: 'anthropic-ai',
        allow: '/',
        disallow: ['/api', '/search'],
      },
      // Claude-Web (Anthropic Claude browsing)
      {
        userAgent: 'Claude-Web',
        allow: '/',
        disallow: ['/api', '/search'],
      },
      // PerplexityBot
      {
        userAgent: 'PerplexityBot',
        allow: '/',
        disallow: ['/api', '/search'],
      },
    ],

    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
