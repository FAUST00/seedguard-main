'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
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
  ChevronLeft,
  ChevronRight,
  Lock,
} from 'lucide-react';
import { SeedGuardLogo } from '@/components/seedguard-logo';
import { XpBar } from '@/components/xp-bar';
import { computeXp, levelFromXp, type LevelInfo } from '@/lib/xp';
import { getQuestXp, QUEST_EVENT } from '@/lib/quests';
import { computeEarnedBadgeIds } from '@/lib/badges';

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
  const [collapsed, setCollapsed] = useState(false);
  const [isAnonMode, setIsAnonMode] = useState(false);
  const [levelInfo, setLevelInfo] = useState<LevelInfo | null>(null);

  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem('seedguard_sidebar_collapsed') === '1');
      setIsAnonMode(localStorage.getItem('seedguard_anon_mode') === '1');
    } catch {}
  }, []);

  // Compute level from stored progress; refresh on quest completions + nav.
  useEffect(() => {
    const recompute = () => {
      try {
        const stats = JSON.parse(localStorage.getItem('seedguard_stats') || '{}');
        const history = JSON.parse(localStorage.getItem('seedguard_history') || '[]');
        const totalDays = Number(stats.totalDays) || 0;
        const longestStreak = Number(stats.longestStreak) || 0;
        const entryCount = Array.isArray(history) ? history.length : 0;
        const badgeCount = computeEarnedBadgeIds({
          streak: Number(stats.currentStreak) || 0,
          totalDays,
          relapses: Number(stats.relapses) || 0,
          entryCount,
        }).length;
        const xp = computeXp({ totalDays, longestStreak, entryCount, badgeCount, questXp: getQuestXp() });
        setLevelInfo(levelFromXp(xp));
      } catch {
        setLevelInfo(levelFromXp(0));
      }
    };
    recompute();
    window.addEventListener(QUEST_EVENT, recompute);
    return () => window.removeEventListener(QUEST_EVENT, recompute);
  }, [pathname]);

  const toggleCollapse = () => {
    const next = !collapsed;
    setCollapsed(next);
    try { localStorage.setItem('seedguard_sidebar_collapsed', next ? '1' : '0'); } catch {}
  };

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* ── Desktop Sidebar ───────────────────────────────────────────── */}
      <aside
        className={`hidden md:flex border-r border-primary/10 glass-effect flex-col gap-6 md:min-h-screen shrink-0 sticky top-0 transition-[width] duration-200 ease-in-out overflow-hidden ${collapsed ? 'w-16 p-3' : 'w-64 p-6'}`}
      >
        {/* Logo */}
        <div className={`flex items-center ${collapsed ? 'justify-center' : ''}`}>
          {collapsed ? (
            <Link href="/" className="hover:opacity-80 transition-opacity" aria-label="SeedGuard home">
              <SeedGuardLogo collapsed />
            </Link>
          ) : (
            <Link href="/" className="flex flex-col items-center gap-2 hover:opacity-80 transition-opacity w-full">
              <SeedGuardLogo size="sm" />
              <span className="font-black text-base tracking-[0.25em] uppercase text-[#ff2d9b] drop-shadow-[0_0_10px_rgba(255,45,155,0.8)]">
                SEEDGUARD
              </span>
            </Link>
          )}
          {isAnonMode && !collapsed && (
            <span className="ml-auto text-[10px] text-muted-foreground/60 flex items-center gap-1">
              <Lock className="w-3 h-3" /> Local
            </span>
          )}
        </div>

        {/* Level / XP — expanded only */}
        {!collapsed && levelInfo && (
          <Link href="/dashboard" className="block hover:opacity-90 transition-opacity" aria-label={`Level ${levelInfo.level} — ${levelInfo.title}`}>
            <XpBar info={levelInfo} variant="compact" />
          </Link>
        )}

        {/* Nav items */}
        <nav className="flex flex-col gap-1 flex-1" aria-label="Main navigation">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                title={collapsed ? item.label : undefined}
                className={`
                  flex items-center gap-3 rounded-lg transition-all duration-200 whitespace-nowrap
                  ${collapsed ? 'px-2 py-3 justify-center' : 'px-4 py-3'}
                  ${active
                    ? 'bg-primary/20 text-primary neon-text-pink shadow-lg neon-box-pink'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}
                `}
              >
                <Icon className="w-5 h-5 flex-shrink-0" aria-hidden />
                {!collapsed && <span className="font-medium">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Collapse toggle + version */}
        <div className={`pt-4 border-t border-primary/10 flex ${collapsed ? 'justify-center' : 'items-center justify-between'}`}>
          {!collapsed && <p className="text-xs text-muted-foreground">v3.2.0</p>}
          <button
            onClick={toggleCollapse}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-all"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </aside>

      {/* ── Mobile Header ─────────────────────────────────────────────── */}
      <div className="md:hidden flex items-center justify-between h-14 px-4 border-b border-primary/10 glass-effect sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <SeedGuardLogo size="sm" showTagline={false} />
          <span className="font-black text-base tracking-[0.25em] uppercase text-[#ff2d9b] drop-shadow-[0_0_10px_rgba(255,45,155,0.8)]">
            SEEDGUARD
          </span>
        </Link>
        {isAnonMode && (
          <span className="flex items-center gap-1 text-[10px] text-muted-foreground/60 mr-auto ml-3">
            <Lock className="w-3 h-3" /> Local
          </span>
        )}
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
