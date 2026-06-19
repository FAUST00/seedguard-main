/* SeedGuard service worker — notifications + offline app-shell caching.
 *
 * Foreground notifications are shown directly by the app (see
 * lib/notifications.ts). This worker handles future server-sent Web Push:
 * a `push` event renders a notification, and clicking it focuses the app.
 * It is inert until a push sender + VAPID keys are configured.
 *
 * Caching: stale-while-revalidate for same-origin GET requests only. Cross-
 * origin calls (Supabase auth/data/realtime) are never intercepted, so
 * online behavior is unaffected — this only adds an offline/instant-load
 * fallback for the app shell (HTML/CSS/JS/icons). Bump CACHE_NAME on any
 * change here so old caches are cleaned up automatically on the next visit.
 */

const BASE = '/seedguard-main';
const CACHE_NAME = 'seedguard-shell-v1';

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))),
      ),
    ]),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  // Never intercept cross-origin requests (Supabase auth/data/realtime) —
  // those must always hit the network directly.
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(request);
      const networkFetch = fetch(request)
        .then((response) => {
          if (response && response.ok) cache.put(request, response.clone());
          return response;
        })
        .catch(() => null);

      if (cached) {
        // Serve the cached app shell instantly; refresh the cache in the
        // background so the next load picks up any changes.
        event.waitUntil(networkFetch);
        return cached;
      }
      const networkResponse = await networkFetch;
      return networkResponse || cached || Response.error();
    }),
  );
});

self.addEventListener('push', (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch (_) {}
  const title = data.title || 'SeedGuard';
  const options = {
    body: data.body || 'You have a new update.',
    icon: `${BASE}/images/logo-icon.svg`,
    badge: `${BASE}/images/logo-icon.svg`,
    data: { url: data.url || `${BASE}/dashboard` },
    tag: data.tag || 'seedguard',
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || `${BASE}/dashboard`;
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ('focus' in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    })
  );
});
