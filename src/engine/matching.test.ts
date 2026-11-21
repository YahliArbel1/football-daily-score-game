import { describe, it, expect } from "vitest";
import { bestAssignment, isMatch, scorePair } from "./matching";
import { OWN_GOAL, type GoalEvent, type GoalGuess } from "./types";

// Helpers: build a real goal / a guess, overriding only the fields a test cares about.
function goal(overrides: Partial<GoalEvent> = {}): GoalEvent {
  return {
    type: "goal",
    team: "home",
    minute: 44,
    extra: 0,
    scorer: "crespo",
    assist: "kaka",
    ownGoal: false,
    ...overrides,
  };
}

function guess(overrides: Partial<GoalGuess> = {}): GoalGuess {
  return { team: "home", scorer: "crespo", assist: null, minute: null, ...overrides };
}

const pts = (scorer: number, assist: number, minute: number) => ({
  scorer,
  assist,
  minute,
  total: scorer + assist + minute,
});

describe("isMatch", () => {
  it("matches same team and same scorer", () => {
    expect(isMatch(guess(), goal())).toBe(true);
  });

  it("does not match a different scorer", () => {
    expect(isMatch(guess({ scorer: "kaka" }), goal())).toBe(false);
  });

  it("does not match the right scorer under the wrong team", () => {
    expect(isMatch(guess({ team: "away" }), goal())).toBe(false);
  });

  it("does not match an empty scorer, even if minute and assist are right", () => {
    expect(isMatch(guess({ scorer: null, assist: "kaka", minute: "44" }), goal())).toBe(false);
  });
});

describe("scorePair: regular goals", () => {
  it("gives 7 for scorer + assist + minute (SPEC 6.3: Crespo 43' -> 44')", () => {
    expect(scorePair(guess({ assist: "kaka", minute: "43" }), goal())).toEqual(pts(3, 2, 2));
  });

  it("gives 3 for scorer only, with empty assist and minute", () => {
    expect(scorePair(guess(), goal())).toEqual(pts(3, 0, 0));
  });

  it("scores assist and minute independently", () => {
    expect(scorePair(guess({ assist: "kaka" }), goal())).toEqual(pts(3, 2, 0));
    expect(scorePair(guess({ minute: "44" }), goal())).toEqual(pts(3, 0, 2));
  });

  it("gives no assist points for a wrong assist", () => {
    expect(scorePair(guess({ assist: "pirlo" }), goal())).toEqual(pts(3, 0, 0));
  });

  it("gives no assist points when both guess and goal have no assist (null === null)", () => {
    expect(scorePair(guess({ assist: null }), goal({ assist: null }))).toEqual(pts(3, 0, 0));
  });

  it("keeps scorer and assist points when the minute is invalid", () => {
    expect(scorePair(guess({ assist: "kaka", minute: "abc" }), goal())).toEqual(pts(3, 2, 0));
  });

  it("returns null when not matched, so assist and minute earn nothing", () => {
    expect(scorePair(guess({ scorer: "pirlo", assist: "kaka", minute: "44" }), goal())).toBeNull();
    expect(scorePair(guess({ scorer: null, assist: "kaka", minute: "44" }), goal())).toBeNull();
  });
});

describe("scorePair: own goals (SPEC 5.3)", () => {
  // An away player scores into his own net at 45+2; it counts for home.
  const ownGoal = goal({ team: "home", minute: 45, extra: 2, scorer: "riise", assist: null, ownGoal: true });

  it("OWN_GOAL guess matches an own goal for that team, regardless of who scored it", () => {
    expect(scorePair(guess({ scorer: OWN_GOAL }), ownGoal)).toEqual(pts(3, 0, 0));
    expect(scorePair(guess({ scorer: OWN_GOAL }), { ...ownGoal, scorer: "hamann" })).toEqual(pts(3, 0, 0));
  });

  it("OWN_GOAL guess under the other team does not match", () => {
    expect(scorePair(guess({ team: "away", scorer: OWN_GOAL }), ownGoal)).toBeNull();
  });

  it("OWN_GOAL guess does not match a regular goal", () => {
    expect(scorePair(guess({ scorer: OWN_GOAL }), goal())).toBeNull();
  });

  it("naming the player who scored the own goal does not match", () => {
    expect(scorePair(guess({ scorer: "riise" }), ownGoal)).toBeNull();
  });

  it("gives the minute bonus on an own goal", () => {
    expect(scorePair(guess({ scorer: OWN_GOAL, minute: "45+1" }), ownGoal)).toEqual(pts(3, 0, 2));
  });

  it("gives no assist points on an own goal, even if an assist was guessed", () => {
    expect(scorePair(guess({ scorer: OWN_GOAL, assist: "gerrard" }), ownGoal)).toEqual(pts(3, 0, 0));
    // Even if the data wrongly lists an assist on an own goal.
    expect(
      scorePair(guess({ scorer: OWN_GOAL, assist: "gerrard" }), { ...ownGoal, assist: "gerrard" }),
    ).toEqual(pts(3, 0, 0));
  });
});

describe("bestAssignment", () => {
  const crespo39 = goal({ minute: 39, assist: "shevchenko" });
  const crespo44 = goal({ minute: 44, assist: "kaka" });

  it("picks the assignment with the most points (SPEC 6.3)", () => {
    // 43'+Kaká -> 44' (7) and no-details -> 39' (3) = 10, beats the swap (3 + 3 = 6).
    const guesses = [guess({ assist: "kaka", minute: "43" }), guess()];
    expect(bestAssignment(guesses, [crespo39, crespo44])).toEqual([1, 0]);
  });

  it("is not greedy: gives up a good match when another guess needs that goal more", () => {
    // Guess 0 alone would prefer 44' (5 vs 3), but guess 1 gets 7 there vs 3 at 39'.
    // Greedy: 5 + 3 = 8. Best: 3 + 7 = 10.
    const guesses = [guess({ minute: "42" }), guess({ assist: "kaka", minute: "45" })];
    expect(bestAssignment(guesses, [crespo39, crespo44])).toEqual([0, 1]);
  });

  it("matches each real goal at most once (guessed twice, scored once)", () => {
    expect(bestAssignment([guess(), guess()], [crespo44])).toEqual([0, null]);
  });

  it("leaves unmatched guesses as null", () => {
    expect(bestAssignment([guess({ scorer: "pirlo" }), guess({ scorer: null })], [crespo44])).toEqual([
      null,
      null,
    ]);
  });

  it("breaks ties deterministically: earlier guesses get earlier goals", () => {
    expect(bestAssignment([guess(), guess()], [crespo39, crespo44])).toEqual([0, 1]);
  });

  it("with two own goals and one OWN_GOAL guess, picks the one that earns the minute bonus", () => {
    const og10 = goal({ minute: 10, scorer: "riise", assist: null, ownGoal: true });
    const og80 = goal({ minute: 80, scorer: "hamann", assist: null, ownGoal: true });
    expect(bestAssignment([guess({ scorer: OWN_GOAL, minute: "79" })], [og10, og80])).toEqual([1]);
  });

  it("handles empty inputs", () => {
    expect(bestAssignment([], [crespo44])).toEqual([]);
    expect(bestAssignment([guess()], [])).toEqual([null]);
  });

  it("stays fast with many guesses for the same scorer", () => {
    const goals = Array.from({ length: 12 }, (_, k) => goal({ minute: 5 + k * 7 }));
    const guesses = Array.from({ length: 12 }, () => guess());
    const assignment = bestAssignment(guesses, goals);
    expect(assignment).toEqual(goals.map((_, k) => k));
  });

  it("rejects more than 30 goals instead of giving wrong results", () => {
    const goals = Array.from({ length: 31 }, () => goal());
    expect(() => bestAssignment([guess()], goals)).toThrow();
  });
});
