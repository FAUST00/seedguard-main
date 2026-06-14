import React from 'react';

interface SeedGuardLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
}

export function SeedGuardLogo({ size = 'md', showTagline = true }: SeedGuardLogoProps) {
  const scale = size === 'sm' ? 0.6 : size === 'lg' ? 1.4 : 1;
  const w = Math.round(160 * scale);
  const h = Math.round((showTagline ? 90 : 68) * scale);

  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 160 ${showTagline ? 90 : 68}`}
      role="img"
      aria-label="SeedGuard logo"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <filter id="sg-glow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="sg-tglow" x="-10%" y="-40%" width="120%" height="180%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
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

      {/* Hex shield — centered at x=22, spans x=8..36 */}
      <path
        d="M22,4 L36,11 L36,34 C36,46 22,55 22,55 C22,55 8,46 8,34 L8,11 Z"
        fill="none"
        stroke="url(#sg-grad)"
        strokeWidth="2"
        filter="url(#sg-glow)"
      />
      {/* Left half tint — pink */}
      <path
        d="M22,4 L8,11 L8,34 C8,46 22,55 22,55 Z"
        fill="#ff2d9b"
        fillOpacity="0.08"
        stroke="none"
      />

      {/* Geometric diamond seed inside shield */}
      <polygon
        points="22,15 28,29 22,43 16,29"
        fill="none"
        stroke="#ff2d9b"
        strokeWidth="1.5"
        filter="url(#sg-glow)"
      />
      {/* Center dot — cyan */}
      <circle cx="22" cy="29" r="3" fill="#00e5ff" filter="url(#sg-glow)" />

      {/* SEEDGUARD — centered in full 160px width */}
      <text
        x="80"
        y="34"
        textAnchor="middle"
        fontFamily="'Orbitron', 'Segoe UI', monospace"
        fontSize="17"
        fontWeight="700"
        fill="#ff2d9b"
        filter="url(#sg-tglow)"
        letterSpacing="4"
      >
        SEEDGUARD
      </text>

      {/* Tagline — only when showTagline=true */}
      {showTagline && (
        <text
          x="80"
          y="52"
          textAnchor="middle"
          fontFamily="'Orbitron', 'Segoe UI', monospace"
          fontSize="6.5"
          fontWeight="400"
          fill="#00e5ff"
          filter="url(#sg-tglow)"
          letterSpacing="5"
          opacity="0.7"
        >
          PMO RECOVERY TRACKER
        </text>
      )}
    </svg>
  );
}
