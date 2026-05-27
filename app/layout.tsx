import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Sidebar } from '@/components/sidebar';

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-sans',
});

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'SeedGuard | PMO Freedom Tracker',
  description: 'Track your progress, build discipline, and reclaim your freedom.',
  icons: {
    icon: '/seedgaurd-tracker/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${geist.variable} ${geistMono.variable}`}>
      <body className="min-h-screen bg-background text-foreground flex flex-col dark antialiased">
        <div className="min-h-screen bg-background flex flex-col md:flex-row">
          <Sidebar />
          <main className="flex-1 overflow-y-auto page-entry">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
