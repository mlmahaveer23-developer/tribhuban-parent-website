import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ category: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const title = category.replace(/-/g, ' ');
  return {
    title: `Blog — ${title}`,
    description: `Browse blog posts in the ${title} category.`,
  };
}

export const revalidate = 600; // 10 minutes

export default async function BlogCategoryPage({ params }: Props) {
  const { category } = await params;

  if (!category) {
    notFound();
  }

  return (
    <div className="container-content py-16">
      <h1 className="font-display text-h1 font-semibold text-page mb-4 capitalize">
        {category.replace(/-/g, ' ')}
      </h1>
      <p className="text-body-lg text-muted max-w-2xl">
        Articles in this category will be loaded from the Content Service.
      </p>
    </div>
  );
}
