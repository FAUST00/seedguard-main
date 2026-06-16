'use client';

import { useState, useEffect } from 'react';
import { Card, SectionHeading, Button } from '@/components/ui';
import { Handshake, Check, X } from 'lucide-react';
import {
  getPartner, setPartner, clearPartner, checkInToday, checkedInToday, checkinStreak,
  type Partner,
} from '@/lib/partner';
import { QUEST_EVENT } from '@/lib/quests';

/** Notify listeners (dashboard cloud-sync) that partner data changed. */
function notifyChange() {
  window.dispatchEvent(new CustomEvent(QUEST_EVENT));
}

/**
 * Accountability partner card. Local-first: name a partner and log daily
 * check-ins to build a shared cadence and streak.
 */
export function AccountabilityPartner() {
  const [partner, setPartnerState] = useState<Partner | null>(null);
  const [name, setName] = useState('');
  const [checkedIn, setCheckedIn] = useState(false);
  const [streak, setStreak] = useState(0);
  const [mounted, setMounted] = useState(false);

  const refresh = () => {
    setPartnerState(getPartner());
    setCheckedIn(checkedInToday());
    setStreak(checkinStreak());
  };

  useEffect(() => {
    setMounted(true);
    refresh();
  }, []);

  if (!mounted) return <div className="h-32 skeleton rounded-xl" />;

  const handleSet = () => {
    if (!name.trim()) return;
    setPartner(name);
    setName('');
    refresh();
    notifyChange();
  };

  const handleCheckIn = () => {
    checkInToday();
    refresh();
    notifyChange();
  };

  return (
    <Card accent="secondary" padding="md" className="animate-scale-in">
      <SectionHeading accent="secondary" Icon={Handshake} className="mb-4">Accountability Partner</SectionHeading>

      {!partner ? (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground/80 leading-relaxed">
            Name someone who keeps you honest. Daily check-ins build a streak you won&apos;t want to break.
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSet()}
              placeholder="Partner's name"
              maxLength={40}
              className="flex-1 rounded-lg border border-muted/30 bg-background/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-secondary/50 focus:ring-1 focus:ring-secondary/30 transition-all"
            />
            <Button variant="secondary" size="sm" onClick={handleSet} disabled={!name.trim()}>Set</Button>
          </div>
        </div>
      ) : (
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
            <button
              onClick={() => { clearPartner(); refresh(); notifyChange(); }}
              aria-label="Remove partner"
              className="text-muted-foreground/50 hover:text-destructive transition-colors p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <Button
            variant={checkedIn ? 'secondary' : 'primary'}
            size="md"
            onClick={handleCheckIn}
            disabled={checkedIn}
            className="w-full"
          >
            {checkedIn ? (<><Check className="w-4 h-4" /> Checked in today</>) : 'Check in with ' + partner.name.split(' ')[0]}
          </Button>
        </div>
      )}
    </Card>
  );
}
