/* SeedGuard service worker — notifications.
 *
 * Foreground notifications are shown directly by the app (see
 * lib/notifications.ts). This worker handles future server-sent Web Push:
 * a `push` event renders a notification, and clicking it focuses the app.
 * It is inert until a push sender + VAPID keys are configured.
 */

const BASE = '/seedguard-main';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

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
