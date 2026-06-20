import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Esoteric Wisdom',
  description:
    'The hidden knowledge behind semen retention: sexual transmutation, ancient traditions, and the esoteric teachings on channeling sexual energy into creative and spiritual power.',
  openGraph: {
    title: 'Esoteric Wisdom | SeedGuard',
    description:
      'Ancient and hidden teachings on sexual transmutation and the power of retained sexual energy.',
  },
};

export default function EsotericLayout({ children }: { children: React.ReactNode }) {
  return children;
}
