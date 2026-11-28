// What the match animation should sound like (SPEC 4), as pure functions:
// which sounds ("cues") to play, and the player's mute setting. The sounds
// themselves are made in synth.ts.

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
 * The whistles: kick-off on the first frame (`prev` is null) and the final
 * whistle when the animation reaches full time. A goal's sounds come from
 * goalCues and pointsCues.
 */
export function cuesBetween(prev: TimelineFrame | null, next: TimelineFrame): Cue[] {
  const cues: Cue[] = [];
  if (prev === null) cues.push("kickoff");
  if (next.finished && !prev?.finished) cues.push("final-whistle");
  return cues;
}

/** The sound of the goal itself, the moment the ball hits the net in the scene. */
export function goalCues(): Cue[] {
  return ["goal"];
}

/**
 * The sound of YOUR points on a goal, played when the goal card shows them
 * (✓ +3, the points sticker): a ding if you got something right, a rising
 * tune for a full house, nothing otherwise.
 */
export function pointsCues(card: GoalCard): Cue[] {
  if (card.outcome !== "hit") return [];
  return [card.badge === "full-house" ? "full-house" : "hit"];
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
