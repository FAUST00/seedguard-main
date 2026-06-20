import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Video Library',
  description:
    'A curated library of the best NoFap and semen retention videos, covering the science, psychology, benefits, motivation, and esoteric tradition behind reclaiming your discipline.',
  openGraph: {
    title: 'Video Library | SeedGuard',
    description:
      'Curated videos on the science, psychology, and real-world transformation behind semen retention and NoFap.',
  },
};

export default function VideosLayout({ children }: { children: React.ReactNode }) {
  return children;
}
