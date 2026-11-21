// Points for the final score guess (SPEC 5.1).

import type { Score } from "./types";

export const EXACT_SCORE_POINTS = 5;
export const CORRECT_OUTCOME_POINTS = 2;

export type Outcome = "homeWin" | "draw" | "awayWin";

/**
 * exact   - both numbers match (+5)
 * outcome - not exact, but home win / draw / away win is right (+2)
 * wrong   - neither (0)
 */
export type ResultKind = "exact" | "outcome" | "wrong";

export interface ResultScore {
  kind: ResultKind;
  points: number;
}

export function outcomeOf(score: Score): Outcome {
  if (score.home > score.away) return "homeWin";
  if (score.home < score.away) return "awayWin";
  return "draw";
}

/** The +5 and +2 do not stack: an exact score earns 5, not 7. */
export function scoreResult(guessed: Score, actual: Score): ResultScore {
  if (guessed.home === actual.home && guessed.away === actual.away) {
    return { kind: "exact", points: EXACT_SCORE_POINTS };
  }
  if (outcomeOf(guessed) === outcomeOf(actual)) {
    return { kind: "outcome", points: CORRECT_OUTCOME_POINTS };
  }
  return { kind: "wrong", points: 0 };
}
