import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

const SITE = 'https://faust00.github.io/seedguard-main';

// Public, content-facing routes worth indexing. App/utility pages behind the
// account flow (dashboard, account, settings, social, etc.) are intentionally
// omitted — they hold no crawlable public content.
const ROUTES = ['', '/benefits', '/videos', '/esoteric'];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return ROUTES.map((path) => ({
    url: `${SITE}${path}/`,
    lastModified: now,
    changeFrequency: path === '' ? 'weekly' : 'monthly',
    priority: path === '' ? 1 : 0.7,
  }));
}
