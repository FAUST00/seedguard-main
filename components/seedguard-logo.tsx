'use client';

import { asset } from '@/lib/assets';

const LOGO_SRC = asset('/images/logo.png');

interface SeedGuardLogoProps {
  /** sm = mobile header (height-constrained), md = desktop sidebar, lg = large context */
  size?: 'sm' | 'md' | 'lg';
  /** Kept for API compat — text is baked into the logo image */
  showTagline?: boolean;
  /** When true, renders a cropped square showing only the shield icon */
  collapsed?: boolean;
}

export function SeedGuardLogo({ size = 'md', collapsed = false }: SeedGuardLogoProps) {
  if (collapsed) {
    // Collapsed sidebar: crop to shield icon only.
    // Image is 1331×784. At 210px rendered width → 124px tall.
    // Shield is horizontally centered (~105px from left) and vertically at ~40% (~50px).
    // To show a 38×38 crop centered on the shield:
    //   marginLeft = -(105 - 19) = -86px
    //   marginTop  = -(50  - 19) = -31px
    return (
      <div
        className="overflow-hidden rounded-lg flex-shrink-0 drop-shadow-[0_0_8px_hsl(315_100%_60%/0.5)]"
        style={{ width: 38, height: 38 }}
        role="img"
        aria-label="SeedGuard"
      >
        <img
          src={LOGO_SRC}
          alt=""
          aria-hidden
          style={{
            width: 210,
            height: 'auto',
            display: 'block',
            marginLeft: -86,
            marginTop: -31,
          }}
        />
      </div>
    );
  }

  if (size === 'sm') {
    // Mobile header — constrain by height so it fits in h-14 (56px) header
    return (
      <img
        src={LOGO_SRC}
        alt="SeedGuard"
        style={{ height: 38, width: 'auto', display: 'block', flexShrink: 0 }}
        className="drop-shadow-[0_0_10px_hsl(315_100%_60%/0.4)]"
      />
    );
  }

  if (size === 'lg') {
    return (
      <img
        src={LOGO_SRC}
        alt="SeedGuard"
        style={{ width: 220, height: 'auto', display: 'block', flexShrink: 0 }}
        className="drop-shadow-[0_0_14px_hsl(315_100%_60%/0.5)]"
      />
    );
  }

  // md — desktop expanded sidebar
  return (
    <img
      src={LOGO_SRC}
      alt="SeedGuard"
      style={{ width: 174, height: 'auto', display: 'block', flexShrink: 0 }}
      className="drop-shadow-[0_0_12px_hsl(315_100%_60%/0.45)]"
    />
  );
}
