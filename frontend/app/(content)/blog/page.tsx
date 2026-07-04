import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Insights, guides, and updates from the Tribhuban Concepts team on solar, technology, and engineering.',
};

export const revalidate = 600; // 10 minutes

export default function BlogPage() {
  return (
    <div className="container-content py-16">
      <h1 className="font-display text-h1 font-semibold text-page mb-4">Blog</h1>
      <p className="text-body-lg text-muted max-w-2xl">
        Insights on solar, technology, and engineering excellence.
      </p>
    </div>
  );
}
