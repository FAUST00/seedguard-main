import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Sidebar } from '@/components/sidebar';
import { ThemeProvider } from '@/components/theme-provider';
import { ToastProvider } from '@/components/toast';
import { ErrorBoundary } from '@/components/error-boundary';
import { SynthBackground } from '@/components/synth-background';

export const metadata: Metadata = {
  title: {
    default: 'SeedGuard | NoFap & PMO Freedom Tracker',
    template: '%s | SeedGuard',
  },
  description:
    'The #1 NoFap streak tracker and semen retention counter. Build discipline, compete on the leaderboard, and reclaim your freedom — synced across all your devices.',
  keywords: [
    'nofap tracker', 'semen retention tracker', 'PMO streak counter',
    'nofap streak app', 'no fap counter', 'PMO recovery app',
    'semen retention app', 'nofap challenge', 'streak tracker free',
    'nofap leaderboard', 'discipline tracker', 'nofap app',
    'semen retention benefits', 'pmo addiction recovery', 'nofap timer',
    'no porn tracker', 'habit tracker men', 'seedguard',
  ],
  openGraph: {
    title: 'SeedGuard | NoFap & PMO Freedom Tracker',
    description: 'Build unbreakable streaks. Compete with friends. Reclaim your freedom.',
    type: 'website',
    siteName: 'SeedGuard',
    images: [
      {
        url: '/seedguard-main/images/wp4787824-retrowave-night-wallpapers.jpg',
        width: 1920,
        height: 1080,
        alt: 'SeedGuard — NoFap & PMO Freedom Tracker',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SeedGuard | NoFap & PMO Freedom Tracker',
    description: 'Build unbreakable streaks. Compete with friends. Reclaim your freedom.',
    images: ['/seedguard-main/images/wp4787824-retrowave-night-wallpapers.jpg'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: '#ff2d9b',
  width: 'device-width',
  initialScale: 1,
};

const themeInitScript = `
try {
  var t = localStorage.getItem('seedguard_theme');
  var c = t === 'bright' ? 'theme-bright' : 'dark';
  document.documentElement.classList.remove('dark', 'theme-bright');
  document.documentElement.classList.add(c);
} catch (e) {}
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
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
            <SynthBackground />
            <div className="relative z-10 min-h-screen flex flex-col md:flex-row">
              <Sidebar />
              {/* pb-20 on mobile leaves room for the fixed bottom tab bar */}
              <main className="flex-1 overflow-y-auto page-entry pb-20 md:pb-0">
                <ErrorBoundary>{children}</ErrorBoundary>
              </main>
            </div>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
