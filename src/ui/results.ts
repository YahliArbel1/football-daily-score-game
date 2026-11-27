// Turns the scoring engine's output into what the results screen shows:
// a points summary by category, and for each team the real goals next to
// the guess that was matched to them (field by field), plus the guesses
// that didn't match any real goal.

import { outcomeOf, type ResultScore } from "../engine/result";
import { scoreGuess } from "../engine/scoring";
import {
  OWN_GOAL,
  type Colors,
  type GoalEvent,
  type GoalGuess,
  type Guess,
  type Match,
  type Score,
  type Side,
} from "../engine/types";

/**
 * One field of a goal (scorer, assist or minute), real against guessed.
 * hit  - you got it right (points > 0)
 * miss - you didn't (or left it empty)
 * none - nothing to guess: no real assist and none guessed
 */
export interface FieldResult {
  real: string | null;
  guess: string | null;
  points: number;
  status: "hit" | "miss" | "none";
}

export type GoalBadge = "full-house" | "pair" | null;

/** Which badge a goal earns from its three fields. */
export function goalBadge(scorer: FieldResult, assist: FieldResult, minute: FieldResult): GoalBadge {
  if (scorer.status !== "hit") return null; // nothing else counts without the scorer
  const assistDone = assist.status === "hit" || assist.status === "none";
  if (assistDone && minute.status === "hit") return "full-house";
  const hits = [scorer, assist, minute].filter((f) => f.status === "hit").length;
  return hits >= 2 ? "pair" : null;
}

export interface GoalCard {
  /** e.g. "44'" or "45+2'" */
  minute: string;
  ownGoal: boolean;
  /** False when none of your guesses was matched to this goal. */
  guessed: boolean;
  /** Points earned on this goal (0 when not guessed). */
  points: number;
  /**
   * full-house - everything that could be guessed was right: scorer and
   *              minute, and the assist too when the goal had one (own goals
   *              and goals without an assist only have scorer + minute).
   * pair       - two of the three right (scorer + assist, or scorer + minute),
   *              but not a full house.
   * null       - anything less.
   */
  badge: GoalBadge;
  scorer: FieldResult;
  assist: FieldResult;
  minuteField: FieldResult;
}

export interface MissedGuess {
  /** Player name, "Own goal", or null if no scorer was chosen. */
  scorerName: string | null;
  /** e.g. "60'", or null */
  minute: string | null;
}

export interface TeamResults {
  side: Side;
  name: string;
  colors: Colors;
  realGoals: number;
  guessedGoals: number;
  points: number;
  cards: GoalCard[];
  missed: MissedGuess[];
}

export interface PointsSummary {
  result: number;
  scorers: number;
  assists: number;
  minutes: number;
}

export interface ResultsView {
  actual: Score;
  guessed: Score;
  result: ResultScore;
  /** e.g. "Exact score!", "Right outcome · draw", "Wrong result" */
  resultLabel: string;
  summary: PointsSummary;
  teams: [TeamResults, TeamResults];
  total: number;
}

/** "44'", "45+2'", "90+3'" */
export function minuteLabel(goal: Pick<GoalEvent, "minute" | "extra">): string {
  return goal.extra > 0 ? `${goal.minute}+${goal.extra}'` : `${goal.minute}'`;
}

/** A typed minute shown the same way: "43" -> "43'", "45 + 2" -> "45+2'". */
function guessedMinuteLabel(minute: string | null): string | null {
  return minute === null ? null : `${minute.replace(/\s+/g, "")}'`;
}

/**
 * A player's name from either team (an own goal's scorer plays for the other
 * team). "Own goal" for OWN_GOAL, null for null, and the id itself if unknown.
 */
export function playerName(match: Match, id: string | null): string | null {
  if (id === null) return null;
  if (id === OWN_GOAL) return "Own goal";
  const all = [...match.homeTeam.players, ...match.awayTeam.players];
  return all.find((p) => p.id === id)?.name ?? id;
}

function resultLabel(result: ResultScore, actual: Score, match: Match): string {
  if (result.kind === "exact") return "Exact score!";
  if (result.kind === "wrong") return "Wrong result";
  const outcome = outcomeOf(actual);
  const what =
    outcome === "draw" ? "draw" : `${outcome === "homeWin" ? match.homeTeam.name : match.awayTeam.name} win`;
  return `Right outcome · ${what}`;
}

function field(real: string | null, guess: string | null, points: number): FieldResult {
  const status = points > 0 ? "hit" : real === null && guess === null ? "none" : "miss";
  return { real, guess, points, status };
}

function goalCard(match: Match, event: GoalEvent, guess: GoalGuess | null, points: { scorer: number; assist: number; minute: number } | null): GoalCard {
  const realScorer = playerName(match, event.scorer) ?? event.scorer;
  const realAssist = playerName(match, event.assist);
  const realMinute = minuteLabel(event);
  const p = points ?? { scorer: 0, assist: 0, minute: 0 };
  const scorer = field(realScorer, guess ? playerName(match, guess.scorer) : null, p.scorer);
  const assist = field(realAssist, guess ? playerName(match, guess.assist) : null, p.assist);
  const minuteField = field(realMinute, guess ? guessedMinuteLabel(guess.minute) : null, p.minute);

  return {
    minute: realMinute,
    ownGoal: event.ownGoal,
    guessed: guess !== null,
    points: p.scorer + p.assist + p.minute,
    badge: goalBadge(scorer, assist, minuteField),
    scorer,
    assist,
    minuteField,
  };
}

/**
 * The result card of every real goal, in the order of match.events (time
 * order), so the match animation can show your hits as each goal happens.
 * buildResults keeps each team's cards in that same order.
 */
export function cardsByEvent(match: Match, view: ResultsView): GoalCard[] {
  const next: Record<Side, number> = { home: 0, away: 0 };
  return match.events.map((event) => {
    const team = view.teams.find((t) => t.side === event.team)!;
    return team.cards[next[event.team]++]!;
  });
}

export function buildResults(match: Match, guess: Guess): ResultsView {
  const breakdown = scoreGuess(match, guess);

  // For each real goal: the guess matched to it, and the points it earned.
  const matchedTo = new Map<number, number>(); // event index -> guess index
  breakdown.goals.forEach((g, guessIndex) => {
    if (g.eventIndex !== null) matchedTo.set(g.eventIndex, guessIndex);
  });

  const summary: PointsSummary = { result: breakdown.result.points, scorers: 0, assists: 0, minutes: 0 };
  for (const g of breakdown.goals) {
    summary.scorers += g.points?.scorer ?? 0;
    summary.assists += g.points?.assist ?? 0;
    summary.minutes += g.points?.minute ?? 0;
  }

  const teamResults = (side: Side): TeamResults => {
    const team = side === "home" ? match.homeTeam : match.awayTeam;

    const cards = match.events.flatMap((event, eventIndex) => {
      if (event.team !== side) return [];
      const guessIndex = matchedTo.get(eventIndex);
      const matchedGuess = guessIndex === undefined ? null : guess.goals[guessIndex] ?? null;
      const points = guessIndex === undefined ? null : breakdown.goals[guessIndex]?.points ?? null;
      return [goalCard(match, event, matchedGuess, points)];
    });

    const missed = guess.goals
      .filter((g, i) => g.team === side && breakdown.goals[i]?.eventIndex === null)
      .map((g) => ({ scorerName: playerName(match, g.scorer), minute: guessedMinuteLabel(g.minute) }));

    return {
      side,
      name: team.name,
      colors: team.colors,
      realGoals: match.finalScore[side],
      guessedGoals: guess.score[side],
      points: cards.reduce((sum, c) => sum + c.points, 0),
      cards,
      missed,
    };
  };

  return {
    actual: match.finalScore,
    guessed: guess.score,
    result: breakdown.result,
    resultLabel: resultLabel(breakdown.result, match.finalScore, match),
    summary,
    teams: [teamResults("home"), teamResults("away")],
    total: breakdown.total,
  };
}
