// The match animation's sounds, made in code with the Web Audio API: no
// audio files, so nothing to download or license. Which sound plays when
// is decided in sound.ts (tested); this file only makes the noise.
//
// Web Audio in short: an AudioContext is a little studio. We create
// "nodes" (a tone or noise source, a filter, a volume knob called a gain),
// plug them into each other, and finally into the speakers
// (context.destination). Times are in seconds on the context's clock.

import type { Cue } from "./sound";

/** Overall volume, so the sounds never get loud. */
const MASTER_VOLUME = 0.5;

let context: AudioContext | null = null;
let master: GainNode | null = null;
/** Sources still playing, so stopAll can cut them. */
const playing = new Set<AudioScheduledSourceNode>();

/**
 * The shared AudioContext, created on first use. Browsers only let a page
 * make sound after the player has clicked something; Submit and Watch again
 * are clicks, so by the time the animation plays this is allowed.
 */
function audio(): { ctx: AudioContext; out: GainNode } | null {
  if (typeof window === "undefined" || !("AudioContext" in window)) return null;
  if (!context || !master) {
    context = new AudioContext();
    master = context.createGain();
    master.gain.value = MASTER_VOLUME;
    master.connect(context.destination);
  }
  if (context.state === "suspended") void context.resume();
  return { ctx: context, out: master };
}

function track(source: AudioScheduledSourceNode, stopAt: number) {
  playing.add(source);
  source.onended = () => playing.delete(source);
  source.stop(stopAt);
}

/** A volume knob that fades in, holds, and fades out. */
function envelope(ctx: AudioContext, start: number, attack: number, hold: number, release: number, peak: number) {
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(peak, start + attack);
  gain.gain.setValueAtTime(peak, start + attack + hold);
  gain.gain.linearRampToValueAtTime(0, start + attack + hold + release);
  return gain;
}

/** A referee's whistle: a high tone with a fast trill (the pea rattling). */
function whistle(ctx: AudioContext, out: GainNode, start: number, length: number) {
  const tone = ctx.createOscillator();
  tone.type = "sine";
  tone.frequency.value = 2900;

  // The trill: a second, slow oscillator wobbles the tone's pitch.
  const trill = ctx.createOscillator();
  trill.frequency.value = 32;
  const trillDepth = ctx.createGain();
  trillDepth.gain.value = 140;
  trill.connect(trillDepth).connect(tone.frequency);

  const volume = envelope(ctx, start, 0.015, length - 0.065, 0.05, 0.25);
  tone.connect(volume).connect(out);
  tone.start(start);
  trill.start(start);
  track(tone, start + length);
  track(trill, start + length);
}

/** Short bell-like notes, one after another. Frequencies in Hz. */
function notes(ctx: AudioContext, out: GainNode, start: number, frequencies: number[], step: number) {
  frequencies.forEach((frequency, i) => {
    const at = start + i * step;
    const tone = ctx.createOscillator();
    tone.type = "triangle";
    tone.frequency.value = frequency;
    const volume = envelope(ctx, at, 0.01, 0.05, 0.25, 0.3);
    tone.connect(volume).connect(out);
    tone.start(at);
    track(tone, at + 0.35);
  });
}

/** Plays one cue right away. Does nothing where the browser has no Web Audio. */
export function playCue(cue: Cue): void {
  const a = audio();
  if (!a) return;
  const { ctx, out } = a;
  const now = ctx.currentTime;

  switch (cue) {
    case "kickoff":
      whistle(ctx, out, now, 0.45);
      break;
    case "goal":
      // No sound yet: a synthesized crowd sounded like white noise. A real
      // recording will go here, with a license that allows a public repo (CC0).
      break;
    // Played when the goal card shows your points (see pointsCues in sound.ts).
    case "hit":
      notes(ctx, out, now, [880, 1318.5], 0.12); // A5, E6
      break;
    case "full-house":
      notes(ctx, out, now, [1046.5, 1318.5, 1568, 2093], 0.1); // C6 E6 G6 C7
      break;
    case "final-whistle":
      // Like a real referee: two short blasts and a long one.
      whistle(ctx, out, now, 0.35);
      whistle(ctx, out, now + 0.5, 0.35);
      whistle(ctx, out, now + 1.0, 0.9);
      break;
  }
}

/** Cuts every sound that is still playing (Skip, or muting mid-sound). */
export function stopAll(): void {
  for (const source of playing) {
    try {
      source.stop();
    } catch {
      // Already stopped.
    }
  }
  playing.clear();
}
