import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: slug.replace(/-/g, ' '),
    description: `Read the article: ${slug.replace(/-/g, ' ')}`,
  };
}

export const revalidate = 3600; // 1 hour

export default async function BlogArticlePage({ params }: Props) {
  const { slug } = await params;

  if (!slug) {
    notFound();
  }

  return (
    <div className="container-content py-16">
      <article>
        <h1 className="font-display text-h1 font-semibold text-page mb-4 capitalize">
          {slug.replace(/-/g, ' ')}
        </h1>
        <p className="text-body-lg text-muted max-w-2xl">
          Article content will be loaded from the Content Service.
        </p>
      </article>
    </div>
  );
}
