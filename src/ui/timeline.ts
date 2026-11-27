// The timing of the match animation after Submit (SPEC 4): a clock runs from
// 0' to full time in 8 s, and stops on each goal so the player can read it.
// Pure functions only; MatchAnimation.tsx draws whatever `timelineAt` returns.
//
// Time is measured in "match units": one unit per minute, with stoppage time
// added where it happens. A match whose latest first-half goal came at 45+2
// has 47 units in its first half, so 45+2 is drawn after 45 and before 46.

import type { Match, Score, Side } from "../engine/types";

/** How long the clock takes to run from 0' to full time, without pauses. */
export const RUN_MS = 8000;
/** The longest pause on one goal: long enough to read the goal card. */
export const MAX_GOAL_PAUSE_MS = 2500;
/** All goal pauses together never take longer than this, so even 7 goals stay under 20 s. */
export const PAUSE_BUDGET_MS = 10000;

export interface TimelineGoal {
  /** Index into match.events. */
  eventIndex: number;
  /** The side the goal counts for. */
  side: Side;
  /** Position in match units (see the top of this file). */
  unit: number;
  /** When the goal appears, in ms from the start. */
  atMs: number;
}

export interface Timeline {
  goals: TimelineGoal[];
  /** Stoppage minutes drawn after 45' and after 90'. */
  stoppage: { first: number; second: number };
  /** Units in the whole match: 90 plus both stoppages. */
  totalUnits: number;
  pauseMs: number;
  durationMs: number;
}

export interface TimelineFrame {
  /** What the clock shows, e.g. "0'", "67'", "45+2'", "90+5'". */
  clock: string;
  /** How far through the match the clock is, from 0 to 1 (for the progress bar). */
  progress: number;
  /** The score after the goals shown so far. */
  score: Score;
  /** How many goals have appeared so far (in time order). */
  shown: number;
  /** The goal the clock is paused on, or null while the clock runs. */
  current: TimelineGoal | null;
  finished: boolean;
}

/** Builds the timeline for a match. Goals must be in time order (validateMatch checks). */
export function buildTimeline(match: Match): Timeline {
  const stoppage = {
    first: Math.max(0, ...match.events.filter((e) => e.minute === 45).map((e) => e.extra)),
    second: Math.max(0, ...match.events.filter((e) => e.minute === 90).map((e) => e.extra)),
  };
  const totalUnits = 90 + stoppage.first + stoppage.second;
  const count = match.events.length;
  const pauseMs = count === 0 ? 0 : Math.min(MAX_GOAL_PAUSE_MS, PAUSE_BUDGET_MS / count);

  const goals = match.events.map((event, i) => {
    // First-half goals keep their minute (45+2 -> 47); second-half goals come
    // after the first-half stoppage.
    const unit = event.minute <= 45 ? event.minute + event.extra : event.minute + event.extra + stoppage.first;
    // The clock runs until this goal, plus one pause for each earlier goal.
    const atMs = (RUN_MS * unit) / totalUnits + i * pauseMs;
    return { eventIndex: i, side: event.team, unit, atMs };
  });

  return { goals, stoppage, totalUnits, pauseMs, durationMs: RUN_MS + count * pauseMs };
}

/** The clock text for a position in match units. */
export function clockLabel(timeline: Timeline, unit: number): string {
  const { first } = timeline.stoppage;
  const u = Math.floor(unit);
  if (u <= 45) return `${u}'`;
  if (u <= 45 + first) return `45+${u - 45}'`;
  if (u <= 90 + first) return `${u - first}'`;
  return `90+${u - 90 - first}'`;
}

/** What the animation shows `elapsedMs` after it started. */
export function timelineAt(timeline: Timeline, elapsedMs: number): TimelineFrame {
  const t = Math.max(0, Math.min(elapsedMs, timeline.durationMs));
  const score: Score = { home: 0, away: 0 };
  let shown = 0;
  let current: TimelineGoal | null = null;

  for (const goal of timeline.goals) {
    if (t < goal.atMs) break;
    score[goal.side] += 1;
    shown += 1;
    if (t < goal.atMs + timeline.pauseMs) current = goal;
  }

  // While paused the clock stays on the goal. Otherwise every shown goal's
  // pause is over, so the clock has run for the elapsed time minus those pauses.
  const runningMs = t - shown * timeline.pauseMs;
  const unit = current ? current.unit : (Math.max(0, runningMs) / RUN_MS) * timeline.totalUnits;
  const clamped = Math.min(unit, timeline.totalUnits);

  return {
    clock: clockLabel(timeline, clamped),
    progress: clamped / timeline.totalUnits,
    score,
    shown,
    current,
    finished: t >= timeline.durationMs,
  };
}

/** The next elapsed time after `dtMs` of real time, at 1x or 2x speed. */
export function advance(elapsedMs: number, dtMs: number, speed: 1 | 2): number {
  return elapsedMs + dtMs * speed;
}
