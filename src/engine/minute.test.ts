import { describe, it, expect } from "vitest";
import { parseMinute, eventMinute, isMinuteBonus } from "./minute";

describe("parseMinute", () => {
  it.each([
    ["1", 1, 1],
    ["43", 1, 43],
    ["45", 1, 45],
    ["46", 2, 46],
    ["90", 2, 90],
    ["45+2", 1, 47],
    ["90+2", 2, 92],
    ["90+3", 2, 93],
    ["45+15", 1, 60],
  ] as const)("parses %s as half %i, total %i", (input, half, total) => {
    expect(parseMinute(input)).toEqual({ half, total });
  });

  it.each([
    [" 45 + 2 ", 47],
    ["07", 7],
  ] as const)("tolerates formatting: %j -> %i", (input, total) => {
    expect(parseMinute(input)?.total).toBe(total);
  });

  it.each([
    "abc",
    "0",
    "95",
    "91",
    "30+2",
    "46+1",
    "45+",
    "45+0",
    "+2",
    "45+2+1",
    "-3",
    "4.5",
    "",
    "   ",
  ])("returns null for invalid input %j", (input) => {
    expect(parseMinute(input)).toBeNull();
  });

  it("returns null for a skipped minute (null)", () => {
    expect(parseMinute(null)).toBeNull();
  });
});

describe("eventMinute", () => {
  it("adds stoppage time and keeps the half of the base minute", () => {
    expect(eventMinute({ minute: 45, extra: 2 })).toEqual({ half: 1, total: 47 });
    expect(eventMinute({ minute: 90, extra: 3 })).toEqual({ half: 2, total: 93 });
    expect(eventMinute({ minute: 46, extra: 0 })).toEqual({ half: 2, total: 46 });
  });
});

describe("isMinuteBonus", () => {
  const at = (minute: number, extra = 0) => ({ minute, extra });

  it("gives the bonus for an exact minute", () => {
    expect(isMinuteBonus("44", at(44))).toBe(true);
  });

  it("gives the bonus at exactly ±2 minutes", () => {
    expect(isMinuteBonus("42", at(44))).toBe(true);
    expect(isMinuteBonus("46", at(44))).toBe(false); // different half
    expect(isMinuteBonus("58", at(60))).toBe(true);
    expect(isMinuteBonus("62", at(60))).toBe(true);
  });

  it("does not give the bonus at 3 minutes away", () => {
    expect(isMinuteBonus("41", at(44))).toBe(false);
    expect(isMinuteBonus("63", at(60))).toBe(false);
  });

  it("does not cross halves: 45+2 is not close to 46'", () => {
    expect(isMinuteBonus("45+2", at(46))).toBe(false);
    expect(isMinuteBonus("46", at(45, 2))).toBe(false);
    expect(isMinuteBonus("46", at(45))).toBe(false);
  });

  it("compares stoppage time within the same half", () => {
    expect(isMinuteBonus("45", at(45, 2))).toBe(true);
    expect(isMinuteBonus("45+1", at(45, 3))).toBe(true);
    expect(isMinuteBonus("90+3", at(90, 5))).toBe(true);
    expect(isMinuteBonus("90", at(90, 3))).toBe(false);
    expect(isMinuteBonus("89", at(90, 1))).toBe(true);
  });

  it("never gives the bonus for invalid or empty input", () => {
    expect(isMinuteBonus(null, at(44))).toBe(false);
    expect(isMinuteBonus("abc", at(44))).toBe(false);
    expect(isMinuteBonus("30+2", at(32))).toBe(false); // would be 32, but format is invalid
    expect(isMinuteBonus("95", at(90, 5))).toBe(false);
  });
});
