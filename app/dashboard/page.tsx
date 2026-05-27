'use client';

import { useState, useEffect } from 'react';
import { Flame, TrendingUp, Award, Calendar, Shield } from 'lucide-react';

interface DashboardStats {
  currentStreak: number;
  totalDays: number;
  longestStreak: number;
  relapses: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    currentStreak: 0,
    totalDays: 0,
    longestStreak: 0,
    relapses: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load stats from localStorage
    const loadStats = () => {
      try {
        const savedStats = localStorage.getItem('seedguard_stats');
        if (savedStats) {
          setStats(JSON.parse(savedStats));
        } else {
          // Initialize with default stats
          setStats({
            currentStreak: 5,
            totalDays: 42,
            longestStreak: 12,
            relapses: 1,
          });
        }
      } catch (error) {
        console.error('Failed to load stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-bounce-subtle text-primary neon-text-pink">
          <Shield className="w-8 h-8" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-6xl space-y-8 page-entry">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-extrabold tracking-widest uppercase italic neon-text-cyan text-secondary">
          Dashboard
        </h1>
        <p className="text-muted-foreground text-lg mt-2">
          Your journey to freedom starts here. Track every victory, no matter how small.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Current Streak */}
        <div className="group relative overflow-hidden rounded-xl border border-primary/20 bg-background/50 backdrop-blur-sm p-6 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 animate-scale-in">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Current Streak</p>
                <p className="text-4xl font-bold text-primary neon-text-pink">{stats.currentStreak}</p>
                <p className="text-xs text-muted-foreground mt-2">days clean</p>
              </div>
              <div className="rounded-full bg-primary/10 p-3">
                <Flame className="w-6 h-6 text-primary drop-shadow-[0_0_8px_rgba(255,0,255,0.6)]" />
              </div>
            </div>
          </div>
        </div>

        {/* Total Days */}
        <div className="group relative overflow-hidden rounded-xl border border-secondary/20 bg-background/50 backdrop-blur-sm p-6 hover:border-secondary/50 transition-all duration-300 hover:shadow-lg hover:shadow-secondary/20 animate-scale-in [animation-delay:50ms]">
          <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Days</p>
                <p className="text-4xl font-bold text-secondary neon-text-cyan">{stats.totalDays}</p>
                <p className="text-xs text-muted-foreground mt-2">tracked</p>
              </div>
              <div className="rounded-full bg-secondary/10 p-3">
                <Calendar className="w-6 h-6 text-secondary drop-shadow-[0_0_8px_rgba(0,255,255,0.6)]" />
              </div>
            </div>
          </div>
        </div>

        {/* Longest Streak */}
        <div className="group relative overflow-hidden rounded-xl border border-accent/20 bg-background/50 backdrop-blur-sm p-6 hover:border-accent/50 transition-all duration-300 hover:shadow-lg hover:shadow-accent/20 animate-scale-in [animation-delay:100ms]">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Longest Streak</p>
                <p className="text-4xl font-bold text-accent">{stats.longestStreak}</p>
                <p className="text-xs text-muted-foreground mt-2">personal best</p>
              </div>
              <div className="rounded-full bg-accent/10 p-3">
                <TrendingUp className="w-6 h-6 text-accent" />
              </div>
            </div>
          </div>
        </div>

        {/* Relapses */}
        <div className="group relative overflow-hidden rounded-xl border border-destructive/20 bg-background/50 backdrop-blur-sm p-6 hover:border-destructive/50 transition-all duration-300 hover:shadow-lg hover:shadow-destructive/20 animate-scale-in [animation-delay:150ms]">
          <div className="absolute inset-0 bg-gradient-to-br from-destructive/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Relapses</p>
                <p className="text-4xl font-bold text-destructive">{stats.relapses}</p>
                <p className="text-xs text-muted-foreground mt-2">this session</p>
              </div>
              <div className="rounded-full bg-destructive/10 p-3">
                <Award className="w-6 h-6 text-destructive" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-xl border border-primary/20 bg-background/50 backdrop-blur-sm p-8 text-center hover:border-primary/50 transition-all duration-300 cursor-pointer hover:shadow-lg hover:shadow-primary/10 group animate-scale-in [animation-delay:200ms]">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-4 group-hover:scale-110 transition-transform">
            <Flame className="w-7 h-7 text-primary drop-shadow-[0_0_8px_rgba(255,0,255,0.6)]" />
          </div>
          <h3 className="font-bold text-lg mb-2 uppercase tracking-wider">Log Victory</h3>
          <p className="text-sm text-muted-foreground">
            Record a successful day or major milestone in your recovery journey.
          </p>
        </div>

        <div className="rounded-xl border border-secondary/20 bg-background/50 backdrop-blur-sm p-8 text-center hover:border-secondary/50 transition-all duration-300 cursor-pointer hover:shadow-lg hover:shadow-secondary/10 group animate-scale-in [animation-delay:250ms]">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-secondary/10 mb-4 group-hover:scale-110 transition-transform">
            <Calendar className="w-7 h-7 text-secondary drop-shadow-[0_0_8px_rgba(0,255,255,0.6)]" />
          </div>
          <h3 className="font-bold text-lg mb-2 uppercase tracking-wider">View History</h3>
          <p className="text-sm text-muted-foreground">
            Review your complete history of checkpoints and relapses.
          </p>
        </div>
      </div>

      {/* Motivational Section */}
      <div className="rounded-xl border border-primary/10 bg-gradient-to-br from-primary/5 to-secondary/5 backdrop-blur-sm p-8 text-center animate-scale-in [animation-delay:300ms]">
        <p className="text-lg text-foreground leading-relaxed">
          <span className="font-bold text-primary neon-text-pink">Every day</span> you stay strong is a victory. 
          <span className="block mt-4 text-muted-foreground text-base">
            This is your space to build the discipline and freedom you deserve.
          </span>
        </p>
      </div>
    </div>
  );
}
