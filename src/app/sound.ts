import type { ReliancePattern } from '../types/session';

/**
 * Cal's sounds, synthesised in the browser with the Web Audio API. There are no audio files,
 * nothing to download and no licences to track. Sounds only ever play right after the player
 * clicks something, which is also what browsers require before audio may start.
 */
export type Cue = 'happy' | 'grumpy' | 'meh';

let context: AudioContext | null = null;

/** Correct decision: happy. Caught bad advice but picked another wrong option: meh. Anything else wrong: grumpy. */
export function cueForDecision(correct: boolean, pattern: ReliancePattern): Cue {
  if (correct) return 'happy';
  return pattern === 'override-other' ? 'meh' : 'grumpy';
}

export function cueForBand(band: 'strong' | 'middle' | 'low'): Cue {
  return band === 'strong' ? 'happy' : band === 'middle' ? 'meh' : 'grumpy';
}

function audio(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  context ??= new Ctor();
  if (context.state === 'suspended') void context.resume();
  return context;
}

/** One pitched note with a quick attack and exponential decay. */
function note(ac: AudioContext, out: AudioNode, opts: { type: OscillatorType; from: number; to?: number; at: number; length: number; volume: number }) {
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  const start = ac.currentTime + opts.at;
  osc.type = opts.type;
  osc.frequency.setValueAtTime(opts.from, start);
  if (opts.to) osc.frequency.exponentialRampToValueAtTime(opts.to, start + opts.length);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(opts.volume, start + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + opts.length);
  osc.connect(gain).connect(out);
  osc.start(start);
  osc.stop(start + opts.length + 0.02);
}

/** Dry bone clacks: very short bursts of filtered noise. */
function rattle(ac: AudioContext, out: AudioNode, at: number, clacks: number, spacing: number, volume: number) {
  const length = Math.floor(ac.sampleRate * 0.03);
  const buffer = ac.createBuffer(1, length, ac.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 3);
  for (let i = 0; i < clacks; i++) {
    const src = ac.createBufferSource();
    const band = ac.createBiquadFilter();
    const gain = ac.createGain();
    src.buffer = buffer;
    band.type = 'bandpass';
    band.frequency.value = 1800 + ((i * 700) % 1600);
    band.Q.value = 4;
    gain.gain.value = volume;
    src.connect(band).connect(gain).connect(out);
    src.start(ac.currentTime + at + i * spacing);
  }
}

export function playCue(cue: Cue): void {
  try {
    const ac = audio();
    if (!ac) return;
    const master = ac.createGain();
    master.gain.value = 0.5;
    master.connect(ac.destination);

    if (cue === 'happy') {
      // A little xylophone run on Cal's ribs, then a pleased clatter.
      [523.25, 659.25, 783.99, 1046.5].forEach((f, i) =>
        note(ac, master, { type: 'triangle', from: f, at: i * 0.075, length: 0.22, volume: 0.35 }),
      );
      rattle(ac, master, 0.32, 3, 0.045, 0.5);
    } else if (cue === 'grumpy') {
      // An irritated bony shake, then a low grumble that sinks.
      rattle(ac, master, 0, 5, 0.035, 0.55);
      const growl = ac.createBiquadFilter();
      growl.type = 'lowpass';
      growl.frequency.value = 700;
      growl.connect(master);
      note(ac, growl, { type: 'sawtooth', from: 180, to: 85, at: 0.16, length: 0.5, volume: 0.4 });
      note(ac, growl, { type: 'square', from: 120, to: 60, at: 0.18, length: 0.45, volume: 0.12 });
    } else {
      // A flat "hm-hm": two low, even notes and a single clack.
      const soft = ac.createBiquadFilter();
      soft.type = 'lowpass';
      soft.frequency.value = 1400;
      soft.connect(master);
      note(ac, soft, { type: 'square', from: 311.13, at: 0, length: 0.14, volume: 0.12 });
      note(ac, soft, { type: 'square', from: 293.66, at: 0.17, length: 0.2, volume: 0.12 });
      rattle(ac, master, 0.42, 1, 0, 0.4);
    }
  } catch {
    // Audio is a nice-to-have. Never let it break the game.
  }
}
