import { describe, expect, it } from "vitest";
import { istanbul2005 } from "../engine/fixtures/istanbul-2005";
import { OWN_GOAL, type GoalGuess } from "../engine/types";
import {
  emptyGoal,
  normalizeName,
  numberWithinTeam,
  resizeGoalGuesses,
  searchPlayers,
  setScorer,
} from "./goalGuesses";

const milan = istanbul2005.homeTeam.players;
const liverpool = istanbul2005.awayTeam.players;

describe("resizeGoalGuesses", () => {
  it("creates empty goals for each team, home first", () => {
    expect(resizeGoalGuesses([], { home: 2, away: 1 })).toEqual([
      emptyGoal("home"),
      emptyGoal("home"),
      emptyGoal("away"),
    ]);
  });

  it("returns no goals for 0-0", () => {
    expect(resizeGoalGuesses([emptyGoal("home")], { home: 0, away: 0 })).toEqual([]);
  });

  it("keeps chosen scorers when the score goes up", () => {
    const before = setScorer(resizeGoalGuesses([], { home: 1, away: 1 }), 0, "crespo");
    const after = resizeGoalGuesses(before, { home: 2, away: 1 });
    expect(after.map((g) => [g.team, g.scorer])).toEqual([
      ["home", "crespo"],
      ["home", null],
      ["away", null],
    ]);
  });

  it("removes goals from the end of a team's list when the score goes down", () => {
    let goals = resizeGoalGuesses([], { home: 3, away: 1 });
    goals = setScorer(goals, 0, "maldini");
    goals = setScorer(goals, 1, "crespo");
    goals = setScorer(goals, 2, "kaka");
    goals = setScorer(goals, 3, "gerrard");
    const after = resizeGoalGuesses(goals, { home: 2, away: 1 });
    expect(after.map((g) => g.scorer)).toEqual(["maldini", "crespo", "gerrard"]);
  });

  it("keeps the other team untouched", () => {
    const goals = setScorer(resizeGoalGuesses([], { home: 1, away: 2 }), 1, "gerrard");
    const after = resizeGoalGuesses(goals, { home: 0, away: 2 });
    expect(after.map((g) => [g.team, g.scorer])).toEqual([
      ["away", "gerrard"],
      ["away", null],
    ]);
  });
});

describe("numberWithinTeam", () => {
  it("counts goals per team", () => {
    const goals = resizeGoalGuesses([], { home: 2, away: 2 });
    expect([0, 1, 2, 3].map((i) => numberWithinTeam(goals, i))).toEqual([1, 2, 1, 2]);
  });
});

describe("setScorer", () => {
  const goals: GoalGuess[] = [{ team: "home", scorer: "crespo", assist: "kaka", minute: "44" }];

  it("changes only the chosen goal and keeps the rest of it", () => {
    expect(setScorer(goals, 0, "maldini")).toEqual([
      { team: "home", scorer: "maldini", assist: "kaka", minute: "44" },
    ]);
  });

  it("clears the assist when choosing an own goal", () => {
    expect(setScorer(goals, 0, OWN_GOAL)[0]).toEqual({
      team: "home",
      scorer: OWN_GOAL,
      assist: null,
      minute: "44",
    });
  });

  it("can clear the scorer", () => {
    expect(setScorer(goals, 0, null)[0]!.scorer).toBeNull();
  });

  it("does not change the original list", () => {
    setScorer(goals, 0, "maldini");
    expect(goals[0]!.scorer).toBe("crespo");
  });
});

describe("normalizeName", () => {
  it("removes case and accents", () => {
    expect(normalizeName("Kaká")).toBe("kaka");
    expect(normalizeName("Vladimír Šmicer")).toBe("vladimir smicer");
    expect(normalizeName("Milan Baroš")).toBe("milan baros");
    expect(normalizeName("Hernán Crespo")).toBe("hernan crespo");
  });

  it("handles letters that have no separate accent", () => {
    expect(normalizeName("Ole Gunnar Solskjær")).toBe("ole gunnar solskjaer");
    expect(normalizeName("Robert Lewandowski")).toBe("robert lewandowski");
    expect(normalizeName("Łukasz Piszczek")).toBe("lukasz piszczek");
  });
});

describe("searchPlayers", () => {
  it("returns everyone for an empty search", () => {
    expect(searchPlayers(milan, "")).toEqual(milan);
    expect(searchPlayers(milan, "   ")).toEqual(milan);
  });

  it("finds players without typing accents", () => {
    expect(searchPlayers(milan, "kaka").map((p) => p.id)).toEqual(["kaka"]);
    expect(searchPlayers(liverpool, "smicer").map((p) => p.id)).toEqual(["smicer"]);
  });

  it("matches any part of the name, any case", () => {
    expect(searchPlayers(liverpool, "GER").map((p) => p.id)).toEqual(["gerrard"]);
    expect(searchPlayers(milan, "andr").map((p) => p.id)).toEqual(["pirlo", "shevchenko"]);
  });

  it("finds a player by shirt number", () => {
    expect(searchPlayers(liverpool, "8").map((p) => p.id)).toEqual(["gerrard"]);
  });

  it("returns nothing when no one matches", () => {
    expect(searchPlayers(milan, "messi")).toEqual([]);
  });
});
