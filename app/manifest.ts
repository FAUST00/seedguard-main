import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'SeedGuard: PMO Freedom Tracker',
    short_name: 'SeedGuard',
    description: 'Track streaks, compete with friends, and reclaim your freedom.',
    start_url: '/seedguard-main/',
    display: 'standalone',
    background_color: '#0d0a1f',
    theme_color: '#ff2d9b',
    orientation: 'portrait',
    icons: [
      {
        src: '/seedguard-main/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/seedguard-main/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
