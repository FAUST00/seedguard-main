/**
 * Default avatar presets — hand-drawn inline SVGs matching SeedGuard's
 * neon synthwave palette, so users without a photo still get something
 * on-brand instead of a generic initial circle. Stored as data URIs in
 * profiles.avatar_url, exactly like an uploaded photo (see lib/avatar-upload.ts)
 * — one code path renders both.
 */

export interface AvatarPreset {
  id: string;
  label: string;
  dataUri: string;
}

function svgToDataUri(svg: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const PRESET_DEFS = [
  { id: 'pink-ring',      label: 'Pink Ring',      bg: '#1a0f1f', shape: '<circle cx="48" cy="48" r="26" fill="none" stroke="#ff2d9b" stroke-width="8"/>' },
  { id: 'cyan-triangle',  label: 'Cyan Triangle',  bg: '#0f1a1f', shape: '<polygon points="48,20 76,72 20,72" fill="none" stroke="#00e5ff" stroke-width="6"/>' },
  { id: 'gold-flame',     label: 'Gold Flame',     bg: '#1f1a0f', shape: '<path d="M48 18c9 14 17 22 17 36a17 17 0 11-34 0c0-9 5-15 9-20-1 7 2 11 5 11 5 0 7-5 1-14 4 2 2-7 2-13z" fill="#fbbf24"/>' },
  { id: 'purple-diamond', label: 'Purple Diamond', bg: '#160f1f', shape: '<polygon points="48,16 78,48 48,80 18,48" fill="none" stroke="#a78bfa" stroke-width="6"/>' },
  { id: 'green-seed',     label: 'Green Seed',     bg: '#0f1f14', shape: '<ellipse cx="48" cy="52" rx="15" ry="20" fill="#34d399"/><path d="M48 30 L48 16" stroke="#34d399" stroke-width="3"/>' },
  { id: 'shield',         label: 'Shield',         bg: '#0f141f', shape: '<path d="M48 16 L74 26 V50 C74 66 62 76 48 82 C34 76 22 66 22 50 V26 Z" fill="none" stroke="#00e5ff" stroke-width="5"/>' },
] as const;

export const AVATAR_PRESETS: AvatarPreset[] = PRESET_DEFS.map(({ id, label, bg, shape }) => ({
  id,
  label,
  dataUri: svgToDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">
    <rect width="96" height="96" fill="${bg}"/>${shape}
  </svg>`),
}));
