'use client';

import { asset } from '@/lib/assets';

const ICON_SRC = asset('/images/logo-icon.svg'); // shield only  — collapsed sidebar + mobile header
const LOGO_SRC = asset('/images/logo.svg');       // shield + SEEDGUARD text — expanded sidebar + hero

interface SeedGuardLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'hero';
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

  if (size === 'hero') {
    // Landing page hero — shield icon only, title/tagline rendered as HTML below
    return (
      <img
        src={ICON_SRC}
        alt="SeedGuard shield"
        style={{ height: 200, width: 'auto', display: 'block', flexShrink: 0, maxWidth: '90vw' }}
      />
    );
  }

  if (size === 'lg') {
    // Expanded sidebar large variant
    return (
      <img
        src={LOGO_SRC}
        alt="SeedGuard"
        style={{ width: 220, height: 'auto', display: 'block', flexShrink: 0, maxWidth: '90vw' }}
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
