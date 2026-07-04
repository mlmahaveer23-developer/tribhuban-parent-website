import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Knowledge Center',
  description: 'In-depth guides, how-tos, and reference material from Tribhuban Concepts.',
};

export const revalidate = 3600; // 1 hour

export default function KnowledgePage() {
  return (
    <div className="container-content py-16">
      <h1 className="font-display text-h1 font-semibold text-page mb-4">Knowledge Center</h1>
      <p className="text-body-lg text-muted max-w-2xl">
        Evergreen guides and reference material on solar, technology, and engineering.
      </p>
    </div>
  );
}
