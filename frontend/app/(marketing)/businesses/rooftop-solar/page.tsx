/**
 * /businesses/rooftop-solar — Dedicated Rooftop Solar page.
 *
 * This static segment overrides the generic [business]/page.tsx template,
 * serving the full solar content with video hero, subsidies, installation
 * process, net metering, ROI calculator preview, FAQs, and blog links.
 *
 * Next.js resolves static segments before dynamic ones, so this file takes
 * priority over [business]/page.tsx when the slug is "rooftop-solar".
 *
 * Implementation: re-exports the default export and named exports from the
 * shared solar page so we don't duplicate 500+ lines of content.
 */
export {
  default,
  generateMetadata,
  revalidate,
} from '../../solar/page';
