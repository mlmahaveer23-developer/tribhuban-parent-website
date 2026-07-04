import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Careers',
  description: 'Join Tribhuban Concepts — explore open roles in engineering, technology, and solar energy.',
};

export const revalidate = 900; // 15 minutes

export default function CareersPage() {
  return (
    <div className="container-content py-16">
      <h1 className="font-display text-h1 font-semibold text-page mb-4">Careers at Tribhuban Concepts</h1>
      <p className="text-body-lg text-muted max-w-2xl">
        Open roles and opportunities to join our engineering and technology team.
      </p>
    </div>
  );
}
