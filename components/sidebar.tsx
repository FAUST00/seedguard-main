'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import {
  LayoutDashboard,
  History,
  MapPin,
  Settings,
  Menu,
  X,
  Users,
  User,
  Flame,
  BookOpen,
  Sparkles,
} from 'lucide-react';
import { SeedGuardLogo } from '@/components/seedguard-logo';

const navigationItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/history',   label: 'History',   icon: History },
  { href: '/benefits',  label: 'Benefits',  icon: MapPin },
  { href: '/streaks',   label: 'Streaks',   icon: Flame },
  { href: '/social',    label: 'Social',    icon: Users },
  { href: '/account',   label: 'Account',   icon: User },
  { href: '/esoteric',  label: 'Esoteric',  icon: Sparkles },
  { href: '/settings',  label: 'Settings',  icon: Settings },
];

// Bottom tab bar: 5 most-used pages on mobile
const bottomTabs = [
  { href: '/dashboard', label: 'Home',    icon: LayoutDashboard },
  { href: '/history',   label: 'History', icon: History },
  { href: '/streaks',   label: 'Streaks', icon: Flame },
  { href: '/social',    label: 'Social',  icon: Users },
  { href: '/account',   label: 'Account', icon: User },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* ── Desktop Sidebar ───────────────────────────────────────────── */}
      <aside className="hidden md:flex w-64 border-r border-primary/10 glass-effect p-6 flex-col gap-8 md:min-h-screen shrink-0 sticky top-0">
        <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
          <SeedGuardLogo size="md" showTagline />
        </Link>

        <nav className="flex flex-col gap-2 flex-1" aria-label="Main navigation">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 whitespace-nowrap
                  ${active
                    ? 'bg-primary/20 text-primary neon-text-pink shadow-lg neon-box-pink'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}
                `}
              >
                <Icon className="w-5 h-5 flex-shrink-0" aria-hidden />
                <span className="font-medium hidden sm:inline">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="pt-4 border-t border-primary/10">
          <p className="text-xs text-muted-foreground text-center">v3.1.0</p>
        </div>
      </aside>

      {/* ── Mobile Header ─────────────────────────────────────────────── */}
      <div className="md:hidden flex items-center justify-between h-14 px-4 border-b border-primary/10 glass-effect sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-2">
          <SeedGuardLogo size="sm" showTagline={false} />
        </Link>

        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 hover:bg-muted/50 rounded-lg transition-colors"
          aria-label="Toggle full menu"
          aria-expanded={isMobileOpen}
        >
          {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* ── Mobile Hamburger Overlay (full menu) ──────────────────────── */}
      {isMobileOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 bg-black/60 z-40 animate-fade-in"
            onClick={() => setIsMobileOpen(false)}
            aria-hidden
          />
          <nav
            className="md:hidden fixed left-0 top-14 w-full bg-background/97 backdrop-blur-md border-b border-primary/10 z-40"
            aria-label="Full navigation"
          >
            <div className="p-4 grid grid-cols-4 gap-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    aria-current={active ? 'page' : undefined}
                    className={`
                      flex flex-col items-center gap-1.5 px-2 py-3 rounded-lg transition-all
                      ${active
                        ? 'bg-primary/20 text-primary neon-text-pink'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}
                    `}
                  >
                    <Icon className="w-5 h-5" aria-hidden />
                    <span className="font-medium text-[10px] text-center leading-tight">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </nav>
        </>
      )}

      {/* ── Mobile Bottom Tab Bar ─────────────────────────────────────── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-primary/15 flex"
        aria-label="Primary navigation"
      >
        {bottomTabs.map((tab) => {
          const Icon = tab.icon;
          const active = isActive(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? 'page' : undefined}
              className={`
                flex-1 flex flex-col items-center justify-center gap-1 py-2.5 transition-all
                ${active ? 'text-primary neon-text-pink' : 'text-muted-foreground'}
              `}
            >
              <Icon
                className={`w-5 h-5 ${active ? 'drop-shadow-[0_0_6px_hsl(var(--primary)/0.8)]' : ''}`}
                aria-hidden
              />
              <span className="text-[9px] font-bold uppercase tracking-wider">{tab.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
