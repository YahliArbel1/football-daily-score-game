import { MAX_GOALS_PER_TEAM, type GoalEvent, type Match, type Side } from "../engine/types";
import { competitions as defaultCompetitions, type Competition } from "./competitions";

const HEX_COLOR = /^#[0-9a-f]{6}$/i;

const other = (side: Side): Side => (side === "home" ? "away" : "home");

function describeGoal(goal: GoalEvent, index: number): string {
  const extra = goal.extra > 0 ? `+${goal.extra}` : "";
  return `goal #${index + 1} (${goal.minute}${extra}')`;
}

/**
 * Checks one match's data for mistakes. Returns a list of readable problems;
 * an empty list means the match is valid.
 */
export function validateMatch(
  match: Match,
  competitions: Record<string, Competition> = defaultCompetitions,
): string[] {
  const problems: string[] = [];
  const teams = { home: match.homeTeam, away: match.awayTeam };

  // Final score: whole numbers from 0 to MAX_GOALS_PER_TEAM.
  for (const side of ["home", "away"] as const) {
    const goals = match.finalScore[side];
    if (!Number.isInteger(goals) || goals < 0 || goals > MAX_GOALS_PER_TEAM) {
      problems.push(
        `finalScore.${side} is ${goals}; it must be a whole number from 0 to ${MAX_GOALS_PER_TEAM}`,
      );
    }
  }

  // The goal list must add up to the final score.
  for (const side of ["home", "away"] as const) {
    const listed = match.events.filter((e) => e.team === side).length;
    if (listed !== match.finalScore[side]) {
      problems.push(
        `${side} has ${listed} goal events but finalScore.${side} is ${match.finalScore[side]}`,
      );
    }
  }

  // Player ids must be unique across both teams (guesses refer to them by id).
  const seen = new Set<string>();
  for (const player of [...match.homeTeam.players, ...match.awayTeam.players]) {
    if (seen.has(player.id)) problems.push(`player id "${player.id}" appears more than once`);
    seen.add(player.id);
  }

  // Each squad: exactly 11 starters, and no two players with the same shirt number.
  for (const side of ["home", "away"] as const) {
    const { name, players } = teams[side];
    const starters = players.filter((p) => !p.sub).length;
    if (starters !== 11) problems.push(`${name} has ${starters} starters; it must have 11`);

    const numbers = new Set<number>();
    for (const p of players) {
      if (numbers.has(p.number)) problems.push(`${name} has two players with shirt number ${p.number}`);
      numbers.add(p.number);
    }
  }

  const playsFor = (side: Side, id: string) => teams[side].players.some((p) => p.id === id);

  match.events.forEach((goal, i) => {
    const name = describeGoal(goal, i);

    // Minutes: 1-90, stoppage time only after 45 or 90 (SPEC 5.4).
    if (!Number.isInteger(goal.minute) || goal.minute < 1 || goal.minute > 90) {
      problems.push(`${name}: minute must be from 1 to 90`);
    }
    if (!Number.isInteger(goal.extra) || goal.extra < 0) {
      problems.push(`${name}: extra must be a whole number, 0 or more`);
    } else if (goal.extra > 0 && goal.minute !== 45 && goal.minute !== 90) {
      problems.push(`${name}: stoppage time is only allowed at minute 45 or 90`);
    }

    // Scorer: from the team the goal counts for, or the other team for an own goal (SPEC 5.3).
    const scorerSide = goal.ownGoal ? other(goal.team) : goal.team;
    if (!playsFor(scorerSide, goal.scorer)) {
      problems.push(
        `${name}: scorer "${goal.scorer}" is not in the ${teams[scorerSide].name} player list`,
      );
    }

    // Assist: none for own goals; otherwise a teammate, not the scorer.
    if (goal.assist !== null) {
      if (goal.ownGoal) {
        problems.push(`${name}: an own goal cannot have an assist`);
      } else if (goal.assist === goal.scorer) {
        problems.push(`${name}: the scorer cannot assist their own goal`);
      } else if (!playsFor(goal.team, goal.assist)) {
        problems.push(
          `${name}: assist "${goal.assist}" is not in the ${teams[goal.team].name} player list`,
        );
      }
    }

    // Events must be in chronological order (they drive the animation).
    const prev = match.events[i - 1];
    if (prev && (goal.minute < prev.minute || (goal.minute === prev.minute && goal.extra < prev.extra))) {
      problems.push(`${name}: comes before the previous goal; events must be in time order`);
    }
  });

  if (!competitions[match.competitionId]) {
    problems.push(`competitionId "${match.competitionId}" is not in the competitions list`);
  }

  for (const side of ["home", "away"] as const) {
    const { colors, name } = teams[side];
    for (const key of ["primary", "secondary"] as const) {
      if (!HEX_COLOR.test(colors[key])) {
        problems.push(`${name} colors.${key} "${colors[key]}" must look like #rrggbb`);
      }
    }
  }

  return problems;
}

/** Problems that involve more than one match, such as duplicate ids. */
export function validateMatchList(list: Match[]): string[] {
  const problems: string[] = [];
  const ids = new Set<string>();
  for (const match of list) {
    if (ids.has(match.id)) problems.push(`match id "${match.id}" appears more than once`);
    ids.add(match.id);
  }
  return problems;
}
