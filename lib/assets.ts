/**
 * basePath-safe asset helper. The app deploys to GitHub Pages under
 * /seedguard-main, and plain <img>/CSS urls do NOT get the basePath
 * applied automatically — always reference public/ assets through this.
 */
export const BASE_PATH = '/seedguard-main';

export function asset(path: string): string {
  return `${BASE_PATH}${path.startsWith('/') ? path : `/${path}`}`;
}

/**
 * USER-PROVIDED ARTWORK SLOTS
 * ───────────────────────────
 * Drop your four synthwave wallpapers into public/images/ with these
 * exact filenames (see public/images/README.md). Every component that
 * uses them renders a pure-CSS gradient fallback when a file is missing,
 * so the site looks correct either way.
 */
export const ART = {
  /** Pixel-art city + huge sun  → landing page hero background */
  heroCity: asset('/images/wp4787824-retrowave-night-wallpapers.jpg'),
  /** Pink/blue painted LA skyline → Streaks tab header banner */
  laSunset: asset('/images/wp4694442-80s-anime-wallpapers.jpg'),
  /** Wireframe mountains + magenta sun → Social tab header banner */
  wireframeSun: asset('/images/wp4787763-retrowave-space-wallpapers.jpg'),
  /** Purple starry skyline + laser grid → Settings/Account header accent */
  gridCity: asset('/images/wp4787765-retrowave-space-wallpapers.jpg'),
} as const;
