import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Sidebar } from '@/components/sidebar';
import { ThemeProvider } from '@/components/theme-provider';
import { ToastProvider } from '@/components/toast';
import { ErrorBoundary } from '@/components/error-boundary';
import { SynthBackground } from '@/components/synth-background';

export const metadata: Metadata = {
  title: {
    default: 'SeedGuard | PMO Freedom Tracker',
    template: '%s | SeedGuard',
  },
  description:
    'Track your progress, build discipline, and reclaim your freedom. Streak tracking, friends, leaderboards, and messaging — synced across all your devices.',
  keywords: ['streak tracker', 'recovery', 'discipline', 'habit tracker', 'seedguard'],
  openGraph: {
    title: 'SeedGuard | PMO Freedom Tracker',
    description: 'Build unbreakable streaks. Compete with friends. Reclaim your freedom.',
    type: 'website',
    siteName: 'SeedGuard',
    images: [
      {
        url: '/seedguard-main/images/wp4787824-retrowave-night-wallpapers.jpg',
        width: 1920,
        height: 1080,
        alt: 'SeedGuard — PMO Freedom Tracker',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SeedGuard | PMO Freedom Tracker',
    description: 'Build unbreakable streaks. Compete with friends. Reclaim your freedom.',
    images: ['/seedguard-main/images/wp4787824-retrowave-night-wallpapers.jpg'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: '#0d0a1f',
  width: 'device-width',
  initialScale: 1,
};

/**
 * Applies the saved theme class before React hydrates so there is never
 * a flash of the wrong theme. Mirrors components/theme-provider.tsx.
 */
const themeInitScript = `
try {
  var t = localStorage.getItem('seedguard_theme');
  var c = t === 'bright' ? 'theme-bright' : 'dark';
  document.documentElement.classList.remove('dark', 'theme-bright');
  document.documentElement.classList.add(c);
} catch (e) {}
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        {/* Retro display font for headings (font-display utility) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700;900&display=swap"
          rel="stylesheet"
        />
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <ThemeProvider>
          <ToastProvider>
            {/* Animated synthwave atmosphere behind everything */}
            <SynthBackground />
            <div className="relative z-10 min-h-screen flex flex-col md:flex-row">
              <Sidebar />
              <main className="flex-1 overflow-y-auto page-entry">
                <ErrorBoundary>{children}</ErrorBoundary>
              </main>
            </div>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
