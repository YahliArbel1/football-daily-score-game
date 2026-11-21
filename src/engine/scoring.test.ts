import { describe, it, expect } from "vitest";
import { scoreGuess } from "./scoring";
import { OWN_GOAL, type Guess, type Match } from "./types";
import { istanbul2005, istanbul2005Guess } from "./fixtures/istanbul-2005";

function guessFor(match: Match, overrides: Partial<Guess>): Guess {
  return { matchId: match.id, score: { home: 0, away: 0 }, goals: [], ...overrides };
}

describe("scoreGuess: SPEC 6.3 example", () => {
  const breakdown = scoreGuess(istanbul2005, istanbul2005Guess);

  it("totals 19 points", () => {
    expect(breakdown.total).toBe(19);
  });

  it("gives +2 for the correct outcome (draw), not exact", () => {
    expect(breakdown.result).toEqual({ kind: "outcome", points: 2 });
  });

  it("matches each guess to the expected real goal", () => {
    expect(breakdown.goals).toEqual([
      // Crespo 43' + Kaká -> Crespo 44' (event 2)
      { eventIndex: 2, points: { scorer: 3, assist: 2, minute: 2, total: 7 } },
      // Crespo, no details -> Crespo 39' (event 1)
      { eventIndex: 1, points: { scorer: 3, assist: 0, minute: 0, total: 3 } },
      // Gerrard 55' + Riise -> Gerrard 54' (event 3)
      { eventIndex: 3, points: { scorer: 3, assist: 2, minute: 2, total: 7 } },
      // Baroš didn't score
      { eventIndex: null, points: null },
    ]);
  });
});

describe("scoreGuess: partial and empty guesses (SPEC 5.2)", () => {
  it("scores the result even with no goal guesses at all", () => {
    const g = guessFor(istanbul2005, { score: { home: 3, away: 3 }, goals: [] });
    expect(scoreGuess(istanbul2005, g).total).toBe(5);
  });

  it("scores only the result when every goal guess is empty", () => {
    const empty = { scorer: null, assist: null, minute: null };
    const g = guessFor(istanbul2005, {
      score: { home: 1, away: 1 },
      goals: [
        { team: "home", ...empty },
        { team: "away", ...empty },
      ],
    });
    const breakdown = scoreGuess(istanbul2005, g);
    expect(breakdown.total).toBe(2);
    expect(breakdown.goals).toEqual([
      { eventIndex: null, points: null },
      { eventIndex: null, points: null },
    ]);
  });

  it("scores filled-in goals even if others are left empty", () => {
    const g = guessFor(istanbul2005, {
      score: { home: 3, away: 3 },
      goals: [
        { team: "home", scorer: "maldini", assist: null, minute: "1" }, // 3 + 2
        { team: "home", scorer: null, assist: "kaka", minute: "44" }, // 0: no scorer
        { team: "away", scorer: "alonso", assist: null, minute: "abc" }, // 3: bad minute
      ],
    });
    // 5 (exact) + 5 + 0 + 3
    expect(scoreGuess(istanbul2005, g).total).toBe(13);
  });

  it("does not crash when the number of goal guesses differs from the guessed score", () => {
    const g = guessFor(istanbul2005, {
      score: { home: 0, away: 0 },
      goals: [{ team: "home", scorer: "maldini", assist: null, minute: null }],
    });
    // draw (+2) + Maldini (+3)
    expect(scoreGuess(istanbul2005, g).total).toBe(5);
  });
});

describe("scoreGuess: own goals end to end", () => {
  // Home wins 2-1; the first home goal is an own goal by an away player at 45+2.
  const match: Match = {
    ...istanbul2005,
    id: "own-goal-test",
    finalScore: { home: 2, away: 1 },
    events: [
      { type: "goal", team: "home", minute: 45, extra: 2, scorer: "riise", assist: null, ownGoal: true },
      { type: "goal", team: "away", minute: 60, extra: 0, scorer: "gerrard", assist: null, ownGoal: false },
      { type: "goal", team: "home", minute: 90, extra: 3, scorer: "crespo", assist: "kaka", ownGoal: false },
    ],
  };

  it("scores an OWN_GOAL guess with the minute bonus but no assist points", () => {
    const g = guessFor(match, {
      score: { home: 2, away: 1 },
      goals: [
        { team: "home", scorer: OWN_GOAL, assist: "kaka", minute: "45+1" }, // 3 + 0 + 2
        { team: "home", scorer: "crespo", assist: "kaka", minute: "90+2" }, // 3 + 2 + 2
        { team: "away", scorer: "gerrard", assist: null, minute: "46" }, // 3
      ],
    });
    const breakdown = scoreGuess(match, g);
    expect(breakdown.goals.map((x) => x.eventIndex)).toEqual([0, 2, 1]);
    // 5 (exact) + 5 + 7 + 3
    expect(breakdown.total).toBe(20);
  });

  it("does not match an own goal when the guess names the player who scored it", () => {
    const g = guessFor(match, {
      score: { home: 1, away: 0 },
      goals: [{ team: "home", scorer: "riise", assist: null, minute: "45+2" }],
    });
    // home win (+2) only
    expect(scoreGuess(match, g).total).toBe(2);
  });
});

describe("scoreGuess: input checks", () => {
  it("throws if the guess is for a different match", () => {
    const g = guessFor(istanbul2005, { matchId: "some-other-match" });
    expect(() => scoreGuess(istanbul2005, g)).toThrow(/some-other-match/);
  });
});
