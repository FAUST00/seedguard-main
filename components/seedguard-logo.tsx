'use client';

import { asset } from '@/lib/assets';

// 1220×720 transparent-background PNG (watermark removed)
const LOGO_SRC = asset('/images/logo.png');
// Aspect ratio: 1220/720 = 1.694

interface SeedGuardLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean; // kept for API compat — text is baked into image
  collapsed?: boolean;   // collapsed sidebar: crop to shield icon only
}

export function SeedGuardLogo({ size = 'md', collapsed = false }: SeedGuardLogoProps) {
  if (collapsed) {
    // Show a 38×38 crop centered on the shield emblem only.
    // At 200px rendered width → 118px tall.
    // Shield center ≈ (50%, 35%) → (100px, 41px).
    // marginLeft = -(100 - 19) = -81px
    // marginTop  = -(41  - 19) = -22px
    return (
      <div
        className="overflow-hidden rounded-lg flex-shrink-0"
        style={{ width: 38, height: 38 }}
        role="img"
        aria-label="SeedGuard"
      >
        <img
          src={LOGO_SRC}
          alt=""
          aria-hidden
          style={{
            width: 200,
            height: 'auto',
            display: 'block',
            marginLeft: -81,
            marginTop: -22,
          }}
        />
      </div>
    );
  }

  if (size === 'sm') {
    // Mobile header — fixed 40px height so it fits in the h-14 (56px) top bar
    return (
      <img
        src={LOGO_SRC}
        alt="SeedGuard"
        style={{ height: 40, width: 'auto', display: 'block', flexShrink: 0 }}
      />
    );
  }

  if (size === 'lg') {
    // Landing page hero — wide, prominent
    return (
      <img
        src={LOGO_SRC}
        alt="SeedGuard"
        style={{ width: 240, height: 'auto', display: 'block', flexShrink: 0 }}
      />
    );
  }

  // md — desktop expanded sidebar
  return (
    <img
      src={LOGO_SRC}
      alt="SeedGuard"
      style={{ width: 172, height: 'auto', display: 'block', flexShrink: 0 }}
    />
  );
}
