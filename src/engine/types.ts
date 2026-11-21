// Data types for matches and guesses, as described in SPEC.md section 6.

export type Side = "home" | "away";

export interface Score {
  home: number;
  away: number;
}

export interface Player {
  id: string;
  name: string;
  number: number;
}

export interface Team {
  id: string;
  name: string;
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
