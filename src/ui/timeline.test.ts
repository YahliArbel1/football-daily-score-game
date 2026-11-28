import { describe, expect, it } from "vitest";
import { barcelona1999 } from "../engine/fixtures/barcelona-1999";
import { barcelona2017 } from "../engine/fixtures/barcelona-2017";
import type { GoalEvent, Match } from "../engine/types";
import { advance, buildTimeline, clockLabel, MAX_GOAL_PAUSE_MS, RUN_MS, timelineAt } from "./timeline";

const goal = (team: "home" | "away", minute: number, extra = 0): GoalEvent => ({
  type: "goal",
  team,
  minute,
  extra,
  scorer: team === "home" ? "giggs" : "basler",
  assist: null,
  ownGoal: false,
});

/** Barcelona 1999 with its goals replaced. */
function withGoals(events: GoalEvent[]): Match {
  const m = structuredClone(barcelona1999);
  m.events = events;
  m.finalScore = {
    home: events.filter((e) => e.team === "home").length,
    away: events.filter((e) => e.team === "away").length,
  };
  return m;
}

describe("buildTimeline", () => {
  it("lasts 10 to 50 seconds, from no goals to many", () => {
    for (const match of [withGoals([]), barcelona1999, barcelona2017]) {
      const { durationMs } = buildTimeline(match);
      expect(durationMs).toBeGreaterThanOrEqual(10000);
      expect(durationMs).toBeLessThanOrEqual(50000);
    }
  });

  it("pauses at most 6 seconds on each goal, and less when there are many", () => {
    expect(buildTimeline(barcelona1999).pauseMs).toBe(MAX_GOAL_PAUSE_MS);
    expect(buildTimeline(barcelona2017).pauseMs).toBeLessThan(MAX_GOAL_PAUSE_MS);
  });

  it("puts goals in time order, stoppage time after its minute", () => {
    // Barcelona 2017: 3', 40', 50', 62', 88', 90+1', 90+5'.
    const units = buildTimeline(barcelona2017).goals.map((g) => g.unit);
    expect(units).toEqual([3, 40, 50, 62, 88, 91, 95]);
    const times = buildTimeline(barcelona2017).goals.map((g) => g.atMs);
    expect(times).toEqual([...times].sort((a, b) => a - b));
  });

  it("makes room for first-half stoppage time", () => {
    const t = buildTimeline(withGoals([goal("home", 45, 2), goal("away", 46)]));
    expect(t.stoppage).toEqual({ first: 2, second: 0 });
    // 45+2 is unit 47; 46' comes after it, at unit 48.
    expect(t.goals.map((g) => g.unit)).toEqual([47, 48]);
    expect(t.totalUnits).toBe(92);
  });
});

describe("clockLabel", () => {
  const t = buildTimeline(withGoals([goal("home", 45, 2), goal("away", 90, 3)]));

  it("shows normal minutes and stoppage time", () => {
    expect(clockLabel(t, 0)).toBe("0'");
    expect(clockLabel(t, 45)).toBe("45'");
    expect(clockLabel(t, 47)).toBe("45+2'");
    expect(clockLabel(t, 48)).toBe("46'");
    expect(clockLabel(t, 92)).toBe("90'");
    expect(clockLabel(t, 95)).toBe("90+3'");
  });

  it("rounds down while the clock is between minutes", () => {
    expect(clockLabel(t, 12.9)).toBe("12'");
  });
});

describe("timelineAt", () => {
  const t = buildTimeline(barcelona1999); // 6' Basler, 90+1' Sheringham, 90+3' Solskjær

  it("starts at 0' and 0-0", () => {
    const f = timelineAt(t, 0);
    expect(f.clock).toBe("0'");
    expect(f.score).toEqual({ home: 0, away: 0 });
    expect(f.shown).toBe(0);
    expect(f.current).toBeNull();
    expect(f.finished).toBe(false);
  });

  it("stops the clock on a goal and updates the score", () => {
    const first = t.goals[0]!;
    const f = timelineAt(t, first.atMs + 10);
    expect(f.clock).toBe("6'");
    expect(f.score).toEqual({ home: 0, away: 1 });
    expect(f.current?.eventIndex).toBe(0);
  });

  it("runs on after the pause, keeping the score", () => {
    const first = t.goals[0]!;
    const f = timelineAt(t, first.atMs + t.pauseMs + 500);
    expect(f.current).toBeNull();
    expect(f.score).toEqual({ home: 0, away: 1 });
    expect(Number.parseInt(f.clock)).toBeGreaterThan(6);
  });

  it("shows stoppage-time goals on the clock", () => {
    expect(timelineAt(t, t.goals[1]!.atMs).clock).toBe("90+1'");
    expect(timelineAt(t, t.goals[2]!.atMs).clock).toBe("90+3'");
  });

  it("ends on the final score and full time", () => {
    const f = timelineAt(t, t.durationMs);
    expect(f.score).toEqual(barcelona1999.finalScore);
    expect(f.shown).toBe(3);
    expect(f.clock).toBe("90+3'");
    expect(f.progress).toBe(1);
    expect(f.finished).toBe(true);
  });

  it("ends on the final score for a 6-1 too", () => {
    const t2 = buildTimeline(barcelona2017);
    expect(timelineAt(t2, t2.durationMs).score).toEqual({ home: 6, away: 1 });
  });

  it("never moves the clock backwards", () => {
    let last = -1;
    for (let ms = 0; ms <= t.durationMs; ms += 50) {
      const p = timelineAt(t, ms).progress;
      expect(p).toBeGreaterThanOrEqual(last);
      last = p;
    }
  });

  it("treats times outside the animation as its start or end", () => {
    expect(timelineAt(t, -100).clock).toBe("0'");
    expect(timelineAt(t, t.durationMs + 5000).finished).toBe(true);
  });

  it("runs a goalless match straight to 90'", () => {
    const t0 = buildTimeline(withGoals([]));
    expect(t0.durationMs).toBe(RUN_MS);
    expect(timelineAt(t0, RUN_MS / 2).clock).toBe("45'");
    expect(timelineAt(t0, RUN_MS).clock).toBe("90'");
  });
});

describe("advance", () => {
  it("moves at half, normal or double speed", () => {
    expect(advance(1000, 16, 0.5)).toBe(1008);
    expect(advance(1000, 16, 1)).toBe(1016);
    expect(advance(1000, 16, 2)).toBe(1032);
  });
});
