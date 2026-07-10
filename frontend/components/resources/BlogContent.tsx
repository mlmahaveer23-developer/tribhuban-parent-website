/**
 * BlogContent — rendered inside /resources/blogs.
 * Delegates to the existing BlogPage body so logic lives in one place.
 */
import Link from 'next/link';

export default function BlogContent() {
  return (
    <div>
      <p className="text-[var(--fg-muted)] mb-8">
        Browse our latest articles on solar energy, technology, and sustainability.
      </p>
      <Link
        href="/resources/blogs"
        className="inline-flex items-center text-sm font-semibold text-[var(--accent)] hover:underline"
      >
        View all articles →
      </Link>
    </div>
  );
}
