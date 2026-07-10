import type { Metadata } from 'next';

const SITE_NAME = 'Tribhuban Concepts';
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? 'https://tribhuban-parent-website.vercel.app';
const DEFAULT_OG_IMAGE = '/og-default.png';

export interface BaseMetadataOptions {
  title: string;
  description: string;
  canonical: string;
  noIndex?: boolean;
  ogType?: 'website' | 'article';
  ogImage?: string;
}

/**
 * Shared base metadata builder.
 * Produces title template, description, canonical, OpenGraph, Twitter card,
 * robots, and metadataBase for every page.
 */
export function buildBaseMetadata(options: BaseMetadataOptions): Metadata {
  const {
    title,
    description,
    canonical,
    noIndex = false,
    ogType = 'website',
    ogImage = DEFAULT_OG_IMAGE,
  } = options;

  const canonicalUrl = canonical.startsWith('http')
    ? canonical
    : `${BASE_URL}${canonical}`;

  const resolvedOgImage = ogImage.startsWith('http')
    ? ogImage
    : ogImage;

  return {
    metadataBase: new URL(BASE_URL),

    title: {
      default: `${title} — ${SITE_NAME}`,
      template: `%s — ${SITE_NAME}`,
    },
    description,

    alternates: {
      canonical: canonicalUrl,
    },

    robots: noIndex
      ? { index: false, follow: true }
      : { index: true, follow: true },

    openGraph: {
      type: ogType,
      title: `${title} — ${SITE_NAME}`,
      description,
      url: canonicalUrl,
      siteName: SITE_NAME,
      images: [
        {
          url: resolvedOgImage,
          width: 1200,
          height: 630,
          alt: `${title} — ${SITE_NAME}`,
        },
      ],
    },

    twitter: {
      card: 'summary_large_image',
      title: `${title} — ${SITE_NAME}`,
      description,
      images: [resolvedOgImage],
    },
  };
}

// ---------------------------------------------------------------------------
// Page-type specific factories
// ---------------------------------------------------------------------------

export interface ArticleMetadataInput {
  title: string;
  description: string;
  slug: string;
  publishedAt: string | Date;
  heroImageKey?: string;
}

/**
 * Metadata factory for blog articles and knowledge center items.
 */
export function buildArticleMetadata(article: ArticleMetadataInput): Metadata {
  const publishedTime =
    article.publishedAt instanceof Date
      ? article.publishedAt.toISOString()
      : article.publishedAt;

  const ogImage = article.heroImageKey
    ? article.heroImageKey.startsWith('http')
      ? article.heroImageKey
      : `${BASE_URL}${article.heroImageKey}`
    : DEFAULT_OG_IMAGE;

  const base = buildBaseMetadata({
    title: article.title,
    description: article.description,
    canonical: `/blog/${article.slug}`,
    ogType: 'article',
    ogImage,
  });

  return {
    ...base,
    openGraph: {
      ...base.openGraph,
      type: 'article',
      publishedTime,
    },
  };
}

export interface JobMetadataInput {
  title: string;
  location: string;
  slug: string;
}

/**
 * Metadata factory for job detail pages.
 */
export function buildJobMetadata(job: JobMetadataInput): Metadata {
  const description = `${job.title} position at Tribhuban Concepts — ${job.location}. Apply now and join our engineering team.`;

  return buildBaseMetadata({
    title: job.title,
    description,
    canonical: `/careers/${job.slug}`,
    ogType: 'website',
  });
}
