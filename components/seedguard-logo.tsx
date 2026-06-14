'use client';

interface SeedGuardLogoProps {
  /** sm = 75% (mobile header), md = full 200×66 (desktop sidebar), lg = 130% */
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
}

export function SeedGuardLogo({ size = 'md', showTagline = true }: SeedGuardLogoProps) {
  const BASE_W = 200;
  const BASE_H = showTagline ? 66 : 48;
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
        <filter id="sg-glow" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="sg-tglow" x="-12%" y="-60%" width="124%" height="220%">
          <feGaussianBlur stdDeviation="1.6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id="sg-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ff2d9b" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#00e5ff" stopOpacity="0.95" />
        </linearGradient>
      </defs>

      {/* ── Shield — center x=24, spans y=4..62 ── */}
      <path
        d="M24,4 L40,12 L40,38 C40,52 24,62 24,62 C24,62 8,52 8,38 L8,12 Z"
        fill="none"
        stroke="url(#sg-grad)"
        strokeWidth="2"
        filter="url(#sg-glow)"
      />
      {/* Left-half pink tint */}
      <path
        d="M24,4 L8,12 L8,38 C8,52 24,62 24,62 Z"
        fill="#ff2d9b"
        fillOpacity="0.07"
        stroke="none"
      />

      {/* ── Diamond seed — vertically centered in shield at y=33 ── */}
      <polygon
        points="24,17 31,33 24,49 17,33"
        fill="none"
        stroke="#ff2d9b"
        strokeWidth="1.5"
        strokeLinejoin="round"
        filter="url(#sg-glow)"
      />
      {/* Cyan center dot */}
      <circle cx="24" cy="33" r="3" fill="#00e5ff" filter="url(#sg-glow)" />
      <line x1="17" y1="33" x2="31" y2="33" stroke="#00e5ff" strokeWidth="0.5" opacity="0.2" />

      {/* ── SEEDGUARD — baseline at y=37, center of right column x=50..200 → x=125 ── */}
      <text
        x="125"
        y="37"
        textAnchor="middle"
        fontFamily="'Orbitron','Segoe UI',monospace"
        fontSize="17"
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
          x="125"
          y="54"
          textAnchor="middle"
          fontFamily="'Orbitron','Segoe UI',monospace"
          fontSize="6.5"
          fontWeight="400"
          fill="#00e5ff"
          filter="url(#sg-tglow)"
          letterSpacing="5"
          opacity="0.72"
        >
          PMO RECOVERY TRACKER
        </text>
      )}
    </svg>
  );
}
