'use client';

import { asset } from '@/lib/assets';

// Original logo with dark navy background — mix-blend-mode:screen makes dark pixels invisible
const LOGO_SRC = asset('/images/logo-orig.png');

interface SeedGuardLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  collapsed?: boolean;
}

const SCREEN_STYLE: React.CSSProperties = {
  mixBlendMode: 'screen',
  display: 'block',
  flexShrink: 0,
};

export function SeedGuardLogo({ size = 'md', collapsed = false }: SeedGuardLogoProps) {
  if (collapsed) {
    // 48×48 viewport cropped to show shield emblem only.
    // At 230px rendered width the image is ~135px tall.
    // Shield center ≈ (50%, 36%) → (115px, 49px).
    // marginLeft = -(115 - 24) = -91   marginTop = -(49 - 24) = -25
    return (
      <div
        className="overflow-hidden rounded-lg flex-shrink-0"
        style={{ width: 48, height: 48 }}
        role="img"
        aria-label="SeedGuard"
      >
        <img
          src={LOGO_SRC}
          alt=""
          aria-hidden
          style={{ ...SCREEN_STYLE, width: 230, height: 'auto', marginLeft: -91, marginTop: -25 }}
        />
      </div>
    );
  }

  if (size === 'sm') {
    return (
      <img src={LOGO_SRC} alt="SeedGuard" style={{ ...SCREEN_STYLE, height: 44, width: 'auto' }} />
    );
  }

  if (size === 'lg') {
    return (
      <img src={LOGO_SRC} alt="SeedGuard" style={{ ...SCREEN_STYLE, width: 260, height: 'auto' }} />
    );
  }

  // md — desktop expanded sidebar
  return (
    <img src={LOGO_SRC} alt="SeedGuard" style={{ ...SCREEN_STYLE, width: 180, height: 'auto' }} />
  );
}
