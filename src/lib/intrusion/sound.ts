/**
 * Intrusion sound engine — synthesized WebAudio, no asset files.
 *
 * Design contract:
 *  - Single AudioContext created lazily on first user gesture (autoplay-safe).
 *  - All public functions are no-ops when muted, context not yet created, or
 *    when the Web Audio API is unavailable (SSR-safe).
 *  - Master gain is intentionally low (~0.15). Sounds are restrained, not arcade-y.
 */

// ---------------------------------------------------------------------------
// Internal state
// ---------------------------------------------------------------------------

let ctx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let humOscillator: OscillatorNode | null = null;
let humGain: GainNode | null = null;

const MUTE_KEY = "sad:mute";
const MASTER_GAIN = 0.15;

// ---------------------------------------------------------------------------
// SSR guard
// ---------------------------------------------------------------------------

function hasWebAudio(): boolean {
  return (
    typeof window !== "undefined" &&
    (typeof AudioContext !== "undefined" ||
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      typeof (window as any).webkitAudioContext !== "undefined")
  );
}

function getContext(): AudioContext | null {
  return ctx;
}

// ---------------------------------------------------------------------------
// Mute state (persisted to localStorage)
// ---------------------------------------------------------------------------

export function isMuted(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return window.localStorage.getItem(MUTE_KEY) === "1";
  } catch {
    return false;
  }
}

export function setMuted(v: boolean): void {
  if (typeof window === "undefined") return;
  try {
    if (v) {
      window.localStorage.setItem(MUTE_KEY, "1");
    } else {
      window.localStorage.removeItem(MUTE_KEY);
    }
    // Silence / restore the hum live if it's running
    if (humGain && masterGain) {
      humGain.gain.setTargetAtTime(v ? 0 : 0.012, ctx!.currentTime, 0.1);
    }
  } catch {
    // localStorage unavailable — ignore
  }
}

export function toggleMuted(): boolean {
  const next = !isMuted();
  setMuted(next);
  return next;
}

// ---------------------------------------------------------------------------
// Context lifecycle
// ---------------------------------------------------------------------------

/**
 * Call this inside a user-gesture handler (click, keydown, etc.).
 * Idempotent — safe to call many times.
 */
export function initOnGesture(): void {
  if (!hasWebAudio()) return;

  if (!ctx) {
    const Ctor: typeof AudioContext =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      typeof AudioContext !== "undefined"
        ? AudioContext
        : (window as any).webkitAudioContext;
    ctx = new Ctor();

    masterGain = ctx.createGain();
    masterGain.gain.value = MASTER_GAIN;
    masterGain.connect(ctx.destination);
  }

  // Resume if suspended (browser policy: context starts suspended until gesture)
  if (ctx.state === "suspended") {
    ctx.resume().catch(() => undefined);
  }
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Returns master gain only when audio is ready and unmuted. */
function ready(): GainNode | null {
  if (isMuted()) return null;
  if (!ctx || !masterGain) return null;
  return masterGain;
}

/** Create a short noise buffer (white noise). */
function makeNoiseBuffer(durationSec: number): AudioBuffer {
  const sampleRate = ctx!.sampleRate;
  const frames = Math.ceil(sampleRate * durationSec);
  const buf = ctx!.createBuffer(1, frames, sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < frames; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  return buf;
}

/** Ramp a GainNode from `start` to `end` over `duration` seconds. */
function rampGain(
  gainNode: GainNode,
  start: number,
  end: number,
  startTime: number,
  duration: number,
): void {
  gainNode.gain.setValueAtTime(start, startTime);
  gainNode.gain.linearRampToValueAtTime(end, startTime + duration);
}

// ---------------------------------------------------------------------------
// Public sound functions
// ---------------------------------------------------------------------------

/**
 * Tiny mechanical keystroke tick (~15 ms).
 * A very brief high-pitched sine click — subtle, non-intrusive.
 */
export function key(): void {
  const dest = ready();
  if (!dest || !ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "sine";
  osc.frequency.setValueAtTime(2200, now);
  osc.frequency.exponentialRampToValueAtTime(600, now + 0.015);

  gain.gain.setValueAtTime(0.6, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.015);

  osc.connect(gain);
  gain.connect(dest);

  osc.start(now);
  osc.stop(now + 0.02);
}

/**
 * Brief modem-ish two-tone sweep on connect (~400 ms).
 * Two oscillators: one sweeps up, one sweeps down, slight tremolo feel.
 */
export function handshake(): void {
  const dest = ready();
  if (!dest || !ctx) return;

  const now = ctx.currentTime;
  const duration = 0.4;

  // Tone A — sweeps up
  const oscA = ctx.createOscillator();
  const gainA = ctx.createGain();
  oscA.type = "sine";
  oscA.frequency.setValueAtTime(440, now);
  oscA.frequency.exponentialRampToValueAtTime(1200, now + duration * 0.7);
  rampGain(gainA, 0.5, 0, now, duration);
  oscA.connect(gainA);
  gainA.connect(dest);
  oscA.start(now);
  oscA.stop(now + duration + 0.02);

  // Tone B — sweeps down, offset start
  const oscB = ctx.createOscillator();
  const gainB = ctx.createGain();
  oscB.type = "triangle";
  oscB.frequency.setValueAtTime(1800, now + 0.05);
  oscB.frequency.exponentialRampToValueAtTime(300, now + duration);
  gainB.gain.setValueAtTime(0, now);
  gainB.gain.setValueAtTime(0.4, now + 0.05);
  gainB.gain.linearRampToValueAtTime(0, now + duration);
  oscB.connect(gainB);
  gainB.connect(dest);
  oscB.start(now + 0.05);
  oscB.stop(now + duration + 0.02);
}

/**
 * Deep "thunk + whoosh" for the wall peel (~500 ms).
 * Low sine drop + bandpass-filtered noise tail.
 */
export function peel(): void {
  const dest = ready();
  if (!dest || !ctx) return;

  const now = ctx.currentTime;
  const duration = 0.5;

  // Low sine thunk
  const osc = ctx.createOscillator();
  const oscGain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(120, now);
  osc.frequency.exponentialRampToValueAtTime(30, now + 0.25);
  oscGain.gain.setValueAtTime(0.9, now);
  oscGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
  osc.connect(oscGain);
  oscGain.connect(dest);
  osc.start(now);
  osc.stop(now + 0.35);

  // Filtered noise whoosh tail
  const noiseBuf = makeNoiseBuffer(duration);
  const noiseSource = ctx.createBufferSource();
  noiseSource.buffer = noiseBuf;

  const bpf = ctx.createBiquadFilter();
  bpf.type = "bandpass";
  bpf.frequency.setValueAtTime(800, now + 0.05);
  bpf.frequency.exponentialRampToValueAtTime(200, now + duration);
  bpf.Q.value = 2;

  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0, now);
  noiseGain.gain.linearRampToValueAtTime(0.5, now + 0.08);
  noiseGain.gain.linearRampToValueAtTime(0, now + duration);

  noiseSource.connect(bpf);
  bpf.connect(noiseGain);
  noiseGain.connect(dest);
  noiseSource.start(now);
  noiseSource.stop(now + duration + 0.02);
}

/**
 * Looping low ambient server-room hum.
 * Call `hum(true)` to start, `hum(false)` to stop.
 * Safe to toggle; will not stack oscillators.
 */
export function hum(on: boolean): void {
  const dest = ready();

  if (!on) {
    if (humGain) {
      humGain.gain.setTargetAtTime(0, ctx!.currentTime, 0.3);
      const toStop = humOscillator;
      const toDisconnect = humGain;
      window.setTimeout(() => {
        try {
          toStop?.stop();
          toDisconnect?.disconnect();
        } catch {
          // already stopped — ignore
        }
      }, 1500);
      humOscillator = null;
      humGain = null;
    }
    return;
  }

  if (!dest || !ctx) return;
  if (humOscillator) return; // already running

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "sine";
  osc.frequency.value = 52; // ~low B — server-room fundamental
  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0.012, ctx.currentTime + 1.0);

  osc.connect(gain);
  gain.connect(dest);
  osc.start();

  humOscillator = osc;
  humGain = gain;
}

/**
 * Short dissonant buzz/zap for failure (~180 ms).
 */
export function fail(): void {
  const dest = ready();
  if (!dest || !ctx) return;

  const now = ctx.currentTime;
  const duration = 0.18;

  // Sawtooth buzz — dissonant, harsh
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(180, now);
  osc.frequency.setValueAtTime(130, now + 0.04);
  osc.frequency.setValueAtTime(160, now + 0.09);
  osc.frequency.setValueAtTime(80, now + 0.14);

  gain.gain.setValueAtTime(0.7, now);
  gain.gain.linearRampToValueAtTime(0, now + duration);

  osc.connect(gain);
  gain.connect(dest);
  osc.start(now);
  osc.stop(now + duration + 0.02);

  // Bit of noise for extra grit
  const noiseBuf = makeNoiseBuffer(duration);
  const noiseSource = ctx.createBufferSource();
  noiseSource.buffer = noiseBuf;
  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.3, now);
  noiseGain.gain.linearRampToValueAtTime(0, now + duration);
  noiseSource.connect(noiseGain);
  noiseGain.connect(dest);
  noiseSource.start(now);
  noiseSource.stop(now + duration + 0.02);
}

/**
 * Warm rising confirmation tone (~300 ms).
 * Two harmonics sweep upward — round, satisfying.
 */
export function enter(): void {
  const dest = ready();
  if (!dest || !ctx) return;

  const now = ctx.currentTime;
  const duration = 0.3;

  const freqs: [number, number, OscillatorType][] = [
    [220, 440, "sine"],
    [330, 660, "triangle"],
  ];

  for (const [startF, endF, type] of freqs) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(startF, now);
    osc.frequency.exponentialRampToValueAtTime(endF, now + duration * 0.6);
    osc.frequency.setValueAtTime(endF, now + duration * 0.6);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.45, now + 0.02);
    gain.gain.setValueAtTime(0.45, now + duration * 0.6);
    gain.gain.linearRampToValueAtTime(0, now + duration);

    osc.connect(gain);
    gain.connect(dest);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }
}
