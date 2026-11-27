// Saves the Daily Game guess in the browser (localStorage), so a player who
// already submitted today sees their results after a reload instead of a new
// guess (SPEC 2.1: one play per day).
//
// The guess is saved under the DAY number, not the match id: the daily list
// starts over after the last match, so the same match comes back on a later
// day and must be playable again then.
//
// Only the guess is saved. The results are recalculated from it, so there is
// a single source of truth.

import { MAX_GOALS_PER_TEAM, type Guess, type Match } from "../engine/types";

/** The two localStorage methods we use. Tests pass a fake one. */
export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export const storageKey = (day: number) => `scordle:daily:${day}`;

/** Saves the guess for `day`. Returns false if the browser refused (e.g. storage full or blocked). */
export function saveGuess(storage: StorageLike | null, day: number, guess: Guess): boolean {
  if (!storage) return false;
  try {
    storage.setItem(storageKey(day), JSON.stringify(guess));
    return true;
  } catch {
    return false;
  }
}

/**
 * The guess saved for `day`, or null if there is none or it can't be trusted:
 * broken JSON, the wrong shape, or a guess for a different match (the match
 * list changed). Ignoring bad data means the player can simply play again.
 */
export function loadGuess(storage: StorageLike | null, day: number, match: Match): Guess | null {
  if (!storage) return null;
  let raw: string | null;
  try {
    raw = storage.getItem(storageKey(day));
  } catch {
    return null;
  }
  if (raw === null) return null;

  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return null;
  }
  return isGuessFor(data, match) ? data : null;
}

const isGoalCount = (n: unknown): n is number =>
  Number.isInteger(n) && (n as number) >= 0 && (n as number) <= MAX_GOALS_PER_TEAM;

const isTextOrNull = (v: unknown) => v === null || typeof v === "string";

/** Checks that `data` looks exactly like a Guess for this match. */
function isGuessFor(data: unknown, match: Match): data is Guess {
  if (typeof data !== "object" || data === null) return false;
  const { matchId, score, goals } = data as Record<string, unknown>;
  if (matchId !== match.id) return false;

  if (typeof score !== "object" || score === null) return false;
  const { home, away } = score as Record<string, unknown>;
  if (!isGoalCount(home) || !isGoalCount(away)) return false;

  if (!Array.isArray(goals)) return false;
  const goalsOk = goals.every((g: unknown) => {
    if (typeof g !== "object" || g === null) return false;
    const { team, scorer, assist, minute } = g as Record<string, unknown>;
    return (
      (team === "home" || team === "away") &&
      isTextOrNull(scorer) &&
      isTextOrNull(assist) &&
      isTextOrNull(minute)
    );
  });
  if (!goalsOk) return false;

  // One goal guess per guessed goal, as the goals screen creates them.
  const count = (side: string) => goals.filter((g: { team: string }) => g.team === side).length;
  return count("home") === home && count("away") === away;
}

/**
 * The browser's localStorage, or null where it isn't available (some
 * browsers throw just for reading it when storage is blocked).
 */
export function browserStorage(): StorageLike | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}
