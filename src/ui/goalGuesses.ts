// Pure logic for the goals screen: keeping the list of goal guesses in step
// with the guessed score, and searching players by name.

import { parseMinute } from "../engine/minute";
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

/** Returns a copy of `goals` with the goal at `index` changed by `change`. */
function updateGoal(goals: GoalGuess[], index: number, change: (g: GoalGuess) => GoalGuess): GoalGuess[] {
  return goals.map((g, i) => (i === index ? change(g) : g));
}

/**
 * Sets the scorer of one goal (null = not chosen). The assist is cleared when
 * it no longer makes sense: an own goal has no assist (SPEC 5.3), and a
 * player can't assist their own goal.
 */
export function setScorer(goals: GoalGuess[], index: number, scorer: string | null): GoalGuess[] {
  return updateGoal(goals, index, (g) => ({
    ...g,
    scorer,
    assist: scorer === OWN_GOAL || (scorer !== null && scorer === g.assist) ? null : g.assist,
  }));
}

/**
 * Sets the assist of one goal (null = no assist). Ignored for an own goal, or
 * when the assist would be the scorer themself.
 */
export function setAssist(goals: GoalGuess[], index: number, assist: string | null): GoalGuess[] {
  return updateGoal(goals, index, (g) => {
    if (assist !== null && (g.scorer === OWN_GOAL || assist === g.scorer)) return g;
    return { ...g, assist };
  });
}

/**
 * Sets the minute of one goal exactly as typed (e.g. "45+2"), trimmed.
 * An empty field is stored as null (skipped). Invalid text is kept as is: it
 * just won't earn the minute bonus (SPEC 5.4).
 */
export function setMinute(goals: GoalGuess[], index: number, text: string): GoalGuess[] {
  const minute = text.trim() === "" ? null : text.trim();
  return updateGoal(goals, index, (g) => ({ ...g, minute }));
}

export type MinuteStatus = "empty" | "valid" | "invalid";

/** Whether a typed minute is empty, valid ("43", "45+2", "90+3") or invalid. Uses the engine's parser. */
export function minuteStatus(text: string | null): MinuteStatus {
  if (text === null || text.trim() === "") return "empty";
  return parseMinute(text.trim()) ? "valid" : "invalid";
}

/** Players who can be chosen as the assist: the team without the scorer. */
export function assistOptions(players: Player[], scorer: string | null): Player[] {
  return players.filter((p) => p.id !== scorer);
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

/** The starting XI and the substitutes, each in squad order. */
export function splitSquad(players: Player[]): { starters: Player[]; subs: Player[] } {
  return {
    starters: players.filter((p) => !p.sub),
    subs: players.filter((p) => p.sub),
  };
}

/** Players whose name contains the query (ignoring case and accents), or whose shirt number is the query. */
export function searchPlayers(players: Player[], query: string): Player[] {
  const q = normalizeName(query);
  if (!q) return players;
  return players.filter((p) => normalizeName(p.name).includes(q) || String(p.number) === q);
}
