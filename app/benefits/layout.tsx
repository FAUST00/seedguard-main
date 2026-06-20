import type { Metadata } from 'next';

// Route-segment metadata for the (client-component) Benefits page. A server
// layout is the zero-risk way to give a client page its own SEO tags without
// touching the page itself.
export const metadata: Metadata = {
  title: 'Benefits Timeline',
  description:
    'A week-by-week and month-by-month timeline of NoFap and semen retention benefits, from the first-week detox through flatline to long-term clarity, confidence, and energy.',
  openGraph: {
    title: 'The Retention Journey | SeedGuard',
    description:
      'Week-by-week and month-by-month benefits of NoFap and semen retention, honestly mapped.',
  },
};

export default function BenefitsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
