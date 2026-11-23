import { MAX_GOALS_PER_TEAM, type Score } from "../engine/types";

/** Adds `delta` goals (usually +1 or -1), staying within 0..MAX_GOALS_PER_TEAM. */
export function changeGoals(current: number, delta: number): number {
  return Math.min(MAX_GOALS_PER_TEAM, Math.max(0, current + delta));
}

/** A short line describing a guessed score, e.g. "AC Milan win" or "Draw". */
export function describeScore(score: Score, homeName: string, awayName: string): string {
  if (score.home > score.away) return `${homeName} win`;
  if (score.away > score.home) return `${awayName} win`;
  return "Draw";
}
