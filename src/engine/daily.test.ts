import { afterEach, describe, expect, it, vi } from "vitest";
import { DAILY_START, getDailyMatch, getDayNumber, localDate, timeUntilNextDaily } from "./daily";
import { istanbul2005 } from "./fixtures/istanbul-2005";
import type { Match } from "./types";

// Most tests build dates with new Date(year, monthIndex, day, hour, minute),
// which means "this time on the computer's own clock". So they pass on any
// computer: your PC (Israel) and GitHub's CI machine (UTC) alike.
// Note: monthIndex starts at 0, so 10 is November.

// Copies of a real match with different ids and pools, enough to test the order.
const make = (id: string, pool: Match["pool"] = "daily"): Match => ({ ...istanbul2005, id, pool });
const a = make("a");
const b = make("b");
const c = make("c");

const START = "2026-11-27";
const HOUR = 60 * 60 * 1000;

/** From here on, the test runs as if the computer were in another time zone. */
function inTimeZone(zone: string) {
  vi.stubEnv("TZ", zone);
}
// Put the real time zone back after each test.
afterEach(() => {
  vi.unstubAllEnvs();
});

describe("localDate", () => {
  it("writes the local date as YYYY-MM-DD", () => {
    expect(localDate(new Date(2026, 10, 27, 23, 59))).toBe("2026-11-27");
    expect(localDate(new Date(2027, 0, 5, 0, 0))).toBe("2027-01-05");
  });
});

describe("getDayNumber", () => {
  it("is 0 on the whole start day", () => {
    expect(getDayNumber(new Date(2026, 10, 27, 0, 0), START)).toBe(0);
    expect(getDayNumber(new Date(2026, 10, 27, 23, 59, 59), START)).toBe(0);
  });

  it("goes up by one at local midnight", () => {
    expect(getDayNumber(new Date(2026, 10, 28, 0, 0), START)).toBe(1);
    expect(getDayNumber(new Date(2026, 11, 27, 12, 0), START)).toBe(30);
  });

  it("follows each player's own date: same moment, different day", () => {
    // 23:30 UTC on Nov 27 is already 01:30 on Nov 28 in Israel,
    // but still 18:30 on Nov 27 in New York.
    const moment = new Date("2026-11-27T23:30:00Z");
    inTimeZone("Asia/Jerusalem");
    expect(getDayNumber(moment, START)).toBe(1);
    inTimeZone("America/New_York");
    expect(getDayNumber(moment, START)).toBe(0);
  });

  it("counts a daylight-saving day as one day", () => {
    // New York turns the clocks back on Nov 1, 2026: that day has 25 hours.
    inTimeZone("America/New_York");
    expect(getDayNumber(new Date(2026, 10, 2, 0, 0), "2026-10-31")).toBe(2);
    expect(getDayNumber(new Date(2026, 10, 1, 23, 59), "2026-10-31")).toBe(1);
  });

  it("counts correctly across a leap day and a year change", () => {
    expect(getDayNumber(new Date(2028, 2, 1, 10, 0), "2028-02-28")).toBe(2);
    expect(getDayNumber(new Date(2027, 0, 1, 0, 0), "2026-12-31")).toBe(1);
  });

  it("treats dates before the start as day 0", () => {
    expect(getDayNumber(new Date(2026, 10, 20, 12, 0), START)).toBe(0);
  });

  it("uses DAILY_START by default", () => {
    const [y, m, d] = DAILY_START.split("-").map(Number) as [number, number, number];
    expect(getDayNumber(new Date(y, m - 1, d, 12, 0))).toBe(0);
  });
});

describe("getDailyMatch", () => {
  const on = (month: number, day: number) => new Date(2026, month, day, 12, 0);

  it("goes through the daily pool in list order", () => {
    const list = [a, b, c];
    expect(getDailyMatch(list, on(10, 27), START).id).toBe("a");
    expect(getDailyMatch(list, on(10, 28), START).id).toBe("b");
    expect(getDailyMatch(list, on(10, 29), START).id).toBe("c");
  });

  it("starts over after the last match", () => {
    const list = [a, b, c];
    expect(getDailyMatch(list, on(10, 30), START).id).toBe("a");
    expect(getDailyMatch(list, on(11, 1), START).id).toBe("b");
  });

  it("skips Quick Play matches", () => {
    const list = [a, make("q", "quick"), b];
    expect(getDailyMatch(list, on(10, 27), START).id).toBe("a");
    expect(getDailyMatch(list, on(10, 28), START).id).toBe("b");
  });

  it("is the same match all day long", () => {
    const list = [a, b];
    expect(getDailyMatch(list, new Date(2026, 10, 27, 0, 0), START).id).toBe("a");
    expect(getDailyMatch(list, new Date(2026, 10, 27, 23, 59, 59), START).id).toBe("a");
  });

  it("fails clearly when there are no daily matches", () => {
    expect(() => getDailyMatch([make("q", "quick")], on(10, 27), START)).toThrow(
      /No daily matches/,
    );
  });
});

describe("timeUntilNextDaily", () => {
  it("counts down to the next local midnight", () => {
    expect(timeUntilNextDaily(new Date(2026, 10, 27, 18, 0))).toBe(6 * HOUR);
    expect(timeUntilNextDaily(new Date(2026, 10, 27, 23, 59, 59))).toBe(1000);
  });

  it("is a full day exactly at midnight", () => {
    expect(timeUntilNextDaily(new Date(2026, 10, 28, 0, 0))).toBe(24 * HOUR);
  });

  it("is 25 hours on the day the clocks go back", () => {
    inTimeZone("America/New_York");
    expect(timeUntilNextDaily(new Date(2026, 10, 1, 0, 0))).toBe(25 * HOUR);
  });
});
