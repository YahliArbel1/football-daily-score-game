// Data types for matches and guesses, as described in SPEC.md section 6.

export type Side = "home" | "away";

export interface Score {
  home: number;
  away: number;
}

/**
 * The most goals a player can guess for one team. Fixed for every match, so it
 * never hints at the real score. Every match's real score must fit under it
 * (checked by validateMatch).
 */
export const MAX_GOALS_PER_TEAM = 9;

/** A player in the matchday squad (starting XI + substitutes). */
export interface Player {
  id: string;
  name: string;
  number: number;
  /** true for a substitute (on the bench at kick-off); missing for starters. */
  sub?: boolean;
}

/** Hex colors, e.g. "#c8102e". Used only for display. */
export interface Colors {
  primary: string;
  secondary: string;
}

export interface Team {
  id: string;
  name: string;
  colors: Colors;
  players: Player[];
}

/**
 * A real goal (SPEC 6.1).
 * `team` is the side the goal counts for. For an own goal this is the
 * opponent of the scorer's team (SPEC 5.3).
 */
export interface GoalEvent {
  type: "goal";
  team: Side;
  minute: number;
  extra: number;
  scorer: string;
  assist: string | null;
  ownGoal: boolean;
}

export interface Match {
  id: string;
  pool: "daily" | "quick";
  /** Key into the competitions list (src/data/competitions.ts), e.g. "ucl". */
  competitionId: string;
  /** Display name for this match, including the stage, e.g. "UEFA Champions League — Final". */
  competition: string;
  date: string;
  venue: string;
  homeTeam: Team;
  awayTeam: Team;
  finalScore: Score;
  events: GoalEvent[];
}

/** Special scorer value for guessing an own goal (SPEC 5.3). */
export const OWN_GOAL = "OWN_GOAL";

/**
 * A single goal guess (SPEC 6.2). Every field except `team` may be null
 * (partial guesses, SPEC 5.2). `minute` is the raw user input, e.g. "45+2".
 */
export interface GoalGuess {
  team: Side;
  scorer: string | null;
  assist: string | null;
  minute: string | null;
}

export interface Guess {
  matchId: string;
  score: Score;
  goals: GoalGuess[];
}
