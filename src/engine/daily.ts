// Picks the Daily Game (SPEC 2.1): one match per day, the same for everyone.
//
// Days are counted in UTC, so every player switches to the next match at the
// same moment wherever they are. Day 0 is DAILY_START; players see it as #1.
//
// The match of the day is chosen by its place in the daily pool, so new daily
// matches must only be ADDED AT THE END of the list. Inserting one in the
// middle would shift every later day to a different match.

import type { Match } from "./types";

/** The first Daily Game (day 0), as a UTC date. */
export const DAILY_START = "2026-11-27";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Milliseconds at 00:00 UTC of the day `now` falls on. */
function utcMidnight(now: Date): number {
  return Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
}

/**
 * Whole UTC days from `start` to `now`: 0 on the start day, 1 the day after...
 * Dates before the start count as day 0, so the game always has a match.
 */
export function getDayNumber(now: Date, start: string = DAILY_START): number {
  const startMs = Date.parse(`${start}T00:00:00Z`);
  const days = Math.round((utcMidnight(now) - startMs) / MS_PER_DAY);
  return Math.max(0, days);
}

/**
 * Today's match from the daily pool. After the last match it starts over
 * from the first (wrap-around).
 */
export function getDailyMatch(matches: Match[], now: Date, start: string = DAILY_START): Match {
  const pool = matches.filter((m) => m.pool === "daily");
  const match = pool[getDayNumber(now, start) % pool.length];
  // Only happens when the pool is empty (any index into an empty list).
  if (!match) {
    throw new Error("No daily matches: add at least one match with pool: \"daily\".");
  }
  return match;
}

/** Milliseconds until the next Daily Game, i.e. the next 00:00 UTC. */
export function timeUntilNextDaily(now: Date): number {
  return utcMidnight(now) + MS_PER_DAY - now.getTime();
}
