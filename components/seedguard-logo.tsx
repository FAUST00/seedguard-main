'use client';

interface SeedGuardLogoProps {
  /** sm = 75% scale, md = full (220×68), lg = 130% */
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
}

export function SeedGuardLogo({ size = 'md', showTagline = true }: SeedGuardLogoProps) {
  const BASE_W = 220;
  const BASE_H = showTagline ? 68 : 50;
  const s = size === 'sm' ? 0.75 : size === 'lg' ? 1.3 : 1;
  const w = Math.round(BASE_W * s);
  const h = Math.round(BASE_H * s);

  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${BASE_W} ${BASE_H}`}
      role="img"
      aria-label="SeedGuard"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block', flexShrink: 0 }}
    >
      <defs>
        {/* Shield / icon glow */}
        <filter id="sg-glow" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="2.8" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        {/* Text glow */}
        <filter id="sg-tglow" x="-15%" y="-50%" width="130%" height="200%">
          <feGaussianBlur stdDeviation="1.8" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        {/* Pink→cyan vertical gradient for shield stroke */}
        <linearGradient id="sg-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ff2d9b" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#00e5ff" stopOpacity="0.95" />
        </linearGradient>
      </defs>

      {/* ── Hex shield ── centered at x=28, y=34 */}
      {/* shape: pointed top, flat sides, curved bottom point */}
      <path
        d="M28,5 L44,13 L44,36 C44,50 28,60 28,60 C28,60 12,50 12,36 L12,13 Z"
        fill="none"
        stroke="url(#sg-grad)"
        strokeWidth="2.2"
        filter="url(#sg-glow)"
      />
      {/* Left half pink tint */}
      <path
        d="M28,5 L12,13 L12,36 C12,50 28,60 28,60 Z"
        fill="#ff2d9b"
        fillOpacity="0.07"
        stroke="none"
      />

      {/* ── Geometric diamond seed inside shield ── */}
      <polygon
        points="28,16 35,32 28,48 21,32"
        fill="none"
        stroke="#ff2d9b"
        strokeWidth="1.6"
        strokeLinejoin="round"
        filter="url(#sg-glow)"
      />
      {/* Cyan center dot */}
      <circle cx="28" cy="32" r="3.2" fill="#00e5ff" filter="url(#sg-glow)" />
      {/* Subtle horizontal cross-line */}
      <line x1="21" y1="32" x2="35" y2="32" stroke="#00e5ff" strokeWidth="0.6" opacity="0.25" />

      {/* ── SEEDGUARD wordmark ── x=118 = center of right column (58..220) */}
      <text
        x="118"
        y={showTagline ? '30' : '36'}
        textAnchor="middle"
        fontFamily="'Orbitron', 'Segoe UI', monospace"
        fontSize="18"
        fontWeight="700"
        fill="#ff2d9b"
        filter="url(#sg-tglow)"
        letterSpacing="4"
      >
        SEEDGUARD
      </text>

      {/* ── Tagline ── */}
      {showTagline && (
        <text
          x="118"
          y="50"
          textAnchor="middle"
          fontFamily="'Orbitron', 'Segoe UI', monospace"
          fontSize="7"
          fontWeight="400"
          fill="#00e5ff"
          filter="url(#sg-tglow)"
          letterSpacing="5.5"
          opacity="0.72"
        >
          PMO RECOVERY TRACKER
        </text>
      )}
    </svg>
  );
}
