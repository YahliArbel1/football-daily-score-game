// Pure logic for the goals screen: keeping the list of goal guesses in step
// with the guessed score, and searching players by name.

import { OWN_GOAL, type GoalGuess, type Player, type Score, type Side } from "../engine/types";

export function emptyGoal(team: Side): GoalGuess {
  return { team, scorer: null, assist: null, minute: null };
}

/**
 * Makes the goal list match the guessed score: home goals first, then away.
 * Goals already filled in are kept (in order); extra ones are removed from
 * the end, and missing ones are added empty.
 */
export function resizeGoalGuesses(goals: GoalGuess[], score: Score): GoalGuess[] {
  const forSide = (side: Side) => {
    const kept = goals.filter((g) => g.team === side).slice(0, score[side]);
    while (kept.length < score[side]) kept.push(emptyGoal(side));
    return kept;
  };
  return [...forSide("home"), ...forSide("away")];
}

/** 1-based number of the goal at `index` among its own team's goals ("goal 2" of Milan). */
export function numberWithinTeam(goals: GoalGuess[], index: number): number {
  const team = goals[index]?.team;
  return goals.slice(0, index + 1).filter((g) => g.team === team).length;
}

/**
 * Sets the scorer of one goal (null = not chosen). An own goal has no assist
 * (SPEC 5.3), so choosing one also clears the assist.
 */
export function setScorer(goals: GoalGuess[], index: number, scorer: string | null): GoalGuess[] {
  return goals.map((g, i) => {
    if (i !== index) return g;
    return { ...g, scorer, assist: scorer === OWN_GOAL ? null : g.assist };
  });
}

// Letters that don't split into "base letter + accent" in Unicode.
const SPECIAL_LETTERS: Record<string, string> = { ø: "o", æ: "ae", œ: "oe", ß: "ss", ł: "l", đ: "d", ı: "i" };

/** Lower-case, without accents: "Kaká" -> "kaka", "Šmicer" -> "smicer", "Solskjær" -> "solskjaer". */
export function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[øæœßłđı]/g, (c) => SPECIAL_LETTERS[c] ?? c)
    .trim();
}

/** Players whose name contains the query (ignoring case and accents), or whose shirt number is the query. */
export function searchPlayers(players: Player[], query: string): Player[] {
  const q = normalizeName(query);
  if (!q) return players;
  return players.filter((p) => normalizeName(p.name).includes(q) || String(p.number) === q);
}
