import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: slug.replace(/-/g, ' '),
    description: `Career opportunity at Tribhuban Concepts: ${slug.replace(/-/g, ' ')}`,
  };
}

export const revalidate = 900; // 15 minutes

export default async function CareerDetailPage({ params }: Props) {
  const { slug } = await params;

  if (!slug) {
    notFound();
  }

  return (
    <div className="container-content py-16">
      <h1 className="font-display text-h1 font-semibold text-page mb-4 capitalize">
        {slug.replace(/-/g, ' ')}
      </h1>
      <p className="text-body-lg text-muted max-w-2xl">
        Job details and application form will be loaded from the Career Service.
      </p>
    </div>
  );
}
