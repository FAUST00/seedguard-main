/**
 * lib/sound.ts — Synthwave sound engine (Web Audio API, zero audio files)
 *
 * All sounds are procedurally synthesised — no network requests.
 * Reads seedguard_settings.soundEnabled before every play call.
 * Safe to call during SSR (guards typeof window).
 */

export type SoundType = 'click' | 'success' | 'error' | 'milestone' | 'toggle';

let _ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    if (!_ctx || _ctx.state === 'closed') {
      _ctx = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    if (_ctx.state === 'suspended') void _ctx.resume();
    return _ctx;
  } catch {
    return null;
  }
}

function isSoundEnabled(): boolean {
  try {
    const raw =
      typeof window !== 'undefined' ? localStorage.getItem('seedguard_settings') : null;
    if (!raw) return false;
    return (JSON.parse(raw) as { soundEnabled?: boolean }).soundEnabled === true;
  } catch {
    return false;
  }
}

// ── Primitive audio builders ────────────────────────────────────────────────

function osc(
  ctx: AudioContext,
  type: OscillatorType,
  freq: number,
  startT: number,
  endT: number,
  gain = 0.25,
): void {
  const g = ctx.createGain();
  const o = ctx.createOscillator();
  o.type = type;
  o.frequency.setValueAtTime(freq, startT);
  g.gain.setValueAtTime(gain, startT);
  g.gain.exponentialRampToValueAtTime(0.0001, endT);
  o.connect(g);
  g.connect(ctx.destination);
  o.start(startT);
  o.stop(endT + 0.01);
}

function sweep(
  ctx: AudioContext,
  type: OscillatorType,
  fromFreq: number,
  toFreq: number,
  startT: number,
  dur: number,
  gain = 0.22,
): void {
  const g = ctx.createGain();
  const o = ctx.createOscillator();
  o.type = type;
  o.frequency.setValueAtTime(fromFreq, startT);
  o.frequency.exponentialRampToValueAtTime(toFreq, startT + dur);
  g.gain.setValueAtTime(gain, startT);
  g.gain.exponentialRampToValueAtTime(0.0001, startT + dur);
  o.connect(g);
  g.connect(ctx.destination);
  o.start(startT);
  o.stop(startT + dur + 0.01);
}

// ── Sound definitions ───────────────────────────────────────────────────────

/** Short percussive click — UI button press */
function playClick(ctx: AudioContext): void {
  const t = ctx.currentTime;
  sweep(ctx, 'square', 880, 440, t, 0.06, 0.14);
}

/** Rising synthwave arpeggio — success / login */
function playSuccess(ctx: AudioContext): void {
  const t = ctx.currentTime;
  ([523, 659, 784, 1047] as const).forEach((f, i) => {
    osc(ctx, 'sawtooth', f, t + i * 0.07, t + i * 0.07 + 0.2, 0.16);
  });
}

/** Descending dissonant sweep — error */
function playError(ctx: AudioContext): void {
  const t = ctx.currentTime;
  sweep(ctx, 'sawtooth', 440, 110, t, 0.28, 0.18);
  sweep(ctx, 'square', 220, 80, t + 0.05, 0.22, 0.09);
}

/** Retro fanfare — streak milestone (7 / 30 / 90 / 180 / 365 days) */
function playMilestone(ctx: AudioContext): void {
  const t = ctx.currentTime;
  ([261, 392, 523, 784, 1047] as const).forEach((f, i) => {
    osc(ctx, 'sawtooth', f, t + i * 0.06, t + i * 0.06 + 0.5, 0.13);
  });
  // Retro noise sparkle
  const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.08), ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.04;
  const src = ctx.createBufferSource();
  src.buffer = buf;
  src.connect(ctx.destination);
  src.start(t);
}

/** Short UI confirmation beep — toggle switches */
function playToggle(ctx: AudioContext): void {
  const t = ctx.currentTime;
  sweep(ctx, 'sine', 600, 950, t, 0.12, 0.18);
}

// ── Public API ──────────────────────────────────────────────────────────────

const SOUNDS: Record<SoundType, (ctx: AudioContext) => void> = {
  click:     playClick,
  success:   playSuccess,
  error:     playError,
  milestone: playMilestone,
  toggle:    playToggle,
};

/**
 * Play a sound effect.
 * Silently no-ops if sounds are disabled, AudioContext unavailable,
 * or running in a non-browser environment (SSR/SSG).
 */
export function playSound(type: SoundType): void {
  if (!isSoundEnabled()) return;
  const ctx = getCtx();
  if (!ctx) return;
  try {
    SOUNDS[type](ctx);
  } catch (err) {
    console.warn('[SeedGuard Sound]', err);
  }
}

/**
 * Pre-warm the AudioContext on the first user gesture.
 * Required on iOS/Safari where AudioContext must be created inside a user event.
 */
export function unlockAudio(): void {
  getCtx();
}
