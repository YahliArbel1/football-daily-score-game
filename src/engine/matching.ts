// Matching goal guesses to real goals (SPEC 5.2, 5.3).

import { OWN_GOAL, type GoalEvent, type GoalGuess } from "./types";
import { isMinuteBonus } from "./minute";

export const SCORER_POINTS = 3;
export const ASSIST_POINTS = 2;
export const MINUTE_BONUS_POINTS = 2;

export interface PairScore {
  scorer: number;
  assist: number;
  minute: number;
  total: number;
}

/** True if this guess can be matched to this real goal (SPEC 5.2). */
export function isMatch(guess: GoalGuess, event: GoalEvent): boolean {
  if (guess.team !== event.team) return false;
  if (guess.scorer === null) return false;

  // An OWN_GOAL guess matches any own goal for that team, whoever scored it.
  // A guess naming a player never matches an own goal.
  if (guess.scorer === OWN_GOAL) return event.ownGoal;
  return !event.ownGoal && guess.scorer === event.scorer;
}

/**
 * Points for one guess against one real goal, or null if they don't match.
 * Assist and minute are only checked once the scorer matches.
 */
export function scorePair(guess: GoalGuess, event: GoalEvent): PairScore | null {
  if (!isMatch(guess, event)) return null;

  // Own goals have no assist (SPEC 5.3). A goal with no assist (null) can't
  // be "guessed right" by leaving the assist empty.
  const assistCorrect =
    !event.ownGoal && event.assist !== null && guess.assist === event.assist;

  const scorer = SCORER_POINTS;
  const assist = assistCorrect ? ASSIST_POINTS : 0;
  const minute = isMinuteBonus(guess.minute, event) ? MINUTE_BONUS_POINTS : 0;

  return { scorer, assist, minute, total: scorer + assist + minute };
}
