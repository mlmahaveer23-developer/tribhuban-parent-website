/**
 * /businesses/rooftop-solar — Full Rooftop Solar page.
 * Static segment overrides [business]/page.tsx for this slug.
 * Re-exports the full solar page (video hero, subsidies, FAQs, etc.)
 */
export {
  default,
  generateMetadata,
  revalidate,
} from '../../solar/page';
