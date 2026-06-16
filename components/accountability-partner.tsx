'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Card, SectionHeading, Button } from '@/components/ui';
import { Handshake, Check, X, Zap, Loader2 } from 'lucide-react';
import {
  getPartner, setPartner, clearPartner, checkInToday, checkedInToday, checkinStreak,
  type Partner,
} from '@/lib/partner';
import { QUEST_EVENT } from '@/lib/quests';
import { getUser } from '@/lib/sync';
import { getMyFriendships } from '@/lib/social';
import {
  getMyCloudPartner, setCloudPartner, clearCloudPartner, nudgePartner,
  type CloudPartner,
} from '@/lib/accountability-cloud';

/** Notify listeners (dashboard cloud-sync) that partner data changed. */
function notifyChange() {
  window.dispatchEvent(new CustomEvent(QUEST_EVENT));
}

interface Friend { id: string; username: string; avatarUrl: string | null; }

export function AccountabilityPartner() {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [cloudPartner, setCloudPartnerState] = useState<CloudPartner | null>(null);

  // Local-mode (logged-out) state
  const [localPartner, setLocalPartner] = useState<Partner | null>(null);
  const [name, setName] = useState('');

  // My own check-in state (shared by both modes)
  const [checkedIn, setCheckedIn] = useState(false);
  const [streak, setStreak] = useState(0);

  const [busy, setBusy] = useState(false);
  const [nudged, setNudged] = useState(false);

  const refreshMine = useCallback(() => {
    setCheckedIn(checkedInToday());
    setStreak(checkinStreak());
    setLocalPartner(getPartner());
  }, []);

  const loadCloud = useCallback(async () => {
    const [fr, cp] = await Promise.all([getMyFriendships(), getMyCloudPartner()]);
    setFriends(fr.accepted.map((f) => ({ id: f.profile.id, username: f.profile.username ?? 'Friend', avatarUrl: f.profile.avatar_url })));
    setCloudPartnerState(cp);
  }, []);

  useEffect(() => {
    refreshMine();
    getUser().then(async (u) => {
      setLoggedIn(!!u);
      if (u) await loadCloud();
    });
  }, [refreshMine, loadCloud]);

  const handleCheckIn = () => {
    checkInToday();
    refreshMine();
    notifyChange();
  };

  // ── Logged-out: local name-based partner ───────────────────────────────
  if (loggedIn === false) {
    return (
      <Card accent="secondary" padding="md" className="animate-scale-in">
        <SectionHeading accent="secondary" Icon={Handshake} className="mb-4">Accountability Partner</SectionHeading>
        {!localPartner ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground/80 leading-relaxed">
              Name someone who keeps you honest. <Link href="/account" className="text-secondary underline">Sign in</Link> to pair with a real friend.
            </p>
            <div className="flex gap-2">
              <input
                type="text" value={name} onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && name.trim() && (setPartner(name), setName(''), refreshMine(), notifyChange())}
                placeholder="Partner's name" maxLength={40}
                className="flex-1 rounded-lg border border-muted/30 bg-background/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-secondary/50 focus:ring-1 focus:ring-secondary/30 transition-all"
              />
              <Button variant="secondary" size="sm" onClick={() => { setPartner(name); setName(''); refreshMine(); notifyChange(); }} disabled={!name.trim()}>Set</Button>
            </div>
          </div>
        ) : (
          <LocalPartnerView partner={localPartner} streak={streak} checkedIn={checkedIn}
            onCheckIn={handleCheckIn} onRemove={() => { clearPartner(); refreshMine(); notifyChange(); }} />
        )}
      </Card>
    );
  }

  // ── Loading ────────────────────────────────────────────────────────────
  if (loggedIn === null) {
    return <div className="h-32 skeleton rounded-xl" />;
  }

  // ── Logged-in: friend-based pairing ────────────────────────────────────
  return (
    <Card accent="secondary" padding="md" className="animate-scale-in">
      <SectionHeading accent="secondary" Icon={Handshake} className="mb-4">Accountability Partner</SectionHeading>

      {cloudPartner ? (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-11 h-11 rounded-full bg-secondary/15 text-secondary font-black text-lg flex-shrink-0 overflow-hidden">
              {cloudPartner.avatarUrl
                ? <img src={cloudPartner.avatarUrl} alt="" className="w-full h-full object-cover" loading="lazy" decoding="async" />
                : cloudPartner.username.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-bold text-foreground truncate">{cloudPartner.username}</p>
                {cloudPartner.mutual && (
                  <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-secondary/20 text-secondary flex-shrink-0">Mutual</span>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground/70">
                {cloudPartner.checkinStreak > 0
                  ? `🔥 ${cloudPartner.checkinStreak}-day streak${cloudPartner.checkedInToday ? ' · checked in today' : ''}`
                  : 'No check-in streak yet'}
              </p>
            </div>
            <button onClick={async () => { setBusy(true); await clearCloudPartner(); await loadCloud(); setBusy(false); }}
              aria-label="Remove partner" className="text-muted-foreground/50 hover:text-destructive transition-colors p-1">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex gap-2">
            <Button variant={checkedIn ? 'secondary' : 'primary'} size="md" onClick={handleCheckIn} disabled={checkedIn} className="flex-1">
              {checkedIn ? (<><Check className="w-4 h-4" /> Checked in</>) : 'Check in'}
            </Button>
            <Button variant="outline" size="md" onClick={async () => { setBusy(true); try { await nudgePartner(cloudPartner.partnerId); setNudged(true); } catch {} setBusy(false); }} disabled={busy || nudged}>
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : nudged ? (<><Check className="w-4 h-4" /> Sent</>) : (<><Zap className="w-4 h-4" /> Nudge</>)}
            </Button>
          </div>
          {nudged && <p className="text-[10px] text-muted-foreground/60 text-center">Nudge sent as a direct message.</p>}
        </div>
      ) : friends.length === 0 ? (
        <p className="text-sm text-muted-foreground/80 leading-relaxed">
          Add a friend in the <Link href="/social" className="text-secondary underline">Social</Link> tab, then pick them here as your accountability partner.
        </p>
      ) : (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground/80 mb-1">Choose a friend to keep you accountable:</p>
          {friends.map((f) => (
            <button key={f.id} disabled={busy}
              onClick={async () => { setBusy(true); await setCloudPartner(f.id); await loadCloud(); notifyChange(); setBusy(false); }}
              className="w-full flex items-center gap-3 rounded-lg border border-muted/25 bg-muted/5 px-3 py-2.5 hover:border-secondary/40 hover:bg-secondary/5 transition-all text-left disabled:opacity-50">
              <div className="flex items-center justify-center w-9 h-9 rounded-full bg-secondary/15 text-secondary font-bold flex-shrink-0 overflow-hidden">
                {f.avatarUrl ? <img src={f.avatarUrl} alt="" className="w-full h-full object-cover" loading="lazy" decoding="async" /> : f.username.charAt(0).toUpperCase()}
              </div>
              <span className="flex-1 text-sm font-semibold text-foreground truncate">{f.username}</span>
              <span className="text-[10px] text-secondary font-bold uppercase tracking-wider">Pick</span>
            </button>
          ))}
        </div>
      )}
    </Card>
  );
}

// Local (logged-out) partner card.
function LocalPartnerView({ partner, streak, checkedIn, onCheckIn, onRemove }: {
  partner: Partner; streak: number; checkedIn: boolean; onCheckIn: () => void; onRemove: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-11 h-11 rounded-full bg-secondary/15 text-secondary font-black text-lg flex-shrink-0">
          {partner.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-foreground truncate">{partner.name}</p>
          <p className="text-[11px] text-muted-foreground/70">
            {streak > 0 ? `🔥 ${streak}-day check-in streak` : 'No check-in streak yet'}
          </p>
        </div>
        <button onClick={onRemove} aria-label="Remove partner" className="text-muted-foreground/50 hover:text-destructive transition-colors p-1">
          <X className="w-4 h-4" />
        </button>
      </div>
      <Button variant={checkedIn ? 'secondary' : 'primary'} size="md" onClick={onCheckIn} disabled={checkedIn} className="w-full">
        {checkedIn ? (<><Check className="w-4 h-4" /> Checked in today</>) : `Check in with ${partner.name.split(' ')[0]}`}
      </Button>
    </div>
  );
}
