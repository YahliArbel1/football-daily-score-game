import { describe, expect, it } from "vitest";
import { dailyLabel, formatCountdown } from "./dailyText";

describe("dailyLabel", () => {
  it("shows day 0 as #1 with the start date", () => {
    expect(dailyLabel(0, "2026-11-27")).toBe("#1 · NOV 27");
  });

  it("moves the date along with the day, across months and years", () => {
    expect(dailyLabel(4, "2026-11-27")).toBe("#5 · DEC 1");
    expect(dailyLabel(35, "2026-11-27")).toBe("#36 · JAN 1");
  });
});

describe("formatCountdown", () => {
  const SECOND = 1000;
  const HOUR = 3600 * SECOND;

  it("shows hours, minutes and seconds with two digits each", () => {
    expect(formatCountdown(5 * HOUR + 12 * 60 * SECOND + 33 * SECOND)).toBe("05:12:33");
    expect(formatCountdown(24 * HOUR)).toBe("24:00:00");
  });

  it("drops parts of a second", () => {
    expect(formatCountdown(1999)).toBe("00:00:01");
  });

  it("never goes below zero", () => {
    expect(formatCountdown(0)).toBe("00:00:00");
    expect(formatCountdown(-5000)).toBe("00:00:00");
  });
});
