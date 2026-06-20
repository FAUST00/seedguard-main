import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

const SITE = 'https://faust00.github.io/seedguard-main';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: `${SITE}/sitemap.xml`,
  };
}
