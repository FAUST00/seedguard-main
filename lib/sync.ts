const API_URL = process.env.NEXT_PUBLIC_SEEDGUARD_API_URL || 'http://localhost:3001';

// Throttle/debounce delay
let syncTimeout: NodeJS.Timeout | null = null;

export async function syncWithCloud(immediate: boolean = false) {
  if (typeof window === 'undefined') return;

  const token = localStorage.getItem('seedguard_token');
  if (!token) return; // Not logged in, skip sync

  // Debounce the actual request to avoid spamming the server
  if (syncTimeout) {
    clearTimeout(syncTimeout);
  }

  const doSync = async () => {
    try {
      const streakStart = localStorage.getItem('seedguard_streak_start');
      const statsRaw = localStorage.getItem('seedguard_stats');
      const historyRaw = localStorage.getItem('seedguard_history');
      const settingsRaw = localStorage.getItem('seedguard_settings');
      const friendsRaw = localStorage.getItem('seedguard_friends');

      const body = {
        streakStart,
        stats: statsRaw ? JSON.parse(statsRaw) : null,
        history: historyRaw ? JSON.parse(historyRaw) : null,
        settings: settingsRaw ? JSON.parse(settingsRaw) : null,
        friends: friendsRaw ? JSON.parse(friendsRaw) : null,
      };

      const res = await fetch(`${API_URL}/api/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        console.error('Failed to sync with cloud:', data.error || res.statusText);
      } else {
        console.log('Successfully synchronized with the cloud.');
      }
    } catch (error) {
      console.error('Error during cloud synchronization:', error);
    }
  };

  if (immediate) {
    await doSync();
  } else {
    syncTimeout = setTimeout(doSync, 1000); // 1-second debounce
  }
}
