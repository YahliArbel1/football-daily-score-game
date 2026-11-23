import { describe, expect, it } from "vitest";
import { MAX_GOALS_PER_TEAM } from "../engine/types";
import { changeGoals, describeScore } from "./scoreGuess";

describe("changeGoals", () => {
  it("adds and removes a goal", () => {
    expect(changeGoals(2, 1)).toBe(3);
    expect(changeGoals(2, -1)).toBe(1);
  });

  it("never goes below 0", () => {
    expect(changeGoals(0, -1)).toBe(0);
  });

  it("never goes above the maximum", () => {
    expect(MAX_GOALS_PER_TEAM).toBe(9);
    expect(changeGoals(9, 1)).toBe(9);
    expect(changeGoals(8, 1)).toBe(9);
  });
});

describe("describeScore", () => {
  it("names the home team when it wins", () => {
    expect(describeScore({ home: 2, away: 1 }, "AC Milan", "Liverpool")).toBe("AC Milan win");
  });

  it("names the away team when it wins", () => {
    expect(describeScore({ home: 0, away: 3 }, "AC Milan", "Liverpool")).toBe("Liverpool win");
  });

  it("says Draw for equal scores, including 0-0", () => {
    expect(describeScore({ home: 3, away: 3 }, "AC Milan", "Liverpool")).toBe("Draw");
    expect(describeScore({ home: 0, away: 0 }, "AC Milan", "Liverpool")).toBe("Draw");
  });
});
