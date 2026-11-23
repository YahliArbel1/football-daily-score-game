import { describe, expect, it } from "vitest";
import { istanbul2005 } from "../engine/fixtures/istanbul-2005";
import { OWN_GOAL, type GoalGuess } from "../engine/types";
import {
  assistOptions,
  emptyGoal,
  minuteStatus,
  normalizeName,
  numberWithinTeam,
  resizeGoalGuesses,
  searchPlayers,
  setAssist,
  setMinute,
  setScorer,
  splitSquad,
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

  it("clears the assist when the assist player becomes the scorer", () => {
    expect(setScorer(goals, 0, "kaka")[0]).toMatchObject({ scorer: "kaka", assist: null });
  });

  it("keeps the assist when the scorer is cleared", () => {
    expect(setScorer(goals, 0, null)[0]).toMatchObject({ scorer: null, assist: "kaka" });
  });
});

describe("setAssist", () => {
  const goals: GoalGuess[] = [
    { team: "home", scorer: "crespo", assist: null, minute: null },
    { team: "home", scorer: OWN_GOAL, assist: null, minute: null },
  ];

  it("sets and clears the assist", () => {
    const withAssist = setAssist(goals, 0, "kaka");
    expect(withAssist[0]!.assist).toBe("kaka");
    expect(setAssist(withAssist, 0, null)[0]!.assist).toBeNull();
  });

  it("works before a scorer is chosen", () => {
    const empty: GoalGuess[] = [emptyGoal("away")];
    expect(setAssist(empty, 0, "riise")[0]!.assist).toBe("riise");
  });

  it("refuses an assist on an own goal", () => {
    expect(setAssist(goals, 1, "kaka")[1]!.assist).toBeNull();
  });

  it("refuses the scorer as their own assist", () => {
    expect(setAssist(goals, 0, "crespo")[0]!.assist).toBeNull();
  });

  it("changes only the chosen goal", () => {
    expect(setAssist(goals, 0, "kaka")[1]).toEqual(goals[1]);
  });
});

describe("setMinute", () => {
  const goals: GoalGuess[] = [emptyGoal("home")];

  it("stores the minute as typed, trimmed", () => {
    expect(setMinute(goals, 0, " 45+2 ")[0]!.minute).toBe("45+2");
  });

  it("stores an empty field as null (skipped)", () => {
    expect(setMinute(goals, 0, "")[0]!.minute).toBeNull();
    expect(setMinute(goals, 0, "   ")[0]!.minute).toBeNull();
  });

  it("keeps invalid text, so the user can see and fix it", () => {
    expect(setMinute(goals, 0, "95")[0]!.minute).toBe("95");
  });
});

describe("minuteStatus", () => {
  it("is empty for nothing typed", () => {
    expect(minuteStatus(null)).toBe("empty");
    expect(minuteStatus("")).toBe("empty");
    expect(minuteStatus("  ")).toBe("empty");
  });

  it("accepts 1-90 and stoppage time after 45 or 90", () => {
    for (const ok of ["1", "43", "90", "45+2", "90+3", " 44 "]) expect(minuteStatus(ok)).toBe("valid");
  });

  it("rejects everything else (SPEC 5.4)", () => {
    for (const bad of ["abc", "0", "95", "30+2", "45+", "45+0", "-5", "4 5"]) {
      expect(minuteStatus(bad)).toBe("invalid");
    }
  });
});

describe("assistOptions", () => {
  it("leaves out the scorer", () => {
    const ids = assistOptions(milan, "crespo").map((p) => p.id);
    expect(ids).not.toContain("crespo");
    expect(ids).toHaveLength(milan.length - 1);
  });

  it("offers everyone when there is no scorer or it's an own goal", () => {
    expect(assistOptions(milan, null)).toEqual(milan);
    expect(assistOptions(milan, OWN_GOAL)).toEqual(milan);
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
    const players = [
      { id: "pirlo", name: "Andrea Pirlo", number: 21 },
      { id: "sheva", name: "Andriy Shevchenko", number: 7 },
      { id: "dida", name: "Dida", number: 1 },
    ];
    expect(searchPlayers(players, "ANDR").map((p) => p.id)).toEqual(["pirlo", "sheva"]);
    expect(searchPlayers(liverpool, "GER").map((p) => p.id)).toEqual(["gerrard"]);
  });

  it("finds substitutes too", () => {
    expect(searchPlayers(liverpool, "cisse").map((p) => p.id)).toEqual(["cisse"]);
  });

  it("finds a player by shirt number", () => {
    expect(searchPlayers(liverpool, "8").map((p) => p.id)).toEqual(["gerrard"]);
  });

  it("returns nothing when no one matches", () => {
    expect(searchPlayers(milan, "messi")).toEqual([]);
  });
});

describe("splitSquad", () => {
  it("separates the starting XI from the substitutes, keeping order", () => {
    const { starters, subs } = splitSquad(liverpool);
    expect(starters).toHaveLength(11);
    expect(subs).toHaveLength(7);
    expect(starters[0]!.id).toBe("dudek");
    expect(subs.map((p) => p.id)).toContain("smicer");
  });

  it("treats everyone as a starter when no one is marked as a sub", () => {
    const players = [{ id: "a", name: "A", number: 1 }];
    expect(splitSquad(players)).toEqual({ starters: players, subs: [] });
  });
});
