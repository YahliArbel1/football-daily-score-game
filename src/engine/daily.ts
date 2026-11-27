// Picks the Daily Game (SPEC 2.1): one match per day, the same for everyone.
//
// Days follow the player's LOCAL date, like Wordle: everyone gets the next match
// at their own midnight, and everyone on the same date plays the same match.
// Day 0 is DAILY_START; players see it as #1.
//
// We count calendar dates, never hours: on a daylight-saving change a day has
// 23 or 25 hours, but 27/11 to 28/11 is always exactly one day.
//
// The match of the day is chosen by its place in the daily pool, so new daily
// matches must only be ADDED AT THE END of the list. Inserting one in the
// middle would shift every later day to a different match.

import type { Match } from "./types";

/** The first Daily Game (day 0), as a "YYYY-MM-DD" date. */
export const DAILY_START = "2026-11-27";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** The player's local calendar date for `now`, e.g. "2026-11-27". */
export function localDate(now: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/**
 * Days since 1970-01-01 for a "YYYY-MM-DD" date. Done in UTC on purpose:
 * it is only date arithmetic here, and UTC has no 23- or 25-hour days.
 */
function dateIndex(date: string): number {
  return Date.parse(`${date}T00:00:00Z`) / MS_PER_DAY;
}

/**
 * Whole days from `start` to the player's local date: 0 on the start day,
 * 1 the day after... Dates before the start count as day 0, so the game
 * always has a match.
 */
export function getDayNumber(now: Date, start: string = DAILY_START): number {
  return Math.max(0, dateIndex(localDate(now)) - dateIndex(start));
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

/**
 * Milliseconds until the next Daily Game, i.e. the player's next local
 * midnight. Building the date from day + 1 (instead of adding 24 hours) keeps
 * it right on daylight-saving days.
 */
export function timeUntilNextDaily(now: Date): number {
  const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  return nextMidnight.getTime() - now.getTime();
}
