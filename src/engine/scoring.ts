// Full scoring of a guess against a match (SPEC 5).

import type { Guess, Match } from "./types";
import { scoreResult, type ResultScore } from "./result";
import { bestAssignment, scorePair, type PairScore } from "./matching";

export interface GoalGuessResult {
  /** Index of the real goal in `match.events` this guess was matched to, or null. */
  eventIndex: number | null;
  /** Points breakdown, or null if the guess was not matched. */
  points: PairScore | null;
}

export interface ScoreBreakdown {
  result: ResultScore;
  /** One entry per guessed goal, in the same order as `guess.goals`. */
  goals: GoalGuessResult[];
  total: number;
}

export function scoreGuess(match: Match, guess: Guess): ScoreBreakdown {
  if (guess.matchId !== match.id) {
    throw new Error(`Guess is for match "${guess.matchId}", not "${match.id}"`);
  }

  const result = scoreResult(guess.score, match.finalScore);
  const assignment = bestAssignment(guess.goals, match.events);

  const goals = guess.goals.map((goalGuess, i): GoalGuessResult => {
    const eventIndex = assignment[i] ?? null;
    const event = eventIndex === null ? undefined : match.events[eventIndex];
    return {
      eventIndex,
      points: event === undefined ? null : scorePair(goalGuess, event),
    };
  });

  const goalPoints = goals.reduce((sum, g) => sum + (g.points?.total ?? 0), 0);
  return { result, goals, total: result.points + goalPoints };
}
