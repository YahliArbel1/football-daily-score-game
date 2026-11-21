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

/**
 * Picks which real goal each guess is matched to, so that the total points
 * are as high as possible (SPEC 5.2). Each guess and each real goal is used
 * at most once.
 *
 * Returns one entry per guess: the index of its real goal in `events`, or null.
 *
 * Ties are broken deterministically: earlier guesses get earlier goals.
 *
 * How it works: for each guess in turn, try every still-unused real goal it
 * matches (and also "no goal"), and keep the option with the best total.
 * Results are cached by (guess index, set of used goals), so even many
 * guesses for the same scorer stay fast. The set of used goals is stored as
 * bits of a number (bit j = goal j is taken), which supports up to 30 goals.
 */
export function bestAssignment(guesses: GoalGuess[], events: GoalEvent[]): (number | null)[] {
  if (events.length > 30) throw new Error("bestAssignment supports at most 30 goals");

  // points[i][j] = points for guess i on goal j, or null if they don't match.
  const points = guesses.map((g) => events.map((e) => scorePair(g, e)?.total ?? null));
  const pointsFor = (i: number, j: number) => points[i]?.[j] ?? null;
  const isUsed = (used: number, j: number) => (used & (1 << j)) !== 0;

  const cache = new Map<string, number>();

  // Best total achievable for guesses i..end, given the goals already used.
  function best(i: number, used: number): number {
    if (i === guesses.length) return 0;

    const key = `${i}:${used}`;
    const cached = cache.get(key);
    if (cached !== undefined) return cached;

    let result = best(i + 1, used); // option: guess i matches nothing
    for (let j = 0; j < events.length; j++) {
      const p = pointsFor(i, j);
      if (p === null || isUsed(used, j)) continue;
      result = Math.max(result, p + best(i + 1, used | (1 << j)));
    }

    cache.set(key, result);
    return result;
  }

  // Walk the guesses again and pick, for each, the first option that
  // achieves the best total. Goals are tried in order before "nothing",
  // which gives the tie-breaking rule above.
  const assignment: (number | null)[] = [];
  let used = 0;
  for (let i = 0; i < guesses.length; i++) {
    const target = best(i, used);
    let chosen: number | null = null;
    for (let j = 0; j < events.length; j++) {
      const p = pointsFor(i, j);
      if (p === null || isUsed(used, j)) continue;
      if (p + best(i + 1, used | (1 << j)) === target) {
        chosen = j;
        break;
      }
    }
    if (chosen !== null) used |= 1 << chosen;
    assignment.push(chosen);
  }
  return assignment;
}
