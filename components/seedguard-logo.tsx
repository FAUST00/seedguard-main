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
    return (
      <img
        src={ICON_SRC}
        alt="SeedGuard"
        style={{ width: 44, height: 44, display: 'block', flexShrink: 0 }}
      />
    );
  }

  if (size === 'sm') {
    // Mobile header — icon only at fixed height so it fits the h-14 top bar
    return (
      <img
        src={ICON_SRC}
        alt="SeedGuard"
        style={{ height: 44, width: 'auto', display: 'block', flexShrink: 0 }}
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
      style={{ width: 190, height: 'auto', display: 'block', flexShrink: 0 }}
    />
  );
}
