import { describe, it, expect } from "vitest";
import { outcomeOf, scoreResult } from "./result";

const s = (home: number, away: number) => ({ home, away });

describe("outcomeOf", () => {
  it.each([
    [s(2, 1), "homeWin"],
    [s(0, 3), "awayWin"],
    [s(1, 1), "draw"],
    [s(0, 0), "draw"],
  ] as const)("%j is %s", (score, outcome) => {
    expect(outcomeOf(score)).toBe(outcome);
  });
});

describe("scoreResult", () => {
  it.each([
    // [guessed, actual, kind, points]
    [s(3, 3), s(3, 3), "exact", 5],
    [s(0, 0), s(0, 0), "exact", 5],
    [s(2, 1), s(2, 1), "exact", 5],

    [s(2, 2), s(3, 3), "outcome", 2], // SPEC 6.3: draw, not exact
    [s(0, 0), s(2, 2), "outcome", 2],
    [s(1, 0), s(3, 1), "outcome", 2], // home win
    [s(0, 1), s(1, 4), "outcome", 2], // away win

    [s(1, 0), s(1, 1), "wrong", 0], // guessed home win, was a draw
    [s(0, 0), s(0, 1), "wrong", 0], // guessed draw, was an away win
    [s(1, 2), s(2, 1), "wrong", 0], // same numbers, swapped sides
  ] as const)("guess %j vs actual %j -> %s (%i)", (guessed, actual, kind, points) => {
    expect(scoreResult(guessed, actual)).toEqual({ kind, points });
  });

  it("does not stack exact (+5) with outcome (+2)", () => {
    expect(scoreResult(s(2, 1), s(2, 1)).points).toBe(5);
  });
});
