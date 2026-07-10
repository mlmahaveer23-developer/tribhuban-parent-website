/**
 * /resources/blogs/[slug] — Canonical URL for blog articles.
 * Re-exports the existing blog article page so all /resources/blogs/[slug]
 * links resolve correctly without duplicating any logic or content.
 *
 * The blog article page already sets canonical → /resources/blogs/[slug]
 * so this is the authoritative route for SEO.
 */
export {
  default,
  generateMetadata,
  generateStaticParams,
  revalidate,
} from '../../../../(content)/blog/[slug]/page';
