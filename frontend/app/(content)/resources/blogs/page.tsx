/**
 * /resources/blogs — Blog listing page at the canonical resources path.
 * Re-exports the existing blog listing page so both routes serve the same content.
 */
export { default, metadata, revalidate } from '../../../(content)/blog/page';
