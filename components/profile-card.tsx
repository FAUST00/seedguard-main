'use client';

/**
 * ProfileCard — mini hover card shown on leaderboard / friends rows.
 *
 * Rendered via React Portal into document.body so it always appears above
 * every stacking context (glass-effect backdrop-filter, neon-hover transform, etc).
 */

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Flame, Trophy, Calendar } from 'lucide-react';
import { streakTier, fmtDate } from '@/lib/streaks';
import type { StreakEntry } from '@/lib/streaks';

interface Props {
  entry: Pick<StreakEntry, 'id' | 'username' | 'avatar_url' | 'current_streak' | 'best_streak' | 'streak_start' | 'last_active' | 'isMe'>;
  children: React.ReactNode;
}

const CARD_WIDTH = 256; // w-64

export function ProfileCard({ entry, children }: Props) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Needed to avoid SSR mismatch — portal requires document
  useEffect(() => { setMounted(true); }, []);

  // Recalculate fixed position every time the card opens
  useEffect(() => {
    if (!open || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const gap = 12;
    let left = rect.right + gap;
    if (left + CARD_WIDTH > window.innerWidth - gap) {
      left = rect.left - CARD_WIDTH - gap;
    }
    setCoords({ top: rect.top, left });
  }, [open]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        !cardRef.current?.contains(e.target as Node) &&
        !triggerRef.current?.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Close on scroll or resize so position never goes stale
  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [open]);

  const tier = streakTier(entry.current_streak);
  const initial = entry.username.charAt(0).toUpperCase();

  const popup = (
    <div
      ref={cardRef}
      role="dialog"
      aria-label={`${entry.username}'s profile`}
      style={{
        position: 'fixed',
        top: coords.top,
        left: coords.left,
        width: CARD_WIDTH,
        zIndex: 9999,
        background: '#0a0312',
        border: '2px solid rgba(168, 85, 247, 0.85)',
        boxShadow: '0 8px 40px rgba(0,0,0,0.95), 0 0 16px rgba(168,85,247,0.25)',
      }}
      className="rounded-2xl p-5 animate-scale-in"
    >
      {/* Avatar + name */}
      <div className="flex items-center gap-3 mb-4">
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-extrabold border-2 border-primary/50 bg-primary/15 flex-shrink-0 ${tier.color}`}
        >
          {entry.avatar_url ? (
            <img
              src={entry.avatar_url}
              alt={`${entry.username} avatar`}
              className="w-full h-full rounded-full object-cover"
              loading="lazy"
            />
          ) : initial}
        </div>
        <div className="min-w-0">
          <p className={`font-bold truncate text-sm ${tier.color || 'text-white'} ${entry.isMe ? 'neon-text-pink' : ''}`}>
            {entry.username}
          </p>
          {entry.isMe && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/20 text-primary uppercase tracking-wider">
              You
            </span>
          )}
          {tier.label && (
            <p className="text-[10px] text-purple-300 uppercase tracking-wider font-semibold">{tier.label}</p>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="space-y-2.5 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-purple-200 flex items-center gap-1.5 font-medium">
            <Flame className="w-3.5 h-3.5 flame-glow" aria-hidden /> Current
          </span>
          <span className={`font-bold tabular-nums ${tier.color || 'text-white'}`}>
            {entry.current_streak} days
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-purple-200 flex items-center gap-1.5 font-medium">
            <Trophy className="w-3.5 h-3.5" aria-hidden /> Best
          </span>
          <span className="font-bold tabular-nums text-white">
            {entry.best_streak} days
          </span>
        </div>
        {entry.streak_start && (
          <div className="flex items-center justify-between">
            <span className="text-purple-200 flex items-center gap-1.5 font-medium">
              <Calendar className="w-3.5 h-3.5" aria-hidden /> Started
            </span>
            <span className="text-xs tabular-nums text-purple-100 font-semibold">
              {fmtDate(entry.streak_start)}
            </span>
          </div>
        )}
      </div>

      {/* Flame indicators */}
      {tier.flames > 0 && (
        <div className="mt-3 flex gap-1 justify-center" aria-label={`${tier.flames} flame rating`}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Flame
              key={i}
              className={`w-4 h-4 transition-opacity ${i < tier.flames ? `${tier.color} flame-glow` : 'text-purple-900'}`}
              aria-hidden
            />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="inline-block" ref={triggerRef}>
      <div
        tabIndex={0}
        role="button"
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={`View ${entry.username}'s profile`}
        className="cursor-pointer"
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => e.key === 'Enter' && setOpen((v) => !v)}
      >
        {children}
      </div>
      {open && mounted && createPortal(popup, document.body)}
    </div>
  );
}
