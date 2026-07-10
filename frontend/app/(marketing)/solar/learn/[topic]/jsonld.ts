/**
 * JSON-LD helper functions for the Solar Learning Hub topic page.
 * Extracted into a separate file to avoid Next.js page-export type-checking issues.
 */
import { SITE_URL } from '@/lib/siteConfig';

/** Build LearningResource JSON-LD for a topic. (Req 23.2) */
export function buildLearningResourceJsonLd(topic: string, title: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'LearningResource',
    name: title,
    url: `${SITE_URL}/solar/learn/${topic}`,
    provider: {
      '@type': 'Organization',
      name: 'Tribhuban Concepts',
    },
    educationalLevel: 'Beginner',
    learningResourceType: 'Article',
    inLanguage: 'en',
  };
}

/** Build BreadcrumbList JSON-LD for a topic. (Req 23.2) */
export function buildBreadcrumbJsonLd(topic: string, title: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: `${SITE_URL}/`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Rooftop Solar',
        item: `${SITE_URL}/businesses/rooftop-solar`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'Learning Hub',
        item: `${SITE_URL}/solar/learn`,
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: title,
        item: `${SITE_URL}/solar/learn/${topic}`,
      },
    ],
  };
}
