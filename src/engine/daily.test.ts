import { describe, expect, it } from "vitest";
import { DAILY_START, getDailyMatch, getDayNumber, timeUntilNextDaily } from "./daily";
import { istanbul2005 } from "./fixtures/istanbul-2005";
import type { Match } from "./types";

// Copies of a real match with different ids and pools, enough to test the order.
const make = (id: string, pool: Match["pool"] = "daily"): Match => ({ ...istanbul2005, id, pool });
const a = make("a");
const b = make("b");
const c = make("c");

const START = "2026-11-27";

describe("getDayNumber", () => {
  it("is 0 on the whole start day", () => {
    expect(getDayNumber(new Date("2026-11-27T00:00:00Z"), START)).toBe(0);
    expect(getDayNumber(new Date("2026-11-27T23:59:59Z"), START)).toBe(0);
  });

  it("goes up by one at 00:00 UTC", () => {
    expect(getDayNumber(new Date("2026-11-28T00:00:00Z"), START)).toBe(1);
    expect(getDayNumber(new Date("2026-12-27T12:00:00Z"), START)).toBe(30);
  });

  it("gives the same day for the same moment in any time zone", () => {
    // 01:30 in Israel (UTC+2) and 18:30 the evening before in New York (UTC-5)
    // are the same moment: 23:30 UTC on Nov 27, so both are still day 0.
    const israel = new Date("2026-11-28T01:30:00+02:00");
    const newYork = new Date("2026-11-27T18:30:00-05:00");
    expect(getDayNumber(israel, START)).toBe(0);
    expect(getDayNumber(newYork, START)).toBe(0);
  });

  it("counts correctly across a leap day and a year change", () => {
    expect(getDayNumber(new Date("2028-03-01T10:00:00Z"), "2028-02-28")).toBe(2);
    expect(getDayNumber(new Date("2027-01-01T00:00:00Z"), "2026-12-31")).toBe(1);
  });

  it("treats dates before the start as day 0", () => {
    expect(getDayNumber(new Date("2026-11-20T12:00:00Z"), START)).toBe(0);
  });

  it("uses DAILY_START by default", () => {
    expect(getDayNumber(new Date(`${DAILY_START}T12:00:00Z`))).toBe(0);
  });
});

describe("getDailyMatch", () => {
  const on = (date: string) => new Date(`${date}T12:00:00Z`);

  it("goes through the daily pool in list order", () => {
    const list = [a, b, c];
    expect(getDailyMatch(list, on("2026-11-27"), START).id).toBe("a");
    expect(getDailyMatch(list, on("2026-11-28"), START).id).toBe("b");
    expect(getDailyMatch(list, on("2026-11-29"), START).id).toBe("c");
  });

  it("starts over after the last match", () => {
    const list = [a, b, c];
    expect(getDailyMatch(list, on("2026-11-30"), START).id).toBe("a");
    expect(getDailyMatch(list, on("2026-12-01"), START).id).toBe("b");
  });

  it("skips Quick Play matches", () => {
    const list = [a, make("q", "quick"), b];
    expect(getDailyMatch(list, on("2026-11-27"), START).id).toBe("a");
    expect(getDailyMatch(list, on("2026-11-28"), START).id).toBe("b");
  });

  it("is the same match all day long", () => {
    const list = [a, b];
    expect(getDailyMatch(list, new Date("2026-11-27T00:00:00Z"), START).id).toBe("a");
    expect(getDailyMatch(list, new Date("2026-11-27T23:59:59Z"), START).id).toBe("a");
  });

  it("fails clearly when there are no daily matches", () => {
    expect(() => getDailyMatch([make("q", "quick")], on("2026-11-27"), START)).toThrow(
      /No daily matches/,
    );
  });
});

describe("timeUntilNextDaily", () => {
  const HOUR = 60 * 60 * 1000;

  it("counts down to the next 00:00 UTC", () => {
    expect(timeUntilNextDaily(new Date("2026-11-27T18:00:00Z"))).toBe(6 * HOUR);
    expect(timeUntilNextDaily(new Date("2026-11-27T23:59:59Z"))).toBe(1000);
  });

  it("is a full day exactly at midnight", () => {
    expect(timeUntilNextDaily(new Date("2026-11-28T00:00:00Z"))).toBe(24 * HOUR);
  });
});
