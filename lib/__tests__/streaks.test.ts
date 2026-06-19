import { describe, test, expect, vi } from 'vitest';

// Mock the supabase client so tests run without env vars
vi.mock('../supabase', () => ({ supabase: {} }));

import { streakTier, fmtDate, daysSince } from '../streaks';

// streakTier ──────────────────────────────────────────────────────────────────

describe('streakTier', () => {
  test('0 days → no flames, no label', () => {
    const t = streakTier(0);
    expect(t.flames).toBe(0);
    expect(t.label).toBe('');
  });

  test('7 days → Builder, 1 flame', () => {
    const t = streakTier(7);
    expect(t.label).toBe('Builder');
    expect(t.flames).toBe(1);
  });

  test('30 days → Rising, 2 flames', () => {
    const t = streakTier(30);
    expect(t.label).toBe('Rising');
    expect(t.flames).toBe(2);
  });

  test('90 days → Master, 3 flames', () => {
    const t = streakTier(90);
    expect(t.label).toBe('Master');
    expect(t.flames).toBe(3);
  });

  test('180 days → Elite, 4 flames', () => {
    const t = streakTier(180);
    expect(t.label).toBe('Elite');
    expect(t.flames).toBe(4);
  });

  test('365 days → Legend, 5 flames', () => {
    const t = streakTier(365);
    expect(t.label).toBe('Legend');
    expect(t.flames).toBe(5);
  });

  test('boundary: 29 days is not Rising (needs 30)', () => {
    expect(streakTier(29).label).toBe('Builder');
  });

  test('boundary: 6 days is not Builder (needs 7)', () => {
    expect(streakTier(6).label).toBe('');
  });
});

// fmtDate ─────────────────────────────────────────────────────────────────────

describe('fmtDate', () => {
  test('null returns placeholder', () => {
    expect(fmtDate(null)).toBe('·');
  });

  test('valid ISO string returns formatted date with digits', () => {
    const result = fmtDate('2026-01-15T00:00:00.000Z');
    expect(result).toMatch(/\d/);
    expect(result).not.toBe('·');
  });

  test('invalid string returns placeholder', () => {
    expect(fmtDate('not-a-date')).toBe('·');
  });
});

// daysSince ───────────────────────────────────────────────────────────────────

describe('daysSince', () => {
  test('null returns 0', () => {
    expect(daysSince(null)).toBe(0);
  });

  test('future date returns 0 (not negative)', () => {
    const future = new Date(Date.now() + 86_400_000 * 5).toISOString();
    expect(daysSince(future)).toBe(0);
  });

  test('yesterday returns 1', () => {
    const yesterday = new Date(Date.now() - 86_400_000).toISOString();
    expect(daysSince(yesterday)).toBe(1);
  });

  test('7 days ago returns 7', () => {
    const weekAgo = new Date(Date.now() - 86_400_000 * 7).toISOString();
    expect(daysSince(weekAgo)).toBe(7);
  });

  test('invalid string returns 0', () => {
    expect(daysSince('invalid')).toBe(0);
  });
});
