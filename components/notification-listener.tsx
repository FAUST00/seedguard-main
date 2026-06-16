'use client';

import { useEffect } from 'react';
import { getUser } from '@/lib/sync';
import { subscribeToInbox } from '@/lib/social';
import { getPermission, registerServiceWorker, showLocalNotification } from '@/lib/notifications';

/**
 * App-wide listener that surfaces a browser notification for incoming DMs and
 * accountability nudges while SeedGuard is open. No-ops unless the user has
 * granted notification permission. Mounted once in the root layout.
 */
export function NotificationListener() {
  useEffect(() => {
    let cleanup: (() => void) | undefined;
    let active = true;

    (async () => {
      if (getPermission() !== 'granted') return;
      await registerServiceWorker();
      const user = await getUser();
      if (!user || !active) return;

      cleanup = subscribeToInbox(user.id, (msg) => {
        // Skip notifying for a chat you're actively viewing.
        const onThatChat = typeof window !== 'undefined'
          && window.location.pathname.includes('/social')
          && document.visibilityState === 'visible';
        if (onThatChat) return;
        const body = msg.content.length > 120 ? msg.content.slice(0, 117) + '…' : msg.content;
        showLocalNotification('SeedGuard', body, '/seedguard-main/social');
      });
    })();

    return () => { active = false; cleanup?.(); };
  }, []);

  return null;
}
