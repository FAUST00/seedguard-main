'use client';

import { asset } from '@/lib/assets';

const ICON_SRC = asset('/images/logo-icon.svg'); // shield only  — collapsed sidebar + mobile header
const LOGO_SRC = asset('/images/logo.svg');       // shield + SEEDGUARD text — expanded sidebar + hero

interface SeedGuardLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  collapsed?: boolean;
}

export function SeedGuardLogo({ size = 'md', collapsed = false }: SeedGuardLogoProps) {
  if (collapsed) {
    // Collapsed sidebar (w-16) — shield icon only, height-locked so it stays centered
    return (
      <img
        src={ICON_SRC}
        alt="SeedGuard"
        style={{ height: 48, width: 'auto', display: 'block', flexShrink: 0 }}
      />
    );
  }

  if (size === 'sm') {
    // Mobile header — icon only at fixed height so it fits the h-14 top bar
    return (
      <img
        src={ICON_SRC}
        alt="SeedGuard"
        style={{ height: 46, width: 'auto', display: 'block', flexShrink: 0 }}
      />
    );
  }

  if (size === 'lg') {
    // Landing page hero
    return (
      <img
        src={LOGO_SRC}
        alt="SeedGuard"
        style={{ width: 280, height: 'auto', display: 'block', flexShrink: 0 }}
      />
    );
  }

  // md — desktop expanded sidebar
  return (
    <img
      src={LOGO_SRC}
      alt="SeedGuard"
      style={{ width: 188, height: 'auto', display: 'block', flexShrink: 0 }}
    />
  );
}
