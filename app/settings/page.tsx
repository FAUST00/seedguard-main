'use client';

import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Moon, Sun, Trash2, Download, Upload } from 'lucide-react';

export default function Settings() {
  const [isDark, setIsDark] = useState(true);
  const [settings, setSettings] = useState({
    notifications: true,
    soundEnabled: false,
    autoBackup: true,
  });

  useEffect(() => {
    // Load settings from localStorage
    const saved = localStorage.getItem('seedguard_settings');
    if (saved) {
      setSettings(JSON.parse(saved));
    }
  }, []);

  const updateSettings = (key: string, value: any) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    localStorage.setItem('seedguard_settings', JSON.stringify(updated));
  };

  const exportData = () => {
    const data = {
      stats: localStorage.getItem('seedguard_stats'),
      history: localStorage.getItem('seedguard_history'),
      settings: localStorage.getItem('seedguard_settings'),
    };
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `seedguard-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearAllData = () => {
    if (confirm('Are you sure? This will permanently delete all your data.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-2xl space-y-8 page-entry">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-extrabold tracking-widest uppercase italic neon-text-cyan text-secondary flex items-center gap-3">
          <SettingsIcon className="w-10 h-10" />
          Settings
        </h1>
        <p className="text-muted-foreground text-lg mt-2">
          Customize your SeedGuard experience.
        </p>
      </div>

      {/* Appearance Section */}
      <div className="rounded-xl border border-primary/20 bg-background/50 backdrop-blur-sm p-8 space-y-6 animate-scale-in">
        <h2 className="text-xl font-bold uppercase tracking-wider text-primary neon-text-pink">
          Appearance
        </h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isDark ? (
                <Moon className="w-5 h-5 text-primary" />
              ) : (
                <Sun className="w-5 h-5 text-primary" />
              )}
              <span className="font-medium">Dark Mode</span>
            </div>
            <div className="relative inline-flex items-center">
              <input
                type="checkbox"
                checked={isDark}
                onChange={(e) => setIsDark(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-primary after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary/50" />
            </div>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="rounded-xl border border-secondary/20 bg-background/50 backdrop-blur-sm p-8 space-y-6 animate-scale-in [animation-delay:100ms]">
        <h2 className="text-xl font-bold uppercase tracking-wider text-secondary neon-text-cyan">
          Notifications
        </h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-medium">Push Notifications</span>
            <input
              type="checkbox"
              checked={settings.notifications}
              onChange={(e) => updateSettings('notifications', e.target.checked)}
              className="w-5 h-5 rounded border-muted accent-primary cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="font-medium">Sound Effects</span>
            <input
              type="checkbox"
              checked={settings.soundEnabled}
              onChange={(e) => updateSettings('soundEnabled', e.target.checked)}
              className="w-5 h-5 rounded border-muted accent-primary cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="font-medium">Auto-Backup Data</span>
            <input
              type="checkbox"
              checked={settings.autoBackup}
              onChange={(e) => updateSettings('autoBackup', e.target.checked)}
              className="w-5 h-5 rounded border-muted accent-primary cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="rounded-xl border border-accent/20 bg-background/50 backdrop-blur-sm p-8 space-y-6 animate-scale-in [animation-delay:200ms]">
        <h2 className="text-xl font-bold uppercase tracking-wider text-accent">
          Data Management
        </h2>

        <div className="space-y-3">
          <button
            onClick={exportData}
            className="w-full flex items-center justify-center gap-3 px-6 py-3 rounded-lg border border-accent/50 text-accent bg-accent/10 hover:bg-accent/20 transition-all font-medium uppercase tracking-wider"
          >
            <Download className="w-5 h-5" />
            Export Data
          </button>

          <p className="text-xs text-muted-foreground text-center">
            Download a backup of all your data (stats, history, and settings) as JSON.
          </p>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="rounded-xl border border-destructive/20 bg-background/50 backdrop-blur-sm p-8 space-y-6 animate-scale-in [animation-delay:300ms]">
        <h2 className="text-xl font-bold uppercase tracking-wider text-destructive">
          Danger Zone
        </h2>

        <p className="text-sm text-muted-foreground">
          These actions are irreversible. Proceed with caution.
        </p>

        <button
          onClick={clearAllData}
          className="w-full flex items-center justify-center gap-3 px-6 py-3 rounded-lg border border-destructive/50 text-destructive bg-destructive/10 hover:bg-destructive/20 transition-all font-medium uppercase tracking-wider"
        >
          <Trash2 className="w-5 h-5" />
          Clear All Data
        </button>
      </div>

      {/* About Section */}
      <div className="rounded-xl border border-primary/10 bg-gradient-to-br from-primary/5 to-secondary/5 backdrop-blur-sm p-8 text-center space-y-4 animate-scale-in [animation-delay:400ms]">
        <h3 className="font-bold text-lg uppercase tracking-wider">About SeedGuard</h3>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>
            <span className="font-semibold text-foreground">Version</span> 2.0.0
          </p>
          <p>
            <span className="font-semibold text-foreground">Made for</span> PMO Recovery
          </p>
          <p className="pt-2">
            Your data is stored locally in your browser. We never collect or transmit your information.
          </p>
        </div>
      </div>
    </div>
  );
}
