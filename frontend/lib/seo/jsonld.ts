/**
 * JSON-LD structured data builder factories.
 *
 * Each function returns a plain object ready to be serialised with
 * JSON.stringify and injected as <script type="application/ld+json">.
 * The `JsonLd` component in components/seo/ handles the script injection.
 */

const BASE_URL = 'https://tribhubanconcepts.com';
const ORG_NAME = 'Tribhuban Concepts';
const ORG_LOGO = `${BASE_URL}/logo.png`;

// ---------------------------------------------------------------------------
// Organization
// ---------------------------------------------------------------------------

/**
 * Schema.org Organization structured data for the company.
 */
export function buildOrganizationJsonLd(): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${BASE_URL}/#organization`,
    name: ORG_NAME,
    url: BASE_URL,
    logo: {
      '@type': 'ImageObject',
      url: ORG_LOGO,
      width: 512,
      height: 512,
    },
    description:
      'Tribhuban Concepts is an Indian technology and engineering company specialising in solar energy, future technologies, and AI-powered solutions.',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'IN',
    },
    sameAs: [
      'https://twitter.com/tribhubanconcepts',
      'https://www.linkedin.com/company/tribhuban-concepts',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      url: `${BASE_URL}/contact`,
      availableLanguage: 'en',
    },
  };
}

// ---------------------------------------------------------------------------
// WebSite with SearchAction
// ---------------------------------------------------------------------------

/**
 * Schema.org WebSite with a sitelinks search box SearchAction.
 */
export function buildWebSiteJsonLd(): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${BASE_URL}/#website`,
    url: BASE_URL,
    name: ORG_NAME,
    description:
      'The official website of Tribhuban Concepts — solar energy, future technologies, and engineering solutions.',
    publisher: {
      '@id': `${BASE_URL}/#organization`,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${BASE_URL}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

// ---------------------------------------------------------------------------
// Article / BlogPosting
// ---------------------------------------------------------------------------

export interface ArticleJsonLdInput {
  title: string;
  description: string;
  slug: string;
  publishedAt: string | Date;
  modifiedAt?: string | Date;
  heroImageUrl?: string;
  authorName?: string;
  /** 'BlogPosting' | 'TechArticle' | 'Article' */
  articleType?: string;
}

/**
 * Schema.org Article/BlogPosting/TechArticle structured data.
 */
export function buildArticleJsonLd(article: ArticleJsonLdInput): object {
  const type = article.articleType ?? 'BlogPosting';
  const publishedTime =
    article.publishedAt instanceof Date
      ? article.publishedAt.toISOString()
      : article.publishedAt;
  const modifiedTime = article.modifiedAt
    ? article.modifiedAt instanceof Date
      ? article.modifiedAt.toISOString()
      : article.modifiedAt
    : publishedTime;

  return {
    '@context': 'https://schema.org',
    '@type': type,
    headline: article.title,
    description: article.description,
    url: `${BASE_URL}/blog/${article.slug}`,
    datePublished: publishedTime,
    dateModified: modifiedTime,
    author: {
      '@type': 'Organization',
      name: article.authorName ?? ORG_NAME,
      url: BASE_URL,
    },
    publisher: {
      '@id': `${BASE_URL}/#organization`,
    },
    ...(article.heroImageUrl
      ? {
          image: {
            '@type': 'ImageObject',
            url: article.heroImageUrl,
          },
        }
      : {}),
  };
}

// ---------------------------------------------------------------------------
// BreadcrumbList
// ---------------------------------------------------------------------------

export interface BreadcrumbItem {
  name: string;
  href: string;
}

/**
 * Schema.org BreadcrumbList structured data.
 */
export function buildBreadcrumbJsonLd(items: BreadcrumbItem[]): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.href.startsWith('http')
        ? item.href
        : `${BASE_URL}${item.href}`,
    })),
  };
}

// ---------------------------------------------------------------------------
// FAQPage
// ---------------------------------------------------------------------------

export interface FaqItem {
  question: string;
  answer: string;
}

/**
 * Schema.org FAQPage structured data.
 */
export function buildFAQPageJsonLd(faqs: FaqItem[]): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

// ---------------------------------------------------------------------------
// JobPosting
// ---------------------------------------------------------------------------

export interface JobPostingJsonLdInput {
  title: string;
  description: string;
  slug: string;
  location: string;
  employmentType?: string;
  datePosted: string | Date;
  validThrough?: string | Date;
  salary?: {
    minValue: number;
    maxValue: number;
    currency: string;
  };
}

/**
 * Schema.org JobPosting structured data.
 */
export function buildJobPostingJsonLd(job: JobPostingJsonLdInput): object {
  const datePosted =
    job.datePosted instanceof Date
      ? job.datePosted.toISOString().split('T')[0]
      : job.datePosted;
  const validThrough = job.validThrough
    ? job.validThrough instanceof Date
      ? job.validThrough.toISOString().split('T')[0]
      : job.validThrough
    : undefined;

  return {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.title,
    description: job.description,
    datePosted,
    ...(validThrough ? { validThrough } : {}),
    employmentType: job.employmentType ?? 'FULL_TIME',
    hiringOrganization: {
      '@type': 'Organization',
      name: ORG_NAME,
      sameAs: BASE_URL,
      logo: ORG_LOGO,
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: job.location,
        addressCountry: 'IN',
      },
    },
    url: `${BASE_URL}/careers/${job.slug}`,
    ...(job.salary
      ? {
          baseSalary: {
            '@type': 'MonetaryAmount',
            currency: job.salary.currency,
            value: {
              '@type': 'QuantitativeValue',
              minValue: job.salary.minValue,
              maxValue: job.salary.maxValue,
              unitText: 'YEAR',
            },
          },
        }
      : {}),
  };
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

/**
 * Schema.org Service structured data.
 */
export function buildServiceJsonLd(name: string, description: string): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name,
    description,
    provider: {
      '@id': `${BASE_URL}/#organization`,
    },
    url: BASE_URL,
    areaServed: {
      '@type': 'Country',
      name: 'India',
    },
  };
}

// ---------------------------------------------------------------------------
// WebApplication
// ---------------------------------------------------------------------------

/**
 * Schema.org WebApplication structured data (e.g. Solar Calculator).
 */
export function buildWebApplicationJsonLd(
  name: string,
  description: string,
  url: string,
): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name,
    description,
    url: url.startsWith('http') ? url : `${BASE_URL}${url}`,
    applicationCategory: 'UtilityApplication',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'INR',
    },
    provider: {
      '@id': `${BASE_URL}/#organization`,
    },
  };
}
