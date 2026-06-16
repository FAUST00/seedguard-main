/**
 * Notifications — opt-in browser notifications.
 *
 * What works today (no server needed): permission opt-in + foreground
 * notifications fired by the app while it's open (see components/
 * notification-listener.tsx). The service worker (public/sw.js) is registered
 * so Web Push is ready once a sender + VAPID keys are configured; until then
 * `maybeSubscribePush` is a no-op.
 */

import { supabase } from './supabase';
import { getUser } from './sync';

const BASE_PATH = '/seedguard-main';
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';

export function notificationsSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function getPermission(): NotificationPermission {
  if (!notificationsSupported()) return 'denied';
  return Notification.permission;
}

export async function requestPermission(): Promise<NotificationPermission> {
  if (!notificationsSupported()) return 'denied';
  try {
    const perm = await Notification.requestPermission();
    if (perm === 'granted') {
      await registerServiceWorker();
      await maybeSubscribePush();
    }
    return perm;
  } catch {
    return 'denied';
  }
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return null;
  try {
    return await navigator.serviceWorker.register(`${BASE_PATH}/sw.js`, { scope: `${BASE_PATH}/` });
  } catch {
    return null;
  }
}

/** Show a notification now (foreground). Prefers the SW registration so it
 *  works consistently; falls back to the Notification constructor. */
export async function showLocalNotification(title: string, body: string, url?: string): Promise<void> {
  if (getPermission() !== 'granted') return;
  const opts: NotificationOptions = {
    body,
    icon: `${BASE_PATH}/images/logo-icon.svg`,
    badge: `${BASE_PATH}/images/logo-icon.svg`,
    data: { url: url || `${BASE_PATH}/dashboard` },
    tag: 'seedguard',
  };
  try {
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.getRegistration(`${BASE_PATH}/`);
      if (reg) { await reg.showNotification(title, opts); return; }
    }
    new Notification(title, opts);
  } catch {}
}

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(b64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

/** Subscribe to Web Push and store the subscription — only when a VAPID public
 *  key is configured. Inert (no-op) otherwise, so nothing breaks pre-setup. */
export async function maybeSubscribePush(): Promise<void> {
  if (!VAPID_PUBLIC_KEY || typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;
  try {
    const reg = await navigator.serviceWorker.getRegistration(`${BASE_PATH}/`);
    if (!reg) return;
    const existing = await reg.pushManager.getSubscription();
    const sub = existing ?? await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY).buffer as ArrayBuffer,
    });
    const user = await getUser();
    if (!user) return;
    await supabase.from('push_subscriptions').upsert({
      user_id: user.id,
      endpoint: sub.endpoint,
      subscription: JSON.stringify(sub),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'endpoint' });
  } catch {
    // table or VAPID not ready — no-op
  }
}
