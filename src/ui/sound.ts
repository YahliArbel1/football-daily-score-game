// What the match animation should sound like (SPEC 4), as pure functions:
// which sounds ("cues") to play between two animation frames, and the
// player's mute setting. The sounds themselves are made in synth.ts.

import type { GoalCard } from "./results";
import type { StorageLike } from "./savedGuess";
import type { TimelineFrame } from "./timeline";

export type Cue =
  | "kickoff" // a short whistle as the clock starts
  | "goal" // the crowd roars (silent for now: waiting for a CC0 recording)
  | "hit" // a two-note ding: you got something right on this goal
  | "full-house" // a short rising tune: everything right on this goal
  | "final-whistle"; // three whistles at full time

/**
 * The sounds to play when the animation moves from `prev` to `next`
 * (`prev` is null on the very first frame). `cards` is each real goal's
 * result card, in time order (cardsByEvent).
 */
export function cuesBetween(prev: TimelineFrame | null, next: TimelineFrame, cards: GoalCard[]): Cue[] {
  const cues: Cue[] = [];
  if (prev === null) cues.push("kickoff");

  // Every goal that appeared since the last frame (usually one, but a big
  // jump, e.g. at 2x, can show more than one at once).
  for (let i = prev?.shown ?? 0; i < next.shown; i++) {
    cues.push("goal");
    const card = cards[i];
    if (card?.outcome === "hit") cues.push(card.badge === "full-house" ? "full-house" : "hit");
  }

  if (next.finished && !prev?.finished) cues.push("final-whistle");
  return cues;
}

export const MUTED_KEY = "scordle:muted";

/** True if the player turned the sounds off. Sounds are on by default. */
export function loadMuted(storage: StorageLike | null): boolean {
  try {
    return storage?.getItem(MUTED_KEY) === "1";
  } catch {
    return false;
  }
}

/** Remembers the mute setting. If the browser refuses, it lasts only until the page reloads. */
export function saveMuted(storage: StorageLike | null, muted: boolean): void {
  try {
    storage?.setItem(MUTED_KEY, muted ? "1" : "0");
  } catch {
    // Storage blocked or full: nothing to do.
  }
}
